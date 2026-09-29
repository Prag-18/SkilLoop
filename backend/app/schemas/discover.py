from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ProofItem(BaseModel):
    id: int
    skill_name: str
    type: str
    url: str
    description: Optional[str] = None
    verification_state: str = "unverified"

    model_config = ConfigDict(from_attributes=True)


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
    proofs: List[ProofItem] = []

    model_config = ConfigDict(from_attributes=True)
