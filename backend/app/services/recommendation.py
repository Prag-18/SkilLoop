from typing import List, Dict, Any
from sqlalchemy.orm import Session, selectinload
from app.db.models.user import User
from app.db.models.user_skill import UserSkill
from app.db.models.skill import Skill
from app.db.models.category import SkillCategory

# Scoring constants (must match walkthrough doc)
BASE_SCORE = 65.0
SCORE_TEACH_ME = 15.0       # Candidate teaches something current user wants
SCORE_I_CAN_TEACH = 15.0    # Current user teaches something candidate wants
SCORE_MUTUAL_BONUS = 10.0   # Both directions match (reciprocity)
SCORE_EVIDENCE_BONUS = 4.0  # Candidate has verified evidence URL
SCORE_DEPT_BONUS = 5.0      # Same department
SCORE_MIN = 65.0            # Don't inflate no-skill candidates with artificial floor
SCORE_MAX = 98.0


class RecommendationService:
    @staticmethod
    def get_candidates(db: Session, user_id: int) -> List[User]:
        """
        Stage 1 (Candidate Generation):
        Pull all active users excluding current user as the initial candidate pool.
        Eager load skills, taxonomy metadata, and evidence to prevent N+1 queries.
        """
        return db.query(User).options(
            selectinload(User.skills).selectinload(UserSkill.skill).selectinload(Skill.category),
            selectinload(User.skills).selectinload(UserSkill.evidence),
        ).filter(
            User.id != user_id,
            User.is_active == True,
        ).all()

    @staticmethod
    def rank_candidates(
        db: Session, user_id: int, candidates: List[User], top_n: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Stage 2 (Ranking & Reason Generation):
        Scores candidates by reciprocity, taxonomy category overlap, evidence
        confidence, and department alignment. Returns top_n with a human-readable
        reason string.

        Scoring breakdown (matching walkthrough doc):
          Base: 65%
          Candidate teaches what user wants:   +15%
          User teaches what candidate wants:   +15%
          Mutual reciprocity bonus:            +10%
          Verified evidence on skill:          +4%
          Shared department:                   +5%
          Max capped at 98%, no artificial minimum
        """
        user = db.query(User).options(
            selectinload(User.skills).selectinload(UserSkill.skill).selectinload(Skill.category),
            selectinload(User.skills).selectinload(UserSkill.evidence),
        ).filter(User.id == user_id).first()
        if not user:
            return []

        user_skills = user.skills or []
        user_teach_skills = [s for s in user_skills if s.direction == "teach"]
        user_learn_skills = [s for s in user_skills if s.direction == "learn"]

        user_teach_names = {s.skill.name.lower() for s in user_teach_skills if s.skill}
        user_learn_names = {s.skill.name.lower() for s in user_learn_skills if s.skill}
        user_teach_cats = {s.skill.category.name.lower() for s in user_teach_skills if s.skill and s.skill.category}
        user_learn_cats = {s.skill.category.name.lower() for s in user_learn_skills if s.skill and s.skill.category}

        ranked_results = []

        def match_skill(cand_s, target_names, target_cats):
            if not cand_s.skill:
                return False
            name_l = cand_s.skill.name.lower()
            if name_l in target_names or any(name_l in t or t in name_l for t in target_names):
                return True
            if cand_s.skill.category and cand_s.skill.category.name.lower() in target_cats:
                return True
            return False

        for candidate in candidates:
            if not candidate.full_name:
                continue

            cand_skills = candidate.skills or []
            cand_teach = [s for s in cand_skills if s.direction == "teach"]
            cand_learn = [s for s in cand_skills if s.direction == "learn"]

            score = BASE_SCORE

            can_teach_me = [s for s in cand_teach if match_skill(s, user_learn_names, user_learn_cats)]
            i_can_teach = [s for s in cand_learn if match_skill(s, user_teach_names, user_teach_cats)]

            if can_teach_me:
                score += SCORE_TEACH_ME
            if i_can_teach:
                score += SCORE_I_CAN_TEACH
            if can_teach_me and i_can_teach:
                score += SCORE_MUTUAL_BONUS

            has_verified_evidence = any(
                any(e.verification_state == "verified" for e in (s.evidence or []))
                for s in cand_teach
            )
            if has_verified_evidence:
                score += SCORE_EVIDENCE_BONUS

            if candidate.department and user.department and candidate.department == user.department:
                score += SCORE_DEPT_BONUS

            # Cap only — no artificial minimum that inflates no-overlap candidates
            score = min(SCORE_MAX, score)

            if score == BASE_SCORE and (user_teach_skills or user_learn_skills):
                if not cand_teach and not cand_learn:
                    continue  # No skills at all — skip rather than fake a match

            cand_first = candidate.full_name.split()[0]

            if i_can_teach and can_teach_me:
                teach_me_str = can_teach_me[0].skill.name
                i_teach_str = i_can_teach[0].skill.name
                reason = f"You can teach {cand_first} {i_teach_str} and they can teach you {teach_me_str}."
            elif can_teach_me:
                reason = f"{cand_first} can teach you {can_teach_me[0].skill.name}."
            elif i_can_teach:
                reason = f"You can teach {cand_first} {i_can_teach[0].skill.name}."
            elif cand_teach:
                reason = f"{cand_first} offers {cand_teach[0].skill.name}."
            else:
                reason = f"{cand_first} is looking to expand their skills."

            if candidate.department and user.department and candidate.department == user.department:
                reason += f" Both in {candidate.department}."

            teaches_list = [s.skill.name for s in cand_teach if s.skill] or ["Open to Mentoring"]
            wants_list = [s.skill.name for s in cand_learn if s.skill] or ["Skill Growth"]

            ranked_results.append({
                "user_id": candidate.id,
                "full_name": candidate.full_name,
                "department": candidate.department or "Unknown",
                "year_of_study": candidate.year_of_study or "Student",
                "compatibility_percent": int(score),
                "reason": reason,
                "teaches": teaches_list,
                "wants": wants_list,
                "evidence_verified": has_verified_evidence,
                "avatar_url": candidate.avatar_url,
                "headline": candidate.headline,
                "interests": candidate.interests or [],
            })

        ranked_results.sort(key=lambda x: x["compatibility_percent"], reverse=True)
        return ranked_results[:top_n]

    @classmethod
    def get_recommendations(cls, db: Session, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Public entry point: get_candidates (Stage 1) → rank_candidates (Stage 2)."""
        candidates = cls.get_candidates(db, user_id)
        return cls.rank_candidates(db, user_id, candidates, top_n=limit)
