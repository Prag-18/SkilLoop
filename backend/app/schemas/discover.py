from typing import List
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
