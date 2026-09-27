import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    category_id = Column(
        Integer,
        ForeignKey("skill_categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    category = relationship("SkillCategory", back_populates="skills")
    user_skills = relationship(
        "UserSkill",
        back_populates="skill",
        cascade="all, delete-orphan"
    )
