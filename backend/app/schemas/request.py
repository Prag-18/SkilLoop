from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class LearningRequestCreate(BaseModel):
    receiver_id: int
    requested_skill_id: Optional[int] = None


class LearningRequestResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    requested_skill_id: Optional[int] = None
    status: str
    created_at: datetime
    sender_name: Optional[str] = None
    receiver_name: Optional[str] = None
    skill_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
