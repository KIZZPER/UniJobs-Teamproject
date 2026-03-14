from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    file_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="resumes")
