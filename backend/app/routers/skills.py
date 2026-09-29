from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload
from app.db.database import get_db
from app.db.models.category import SkillCategory
from app.db.models.skill import Skill
from app.db.models.user_skill import UserSkill
from app.db.models.user import User
from app.routers.deps import get_current_user
from app.schemas.skill import (
    SkillResponse,
    SkillCategoryTreeResponse,
    UserSkillCreate,
    UserSkillResponse,
)

router = APIRouter(tags=["Skills"])


@router.get("/skills/categories", response_model=List[SkillCategoryTreeResponse])
def get_skill_category_tree(db: Session = Depends(get_db)):
    """Fetch complete hierarchical taxonomy tree (Root categories -> Subcategories -> Skills)."""
    # Fetch top-level categories (parent_category_id is None)
    root_categories = (
        db.query(SkillCategory)
        .filter(SkillCategory.parent_category_id.is_(None))
        .order_by(SkillCategory.name)
        .all()
    )

    def build_tree_node(cat: SkillCategory) -> dict:
        cat_skills = [
            SkillResponse(
                id=s.id,
                name=s.name,
                category_id=s.category_id,
                description=s.description,
                created_at=s.created_at,
                category_name=cat.name,
            )
            for s in cat.skills
        ]
        subcats = [build_tree_node(sub) for sub in cat.subcategories]
        return {
            "id": cat.id,
            "name": cat.name,
            "description": cat.description,
            "icon": cat.icon,
            "parent_category_id": cat.parent_category_id,
            "skills": cat_skills,
            "subcategories": subcats,
        }

    return [build_tree_node(root) for root in root_categories]


@router.get("/skills", response_model=List[SkillResponse])
def list_skills(
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    q: Optional[str] = Query(None, description="Search query by skill name"),
    db: Session = Depends(get_db),
):
    """List taxonomy skills with optional category filter or text search."""
    query = db.query(Skill).join(SkillCategory, Skill.category_id == SkillCategory.id)

    if category_id is not None:
        # Include skills in this category or its subcategories
        cat_ids = [category_id]
        subcategories = db.query(SkillCategory.id).filter(SkillCategory.parent_category_id == category_id).all()
        cat_ids.extend([sub[0] for sub in subcategories])
        query = query.filter(Skill.category_id.in_(cat_ids))

    if q:
        query = query.filter(Skill.name.ilike(f"%{q}%"))

    skills = query.order_by(Skill.name).all()

    result = []
    for skill in skills:
        result.append(
            SkillResponse(
                id=skill.id,
                name=skill.name,
                category_id=skill.category_id,
                description=skill.description,
                created_at=skill.created_at,
                category_name=skill.category.name if skill.category else None,
            )
        )
    return result


@router.post("/users/me/skills", response_model=UserSkillResponse, status_code=status.HTTP_201_CREATED)
def claim_user_skill(
    skill_claim: UserSkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Claim a skill as 'teach' or 'learn' with an initial level."""
    # Verify taxonomy skill exists
    skill = db.query(Skill).filter(Skill.id == skill_claim.skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill with ID {skill_claim.skill_id} not found in taxonomy.",
        )

    # Check if user already claimed this skill with the same direction
    existing = (
        db.query(UserSkill)
        .filter(
            UserSkill.user_id == current_user.id,
            UserSkill.skill_id == skill_claim.skill_id,
            UserSkill.direction == skill_claim.direction,
        )
        .first()
    )
    if existing:
        # Update level if different
        existing.level = skill_claim.level or existing.level
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    new_user_skill = UserSkill(
        user_id=current_user.id,
        skill_id=skill_claim.skill_id,
        direction=skill_claim.direction,
        level=skill_claim.level or "Intermediate",
        confidence_score=0.0,
    )
    db.add(new_user_skill)
    db.commit()
    db.refresh(new_user_skill)
    return new_user_skill


@router.get("/users/{user_id}/skills", response_model=List[UserSkillResponse])
def get_user_skills(
    user_id: str,
    direction: Optional[str] = Query(None, description="Filter by direction: teach | learn"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch skills claimed by user (supports 'me' or user ID)."""
    target_user_id = current_user.id if user_id == "me" else int(user_id)

    query = (
        db.query(UserSkill)
        .options(
            selectinload(UserSkill.skill).selectinload(Skill.category),
            selectinload(UserSkill.evidence),
        )
        .filter(UserSkill.user_id == target_user_id)
    )
    if direction:
        query = query.filter(UserSkill.direction == direction)

    user_skills = query.order_by(UserSkill.created_at.desc()).all()
    return user_skills


@router.delete("/users/me/skills/{user_skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user_skill(
    user_skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a claimed skill from current user's profile."""
    user_skill = (
        db.query(UserSkill)
        .filter(
            UserSkill.id == user_skill_id,
            UserSkill.user_id == current_user.id,
        )
        .first()
    )
    if not user_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claimed skill not found on your profile.",
        )

    db.delete(user_skill)
    db.commit()
    return None
