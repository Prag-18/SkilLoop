import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    user_skill_id = Column(
        Integer,
        ForeignKey("user_skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    type = Column(
        String,
        nullable=False
    )  # "project" | "credential" | "demo" | "knowledge" | "achievement"
    url = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    verification_state = Column(
        String,
        default="unverified"
    )  # "unverified" | "pending" | "verified"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user_skill = relationship("UserSkill", back_populates="evidence")
