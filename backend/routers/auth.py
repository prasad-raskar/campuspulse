from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import models, schemas, auth
from database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Auto-create the college if it doesn't exist for seamless registration during development
        college = db.query(models.College).filter(models.College.id == user.college_id).first()
        if not college:
            college = models.College(id=user.college_id, name=f"Campus {user.college_id}")
            db.add(college)
            db.commit()
            db.refresh(college)

        hashed_password = auth.get_password_hash(user.password)
        db_user = models.User(
            email=user.email,
            password=hashed_password,
            name=user.name,
            role=user.role,
            user_class=user.user_class,
            branch=user.branch,
            college_id=user.college_id
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm expects 'username' and 'password'
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.post("/fcm-token")
def update_fcm_token(
    fcm_data: schemas.UserUpdateFCM, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    current_user.fcm_token = fcm_data.fcm_token
    db.commit()
@router.get("/users", response_model=list[schemas.UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role([models.RoleEnum.admin]))
):
    users = db.query(models.User).filter(models.User.college_id == current_user.college_id).all()
    return users
