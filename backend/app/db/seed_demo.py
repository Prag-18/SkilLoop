import os
import sys
import logging
import datetime

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))))

from app.db.database import SessionLocal, engine, Base
from app.db.models.user import User
from app.db.models.skill import Skill
from app.db.models.user_skill import UserSkill
from app.db.models.evidence import Evidence
from app.db.models.skill_credit import SkillCredit
from app.db.models.learning_request import LearningRequest
from app.db.models.exchange import Exchange
from app.db.models.feedback import Feedback
from app.core.security import get_password_hash
from app.db.seed_taxonomy import seed_taxonomy
from app.routers.evidence import calculate_confidence_score

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("synapse.seed_demo")


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
        logger.info(f"Created student: {full_name} ({email})")
    else:
        # Update details if exists
        user.full_name = full_name
        user.department = department
        user.year_of_study = year_of_study
        user.bio = bio
        user.github_url = github_url
        user.portfolio_url = portfolio_url
        db.commit()
        db.refresh(user)
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
    """Seeds rich campus dataset with Indian student profiles across all disciplines."""
    logger.info("Initializing Synapse Indian Campus Seed Data...")
    Base.metadata.create_all(bind=engine)
    
    # Ensure taxonomy is populated
    seed_taxonomy()

    db = SessionLocal()
    try:
        # Fetch Skill records
        skills = {s.name: s for s in db.query(Skill).all()}

        # -------------------------------------------------------------
        # 1. Aarav Sharma (CS & AI, 3rd Year) - Lead Demo User
        # Teaches: Python, Deep Learning & Neural Networks
        # Wants: UI/UX Design & Prototyping (Figma)
        # -------------------------------------------------------------
        u_aarav = get_or_create_user(
            db,
            email="aarav.sharma@campus.edu",
            full_name="Aarav Sharma",
            password="password123",
            department="Computer Science & Engineering",
            year_of_study="3rd Year",
            bio="AI/ML researcher & backend builder. Building transformer pipelines in PyTorch and FastAPI microservices. Eager to master Figma and product design.",
            github_url="https://github.com/aaravsharma-dev",
            portfolio_url="https://aaravsharma.ai",
        )
        if "Python" in skills:
            us = get_or_create_user_skill(db, u_aarav.id, skills["Python"].id, "teach", "Advanced")
            get_or_create_evidence(db, us.id, "project", "https://github.com/aaravsharma-dev/fastapi-distributed-worker", "Distributed task queue with Redis, Celery and FastAPI backend.")
            get_or_create_evidence(db, us.id, "credential", "https://nptel.ac.in/verify/NPTEL-CS-PY-2026", "NPTEL Elite Gold Certificate in Python & Algorithmic Problem Solving.")
        if "Deep Learning & Neural Networks" in skills:
            us = get_or_create_user_skill(db, u_aarav.id, skills["Deep Learning & Neural Networks"].id, "teach", "Advanced")
            get_or_create_evidence(db, us.id, "project", "https://github.com/aaravsharma-dev/medical-imaging-unet", "PyTorch implementation of U-Net for MRI brain lesion segmentation.")
        if "UI/UX Design & Prototyping (Figma)" in skills:
            get_or_create_user_skill(db, u_aarav.id, skills["UI/UX Design & Prototyping (Figma)"].id, "learn", "Beginner")

        # -------------------------------------------------------------
        # 2. Priya Patel (Design & Interaction, 4th Year) - Direct Loop with Aarav
        # Teaches: UI/UX Design & Prototyping (Figma), Digital Illustration & Branding
        # Wants: Python, Full-Stack Web Development
        # -------------------------------------------------------------
        u_priya = get_or_create_user(
            db,
            email="priya.patel@campus.edu",
            full_name="Priya Patel",
            password="password123",
            department="Interaction Design & HCI",
            year_of_study="4th Year",
            bio="Lead product designer for campus apps. Obsessed with typography, auto-layout, micro-interactions, and design systems. Looking to learn Python to code my own prototypes.",
            portfolio_url="https://figma.com/@priyapatel_ux",
            github_url="https://github.com/priyaux",
        )
        if "UI/UX Design & Prototyping (Figma)" in skills:
            us = get_or_create_user_skill(db, u_priya.id, skills["UI/UX Design & Prototyping (Figma)"].id, "teach", "Expert")
            get_or_create_evidence(db, us.id, "project", "https://figma.com/@priyapatel_ux/campus-design-tokens", "Comprehensive design system with 200+ components, auto-layout 5.0, and dark mode tokens.")
            get_or_create_evidence(db, us.id, "credential", "https://coursera.org/verify/GOOGLE-UX-PRIYA-2026", "Google Professional UX Design Specialization Certificate.")
        if "Digital Illustration & Branding" in skills:
            us = get_or_create_user_skill(db, u_priya.id, skills["Digital Illustration & Branding"].id, "teach", "Advanced")
            get_or_create_evidence(db, us.id, "project", "https://behance.net/gallery/priyapatel-illustrations", "Campus Tech Fest brand identity kit and vector graphics suite.")
        if "Python" in skills:
            get_or_create_user_skill(db, u_priya.id, skills["Python"].id, "learn", "Beginner")
        if "Full-Stack Web Development" in skills:
            get_or_create_user_skill(db, u_priya.id, skills["Full-Stack Web Development"].id, "learn", "Beginner")

        # -------------------------------------------------------------
        # 3. Rohan Mehta (Software Engineering, 3rd Year)
        # Teaches: Full-Stack Web Development, REST & GraphQL API Architecture
        # Wants: Deep Learning & Neural Networks, Cloud & Docker Containerization
        # -------------------------------------------------------------
        u_rohan = get_or_create_user(
            db,
            email="rohan.mehta@campus.edu",
            full_name="Rohan Mehta",
            password="password123",
            department="Information Technology",
            year_of_study="3rd Year",
            bio="Full-stack engineer working with Next.js, GraphQL, and PostgreSQL. Built the university hackathon portal. Looking to learn Neural Networks.",
            github_url="https://github.com/rohanmehta-dev",
        )
        if "Full-Stack Web Development" in skills:
            us = get_or_create_user_skill(db, u_rohan.id, skills["Full-Stack Web Development"].id, "teach", "Expert")
            get_or_create_evidence(db, us.id, "project", "https://github.com/rohanmehta-dev/synapse-portal", "Production campus event portal built with Next.js 14, Tailwind, and Supabase.")
        if "REST & GraphQL API Architecture" in skills:
            us = get_or_create_user_skill(db, u_rohan.id, skills["REST & GraphQL API Architecture"].id, "teach", "Advanced")
            get_or_create_evidence(db, us.id, "credential", "https://graphql.org/certification/rohan-mehta", "Apollo GraphQL Certified Associate Developer.")
        if "Deep Learning & Neural Networks" in skills:
            get_or_create_user_skill(db, u_rohan.id, skills["Deep Learning & Neural Networks"].id, "learn", "Intermediate")

        # -------------------------------------------------------------
        # 4. Ananya Iyer (Mathematics & Data Science, 4th Year)
        # Teaches: Probability & Statistical Inference, Linear Algebra & Vector Calculus
        # Wants: Supervised & Unsupervised Learning, Technical Writing & Documentation
        # -------------------------------------------------------------
        u_ananya = get_or_create_user(
            db,
            email="ananya.iyer@campus.edu",
            full_name="Ananya Iyer",
            password="password123",
            department="Mathematics & Computing",
            year_of_study="4th Year",
            bio="Math nerd and stats tutor. Love matrix decompositions, Bayesian inference, and Monte Carlo simulations. Want to transition to practical scikit-learn ML pipelines.",
            portfolio_url="https://ananyaiyer.math.blog",
        )
        if "Probability & Statistical Inference" in skills:
            us = get_or_create_user_skill(db, u_ananya.id, skills["Probability & Statistical Inference"].id, "teach", "Expert")
            get_or_create_evidence(db, us.id, "credential", "https://nptel.ac.in/verify/NPTEL-STATS-ANANYA-2026", "NPTEL Top 1% Topper in Probability & Random Processes.")
        if "Linear Algebra & Vector Calculus" in skills:
            us = get_or_create_user_skill(db, u_ananya.id, skills["Linear Algebra & Vector Calculus"].id, "teach", "Expert")
            get_or_create_evidence(db, us.id, "project", "https://github.com/ananyaiyer/svd-image-compression", "Mathematical proof and Python visualization of SVD eigenvalue compression.")
        if "Supervised & Unsupervised Learning" in skills:
            get_or_create_user_skill(db, u_ananya.id, skills["Supervised & Unsupervised Learning"].id, "learn", "Beginner")

        # -------------------------------------------------------------
        # 5. Vikram Verma (Electronics & Embedded Systems, 3rd Year)
        # Teaches: Arduino & Raspberry Pi Prototyping, PCB Design & Circuit Fabrication
        # Wants: Python, Linux Command Line & Bash Automation
        # -------------------------------------------------------------
        u_vikram = get_or_create_user(
            db,
            email="vikram.verma@campus.edu",
            full_name="Vikram Verma",
            password="password123",
            department="Electrical & Electronics Engineering",
            year_of_study="3rd Year",
            bio="Hardware hacker, robotics team lead. Designed telemetry PCBs for formula student rover. Want to improve my Linux automation and backend scripting.",
            github_url="https://github.com/vikram-embedded",
        )
        if "Arduino & Raspberry Pi Prototyping" in skills:
            us = get_or_create_user_skill(db, u_vikram.id, skills["Arduino & Raspberry Pi Prototyping"].id, "teach", "Expert")
            get_or_create_evidence(db, us.id, "project", "https://github.com/vikram-embedded/quadcopter-stm32-telemetry", "Custom flight controller firmware on STM32 with FreeRTOS and I2C sensors.")
        if "PCB Design & Circuit Fabrication" in skills:
            us = get_or_create_user_skill(db, u_vikram.id, skills["PCB Design & Circuit Fabrication"].id, "teach", "Advanced")
            get_or_create_evidence(db, us.id, "project", "https://github.com/vikram-embedded/kicad-smart-power-meter", "4-layer KiCad board for wireless solar energy metering.")
        if "Linux Command Line & Bash Automation" in skills:
            get_or_create_user_skill(db, u_vikram.id, skills["Linux Command Line & Bash Automation"].id, "learn", "Intermediate")

        # -------------------------------------------------------------
        # 6. Sneha Reddy (Product Management, 4th Year)
        # Teaches: Product Discovery & User Validation, Agile & Scrum Project Management
        # Wants: Quantitative Financial Modeling, Public Speaking & Pitch Presentations
        # -------------------------------------------------------------
        u_sneha = get_or_create_user(
            db,
            email="sneha.reddy@campus.edu",
            full_name="Sneha Reddy",
            password="password123",
            department="Management & Product Strategy",
            year_of_study="4th Year",
            bio="APM intern at fintech startup. Ran customer interview cohorts and agile sprint backlogs. Looking for quant financial modeling prep.",
            portfolio_url="https://sneha-product.notion.site",
        )
        if "Product Discovery & User Validation" in skills:
            us = get_or_create_user_skill(db, u_sneha.id, skills["Product Discovery & User Validation"].id, "teach", "Advanced")
            get_or_create_evidence(db, us.id, "project", "https://notion.so/sneha-product/campus-marketplace-teardown", "Detailed product teardown, customer persona surveys, and feature prioritization matrix.")
        if "Agile & Scrum Project Management" in skills:
            us = get_or_create_user_skill(db, u_sneha.id, skills["Agile & Scrum Project Management"].id, "teach", "Advanced")
            get_or_create_evidence(db, us.id, "credential", "https://scrumalliance.org/verify/CSPO-SNEHA-2026", "Certified Scrum Product Owner (CSPO).")
        if "Quantitative Financial Modeling" in skills:
            get_or_create_user_skill(db, u_sneha.id, skills["Quantitative Financial Modeling"].id, "learn", "Beginner")

        # -------------------------------------------------------------
        # 7. Aditya Nair (DevOps & Cloud, 3rd Year)
        # Teaches: Cloud & Docker Containerization, Cybersecurity & Web App Security
        # Wants: Tech Interview & System Design Prep
        # -------------------------------------------------------------
        u_aditya = get_or_create_user(
            db,
            email="aditya.nair@campus.edu",
            full_name="Aditya Nair",
            password="password123",
            department="Computer Science & Systems",
            year_of_study="3rd Year",
            bio="Cloud security enthusiast. Certified Kubernetes Administrator (CKA). Managing campus server clusters. Prepping for system design interviews.",
            github_url="https://github.com/adityanair-cloud",
        )
        if "Cloud & Docker Containerization" in skills:
            us = get_or_create_user_skill(db, u_aditya.id, skills["Cloud & Docker Containerization"].id, "teach", "Expert")
            get_or_create_evidence(db, us.id, "credential", "https://www.credly.com/badges/aditya-nair-cka-2026", "Linux Foundation Certified Kubernetes Administrator (CKA).")
            get_or_create_evidence(db, us.id, "project", "https://github.com/adityanair-cloud/k8s-campus-cluster", "Terraform and Helm charts deploying high-availability Kubernetes cluster.")
        if "Cybersecurity & Web App Security" in skills:
            us = get_or_create_user_skill(db, u_aditya.id, skills["Cybersecurity & Web App Security"].id, "teach", "Advanced")
        if "Tech Interview & System Design Prep" in skills:
            get_or_create_user_skill(db, u_aditya.id, skills["Tech Interview & System Design Prep"].id, "learn", "Intermediate")

        # -------------------------------------------------------------
        # 8. Diya Kapoor (Animation & 3D, 2nd Year)
        # Teaches: 3D Modeling & Rendering (Blender), Motion Graphics (After Effects)
        # Wants: UI/UX Design, Academic Writing & Research Methods
        # -------------------------------------------------------------
        u_diya = get_or_create_user(
            db,
            email="diya.kapoor@campus.edu",
            full_name="Diya Kapoor",
            password="password123",
            department="Digital Arts & Animation",
            year_of_study="2nd Year",
            bio="3D artist creating game assets in Blender & kinetic typography in After Effects. Looking for research writing mentorship.",
            portfolio_url="https://artstation.com/diyakapoor3d",
        )
        if "3D Modeling & Rendering (Blender)" in skills:
            us = get_or_create_user_skill(db, u_diya.id, skills["3D Modeling & Rendering (Blender)"].id, "teach", "Advanced")
            get_or_create_evidence(db, us.id, "project", "https://artstation.com/artwork/diyakapoor-cyberpunk-room", "Photorealistic 3D environment rendered with Blender Cycles and custom PBR shaders.")
        if "Motion Graphics (After Effects)" in skills:
            us = get_or_create_user_skill(db, u_diya.id, skills["Motion Graphics (After Effects)"].id, "teach", "Advanced")
        if "Academic Writing & Research Methods" in skills:
            get_or_create_user_skill(db, u_diya.id, skills["Academic Writing & Research Methods"].id, "learn", "Beginner")

        # -------------------------------------------------------------
        # 9. Ishaan Gupta (Economics & Quant Finance, 4th Year)
        # Teaches: Quantitative Financial Modeling, Probability & Statistical Inference
        # Wants: Database Engineering & SQL, Git & Open Source Collaboration
        # -------------------------------------------------------------
        u_ishaan = get_or_create_user(
            db,
            email="ishaan.gupta@campus.edu",
            full_name="Ishaan Gupta",
            password="password123",
            department="Economics & Mathematical Finance",
            year_of_study="4th Year",
            bio="Built Black-Scholes options pricing algorithms and portfolio backtesters. Seeking to learn SQL database design to store market tick data.",
            github_url="https://github.com/ishaangupta-quant",
        )
        if "Quantitative Financial Modeling" in skills:
            us = get_or_create_user_skill(db, u_ishaan.id, skills["Quantitative Financial Modeling"].id, "teach", "Expert")
            get_or_create_evidence(db, us.id, "project", "https://github.com/ishaangupta-quant/monte-carlo-portfolio-sim", "Monte Carlo VaR risk model for multi-asset equity portfolios.")
        if "Database Engineering & SQL" in skills:
            get_or_create_user_skill(db, u_ishaan.id, skills["Database Engineering & SQL"].id, "learn", "Beginner")

        # -------------------------------------------------------------
        # 10. Neha Joshi (Competitive Coding & Algorithms, 4th Year)
        # Teaches: Data Structures & Advanced Algorithms, Tech Interview & System Design Prep
        # Wants: Video Editing & Post-Production
        # -------------------------------------------------------------
        u_neha = get_or_create_user(
            db,
            email="neha.joshi@campus.edu",
            full_name="Neha Joshi",
            password="password123",
            department="Computer Science & Engineering",
            year_of_study="4th Year",
            bio="Knight on LeetCode (2150+ rating), ICPC Regionalist. Love teaching graph algorithms and DP. Want to learn video editing for my YouTube tech channel.",
            github_url="https://github.com/nehajoshi-algo",
        )
        if "Data Structures & Advanced Algorithms" in skills:
            us = get_or_create_user_skill(db, u_neha.id, skills["Data Structures & Advanced Algorithms"].id, "teach", "Expert")
            get_or_create_evidence(db, us.id, "credential", "https://leetcode.com/nehajoshi_algo", "LeetCode Knight rating (Top 1.5% globally with 800+ solved problems).")
            get_or_create_evidence(db, us.id, "project", "https://github.com/nehajoshi-algo/competitive-programming-templates", "Optimized C++ template library for advanced segment trees and flow algorithms.")
        if "Tech Interview & System Design Prep" in skills:
            us = get_or_create_user_skill(db, u_neha.id, skills["Tech Interview & System Design Prep"].id, "teach", "Expert")
        if "Video Editing & Post-Production" in skills:
            get_or_create_user_skill(db, u_neha.id, skills["Video Editing & Post-Production"].id, "learn", "Beginner")

        # -------------------------------------------------------------
        # 11. Arjun Deshmukh (Linux & Infrastructure, 3rd Year)
        # Teaches: Linux Command Line & Bash Automation, Git & Open Source Collaboration
        # Wants: Natural Language Processing (Transformers)
        # -------------------------------------------------------------
        u_arjun = get_or_create_user(
            db,
            email="arjun.deshmukh@campus.edu",
            full_name="Arjun Deshmukh",
            password="password123",
            department="Computer Engineering",
            year_of_study="3rd Year",
            bio="Linux kernel hobbyist and open source contributor. Master of bash scripting, tmux, vim, and git rebase. Want to explore LLMs & NLP transformers.",
            github_url="https://github.com/arjundeshmukh-kernel",
        )
        if "Linux Command Line & Bash Automation" in skills:
            us = get_or_create_user_skill(db, u_arjun.id, skills["Linux Command Line & Bash Automation"].id, "teach", "Expert")
            get_or_create_evidence(db, us.id, "project", "https://github.com/arjundeshmukh-kernel/dotfiles-automation", "Automated Arch Linux provisioning script with POSIX compliance.")
        if "Git & Open Source Collaboration" in skills:
            us = get_or_create_user_skill(db, u_arjun.id, skills["Git & Open Source Collaboration"].id, "teach", "Advanced")
        if "Natural Language Processing (Transformers)" in skills:
            get_or_create_user_skill(db, u_arjun.id, skills["Natural Language Processing (Transformers)"].id, "learn", "Beginner")

        # -------------------------------------------------------------
        # 12. Kavya Menon (Communications & Tech Writing, 3rd Year)
        # Teaches: Public Speaking & Pitch Presentations, Technical Writing & Documentation
        # Wants: Prompt Engineering & LLM Workflows
        # -------------------------------------------------------------
        u_kavya = get_or_create_user(
            db,
            email="kavya.menon@campus.edu",
            full_name="Kavya Menon",
            password="password123",
            department="Communications & Media Studies",
            year_of_study="3rd Year",
            bio="Campus debate president and technical writer. Won national hackathon pitching rounds. Looking to master AI prompt engineering.",
            portfolio_url="https://kavyamenon.substack.com",
        )
        if "Public Speaking & Pitch Presentations" in skills:
            us = get_or_create_user_skill(db, u_kavya.id, skills["Public Speaking & Pitch Presentations"].id, "teach", "Expert")
            get_or_create_evidence(db, us.id, "credential", "https://toastmasters.org/verify/kavya-menon-cc", "Toastmasters Competent Communicator Award.")
        if "Technical Writing & Documentation" in skills:
            us = get_or_create_user_skill(db, u_kavya.id, skills["Technical Writing & Documentation"].id, "teach", "Advanced")
            get_or_create_evidence(db, us.id, "project", "https://kavyamenon.substack.com/p/decoding-distributed-systems", "Published 10-part primer on distributed systems architecture.")
        if "Prompt Engineering & LLM Workflows" in skills:
            get_or_create_user_skill(db, u_kavya.id, skills["Prompt Engineering & LLM Workflows"].id, "learn", "Beginner")

        # -------------------------------------------------------------
        # Seed Past Completed Exchanges & Student Peer Feedback
        # -------------------------------------------------------------
        logger.info("Seeding Completed Exchanges & Campus Peer Reviews...")

        # Exchange 1: Aarav taught Neha Python / FastApi -> Completed
        if "Python" in skills:
            ex1 = db.query(Exchange).filter(Exchange.teacher_id == u_aarav.id, Exchange.learner_id == u_neha.id).first()
            if not ex1:
                ex1 = Exchange(
                    teacher_id=u_aarav.id,
                    learner_id=u_neha.id,
                    skill_id=skills["Python"].id,
                    status="completed",
                    duration_minutes=90,
                    credits_awarded=50,
                    completed_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                )
                db.add(ex1)
                db.flush()

                # Add credit bonus to teacher
                db.add(SkillCredit(user_id=u_aarav.id, amount=50, reason="peer_exchange_taught"))
                # Feedback from Neha to Aarav
                db.add(Feedback(
                    exchange_id=ex1.id,
                    from_user_id=u_neha.id,
                    rating=5,
                    comment="Aarav is an exceptional tutor! He explained FastAPI async request handling with live examples. Highly recommended mentor!",
                ))
                db.commit()

        # Exchange 2: Priya taught Rohan Figma Design Tokens -> Completed
        if "UI/UX Design & Prototyping (Figma)" in skills:
            ex2 = db.query(Exchange).filter(Exchange.teacher_id == u_priya.id, Exchange.learner_id == u_rohan.id).first()
            if not ex2:
                ex2 = Exchange(
                    teacher_id=u_priya.id,
                    learner_id=u_rohan.id,
                    skill_id=skills["UI/UX Design & Prototyping (Figma)"].id,
                    status="completed",
                    duration_minutes=60,
                    credits_awarded=50,
                    completed_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
                )
                db.add(ex2)
                db.flush()

                db.add(SkillCredit(user_id=u_priya.id, amount=50, reason="peer_exchange_taught"))
                db.add(Feedback(
                    exchange_id=ex2.id,
                    from_user_id=u_rohan.id,
                    rating=5,
                    comment="Priya walked me through auto-layout 5.0 and design token exports to Tailwind. Saved our hackathon team hours!",
                ))
                db.commit()

        # Exchange 3: Active / Pending Learning Request from Ananya to Aarav
        req1 = db.query(LearningRequest).filter(LearningRequest.sender_id == u_ananya.id, LearningRequest.receiver_id == u_aarav.id).first()
        if not req1 and "Python" in skills:
            req1 = LearningRequest(
                sender_id=u_ananya.id,
                receiver_id=u_aarav.id,
                requested_skill_id=skills["Python"].id,
                status="pending",
            )
            db.add(req1)
            db.commit()

        logger.info("✅ Synapse Indian Campus Dataset Seeded Successfully!")
        logger.info("Primary Demo User: aarav.sharma@campus.edu (Password: password123)")
        logger.info("Match Partner: priya.patel@campus.edu (Password: password123)")
        logger.info("Total campus students active: 12")

    except Exception as e:
        logger.error(f"Error seeding Indian demo data: {e}")
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
