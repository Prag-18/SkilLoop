from typing import List, Optional
from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    user_id: int
    full_name: str
    department: str
    year_of_study: str
    compatibility_percent: int
    reason: str
    teaches: List[str]
    wants: List[str]
    evidence_verified: bool
    avatar_url: Optional[str] = None
    headline: Optional[str] = None
    interests: Optional[List[str]] = []
