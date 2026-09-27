import logging
import sys
import os

# Add backend directory to sys.path so it can run standalone
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))))

from app.db.database import SessionLocal, engine, Base
from app.db.models.category import SkillCategory
from app.db.models.skill import Skill

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skillloop.seed_taxonomy")


def get_or_create_category(db, name, parent_category_id=None, description=None, icon=None):
    cat = (
        db.query(SkillCategory)
        .filter(
            SkillCategory.name == name,
            SkillCategory.parent_category_id == parent_category_id,
        )
        .first()
    )
    if not cat:
        cat = SkillCategory(
            name=name,
            parent_category_id=parent_category_id,
            description=description,
            icon=icon,
        )
        db.add(cat)
        db.commit()
        db.refresh(cat)
        logger.info(f"Created category: {name} (parent_id: {parent_category_id})")
    return cat


def get_or_create_skill(db, name, category_id, description=None):
    skill = (
        db.query(Skill)
        .filter(
            Skill.name == name,
            Skill.category_id == category_id,
        )
        .first()
    )
    if not skill:
        skill = Skill(
            name=name,
            category_id=category_id,
            description=description,
        )
        db.add(skill)
        db.commit()
        db.refresh(skill)
        logger.info(f"  + Seeded skill: {name} [Cat ID: {category_id}]")
    return skill


