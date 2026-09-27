import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class LearningRequest(Base):
    __tablename__ = "learning_requests"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    requested_skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=True)
    status = Column(String, default="pending")  # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
    requested_skill = relationship("Skill", foreign_keys=[requested_skill_id])
