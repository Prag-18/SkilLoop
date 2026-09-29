import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.routers.deps import get_current_user
from app.db.models.user import User
from app.db.models.exchange import Exchange
from app.db.models.learning_request import LearningRequest
from app.db.models.feedback import Feedback
from app.db.models.skill_credit import SkillCredit
from app.db.models.skill import Skill
from app.schemas.exchange import (
    ExchangeResponse,
    CompleteExchangeRequest,
    FeedbackCreate,
    FeedbackResponse,
)

router = APIRouter(prefix="/exchanges", tags=["Exchanges"])

CREDIT_TABLE = {
    "duration_30": 10,
    "duration_60": 20,
    "completion_bonus": 5,
    "verified_mentor": 25,
}


def _build_exchange_response(ex: Exchange, db: Session, current_user_id: Optional[int] = None) -> ExchangeResponse:
    """Helper to build a consistent ExchangeResponse with mutual peer contact phone."""
    teacher = db.query(User).filter(User.id == ex.teacher_id).first()
    learner = db.query(User).filter(User.id == ex.learner_id).first()
    skill = db.query(Skill).filter(Skill.id == ex.skill_id).first() if ex.skill_id else None

    contact_phone = None
    if current_user_id:
        if current_user_id == ex.teacher_id and learner:
            contact_phone = learner.phone_number
        elif current_user_id == ex.learner_id and teacher:
            contact_phone = teacher.phone_number

    return ExchangeResponse(
        id=ex.id,
        request_id=ex.request_id,
        teacher_id=ex.teacher_id,
        learner_id=ex.learner_id,
        skill_id=ex.skill_id,
        status=ex.status,
        duration_minutes=ex.duration_minutes,
        credits_awarded=ex.credits_awarded,
        completed_at=ex.completed_at,
        created_at=ex.created_at,
        teacher_name=teacher.full_name if teacher else "Teacher",
        learner_name=learner.full_name if learner else "Learner",
        skill_name=skill.name if skill else "Peer Mentorship",
        contact_phone=contact_phone,
    )


@router.get("", response_model=List[ExchangeResponse])
def get_exchanges(
    status_filter: Optional[str] = Query(None, alias="status", description="offered|requested|completed"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/v1/exchanges?status=offered|requested|completed
    Fetch skill exchanges filtering by role or status.
    """
    query = db.query(Exchange)

    if status_filter == "offered":
        query = query.filter(Exchange.teacher_id == current_user.id)
    elif status_filter == "requested":
        query = query.filter(Exchange.learner_id == current_user.id)
    elif status_filter == "completed":
        query = query.filter(
            (Exchange.teacher_id == current_user.id) | (Exchange.learner_id == current_user.id),
            Exchange.status == "completed"
        )
    else:
        query = query.filter(
            (Exchange.teacher_id == current_user.id) | (Exchange.learner_id == current_user.id)
        )

    return [_build_exchange_response(ex, db, current_user.id) for ex in query.order_by(Exchange.created_at.desc()).all()]


@router.post("/{request_id}/complete", response_model=ExchangeResponse)
def complete_exchange(
    request_id: int,
    body: CompleteExchangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/v1/exchanges/{request_id}/complete
    Mark exchange complete & award skill credits.
    
    Credit table:
    - 30 min = +10 CR | 60 min = +20 CR
    - Completion bonus = +5 CR
    - Verified mentor = +25 CR
    
    State guards:
    - Exchange must be in 'scheduled' state (not already completed)
    - User must be a participant
    - Cannot complete twice (double credit prevention)
    """
    # Find exchange by exchange id first, then by request_id
    exchange = db.query(Exchange).filter(Exchange.id == request_id).first()
    if not exchange:
        exchange = db.query(Exchange).filter(Exchange.request_id == request_id).first()

    if not exchange:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exchange not found. Ensure the associated learning request was accepted first.",
        )

    # Auth guard: only participants can complete
    if current_user.id not in (exchange.teacher_id, exchange.learner_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this exchange.",
        )

    # State-machine guard: only scheduled exchanges can be completed (prevent double-complete)
    if exchange.status != "scheduled":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot complete an exchange that is already '{exchange.status}'. Only scheduled exchanges can be completed.",
        )

    # Validate duration
    duration = body.duration_minutes
    if duration <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duration must be a positive number of minutes.",
        )

    # Calculate credits using credit table
    duration_credits = CREDIT_TABLE["duration_60"] if duration >= 60 else CREDIT_TABLE["duration_30"]
    completion_bonus = CREDIT_TABLE["completion_bonus"]
    mentor_bonus = CREDIT_TABLE["verified_mentor"] if body.is_verified_mentor else 0
    total_credits = duration_credits + completion_bonus + mentor_bonus

    # Update exchange state (atomic — before any credit writes)
    exchange.status = "completed"
    exchange.duration_minutes = duration
    exchange.credits_awarded = total_credits
    exchange.completed_at = datetime.datetime.utcnow()
    db.add(exchange)

    # Credit award ledger for teacher (duration + completion + verified mentor bonuses)
    teacher = db.query(User).filter(User.id == exchange.teacher_id).first()
    if teacher:
        credit_entry_teacher = SkillCredit(
            user_id=teacher.id,
            amount=total_credits,
            reason=f"Completed {duration}min skill exchange mentorship (duration={duration_credits}, completion={completion_bonus}, mentor_bonus={mentor_bonus})",
        )
        db.add(credit_entry_teacher)

    # Credit award ledger for learner (participation / completion bonus)
    learner = db.query(User).filter(User.id == exchange.learner_id).first()
    if learner:
        credit_entry_learner = SkillCredit(
            user_id=learner.id,
            amount=completion_bonus,
            reason=f"Completed {duration}min skill exchange session (completion_bonus={completion_bonus})",
        )
        db.add(credit_entry_learner)

    db.commit()
    db.refresh(exchange)
    return _build_exchange_response(exchange, db, current_user.id)


@router.post("/{id}/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_exchange_feedback(
    id: int,
    feedback_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/v1/exchanges/{id}/feedback
    Submit peer feedback for a completed exchange.
    
    State guards:
    - Exchange must be completed (not scheduled)
    - User must be a participant
    - Rating must be 1–5
    """
    exchange = db.query(Exchange).filter(Exchange.id == id).first()
    if not exchange:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exchange record not found.",
        )

    # Auth guard
    if current_user.id not in (exchange.teacher_id, exchange.learner_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only give feedback for exchanges you participated in.",
        )

    # State guard: feedback only on completed exchanges
    if exchange.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Feedback can only be submitted after an exchange is completed.",
        )

    # Rating validation
    if not (1 <= feedback_in.rating <= 5):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Rating must be between 1 and 5.",
        )

    # Duplicate feedback guard per user
    existing_feedback = db.query(Feedback).filter(
        Feedback.exchange_id == exchange.id,
        Feedback.from_user_id == current_user.id,
    ).first()
    if existing_feedback:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted feedback for this exchange.",
        )

    feedback = Feedback(
        exchange_id=exchange.id,
        from_user_id=current_user.id,
        rating=feedback_in.rating,
        comment=feedback_in.comment,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return FeedbackResponse(
        id=feedback.id,
        exchange_id=feedback.exchange_id,
        from_user_id=feedback.from_user_id,
        rating=feedback.rating,
        comment=feedback.comment,
        created_at=feedback.created_at,
    )
