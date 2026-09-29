from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.routers.deps import get_current_user
from app.db.models.user import User
from app.db.models.learning_request import LearningRequest
from app.db.models.exchange import Exchange
from app.db.models.skill import Skill
from app.schemas.request import LearningRequestCreate, LearningRequestResponse

router = APIRouter(prefix="/requests", tags=["Learning Requests"])


def _build_request_response(r: LearningRequest, db: Session, current_user_id: Optional[int] = None) -> LearningRequestResponse:
    """Helper to build a consistent LearningRequestResponse with conditional mutual phone exchange."""
    sender = db.query(User).filter(User.id == r.sender_id).first()
    receiver = db.query(User).filter(User.id == r.receiver_id).first()
    skill = db.query(Skill).filter(Skill.id == r.requested_skill_id).first() if r.requested_skill_id else None

    # Mutual contact reveal ONLY when the learning request is accepted
    contact_phone = None
    if r.status == "accepted" and current_user_id:
        if current_user_id == r.sender_id and receiver:
            contact_phone = receiver.phone_number
        elif current_user_id == r.receiver_id and sender:
            contact_phone = sender.phone_number

    return LearningRequestResponse(
        id=r.id,
        sender_id=r.sender_id,
        receiver_id=r.receiver_id,
        requested_skill_id=r.requested_skill_id,
        status=r.status,
        created_at=r.created_at,
        sender_name=sender.full_name if sender else "Student",
        receiver_name=receiver.full_name if receiver else "Student",
        skill_name=skill.name if skill else "Skill Exchange",
        contact_phone=contact_phone,
        sender_phone=sender.phone_number if (r.status == "accepted" and current_user_id in (r.sender_id, r.receiver_id)) else None,
        receiver_phone=receiver.phone_number if (r.status == "accepted" and current_user_id in (r.sender_id, r.receiver_id)) else None,
    )


@router.post("", response_model=LearningRequestResponse, status_code=status.HTTP_201_CREATED)
def create_learning_request(
    request_in: LearningRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/v1/requests
    Send a learning request to another student.
    """
    if request_in.receiver_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send a learning request to yourself.",
        )

    receiver = db.query(User).filter(User.id == request_in.receiver_id).first()
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target student user not found.",
        )

    # Guard: prevent duplicate pending requests
    existing = db.query(LearningRequest).filter(
        LearningRequest.sender_id == current_user.id,
        LearningRequest.receiver_id == request_in.receiver_id,
        LearningRequest.status == "pending",
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A pending learning request to this student already exists.",
        )

    learning_req = LearningRequest(
        sender_id=current_user.id,
        receiver_id=request_in.receiver_id,
        requested_skill_id=request_in.requested_skill_id,
        status="pending",
    )
    db.add(learning_req)
    db.commit()
    db.refresh(learning_req)

    return _build_request_response(learning_req, db, current_user.id)


@router.get("", response_model=List[LearningRequestResponse])
def get_learning_requests(
    type: Optional[str] = Query("received", description="sent or received"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/v1/requests?type=sent|received
    Fetch learning requests sent or received by current user.
    """
    if type == "sent":
        query = db.query(LearningRequest).filter(LearningRequest.sender_id == current_user.id)
    else:
        query = db.query(LearningRequest).filter(LearningRequest.receiver_id == current_user.id)

    return [_build_request_response(r, db, current_user.id) for r in query.order_by(LearningRequest.created_at.desc()).all()]


@router.patch("/{id}/accept", response_model=LearningRequestResponse)
def accept_learning_request(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    PATCH /api/v1/requests/{id}/accept
    Accept a received learning request and create a scheduled Exchange.
    Rejects invalid state transitions (already accepted/rejected).
    """
    learning_req = db.query(LearningRequest).filter(LearningRequest.id == id).first()
    if not learning_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning request not found.",
        )
    if learning_req.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only accept requests sent to you.",
        )
    # State-machine guard: only pending can be accepted
    if learning_req.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot accept a request that is already '{learning_req.status}'. Only pending requests can be accepted.",
        )

    learning_req.status = "accepted"

    # Prevent duplicate exchanges for same request
    existing_exchange = db.query(Exchange).filter(Exchange.request_id == learning_req.id).first()
    if not existing_exchange:
        exchange = Exchange(
            request_id=learning_req.id,
            teacher_id=learning_req.receiver_id,
            learner_id=learning_req.sender_id,
            skill_id=learning_req.requested_skill_id,
            status="scheduled",
            duration_minutes=60,
            credits_awarded=0,
        )
        db.add(exchange)

    db.commit()
    db.refresh(learning_req)

    return _build_request_response(learning_req, db, current_user.id)


@router.patch("/{id}/reject", response_model=LearningRequestResponse)
def reject_learning_request(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    PATCH /api/v1/requests/{id}/reject
    Reject a received learning request.
    Rejects invalid state transitions (already accepted/rejected).
    """
    learning_req = db.query(LearningRequest).filter(LearningRequest.id == id).first()
    if not learning_req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning request not found.",
        )
    if learning_req.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only reject requests sent to you.",
        )
    # State-machine guard: only pending can be rejected
    if learning_req.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot reject a request that is already '{learning_req.status}'. Only pending requests can be rejected.",
        )

    learning_req.status = "rejected"
    db.commit()
    db.refresh(learning_req)

    return _build_request_response(learning_req, db, current_user.id)
