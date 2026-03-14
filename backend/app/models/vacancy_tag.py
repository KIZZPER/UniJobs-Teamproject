from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class VacancyTag(Base):
    __tablename__ = "vacancy_tags"

    id = Column(Integer, primary_key=True, index=True)
    vacancy_id = Column(Integer, ForeignKey("vacancies.id"), nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=False)

    vacancy = relationship("Vacancy", back_populates="vacancy_tags")
    tag = relationship("Tag", back_populates="vacancy_tags")
