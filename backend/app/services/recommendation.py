from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.db.models.skill import Skill

# Scoring constants (must match walkthrough doc)
BASE_SCORE = 65.0
SCORE_TEACH_ME = 15.0       # Candidate teaches something current user wants
SCORE_I_CAN_TEACH = 15.0    # Current user teaches something candidate wants
SCORE_MUTUAL_BONUS = 10.0   # Both directions match (reciprocity)
SCORE_EVIDENCE_BONUS = 4.0  # Candidate has verified evidence URL
SCORE_DEPT_BONUS = 5.0      # Same department
SCORE_MIN = 65.0            # Don't inflate no-skill candidates with artificial floor
SCORE_MAX = 98.0


def _get_gender_neutral_pronoun_phrase(full_name: str, skill_name: str) -> str:
    """Return gender-neutral reason fragment: '<Name> can teach you <skill>'."""
    first = full_name.split()[0] if full_name else "Peer"
    return f"{first} can teach you {skill_name}"


class RecommendationService:
    @staticmethod
    def get_candidates(db: Session, user_id: int) -> List[User]:
        """
        Stage 1 (Candidate Generation):
        Pull all active users excluding current user as initial candidate pool.
        Future slot: replace with vector DB ANN query here.
        """
        return db.query(User).filter(
            User.id != user_id,
            User.is_active == True,
        ).all()

    @staticmethod
    def rank_candidates(
        db: Session,
        user_id: int,
        candidates: List[User],
        top_n: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Stage 2 (Ranking & Reason Generation):
        Scores candidates by reciprocity, category overlap, evidence confidence,
        and department alignment. Returns top_n with human-readable reason string.

        Scoring breakdown (matching walkthrough doc):
          Base: 65%
          Candidate teaches what user wants:   +15%
          User teaches what candidate wants:   +15%
          Mutual reciprocity bonus:            +10%
          Verified evidence URL on skill:      +4%
          Shared department:                   +5%
          Max capped at 98%
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        user_skills = db.query(Skill).filter(Skill.user_id == user_id).all()
        user_teach_skills = [s for s in user_skills if s.skill_type == "teach"]
        user_learn_skills = [s for s in user_skills if s.skill_type == "learn"]

        user_teach_names = {s.name.lower() for s in user_teach_skills}
        user_learn_names = {s.name.lower() for s in user_learn_skills}
        user_teach_cats = {s.category.lower() for s in user_teach_skills}
        user_learn_cats = {s.category.lower() for s in user_learn_skills}

        ranked_results = []

        for candidate in candidates:
            if not candidate.full_name:
                continue

            cand_skills = db.query(Skill).filter(Skill.user_id == candidate.id).all()
            cand_teach = [s for s in cand_skills if s.skill_type == "teach"]
            cand_learn = [s for s in cand_skills if s.skill_type == "learn"]

            score = BASE_SCORE

            # What candidate can teach current user (name or category overlap)
            can_teach_me = [
                s for s in cand_teach
                if s.name.lower() in user_learn_names or s.category.lower() in user_learn_cats
            ]

            # What current user can teach candidate (name or category overlap)
            i_can_teach = [
                s for s in cand_learn
                if s.name.lower() in user_teach_names or s.category.lower() in user_teach_cats
            ]

            if can_teach_me:
                score += SCORE_TEACH_ME
            if i_can_teach:
                score += SCORE_I_CAN_TEACH
            if can_teach_me and i_can_teach:
                score += SCORE_MUTUAL_BONUS  # Mutual reciprocity

            # Evidence confidence: teacher has a verified evidence URL
            if any(bool(s.evidence_url) for s in cand_teach):
                score += SCORE_EVIDENCE_BONUS

            # Department alignment
            if candidate.department and user.department and candidate.department == user.department:
                score += SCORE_DEPT_BONUS

            # Cap score; do NOT enforce artificial minimum that inflates no-skill candidates
            score = min(SCORE_MAX, score)

            # Skip candidates with score at base (no overlap at all) if user has skills
            if score == BASE_SCORE and (user_teach_skills or user_learn_skills):
                if not cand_teach and not cand_learn:
                    continue  # Candidate has no skills — skip rather than fake 65%

            cand_first = candidate.full_name.split()[0]

            # Build reason string (gender-neutral)
            if i_can_teach and can_teach_me:
                teach_me_str = can_teach_me[0].name
                i_teach_str = i_can_teach[0].name
                reason = (
                    f"You can teach {cand_first} {i_teach_str} and they can teach you {teach_me_str}."
                )
            elif can_teach_me:
                reason = f"{cand_first} can teach you {can_teach_me[0].name}."
            elif i_can_teach:
                i_teach_str = i_can_teach[0].name
                reason = f"You can teach {cand_first} {i_teach_str}."
            elif cand_teach:
                reason = f"{cand_first} offers {cand_teach[0].name}."
            else:
                reason = f"{cand_first} is looking to expand their skills."

            if candidate.department and user.department and candidate.department == user.department:
                reason += f" Both in {candidate.department}."

            ranked_results.append({
                "user_id": candidate.id,
                "full_name": candidate.full_name,
                "department": candidate.department or "Unknown",
                "year_of_study": candidate.year_of_study or "Student",
                "compatibility_percent": int(score),
                "reason": reason,
                "teaches": [s.name for s in cand_teach] if cand_teach else ["Open to Mentoring"],
                "wants": [s.name for s in cand_learn] if cand_learn else ["Skill Growth"],
                "evidence_verified": any(bool(s.evidence_url) for s in cand_teach),
            })

        ranked_results.sort(key=lambda x: x["compatibility_percent"], reverse=True)
        return ranked_results[:top_n]

    @classmethod
    def get_recommendations(cls, db: Session, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Public entry point: get_candidates (Stage 1) → rank_candidates (Stage 2)."""
        candidates = cls.get_candidates(db, user_id)
        return cls.rank_candidates(db, user_id, candidates, top_n=limit)
