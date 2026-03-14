from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", foreign_keys=[author_id], back_populates="reviews_written")
    target = relationship("User", foreign_keys=[target_id], back_populates="reviews_received")
