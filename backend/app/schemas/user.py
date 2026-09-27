from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    department: Optional[str] = "Computer Science"
    year_of_study: Optional[str] = "3rd Year"
    bio: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    year_of_study: Optional[str] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None


class UserResponse(UserBase):
    id: int
    skill_credits: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
