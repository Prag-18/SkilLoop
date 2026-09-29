from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator


class LinkItem(BaseModel):
    label: str = Field(..., max_length=50)
    url: str

    @field_validator("label", mode="before")
    @classmethod
    def strip_label(cls, v: Any) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Link label cannot be empty.")
            return v
        return v

    @field_validator("url", mode="before")
    @classmethod
    def validate_url(cls, v: Any) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not (v.startswith("http://") or v.startswith("https://")):
                raise ValueError("Link URL must start with http:// or https://")
            return v
        raise ValueError("Link URL must be a string.")


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)
    department: Optional[str] = "Computer Science"
    year_of_study: Optional[str] = "3rd Year"
    bio: Optional[str] = Field(None, max_length=300)
    avatar_url: Optional[str] = None
    headline: Optional[str] = Field(None, max_length=80)
    interests: Optional[List[str]] = None
    links: Optional[List[LinkItem]] = None
    availability: Optional[str] = Field(None, max_length=100)
    favorite_quote: Optional[str] = Field(None, max_length=120)
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    phone_number: Optional[str] = Field(None, max_length=20)

    @field_validator("full_name", "department", "year_of_study", "bio", "headline", "availability", "favorite_quote", "github_url", "portfolio_url", "avatar_url", "phone_number", mode="before")
    @classmethod
    def strip_strings(cls, v: Any) -> Any:
        if isinstance(v, str):
            v = v.strip()
            return v if v else None
        return v

    @field_validator("interests", mode="before")
    @classmethod
    def validate_interests(cls, v: Any) -> Optional[List[str]]:
        if v is None:
            return None
        if not isinstance(v, list):
            raise ValueError("Interests must be a list of strings.")
        if len(v) > 8:
            raise ValueError("Interests list cannot exceed 8 items.")
        cleaned = []
        for item in v:
            if isinstance(item, str):
                s = item.strip()
                if s:
                    if len(s) > 30:
                        raise ValueError(f"Interest item '{s[:15]}...' exceeds max length of 30 characters.")
                    cleaned.append(s)
            else:
                raise ValueError("Each interest must be a string.")
        return cleaned

    @field_validator("links", mode="before")
    @classmethod
    def validate_links_count(cls, v: Any) -> Any:
        if v is None:
            return None
        if isinstance(v, list) and len(v) > 5:
            raise ValueError("Links list cannot exceed 5 items.")
        return v


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


RegisterRequest = UserCreate


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    department: Optional[str] = None
    year_of_study: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=300)
    avatar_url: Optional[str] = None
    headline: Optional[str] = Field(None, max_length=80)
    interests: Optional[List[str]] = None
    links: Optional[List[LinkItem]] = None
    availability: Optional[str] = Field(None, max_length=100)
    favorite_quote: Optional[str] = Field(None, max_length=120)
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    phone_number: Optional[str] = Field(None, max_length=20)

    @field_validator("full_name", "department", "year_of_study", "bio", "headline", "availability", "favorite_quote", "github_url", "portfolio_url", "avatar_url", "phone_number", mode="before")
    @classmethod
    def strip_update_strings(cls, v: Any) -> Any:
        if isinstance(v, str):
            v = v.strip()
            return v if v else None
        return v

    @field_validator("interests", mode="before")
    @classmethod
    def validate_update_interests(cls, v: Any) -> Optional[List[str]]:
        if v is None:
            return None
        if not isinstance(v, list):
            raise ValueError("Interests must be a list of strings.")
        if len(v) > 8:
            raise ValueError("Interests list cannot exceed 8 items.")
        cleaned = []
        for item in v:
            if isinstance(item, str):
                s = item.strip()
                if s:
                    if len(s) > 30:
                        raise ValueError(f"Interest item '{s[:15]}...' exceeds max length of 30 characters.")
                    cleaned.append(s)
            else:
                raise ValueError("Each interest must be a string.")
        return cleaned

    @field_validator("links", mode="before")
    @classmethod
    def validate_update_links_count(cls, v: Any) -> Any:
        if v is None:
            return None
        if isinstance(v, list) and len(v) > 5:
            raise ValueError("Links list cannot exceed 5 items.")
        return v


class UserResponse(UserBase):
    id: int
    skill_credits: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PublicUserResponse(BaseModel):
    id: int
    full_name: str
    department: Optional[str] = None
    year_of_study: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    headline: Optional[str] = None
    interests: Optional[List[str]] = []
    links: Optional[List[LinkItem]] = []
    availability: Optional[str] = None
    favorite_quote: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


UserPublicResponse = PublicUserResponse
