from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.routers.deps import get_current_user
from app.db.models.user import User
from app.schemas.discover import RecommendationResponse
from app.services.recommendation import RecommendationService

router = APIRouter(prefix="/discover", tags=["Discovery"])


@router.get("", response_model=List[RecommendationResponse])
def get_discover_recommendations(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/v1/discover
    Returns ranked list of recommended campus peers with compatibility % & human-readable reason.
    """
    recommendations = RecommendationService.get_recommendations(
        db, user_id=current_user.id, limit=limit
    )
    return recommendations
