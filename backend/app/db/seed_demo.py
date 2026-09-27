import os
import sys
import logging

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))))

from app.db.database import SessionLocal, engine, Base
from app.db.models.user import User
from app.db.models.skill import Skill
from app.db.models.user_skill import UserSkill
from app.db.models.evidence import Evidence
from app.db.models.skill_credit import SkillCredit
from app.core.security import get_password_hash
from app.db.seed_taxonomy import seed_taxonomy
from app.routers.evidence import calculate_confidence_score

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skillloop.seed_demo")


def get_or_create_user(db, email, full_name, password, department, year_of_study, bio, github_url=None, portfolio_url=None):
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user:
        user = User(
            email=email.lower(),
            hashed_password=get_password_hash(password),
            full_name=full_name,
            department=department,
            year_of_study=year_of_study,
            bio=bio,
            github_url=github_url,
            portfolio_url=portfolio_url,
            is_active=True,
        )
        db.add(user)
        db.flush()

        # Signup bonus
        db.add(SkillCredit(user_id=user.id, amount=100, reason="signup_bonus"))
        db.commit()
        db.refresh(user)
        logger.info(f"Created demo user: {full_name} ({email})")
    return user


def get_or_create_user_skill(db, user_id, skill_id, direction, level="Intermediate"):
    us = (
        db.query(UserSkill)
        .filter(
            UserSkill.user_id == user_id,
            UserSkill.skill_id == skill_id,
            UserSkill.direction == direction,
        )
        .first()
    )
    if not us:
        us = UserSkill(
            user_id=user_id,
            skill_id=skill_id,
            direction=direction,
            level=level,
            confidence_score=0.0,
        )
        db.add(us)
        db.commit()
        db.refresh(us)
        logger.info(f"  + Claimed skill: {us.skill.name if us.skill else skill_id} ({direction}) for user {user_id}")
    return us


def get_or_create_evidence(db, user_skill_id, ev_type, url, description, verification_state="verified"):
    ev = (
        db.query(Evidence)
        .filter(
            Evidence.user_skill_id == user_skill_id,
            Evidence.url == url,
        )
        .first()
    )
    if not ev:
        ev = Evidence(
            user_skill_id=user_skill_id,
            type=ev_type,
            url=url,
            description=description,
            verification_state=verification_state,
        )
        db.add(ev)
        db.commit()
        db.refresh(ev)
        logger.info(f"    * Attached evidence: [{ev_type}] {url}")

    # Recalculate confidence score
    all_ev = db.query(Evidence).filter(Evidence.user_skill_id == user_skill_id).all()
    user_skill = db.query(UserSkill).filter(UserSkill.id == user_skill_id).first()
    if user_skill:
        user_skill.confidence_score = calculate_confidence_score(all_ev)
        db.add(user_skill)
        db.commit()
        db.refresh(user_skill)

    return ev


def seed_demo_data():
    """Seeds the 2-user demo story (User A: Alex Rivera, User B: Sarah Chen)."""
    logger.info("Initializing Demo Seed Data...")
    Base.metadata.create_all(bind=engine)
    
    # Ensure taxonomy is populated
    seed_taxonomy()

    db = SessionLocal()
    try:
        # Find Python and UI/UX Design skills
        python_skill = db.query(Skill).filter(Skill.name.ilike("%Python%")).first()
        uiux_skill = db.query(Skill).filter(Skill.name.ilike("%UI/UX%")).first()

        if not python_skill or not uiux_skill:
            logger.error("Taxonomy skills for Python or UI/UX Design not found!")
            return

        # -------------------------------------------------------------
        # User A: Alex Rivera (CS, 3rd Year)
        # Teaches: Python (Advanced) with verified GitHub evidence
        # Wants: UI/UX Design (Beginner)
        # -------------------------------------------------------------
        user_a = get_or_create_user(
            db,
            email="alex.rivera@campus.edu",
            full_name="Alex Rivera",
            password="password123",
            department="Computer Science",
            year_of_study="3rd Year",
            bio="Full-stack developer building fast Python & React tools. Looking to master UI/UX design and Figma.",
            github_url="https://github.com/alexrivera-dev",
        )

        us_a_teach = get_or_create_user_skill(db, user_a.id, python_skill.id, "teach", "Advanced")
        get_or_create_evidence(
            db,
            us_a_teach.id,
            ev_type="project",
            url="https://github.com/alexrivera-dev/python-fastapi-microservices",
            description="Production FastAPI microservices architecture with test suite and Docker deployment.",
            verification_state="verified",
        )
        get_or_create_evidence(
            db,
            us_a_teach.id,
            ev_type="credential",
            url="https://coursera.org/verify/PYTHON-ADV-2026",
            description="Advanced Python Specialization Certificate.",
            verification_state="verified",
        )

        us_a_learn = get_or_create_user_skill(db, user_a.id, uiux_skill.id, "learn", "Beginner")

        # -------------------------------------------------------------
        # User B: Sarah Chen (CS, 4th Year)
        # Teaches: UI/UX Design (Expert) with verified Figma & Credential evidence
        # Wants: Python (Beginner)
        # -------------------------------------------------------------
        user_b = get_or_create_user(
            db,
            email="sarah.chen@campus.edu",
            full_name="Sarah Chen",
            password="password123",
            department="Computer Science",
            year_of_study="4th Year",
            bio="Product designer and Figma creator. Looking to learn Python backend development to bring prototypes to life.",
            portfolio_url="https://figma.com/@sarahchen_design",
        )

        us_b_teach = get_or_create_user_skill(db, user_b.id, uiux_skill.id, "teach", "Expert")
        get_or_create_evidence(
            db,
            us_b_teach.id,
            ev_type="project",
            url="https://figma.com/@sarahchen_design/campus-app-system",
            description="Campus SkillLoop UI design system, component tokens, and interactive prototype.",
            verification_state="verified",
        )
        get_or_create_evidence(
            db,
            us_b_teach.id,
            ev_type="credential",
            url="https://coursera.org/verify/GOOGLE-UX-2026",
            description="Google UX Design Professional Certificate.",
            verification_state="verified",
        )

        us_b_learn = get_or_create_user_skill(db, user_b.id, python_skill.id, "learn", "Beginner")

        logger.info("✅ Demo Seed Data Populated Successfully!")
        logger.info(f"User A: {user_a.email} (Password: password123) -> Teaches: {python_skill.name} ({us_a_teach.confidence_score}%), Wants: {uiux_skill.name}")
        logger.info(f"User B: {user_b.email} (Password: password123) -> Teaches: {uiux_skill.name} ({us_b_teach.confidence_score}%), Wants: {python_skill.name}")

    except Exception as e:
        logger.error(f"Error seeding demo data: {e}")
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
