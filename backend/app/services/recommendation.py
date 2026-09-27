from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.db.models.skill import Skill


class RecommendationService:
    @staticmethod
    def get_candidates(db: Session, user_id: int) -> List[User]:
        """
        Stage 1 (Candidate Generation):
        Pulls candidate users from DB who offer or want skills overlapping/sharing categories with user.
        """
        user_skills = db.query(Skill).filter(Skill.user_id == user_id).all()
        user_learn_categories = {s.category.lower() for s in user_skills if s.skill_type == "learn"}
        user_teach_categories = {s.category.lower() for s in user_skills if s.skill_type == "teach"}
        
        # Pull candidate active users (excluding current user)
        candidates = db.query(User).filter(User.id != user_id, User.is_active == True).all()
        return candidates

    @staticmethod
    def rank_candidates(db: Session, user_id: int, candidates: List[User], top_n: int = 10) -> List[Dict[str, Any]]:
        """
        Stage 2 (Ranking & Reason Generation):
        Scores candidates by reciprocity, category overlap, and evidence confidence.
        """
        user = db.query(User).filter(User.id == user_id).first()
        user_skills = db.query(Skill).filter(Skill.user_id == user_id).all()
        
        user_teach_skills = [s for s in user_skills if s.skill_type == "teach"]
        user_learn_skills = [s for s in user_skills if s.skill_type == "learn"]

        user_teach_names = {s.name.lower(): s for s in user_teach_skills}
        user_learn_names = {s.name.lower(): s for s in user_learn_skills}
        user_teach_cats = {s.category.lower() for s in user_teach_skills}
        user_learn_cats = {s.category.lower() for s in user_learn_skills}

        ranked_results = []

        for candidate in candidates:
            cand_skills = db.query(Skill).filter(Skill.user_id == candidate.id).all()
            cand_teach = [s for s in cand_skills if s.skill_type == "teach"]
            cand_learn = [s for s in cand_skills if s.skill_type == "learn"]

            score = 65.0  # Base compatibility baseline

            # What candidate can teach current user:
            can_teach_me = []
            for s in cand_teach:
                if s.name.lower() in user_learn_names or s.category.lower() in user_learn_cats:
                    can_teach_me.append(s)

            # What current user can teach candidate:
            i_can_teach = []
            for s in cand_learn:
                if s.name.lower() in user_teach_names or s.category.lower() in user_teach_cats:
                    i_can_teach.append(s)

            # Reciprocity scoring
            if can_teach_me:
                score += 15.0
            if i_can_teach:
                score += 15.0
            if can_teach_me and i_can_teach:
                score += 10.0  # Mutual Reciprocity Bonus

            # Skill Evidence Confidence
            if any(s.evidence_url for s in cand_teach):
                score += 4.0

            # Department / Interest Alignment
            if user and candidate.department == user.department:
                score += 5.0

            score = min(98.0, max(72.0, score))

            cand_first_name = candidate.full_name.split()[0] if candidate.full_name else "Peer"
            teach_me_str = can_teach_me[0].name if can_teach_me else (cand_teach[0].name if cand_teach else "their specialty")
            i_teach_str = i_can_teach[0].name if i_can_teach else (user_teach_skills[0].name if user_teach_skills else "your skills")

            reason_str = f"You can teach {cand_first_name} {i_teach_str}, she can teach you {teach_me_str}."
            if user and candidate.department == user.department:
                reason_str += f" Both in {candidate.department}."

            ranked_results.append({
                "user_id": candidate.id,
                "full_name": candidate.full_name,
                "department": candidate.department,
                "year_of_study": candidate.year_of_study,
                "compatibility_percent": int(score),
                "reason": reason_str,
                "teaches": [s.name for s in cand_teach] or ["Peer Mentorship"],
                "wants": [s.name for s in cand_learn] or ["Skill Growth"],
                "evidence_verified": any(bool(s.evidence_url) for s in cand_teach),
            })

        ranked_results.sort(key=lambda x: x["compatibility_percent"], reverse=True)
        return ranked_results[:top_n]

    @classmethod
    def get_recommendations(cls, db: Session, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        candidates = cls.get_candidates(db, user_id)
        return cls.rank_candidates(db, user_id, candidates, top_n=limit)
