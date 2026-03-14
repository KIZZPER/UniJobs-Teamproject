from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    student = "student"
    employer = "employer"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="user", uselist=False)
    employer = relationship("Employer", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    reviews_written = relationship("Review", foreign_keys="Review.author_id", back_populates="author")
    reviews_received = relationship("Review", foreign_keys="Review.target_id", back_populates="target")