def seed_taxonomy():
    """Inserts the 5-category taxonomy with 3-level hierarchy into the database."""
    logger.info("Starting Taxonomy Seeding...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ==========================================
        # 1. TECHNICAL (with 3-level hierarchy)
        # Level 1: Technical
        # Level 2: AI & Machine Learning
        # Level 3: Machine Learning & Deep Learning
        # ==========================================
        tech_root = get_or_create_category(
            db,
            name="Technical",
            description="Software engineering, systems, algorithms, and applied technology",
            icon="Code",
        )

        ai_ml_sub = get_or_create_category(
            db,
            name="AI & Machine Learning",
            parent_category_id=tech_root.id,
            description="Artificial intelligence, predictive modeling, and intelligent algorithms",
            icon="Cpu",
        )

        # Level 3 hierarchy node
        ml_sub_level3 = get_or_create_category(
            db,
            name="Machine Learning",
            parent_category_id=ai_ml_sub.id,
            description="Supervised, unsupervised, deep learning algorithms and MLOps",
            icon="Sparkles",
        )

        get_or_create_skill(db, "Supervised & Unsupervised Learning", ml_sub_level3.id, "Regression, classification, clustering, and scikit-learn pipelines.")
        get_or_create_skill(db, "Deep Learning & Neural Networks", ml_sub_level3.id, "PyTorch, TensorFlow, CNNs, RNNs, and backpropagation foundations.")
        get_or_create_skill(db, "Computer Vision (OpenCV & YOLO)", ml_sub_level3.id, "Image processing, object detection, segmentation, and visual embeddings.")
        get_or_create_skill(db, "Natural Language Processing (Transformers)", ml_sub_level3.id, "Hugging Face, tokenizers, LLM fine-tuning, and semantic embeddings.")
        get_or_create_skill(db, "MLOps & Model Deployment", ml_sub_level3.id, "Serving models via FastAPI, ONNX runtime, Docker containerization, and tracking.")

        swe_sub = get_or_create_category(
            db,
            name="Software Engineering",
            parent_category_id=tech_root.id,
            description="Full-stack web, cloud systems, and database engineering",
            icon="Layers",
        )
        get_or_create_skill(db, "Python", swe_sub.id, "Python 3, backend development, FastAPI, scripting, and algorithmic problem solving.")
        get_or_create_skill(db, "Full-Stack Web Development", swe_sub.id, "Modern React, Next.js, FastAPI, Node.js, and responsive frontend architecture.")
        get_or_create_skill(db, "REST & GraphQL API Architecture", swe_sub.id, "Robust schema design, JWT authentication, rate limiting, and documentation.")
        get_or_create_skill(db, "Database Engineering & SQL", swe_sub.id, "PostgreSQL schema modeling, query optimization, indexing, and migrations.")
        get_or_create_skill(db, "Cloud & Docker Containerization", swe_sub.id, "Multi-stage Docker builds, container networking, and cloud orchestration.")
        get_or_create_skill(db, "Cybersecurity & Web App Security", swe_sub.id, "OWASP top 10, auth hardening, cryptography, and secure code practices.")

        # ==========================================
        # 2. CREATIVE
        # ==========================================
        creative_root = get_or_create_category(
            db,
            name="Creative",
            description="Visual design, multimedia production, 3D modeling, and creative arts",
            icon="Palette",
        )

        design_sub = get_or_create_category(
            db,
            name="UI/UX & Product Design",
            parent_category_id=creative_root.id,
            description="Interface wireframing, high-fidelity prototypes, and design systems",
            icon="Layout",
        )
        get_or_create_skill(db, "UI/UX Design", design_sub.id, "User interface wireframing, high-fidelity prototypes, Figma components, and usability.")
        get_or_create_skill(db, "UI/UX Design & Prototyping (Figma)", design_sub.id, "Design tokens, auto-layout, wireframing, and interactive component libraries.")
        get_or_create_skill(db, "User Research & Usability Testing", design_sub.id, "Student persona mapping, heuristic analysis, and testing workflows.")
        get_or_create_skill(db, "Design Systems & Token Architecture", design_sub.id, "Scalable atomic design systems and theme token sync.")

        media_sub = get_or_create_category(
            db,
            name="Media & Animation",
            parent_category_id=creative_root.id,
            description="3D asset creation, motion graphics, and video production",
            icon="Film",
        )
        get_or_create_skill(db, "3D Modeling & Rendering (Blender)", media_sub.id, "Hard surface modeling, texturing, lighting, and rendering.")
        get_or_create_skill(db, "Video Editing & Post-Production", media_sub.id, "Timeline editing in Premiere Pro, DaVinci Resolve, and audio mixing.")
        get_or_create_skill(db, "Motion Graphics (After Effects)", media_sub.id, "Kinetic typography, UI micro-animations, and visual effects.")
        get_or_create_skill(db, "Digital Illustration & Branding", media_sub.id, "Vector graphics, logo identity kits, and digital concept art.")

        # ==========================================
        # 3. KNOWLEDGE
        # ==========================================
        knowledge_root = get_or_create_category(
            db,
            name="Knowledge",
            description="Theoretical computer science, mathematics, quantitative finance, and research",
            icon="BookOpen",
        )

        cs_foundations_sub = get_or_create_category(
            db,
            name="CS Foundations",
            parent_category_id=knowledge_root.id,
            description="Core algorithms, data structures, and computational theory",
            icon="Binary",
        )
        get_or_create_skill(db, "Data Structures & Advanced Algorithms", cs_foundations_sub.id, "Graphs, dynamic programming, trees, amortized complexity, and competitive programming.")
        get_or_create_skill(db, "Operating Systems & Concurrency", cs_foundations_sub.id, "Threads, memory management, lock-free primitives, and virtual file systems.")

        math_sub = get_or_create_category(
            db,
            name="Mathematics & Quant Finance",
            parent_category_id=knowledge_root.id,
            description="Linear algebra, probability, and quantitative modeling",
            icon="TrendingUp",
        )
        get_or_create_skill(db, "Linear Algebra & Vector Calculus", math_sub.id, "Matrix decompositions, eigenvalues, and mathematical foundations for AI.")
        get_or_create_skill(db, "Probability & Statistical Inference", math_sub.id, "Hypothesis testing, Bayesian statistics, distributions, and Monte Carlo simulations.")
        get_or_create_skill(db, "Quantitative Financial Modeling", math_sub.id, "Risk analysis, portfolio optimization, and algorithmic trading basics.")
        get_or_create_skill(db, "Academic Writing & Research Methods", math_sub.id, "LaTeX document preparation, paper structuring, and scientific literature review.")

        # ==========================================
        # 4. PROFESSIONAL
        # ==========================================
        prof_root = get_or_create_category(
            db,
            name="Professional",
            description="Career readiness, product management, public speaking, and team leadership",
            icon="Briefcase",
        )

        career_sub = get_or_create_category(
            db,
            name="Career & Communication",
            parent_category_id=prof_root.id,
            description="Technical interviews, public speaking, and career portfolio",
            icon="MessageSquare",
        )
        get_or_create_skill(db, "Tech Interview & System Design Prep", career_sub.id, "Whiteboard problem solving, architectural trade-off discussions, and mock interviews.")
        get_or_create_skill(db, "Public Speaking & Pitch Presentations", career_sub.id, "Demo day pitching, storytelling, presentation slide structure, and stage presence.")
        get_or_create_skill(db, "Technical Writing & Documentation", career_sub.id, "API documentation, developer tutorials, RFCs, and markdown guides.")

        mgmt_sub = get_or_create_category(
            db,
            name="Product & Leadership",
            parent_category_id=prof_root.id,
            description="Agile execution, sprint planning, and product leadership",
            icon="Users",
        )
        get_or_create_skill(db, "Agile & Scrum Project Management", mgmt_sub.id, "Sprint ceremonies, backlog grooming, velocity tracking, and Jira/Linear workflows.")
        get_or_create_skill(db, "Product Discovery & User Validation", mgmt_sub.id, "Market opportunity sizing, user interview protocols, and MVP scoping.")
        get_or_create_skill(db, "Technical Team Leadership", mgmt_sub.id, "Mentorship, code review standards, sprint delegation, and peer alignment.")

        # ==========================================
        # 5. PRACTICAL
        # ==========================================
        practical_root = get_or_create_category(
            db,
            name="Practical",
            description="Developer workflows, Linux tooling, hardware prototyping, and AI prompts",
            icon="Wrench",
        )

        devops_sub = get_or_create_category(
            db,
            name="Developer Tooling & Linux",
            parent_category_id=practical_root.id,
            description="Version control, shell automation, and CI/CD pipelines",
            icon="Terminal",
        )
        get_or_create_skill(db, "Git & Open Source Collaboration", devops_sub.id, "Branching strategies, interactive rebase, pull request workflows, and fork management.")
        get_or_create_skill(db, "Linux Command Line & Bash Automation", devops_sub.id, "Shell scripting, cron automation, process management, and grep/awk pipelines.")
        get_or_create_skill(db, "CI/CD Workflows (GitHub Actions)", devops_sub.id, "Automated test pipelines, release tagging, and automated deployments.")

        hardware_sub = get_or_create_category(
            db,
            name="Hardware & Emerging Tech",
            parent_category_id=practical_root.id,
            description="Embedded hardware, IoT microcontrollers, and Prompt Engineering",
            icon="Radio",
        )
        get_or_create_skill(db, "Arduino & Raspberry Pi Prototyping", hardware_sub.id, "Microcontroller interfacing, GPIO programming, sensor telemetry, and breadboarding.")
        get_or_create_skill(db, "Prompt Engineering & LLM Workflows", hardware_sub.id, "Few-shot prompting, structured output parsing, chain-of-thought, and agentic workflows.")
        get_or_create_skill(db, "PCB Design & Circuit Fabrication", hardware_sub.id, "Schematic capture in KiCAD, board layout, and prototyping soldering.")

        logger.info("✅ Taxonomy Seeding Completed Successfully!")
    except Exception as e:
        logger.error(f"Failed to seed taxonomy: {e}")
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_taxonomy()
