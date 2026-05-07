from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
import models, schemas, auth
from database import get_db
from fcm_service import send_push_notifications
import uuid
import os
import shutil

router = APIRouter(
    prefix="/notices",
    tags=["Notices"]
)

import cloudinary
import cloudinary.uploader

@router.post("/upload-image")
async def upload_notice_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.require_role([models.RoleEnum.admin, models.RoleEnum.faculty]))
):
    if os.getenv("CLOUDINARY_URL"):
        result = cloudinary.uploader.upload(file.file)
        return {"image_url": result["secure_url"]}
        
    os.makedirs("uploads", exist_ok=True)
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = f"uploads/{filename}"
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"image_url": f"/uploads/{filename}"}

@router.post("/upload-pdf")
async def upload_notice_pdf(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.require_role([models.RoleEnum.admin, models.RoleEnum.faculty]))
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
    if os.getenv("CLOUDINARY_URL"):
        result = cloudinary.uploader.upload(file.file, resource_type="raw")
        return {"pdf_url": result["secure_url"]}
        
    os.makedirs("uploads", exist_ok=True)
    filename = f"{uuid.uuid4()}.pdf"
    filepath = f"uploads/{filename}"
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"pdf_url": f"/uploads/{filename}"}

@router.post("/create", response_model=schemas.NoticeResponse)
def create_notice(
    notice: schemas.NoticeBase, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.RoleEnum.admin, models.RoleEnum.faculty]))
):
    try:
        # 1. Create notice
        db_notice = models.Notice(
            **notice.model_dump(),
            college_id=current_user.college_id,
            created_by=current_user.id
        )
        db.add(db_notice)
        db.commit()
        db.refresh(db_notice)
        
        # 2. Find relevant users to notify
        query = db.query(models.User).filter(
            models.User.college_id == current_user.college_id,
            models.User.id != current_user.id
        )
        
        # Filter by class and branch if specified in the notice
        if notice.target_class:
            query = query.filter(models.User.user_class == notice.target_class)
        if notice.target_branch:
            query = query.filter(models.User.branch == notice.target_branch)
            
        relevant_users = query.all()
        
        # 3. Store notification history & collect FCM tokens
        fcm_tokens = []
        notifications = []
        
        for user in relevant_users:
            notifications.append(models.Notification(
                user_id=user.id,
                notice_id=db_notice.id,
                status=models.NotificationStatusEnum.unread
            ))
            if user.fcm_token:
                fcm_tokens.append(user.fcm_token)
                
        if notifications:
            db.add_all(notifications)
            db.commit()
            
        # 4. Send FCM Push Notification to relevant users
        if fcm_tokens:
            send_push_notifications(
                tokens=fcm_tokens,
                title=f"New Notice: {db_notice.title}",
                body=db_notice.description[:100] + "..." if len(db_notice.description) > 100 else db_notice.description,
                data={"notice_id": str(db_notice.id)}
            )
            
        return db_notice
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my", response_model=List[schemas.NoticeResponse])
def get_my_notices(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Notice).filter(models.Notice.college_id == current_user.college_id)

    if current_user.role == models.RoleEnum.student:
        query = query.filter(
            or_(models.Notice.target_class == None, models.Notice.target_class == current_user.user_class),
            or_(models.Notice.target_branch == None, models.Notice.target_branch == current_user.branch)
        )
    
    notices = query.order_by(models.Notice.created_at.desc()).all()
    return notices

@router.get("/all", response_model=List[schemas.NoticeResponse])
def get_all_notices(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.RoleEnum.admin]))
):
    notices = db.query(models.Notice).filter(
        models.Notice.college_id == current_user.college_id
    ).order_by(models.Notice.created_at.desc()).all()
    return notices

@router.post("/mark-read")
def mark_notices_as_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    from datetime import datetime, timezone
    
    unread_notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.status == models.NotificationStatusEnum.unread
    ).all()
    
    for notif in unread_notifications:
        notif.status = models.NotificationStatusEnum.read
        notif.read_at = datetime.now(timezone.utc)
        
    db.commit()
    return {"message": "All notices marked as read", "marked_count": len(unread_notifications)}

@router.delete("/{notice_id}")
def delete_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.RoleEnum.admin, models.RoleEnum.faculty]))
):
    notice = db.query(models.Notice).filter(models.Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
        
    if notice.college_id != current_user.college_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this notice")
        
    # Faculty can only delete their own notices
    if current_user.role == models.RoleEnum.faculty and notice.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Faculty can only delete their own notices")
        
    db.delete(notice)
    db.commit()
    return {"message": "Notice deleted successfully"}
