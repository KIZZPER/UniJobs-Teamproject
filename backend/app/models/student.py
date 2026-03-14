from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    university = Column(String(255))
    faculty = Column(String(255))
    course = Column(Integer)
    bio = Column(Text)

    user = relationship("User", back_populates="student")
    applications = relationship("Application", back_populates="student")
    resumes = relationship("Resume", back_populates="student")
    favorites = relationship("Favorite", back_populates="student")
