# Track B Integration & Cross-Cutting Triage Report

This document logs cross-cutting integration bugs identified and resolved during the integration of Track A (Skill Profiles, Taxonomy & Evidence) and Track B (Discovery, Matching, Requests & Exchanges).

---

## 1. Resolved Cross-Cutting Issues

### Issue 1: `RecommendationService` Referenced Legacy Flat `Skill` Schema Instead of `UserSkill`
- **Root Cause**: `backend/app/services/recommendation.py` queried `Skill.user_id`, `Skill.skill_type`, and `Skill.category`. However, `Skill` represents canonical taxonomy entries (`id, name, category_id, description`), whereas user claims reside in `UserSkill` (`id, user_id, skill_id, direction, level, confidence_score, evidence`).
- **Symptom**: Calling `GET /api/v1/discover` caused an `AttributeError: type object 'Skill' has no attribute 'user_id'`.
- **Resolution**: Updated `RecommendationService` to join `UserSkill` with `Skill`, `SkillCategory`, and `Evidence`. Re-implemented candidate generation and reciprocity ranking with bidirectional skill and category matching.

---

### Issue 2: Initial Credit Balance Single Source of Truth (`SkillCredit` Ledger)
- **Root Cause**: Registration previously hardcoded an initial integer value without writing a ledger entry to the `skill_credits` table.
- **Resolution**:
  1. Updated `AuthService.register_user` to insert an initial ledger row `SkillCredit(amount=100, reason="signup_bonus")`.
  2. Updated `User.skill_credits` property to calculate dynamically as `SUM(SkillCredit.amount)` for the user.
  3. Configured `UserResponse` Pydantic schemas with `model_config = ConfigDict(from_attributes=True)` so balances serialize directly from the ledger.
  4. Added `GET /api/v1/users/me` alias endpoint in `users.py` so `/users/me` and `/auth/me` return consistent ledger balances.

---

### Issue 3: Exchange Completion Credit Allocation Breakdown
- **Root Cause**: `POST /api/v1/exchanges/{id}/complete` awarded credits to the mentor/teacher only, without issuing participation bonuses to the learner or recording both sides in `SkillCredit`.
- **Resolution**:
  - Teacher receives duration credits (+10 for 30min, +20 for 60min) + completion bonus (+5) + verified mentor bonus (+25 if mentor is verified).
  - Learner receives participation completion bonus (+5) recorded as a ledger entry in `SkillCredit`.

---

### Issue 4: Dashboard.jsx and SkillProfile.jsx State Duplication
- **Root Cause**: `Dashboard.jsx` had separate dummy form states (`teachingSkills`, `learningSkills`, `handleAddTeachSkill`, `handleAddLearnSkill`) disconnected from real database models.
- **Resolution**: Removed duplicate creation forms and dummy states from `Dashboard.jsx`. Reused `SkillCard`, `EvidenceUploader`, and `RecommendationCard` to render live data, linking to `/skills/me` as the canonical management portal.

---

## 2. Test Verification Matrix

All end-to-end flows are covered by automated test suite in `backend/tests/test_e2e_flow.py`:

| Test Step | Action | Status |
|---|---|---|
| 1 | Register User A & User B | ✅ Passed |
| 2 | Assert 100 Initial Credits (Ledger-based) | ✅ Passed |
| 3 | Claim Teaching & Learning Skills from Taxonomy | ✅ Passed |
| 4 | Attach Proofs & Execute Rule-based Verification | ✅ Passed |
| 5 | Verify `GET /api/v1/discover` Reciprocity (98% Compatibility) | ✅ Passed |
| 6 | Create Learning Request (`POST /api/v1/requests`) | ✅ Passed |
| 7 | Accept Learning Request (`PATCH /api/v1/requests/{id}/accept`) | ✅ Passed |
| 8 | Complete Exchange (`POST /api/v1/exchanges/{id}/complete`) | ✅ Passed (Teacher +50, Learner +5) |
| 9 | Submit Exchange Feedback (`POST /api/v1/exchanges/{id}/feedback`) | ✅ Passed |
