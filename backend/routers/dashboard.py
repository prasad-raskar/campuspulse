from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
import models, auth
from database import get_db

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    stats = {}
    
    if current_user.role == models.RoleEnum.admin:
        stats["total_users"] = db.query(models.User).filter(models.User.college_id == current_user.college_id).count()
        stats["total_notices"] = db.query(models.Notice).filter(models.Notice.college_id == current_user.college_id).count()
        
        total_notifs = db.query(models.Notification).join(models.User).filter(models.User.college_id == current_user.college_id).count()
        read_notifs = db.query(models.Notification).join(models.User).filter(
            models.User.college_id == current_user.college_id,
            models.Notification.status == models.NotificationStatusEnum.read
        ).count()
        stats["engagement_rate"] = f"{int((read_notifs / total_notifs) * 100)}%" if total_notifs > 0 else "0%"
        
    elif current_user.role == models.RoleEnum.student:
        query = db.query(models.Notice).filter(models.Notice.college_id == current_user.college_id).filter(
            or_(models.Notice.target_class == None, models.Notice.target_class == current_user.user_class),
            or_(models.Notice.target_branch == None, models.Notice.target_branch == current_user.branch)
        )
        stats["total_notices"] = query.count()
        stats["unread_notices"] = db.query(models.Notification).filter(
            models.Notification.user_id == current_user.id,
            models.Notification.status == models.NotificationStatusEnum.unread
        ).count()
        stats["attendance"] = "N/A"
        
    elif current_user.role == models.RoleEnum.faculty:
        stats["notices_created"] = db.query(models.Notice).filter(models.Notice.created_by == current_user.id).count()
        stats["active_classes"] = "N/A"
        
    return stats
