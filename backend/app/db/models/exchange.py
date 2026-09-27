import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Exchange(Base):
    __tablename__ = "exchanges"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("learning_requests.id", ondelete="CASCADE"), nullable=True)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    learner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=True)
    status = Column(String, default="scheduled")  # scheduled, completed
    duration_minutes = Column(Integer, default=60)
    credits_awarded = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    request = relationship("LearningRequest", foreign_keys=[request_id])
    teacher = relationship("User", foreign_keys=[teacher_id])
    learner = relationship("User", foreign_keys=[learner_id])
    skill = relationship("Skill", foreign_keys=[skill_id])
