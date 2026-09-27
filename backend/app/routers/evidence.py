from typing import List, Tuple
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models.evidence import Evidence
from app.db.models.user_skill import UserSkill
from app.db.models.user import User
from app.routers.deps import get_current_user
from app.schemas.evidence import (
    EvidenceCreate,
    EvidenceResponse,
    EvidenceVerifyResponse,
)

router = APIRouter(tags=["Evidence & Verification"])


def calculate_confidence_score(evidence_list: List[Evidence]) -> float:
    """
    Deterministic rule-based confidence score calculator:
    Weights by evidence type:
      - credential: 35 pts
      - project: 30 pts
      - achievement: 25 pts
      - demo: 20 pts
      - knowledge: 15 pts

    Multipliers by verification state:
      - verified: 1.0 (100%)
      - pending: 0.75 (75%)
      - unverified: 0.40 (40%)

    Total confidence score is capped at 100.0.
    """
    type_weights = {
        "credential": 35.0,
        "project": 30.0,
        "achievement": 25.0,
        "demo": 20.0,
        "knowledge": 15.0,
    }
    state_multipliers = {
        "verified": 1.0,
        "pending": 0.75,
        "unverified": 0.40,
    }

    total = 0.0
    for ev in evidence_list:
        weight = type_weights.get(ev.type.lower(), 15.0)
        multiplier = state_multipliers.get(ev.verification_state.lower(), 0.40)
        total += weight * multiplier

    return min(100.0, round(total, 1))


def evaluate_evidence_verification(url: str, ev_type: str) -> Tuple[str, str]:
    """
    Deterministic explainable rule-based verifier.
    Checks URL structure, recognized educational/portfolio/repository domains.
    """
    url_lower = url.lower().strip()
    ev_type = ev_type.lower()

    if not (url_lower.startswith("http://") or url_lower.startswith("https://")):
        return "unverified", "Invalid URL protocol. Must start with http:// or https://"

    # GitHub / code repositories
    if any(repo in url_lower for repo in ["github.com", "gitlab.com", "bitbucket.org"]):
        if ev_type in ["project", "demo"]:
            return "pending", "GitHub repository detected; staged for peer review and automated checks."
        return "pending", "Source repository URL recognized and staged for validation."

    # Recognized certifications & competitive platforms
    if any(plat in url_lower for plat in ["coursera.org", "udemy.com", "kaggle.com", "hackerrank.com", "leetcode.com", "edx.org"]):
        return "verified", "Recognized educational or credential platform verified."

    # Video demos
    if any(vid in url_lower for vid in ["youtube.com", "youtu.be", "loom.com", "vimeo.com"]):
        return "verified", "Video demonstration stream verified."

    # Design & creative portfolios
    if any(des in url_lower for des in ["figma.com", "behance.net", "dribbble.com"]):
        return "verified", "Creative design portfolio link verified."

    # Deployed web applications
    if any(dep in url_lower for dep in ["vercel.app", "netlify.app", "pages.dev", "render.com"]):
        return "verified", "Live deployed cloud application verified."

    # Tech articles & knowledge blogs
    if any(art in url_lower for art in ["medium.com", "dev.to", "substack.com", "arxiv.org"]):
        return "verified", "Technical article / research publication verified."

    return "unverified", "Standard web domain submitted; awaiting peer verification."


@router.post(
    "/skills/{user_skill_id}/evidence",
    response_model=EvidenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def attach_evidence(
    user_skill_id: int,
    evidence_in: EvidenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Attach evidence URL, type, and description to a claimed skill."""
    # Find user_skill owned by current user
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

    # Determine initial verification state based on deterministic rule
    state, _ = evaluate_evidence_verification(evidence_in.url, evidence_in.type)

    evidence = Evidence(
        user_skill_id=user_skill.id,
        type=evidence_in.type.lower(),
        url=evidence_in.url,
        description=evidence_in.description,
        verification_state=state,
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    # Recalculate confidence score
    all_evidence = db.query(Evidence).filter(Evidence.user_skill_id == user_skill.id).all()
    user_skill.confidence_score = calculate_confidence_score(all_evidence)
    db.add(user_skill)
    db.commit()

    return evidence


@router.get(
    "/skills/{user_skill_id}/evidence",
    response_model=List[EvidenceResponse],
)
def get_skill_evidence(
    user_skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch all evidence items attached to a claimed user skill."""
    user_skill = db.query(UserSkill).filter(UserSkill.id == user_skill_id).first()
    if not user_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claimed skill not found.",
        )

    evidence_list = (
        db.query(Evidence)
        .filter(Evidence.user_skill_id == user_skill_id)
        .order_by(Evidence.created_at.desc())
        .all()
    )
    return evidence_list


@router.patch(
    "/evidence/{evidence_id}/verify",
    response_model=EvidenceVerifyResponse,
)
def verify_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Deterministic rule-based evidence verification.
    Applies domain rules and updates user skill confidence score.
    """
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence with ID {evidence_id} not found.",
        )

    user_skill = db.query(UserSkill).filter(UserSkill.id == evidence.user_skill_id).first()
    if not user_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated claimed skill not found.",
        )

    state, explanation = evaluate_evidence_verification(evidence.url, evidence.type)
    evidence.verification_state = state
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    # Recalculate confidence score
    all_evidence = db.query(Evidence).filter(Evidence.user_skill_id == user_skill.id).all()
    new_confidence = calculate_confidence_score(all_evidence)
    user_skill.confidence_score = new_confidence
    db.add(user_skill)
    db.commit()

    return EvidenceVerifyResponse(
        id=evidence.id,
        user_skill_id=user_skill.id,
        verification_state=evidence.verification_state,
        confidence_score=new_confidence,
        explanation=explanation,
    )
