from typing import Optional
from sqlalchemy.orm import Session, selectinload
from fastapi import HTTPException, status
from app.db.models.user import User
from app.db.models.skill_credit import SkillCredit
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password


class AuthService:
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.lower()).first()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).options(selectinload(User.credit_transactions)).filter(User.id == user_id).first()

    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        existing_user = AuthService.get_by_email(db, user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A student user with this email address already exists.",
            )

        links_data = None
        if user_in.links:
            links_data = [l.model_dump() if hasattr(l, "model_dump") else l for l in user_in.links]

        user = User(
            email=user_in.email.lower(),
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            department=user_in.department,
            year_of_study=user_in.year_of_study,
            bio=user_in.bio,
            avatar_url=user_in.avatar_url,
            headline=user_in.headline,
            interests=user_in.interests,
            links=links_data,
            availability=user_in.availability,
            favorite_quote=user_in.favorite_quote,
            github_url=user_in.github_url,
            portfolio_url=user_in.portfolio_url,
            phone_number=user_in.phone_number,
            is_active=True,
        )
        db.add(user)
        db.flush()  # Generate user.id

        # Ledger-based credit initial grant (100 credits signup bonus)
        initial_credit = SkillCredit(
            user_id=user.id,
            amount=100,
            reason="signup_bonus",
        )
        db.add(initial_credit)

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        user = AuthService.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
