from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.db.models.user_skill import UserSkill
from app.db.models.skill import Skill
from app.db.models.category import SkillCategory


class RecommendationService:
    @staticmethod
    def get_candidates(db: Session, user_id: int) -> List[User]:
        """
        Stage 1 (Candidate Generation):
        Pulls active candidate students from DB (excluding current user).
        """
        candidates = (
            db.query(User)
            .filter(User.id != user_id, User.is_active == True)
            .all()
        )
        return candidates

    @staticmethod
    def rank_candidates(
        db: Session, user_id: int, candidates: List[User], top_n: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Stage 2 (Ranking & Reason Generation):
        Scores candidates by reciprocity, taxonomy category overlap, and evidence confidence.
        """
        user = db.query(User).filter(User.id == user_id).first()
        user_skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()

        user_teach_skills = [s for s in user_skills if s.direction == "teach"]
        user_learn_skills = [s for s in user_skills if s.direction == "learn"]

        user_teach_names = {s.skill.name.lower(): s for s in user_teach_skills if s.skill}
        user_learn_names = {s.skill.name.lower(): s for s in user_learn_skills if s.skill}
        user_teach_cats = {s.skill.category.name.lower() for s in user_teach_skills if s.skill and s.skill.category}
        user_learn_cats = {s.skill.category.name.lower() for s in user_learn_skills if s.skill and s.skill.category}

        ranked_results = []

        def match_skill(cand_s, target_names, target_cats):
            if not cand_s.skill:
                return False
            name_l = cand_s.skill.name.lower()
            # Direct match or substring overlap
            if name_l in target_names or any(name_l in t or t in name_l for t in target_names):
                return True
            if cand_s.skill.category and cand_s.skill.category.name.lower() in target_cats:
                return True
            return False

        for candidate in candidates:
            cand_skills = db.query(UserSkill).filter(UserSkill.user_id == candidate.id).all()
            cand_teach = [s for s in cand_skills if s.direction == "teach"]
            cand_learn = [s for s in cand_skills if s.direction == "learn"]

            score = 60.0  # Base compatibility baseline

            # What candidate can teach current user:
            can_teach_me = [s for s in cand_teach if match_skill(s, user_learn_names, user_learn_cats)]

            # What current user can teach candidate:
            i_can_teach = [s for s in cand_learn if match_skill(s, user_teach_names, user_teach_cats)]

            # Reciprocity scoring
            if can_teach_me:
                score += 15.0
            if i_can_teach:
                score += 15.0
            if can_teach_me and i_can_teach:
                score += 10.0  # Mutual Reciprocity Bonus

            # Skill Evidence Confidence
            has_verified_evidence = any(
                s.confidence_score >= 40 or any(e.verification_state == "verified" for e in s.evidence)
                for s in cand_teach
            )
            if has_verified_evidence:
                score += 5.0

            # Department / Campus Alignment
            if user and candidate.department == user.department:
                score += 5.0

            score = min(98.0, max(50.0, score))

            cand_first_name = candidate.full_name.split()[0] if candidate.full_name else "Peer"
            teach_me_str = can_teach_me[0].skill.name if can_teach_me and can_teach_me[0].skill else (cand_teach[0].skill.name if cand_teach and cand_teach[0].skill else "their specialty")
            i_teach_str = i_can_teach[0].skill.name if i_can_teach and i_can_teach[0].skill else (user_teach_skills[0].skill.name if user_teach_skills and user_teach_skills[0].skill else "your skills")

            reason_str = f"You can teach {cand_first_name} {i_teach_str}, and they can teach you {teach_me_str}."
            if user and candidate.department == user.department:
                reason_str += f" Both in {candidate.department}."

            teaches_list = [s.skill.name for s in cand_teach if s.skill] or ["Peer Mentorship"]
            wants_list = [s.skill.name for s in cand_learn if s.skill] or ["Skill Growth"]

            ranked_results.append({
                "user_id": candidate.id,
                "full_name": candidate.full_name,
                "department": candidate.department,
                "year_of_study": candidate.year_of_study,
                "compatibility_percent": int(score),
                "reason": reason_str,
                "teaches": teaches_list,
                "wants": wants_list,
                "evidence_verified": has_verified_evidence,
            })

        ranked_results.sort(key=lambda x: x["compatibility_percent"], reverse=True)
        return ranked_results[:top_n]

    @classmethod
    def get_recommendations(cls, db: Session, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        candidates = cls.get_candidates(db, user_id)
        return cls.rank_candidates(db, user_id, candidates, top_n=limit)
