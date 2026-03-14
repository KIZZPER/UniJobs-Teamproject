from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), unique=True, nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    location = Column(String(255))
    notes = Column(Text)

    application = relationship("Application", back_populates="interview")
