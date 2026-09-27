from datetime import datetime
from typing import Optional, List, Literal, ForwardRef
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.evidence import EvidenceResponse


# Skill Category Schemas
class SkillCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    parent_category_id: Optional[int] = None


class SkillCategoryCreate(SkillCategoryBase):
    pass


class SkillCategoryResponse(SkillCategoryBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# Skill Schemas
class SkillBase(BaseModel):
    name: str
    category_id: int
    description: Optional[str] = None


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: int
    created_at: Optional[datetime] = None
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Category Tree Schema with nested subcategories & skills
class SkillCategoryTreeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    parent_category_id: Optional[int] = None
    skills: List[SkillResponse] = []
    subcategories: List["SkillCategoryTreeResponse"] = []

    model_config = ConfigDict(from_attributes=True)


# User Skill Schemas
class UserSkillCreate(BaseModel):
    skill_id: int = Field(..., description="ID of the taxonomy skill to claim")
    direction: Literal["teach", "learn"] = Field(..., description="Direction: teach or learn")
    level: Optional[str] = Field("Intermediate", description="Beginner, Intermediate, Advanced, Expert")


class UserSkillUpdate(BaseModel):
    direction: Optional[Literal["teach", "learn"]] = None
    level: Optional[str] = None


class UserSkillResponse(BaseModel):
    id: int
    user_id: int
    skill_id: int
    skill: SkillResponse
    direction: str
    level: str
    confidence_score: float
    evidence: List[EvidenceResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
