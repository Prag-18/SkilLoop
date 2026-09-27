# SkillLoop Live Demo Walkthrough Script

This click-by-click script guides presenters through the end-to-end SkillLoop demo story on stage.

---

## 0. Quick Reset / Pre-Demo Setup

Before presenting on stage, ensure database and demo users are seeded:

```bash
# Terminal 1: Backend
cd backend
python -m app.db.seed_demo
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
npm run dev
```

Open Browser at: `http://localhost:5173`

---

## Demo Story Personas

| Persona | Credentials | Teach Skill (Offer) | Learn Skill (Target) |
|---|---|---|---|
| **User A: Alex Rivera** (CS 3rd Year) | `alex.rivera@campus.edu` / `password123` | **Python** (Advanced) + GitHub Repo Proof | **UI/UX Design** (Beginner) |
| **User B: Sarah Chen** (CS 4th Year) | `sarah.chen@campus.edu` / `password123` | **UI/UX Design** (Expert) + Figma & Coursera Proof | **Python** (Beginner) |

---

## Step-by-Step Live Demo Narrative

### Part 1: Login as User A (Alex Rivera)
1. **Navigate to Sign In**: Click **"Sign In"** on the landing page navbar.
2. **Enter Credentials**:
   - Email: `alex.rivera@campus.edu`
   - Password: `password123`
   - Click **"Sign In"**.
3. **Inspect Dashboard Overview**:
   - Point out credit balance: **100 CR** (funded by the `SkillCredit` ledger signup bonus).
   - Show Teaching Skills: **Python** (Advanced) with verified confidence score ($65\%+$).
   - Show Learning Targets: **UI/UX Design & Prototyping (Figma)**.

---

### Part 2: Explore Taxonomy & Evidence Management
1. **Navigate to Skill Profile**:
   - In Navbar or Sidebar, click **"My Profile & Evidence"** or navigate to `/skills/me`.
2. **Browse Taxonomy Matrix**:
   - Click the **"Browse Full Taxonomy"** tab.
   - Show the 5 core pillars: *Technical*, *Creative*, *Knowledge*, *Professional*, and *Practical*.
   - Drill down into *Technical* $\rightarrow$ *AI & Machine Learning* $\rightarrow$ *Machine Learning* to showcase the 3-level deep hierarchy.
3. **Inspect Attached Evidence**:
   - In the "Skills I Teach" section for Python, click **"Proofs"**.
   - Show the attached GitHub repository link and Coursera certificate.
   - Click **"Verify Proof"** to demonstrate deterministic, real-time confidence recalculation.

---

### Part 3: Live Recommendation & Mutual Reciprocity
1. **Navigate to Campus Discovery**:
   - In Sidebar, click **"Campus Matches"** (or open the Matches tab on `/dashboard`).
2. **Highlight Recommendation Card for Sarah Chen**:
   - Point out the **98% Compatibility Score** with emerald trust badge.
   - Read the explainable reciprocity statement:
     > *"You can teach Sarah Python, and they can teach you UI/UX Design. Both in Computer Science."*
   - Point out Sarah's verified Figma design system and Google UX certificate badges.
3. **Send Learning Request**:
   - Click **"Send Learning Request"**.
   - Notice the button updates immediately to *"Learning Request Sent!"*.

---

### Part 4: Switch to User B (Sarah Chen) & Accept Exchange
1. **Sign Out & Sign In as Sarah**:
   - Click the profile avatar $\rightarrow$ **Sign Out**.
   - Sign in with: `sarah.chen@campus.edu` / `password123`.
2. **Open Learning Requests**:
   - In Sidebar, click **"Learning Requests"**.
   - View the incoming request from Alex Rivera for *UI/UX Design*.
3. **Accept Request**:
   - Click **"Accept Request"**.
   - The status updates to **Accepted**, automatically scheduling an active exchange.

---

### Part 5: Complete Exchange & Verify Ledger Credits
1. **Open Active Exchanges**:
   - In Sidebar, click **"Active Exchanges"**.
   - View the scheduled 60-minute exchange session between Sarah (Teacher) and Alex (Learner).
2. **Mark Session Completed**:
   - Complete the session with verified mentor status.
   - Observe ledger credit awards:
     - **Sarah (Teacher)** receives **+50 CR** ($20\text{ duration} + 5\text{ completion} + 25\text{ verified mentor bonus}$), bringing her balance to **150 CR**.
     - **Alex (Learner)** receives **+5 CR** ($5\text{ participation bonus}$), bringing his balance to **105 CR**.
3. **Submit Peer Feedback**:
   - Rate the session **5 Stars** with comment: *"Exceptional mentorship on design systems!"*.
   - Submit feedback to conclude the demo.
