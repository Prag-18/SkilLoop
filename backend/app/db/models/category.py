import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String, nullable=True)
    parent_category_id = Column(
        Integer,
        ForeignKey("skill_categories.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Hierarchical relationship
    parent_category = relationship(
        "SkillCategory",
        remote_side=[id],
        back_populates="subcategories"
    )
    subcategories = relationship(
        "SkillCategory",
        back_populates="parent_category",
        cascade="all, delete-orphan"
    )
    skills = relationship(
        "Skill",
        back_populates="category",
        cascade="all, delete-orphan"
    )
