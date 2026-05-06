from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, DateTime, Date
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime, timezone

# --- Enums ---
class RoleEnum(str, enum.Enum):
    admin = "admin"
    faculty = "faculty"
    student = "student"

class NoticeTypeEnum(str, enum.Enum):
    general = "general"
    exam = "exam"
    event = "event"
    urgent = "urgent"
    holiday = "holiday"
    assignment = "assignment"

class NotificationStatusEnum(str, enum.Enum):
    unread = "unread"
    read = "read"

class AttendanceStatusEnum(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"

# --- Models ---

class College(Base):
    """
    Multi-tenancy table to support multiple colleges scalability.
    """
    __tablename__ = "colleges"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    domain = Column(String, unique=True, index=True) # e.g., 'stanford.edu'

    users = relationship("User", back_populates="college", cascade="all, delete-orphan")
    notices = relationship("Notice", back_populates="college", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum, native_enum=False), default=RoleEnum.student, nullable=False)
    user_class = Column(String, nullable=True) # Renamed from 'class' as it's a reserved keyword in Python
    branch = Column(String, nullable=True)
    fcm_token = Column(String, nullable=True)

    # Relationships
    college = relationship("College", back_populates="users")
    created_notices = relationship("Notice", back_populates="author", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")

class Notice(Base):
    __tablename__ = "notices"
    
    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    notice_type = Column(Enum(NoticeTypeEnum, native_enum=False), default=NoticeTypeEnum.general)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_class = Column(String, nullable=True)
    target_branch = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    college = relationship("College", back_populates="notices")
    author = relationship("User", back_populates="created_notices")
    notifications = relationship("Notification", back_populates="notice", cascade="all, delete-orphan")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notice_id = Column(Integer, ForeignKey("notices.id"), nullable=False)
    status = Column(Enum(NotificationStatusEnum, native_enum=False), default=NotificationStatusEnum.unread)
    read_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="notifications")
    notice = relationship("Notice", back_populates="notifications")

class Attendance(Base):
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatusEnum, native_enum=False), nullable=False)

    # Relationships
    student = relationship("User", back_populates="attendance_records")
