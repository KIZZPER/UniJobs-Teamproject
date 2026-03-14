from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    reviewed = "reviewed"
    interview = "interview"
    accepted = "accepted"
    rejected = "rejected"


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    vacancy_id = Column(Integer, ForeignKey("vacancies.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    cover_letter = Column(Text)
    resume_path = Column(String(500))
    status = Column(SAEnum(ApplicationStatus), default=ApplicationStatus.pending)
    created_at = Column(DateTime, default=datetime.utcnow)

    vacancy = relationship("Vacancy", back_populates="applications")
    student = relationship("Student", back_populates="applications")
    interview = relationship("Interview", back_populates="application", uselist=False)
