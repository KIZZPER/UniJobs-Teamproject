from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Employer(Base):
    __tablename__ = "employers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String(255), nullable=False)
    description = Column(Text)
    website = Column(String(255))

    user = relationship("User", back_populates="employer")
    vacancies = relationship("Vacancy", back_populates="employer")
