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

    exchanges = query.all()
    results = []

    for ex in exchanges:
        teacher = db.query(User).filter(User.id == ex.teacher_id).first()
        learner = db.query(User).filter(User.id == ex.learner_id).first()
        skill = db.query(Skill).filter(Skill.id == ex.skill_id).first() if ex.skill_id else None

        results.append(
            ExchangeResponse(
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
            )
        )
    return results


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
    Credits breakdown:
    - 30 min duration = +10 credits
    - 60 min duration = +20 credits
    - Completion bonus = +5 credits
    - Verified mentor bonus = +25 credits
    """
    # Find exchange by request_id or exchange id
    exchange = db.query(Exchange).filter(
        (Exchange.request_id == request_id) | (Exchange.id == request_id)
    ).first()

    if not exchange:
        # Create exchange on the fly if completing a learning request directly
        req = db.query(LearningRequest).filter(LearningRequest.id == request_id).first()
        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exchange or learning request not found.",
            )
        exchange = Exchange(
            request_id=req.id,
            teacher_id=req.receiver_id,
            learner_id=req.sender_id,
            skill_id=req.requested_skill_id,
            status="scheduled",
        )
        db.add(exchange)
        db.commit()
        db.refresh(exchange)

    if current_user.id not in (exchange.teacher_id, exchange.learner_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this exchange.",
        )

    # Calculate credits
    duration = body.duration_minutes
    duration_credits = 20 if duration >= 60 else 10
    completion_bonus = 5
    mentor_bonus = 25 if body.is_verified_mentor else 0

    total_credits = duration_credits + completion_bonus + mentor_bonus

    exchange.status = "completed"
    exchange.duration_minutes = duration
    exchange.credits_awarded = total_credits
    exchange.completed_at = datetime.datetime.utcnow()

    # Credit award ledger for teacher (duration + completion + verified mentor bonuses)
    teacher = db.query(User).filter(User.id == exchange.teacher_id).first()
    if teacher:
        credit_entry_teacher = SkillCredit(
            user_id=teacher.id,
            amount=total_credits,
            reason=f"Completed {duration}min skill exchange mentorship (duration={duration_credits}, completion={completion_bonus}, mentor_bonus={mentor_bonus})",
        )
        db.add(credit_entry_teacher)

    # Credit award ledger for learner (participation / completion bonus = +5)
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

    teacher = db.query(User).filter(User.id == exchange.teacher_id).first()
    learner = db.query(User).filter(User.id == exchange.learner_id).first()
    skill = db.query(Skill).filter(Skill.id == exchange.skill_id).first() if exchange.skill_id else None

    return ExchangeResponse(
        id=exchange.id,
        request_id=exchange.request_id,
        teacher_id=exchange.teacher_id,
        learner_id=exchange.learner_id,
        skill_id=exchange.skill_id,
        status=exchange.status,
        duration_minutes=exchange.duration_minutes,
        credits_awarded=exchange.credits_awarded,
        completed_at=exchange.completed_at,
        created_at=exchange.created_at,
        teacher_name=teacher.full_name if teacher else "Teacher",
        learner_name=learner.full_name if learner else "Learner",
        skill_name=skill.name if skill else "Peer Mentorship",
    )


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
    """
    exchange = db.query(Exchange).filter(Exchange.id == id).first()
    if not exchange:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exchange record not found.",
        )

    if current_user.id not in (exchange.teacher_id, exchange.learner_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only give feedback for exchanges you participated in.",
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
