import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    department = Column(String, default="Computer Science")
    year_of_study = Column(String, default="3rd Year")
    bio = Column(Text, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    credit_transactions = relationship("SkillCredit", back_populates="user", cascade="all, delete-orphan")

    @property
    def skill_credits(self) -> int:
        """
        Single Source of Truth: Ledger-based credit balance.
        Calculated as SUM(SkillCredit.amount) for this user.
        """
        if self.credit_transactions:
            return sum(tx.amount for tx in self.credit_transactions)
        return 0
