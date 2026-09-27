from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, HttpUrl, Field

EvidenceType = Literal["project", "credential", "demo", "knowledge", "achievement"]
VerificationState = Literal["unverified", "pending", "verified"]


class EvidenceBase(BaseModel):
    type: str = Field(..., description="Evidence type: project, credential, demo, knowledge, achievement")
    url: str = Field(..., description="Link to proof (GitHub, portfolio, certificate, live demo, etc.)")
    description: Optional[str] = Field(None, description="Detailed explanation of the evidence")


class EvidenceCreate(EvidenceBase):
    pass


class EvidenceResponse(EvidenceBase):
    id: int
    user_skill_id: int
    verification_state: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvidenceVerifyResponse(BaseModel):
    id: int
    user_skill_id: int
    verification_state: str
    confidence_score: float
    explanation: str

    model_config = ConfigDict(from_attributes=True)
