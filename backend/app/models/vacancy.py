from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class VacancyType(str, enum.Enum):
    internship = "internship"
    part_time = "part_time"
    project = "project"


class Vacancy(Base):
    __tablename__ = "vacancies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    type = Column(SAEnum(VacancyType), nullable=False)
    salary = Column(String(100))
    employer_id = Column(Integer, ForeignKey("employers.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Integer, default=1)

    employer = relationship("Employer", back_populates="vacancies")
    category = relationship("Category", back_populates="vacancies")
    applications = relationship("Application", back_populates="vacancy")
    favorites = relationship("Favorite", back_populates="vacancy")
    vacancy_tags = relationship("VacancyTag", back_populates="vacancy")
