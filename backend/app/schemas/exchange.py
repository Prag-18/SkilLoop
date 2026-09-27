from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ExchangeResponse(BaseModel):
    id: int
    request_id: Optional[int] = None
    teacher_id: int
    learner_id: int
    skill_id: Optional[int] = None
    status: str
    duration_minutes: int
    credits_awarded: int
    completed_at: Optional[datetime] = None
    created_at: datetime
    teacher_name: Optional[str] = None
    learner_name: Optional[str] = None
    skill_name: Optional[str] = None

    class Config:
        from_attributes = True


class CompleteExchangeRequest(BaseModel):
    duration_minutes: int = 60
    is_verified_mentor: bool = False


class FeedbackCreate(BaseModel):
    rating: int
    comment: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: int
    exchange_id: int
    from_user_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
