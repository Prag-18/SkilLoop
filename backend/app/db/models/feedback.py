import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    exchange_id = Column(Integer, ForeignKey("exchanges.id", ondelete="CASCADE"), nullable=False)
    from_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    exchange = relationship("Exchange", foreign_keys=[exchange_id])
    from_user = relationship("User", foreign_keys=[from_user_id])
