from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from models import RoleEnum, NoticeTypeEnum, NotificationStatusEnum, AttendanceStatusEnum

# --- College Schemas ---
class CollegeBase(BaseModel):
    name: str
    domain: Optional[str] = None

class CollegeCreate(CollegeBase):
    pass

class CollegeResponse(CollegeBase):
    id: int

    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: RoleEnum = RoleEnum.student
    user_class: Optional[str] = None
    branch: Optional[str] = None
    college_id: int

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class UserUpdateFCM(BaseModel):
    fcm_token: str

# --- Notice Schemas ---
class NoticeBase(BaseModel):
    title: str
    description: str
    notice_type: NoticeTypeEnum = NoticeTypeEnum.general
    target_class: Optional[str] = None
    target_branch: Optional[str] = None
    image_url: Optional[str] = None
    pdf_url: Optional[str] = None

class NoticeCreate(NoticeBase):
    college_id: int
    created_by: int

class NoticeResponse(NoticeBase):
    id: int
    college_id: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationBase(BaseModel):
    status: NotificationStatusEnum = NotificationStatusEnum.unread
    read_at: Optional[datetime] = None

class NotificationCreate(NotificationBase):
    user_id: int
    notice_id: int

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    notice_id: int

    class Config:
        from_attributes = True

# --- Attendance Schemas ---
class AttendanceBase(BaseModel):
    date: date
    status: AttendanceStatusEnum

class AttendanceCreate(AttendanceBase):
    student_id: int

class AttendanceResponse(AttendanceBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
