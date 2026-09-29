import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

from app.main import app
from app.db.database import Base, engine
from app.db.seed_taxonomy import seed_taxonomy
from app.db.models.skill import Skill


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Ensure database tables and baseline taxonomy are initialized."""
    Base.metadata.create_all(bind=engine)
    seed_taxonomy()


import uuid

def test_full_campus_skill_exchange_flow():
    client = TestClient(app)
    uid = uuid.uuid4().hex[:6]

    # -------------------------------------------------------------
    # 1. Register User A and User B with private phone numbers
    # -------------------------------------------------------------
    user_a_payload = {
        "email": f"alex.{uid}@campus.edu",
        "password": "password123",
        "full_name": "Alex Flow",
        "phone_number": "+1-555-111-2222",
        "department": "Computer Science",
        "year_of_study": "3rd Year",
    }
    user_b_payload = {
        "email": f"sarah.{uid}@campus.edu",
        "password": "password123",
        "full_name": "Sarah Flow",
        "phone_number": "+1-555-333-4444",
        "department": "Computer Science",
        "year_of_study": "4th Year",
    }

    res_a = client.post("/api/v1/auth/register", json=user_a_payload)
    if res_a.status_code == 400:
        res_a = client.post("/api/v1/auth/login", json={"email": user_a_payload["email"], "password": user_a_payload["password"]})
    assert res_a.status_code in (200, 201), f"User A registration failed: {res_a.text}"
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    res_b = client.post("/api/v1/auth/register", json=user_b_payload)
    if res_b.status_code == 400:
        res_b = client.post("/api/v1/auth/login", json={"email": user_b_payload["email"], "password": user_b_payload["password"]})
    assert res_b.status_code in (200, 201), f"User B registration failed: {res_b.text}"
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Verify initial ledger credit balance (100 credits from signup_bonus)
    me_a = client.get("/api/v1/users/me", headers=headers_a).json()
    me_b = client.get("/api/v1/users/me", headers=headers_b).json()
    assert me_a["skill_credits"] >= 100, f"Expected User A to have at least 100 signup credits, got {me_a['skill_credits']}"
    assert me_b["skill_credits"] >= 100, f"Expected User B to have at least 100 signup credits, got {me_b['skill_credits']}"

    # Verify phone number is stored on /users/me for self, but hidden on public profile query
    assert me_a.get("phone_number") == "+1-555-111-2222"
    public_b = client.get(f"/api/v1/users/{me_b['id']}/public", headers=headers_a).json()
    assert "phone_number" not in public_b or public_b.get("phone_number") is None, "Phone number must be hidden from public profile!"

    # -------------------------------------------------------------
    # 2. Query Taxonomy Skills (Find Python & UI/UX Design)
    # -------------------------------------------------------------
    skills = client.get("/api/v1/skills").json()
    python_skill = next((s for s in skills if "python" in s["name"].lower()), None)
    uiux_skill = next((s for s in skills if "ui/ux" in s["name"].lower()), None)

    assert python_skill is not None, "Taxonomy must contain Python skill"
    assert uiux_skill is not None, "Taxonomy must contain UI/UX skill"

    # -------------------------------------------------------------
    # 3. User A claims teach: Python, learn: UI/UX Design
    # -------------------------------------------------------------
    a_teach = client.post(
        "/api/v1/users/me/skills",
        json={"skill_id": python_skill["id"], "direction": "teach", "level": "Advanced"},
        headers=headers_a,
    )
    assert a_teach.status_code == 201
    a_teach_data = a_teach.json()

    a_learn = client.post(
        "/api/v1/users/me/skills",
        json={"skill_id": uiux_skill["id"], "direction": "learn", "level": "Beginner"},
        headers=headers_a,
    )
    assert a_learn.status_code == 201

    # -------------------------------------------------------------
    # 4. User B claims teach: UI/UX Design, learn: Python
    # -------------------------------------------------------------
    b_teach = client.post(
        "/api/v1/users/me/skills",
        json={"skill_id": uiux_skill["id"], "direction": "teach", "level": "Expert"},
        headers=headers_b,
    )
    assert b_teach.status_code == 201
    b_teach_data = b_teach.json()

    b_learn = client.post(
        "/api/v1/users/me/skills",
        json={"skill_id": python_skill["id"], "direction": "learn", "level": "Beginner"},
        headers=headers_b,
    )
    assert b_learn.status_code == 201

    # -------------------------------------------------------------
    # 5. Attach Evidence & Verify
    # -------------------------------------------------------------
    ev_a = client.post(
        f"/api/v1/skills/{a_teach_data['id']}/evidence",
        json={
            "type": "project",
            "url": "https://github.com/alex-flow/python-fastapi",
            "description": "Async FastAPI microservice repository",
        },
        headers=headers_a,
    )
    assert ev_a.status_code == 201
    ev_a_data = ev_a.json()

    # Rule-based verification on A's evidence
    v_a = client.patch(f"/api/v1/evidence/{ev_a_data['id']}/verify", headers=headers_a)
    assert v_a.status_code == 200
    assert v_a.json()["confidence_score"] > 0

    ev_b = client.post(
        f"/api/v1/skills/{b_teach_data['id']}/evidence",
        json={
            "type": "credential",
            "url": "https://coursera.org/verify/GOOGLE-UX-2026",
            "description": "Google UX Design Professional Certificate",
        },
        headers=headers_b,
    )
    assert ev_b.status_code == 201
    ev_b_data = ev_b.json()

    # Rule-based verification on B's evidence
    v_b = client.patch(f"/api/v1/evidence/{ev_b_data['id']}/verify", headers=headers_b)
    assert v_b.status_code == 200
    assert v_b.json()["verification_state"] == "verified"
    assert v_b.json()["confidence_score"] >= 35.0

    # -------------------------------------------------------------
    # 6. GET /discover as User A -> Assert User B is top recommendation with proofs
    # -------------------------------------------------------------
    discover_res = client.get("/api/v1/discover", headers=headers_a)
    assert discover_res.status_code == 200
    recommendations = discover_res.json()
    assert len(recommendations) > 0, "Expected at least 1 recommended peer"

    top_match = next((r for r in recommendations if r["user_id"] == me_b["id"]), None)
    assert top_match is not None, f"User B (id {me_b['id']}) not found in recommendations: {recommendations}"
    assert top_match["compatibility_percent"] >= 80, f"Expected high compatibility >= 80%, got {top_match['compatibility_percent']}%"

    # Assert attached proofs list is populated for User B
    assert "proofs" in top_match, "Proofs field must exist in recommendation"
    assert len(top_match["proofs"]) > 0, f"Expected User B to have proofs, got {top_match['proofs']}"
    assert top_match["proofs"][0]["url"] == "https://coursera.org/verify/GOOGLE-UX-2026"
    assert top_match["proofs"][0]["verification_state"] == "verified"

    # Assert reciprocity reason mentions both skills
    reason = top_match["reason"].lower()
    assert "python" in reason, f"Reason does not mention Python: {top_match['reason']}"
    assert "ui/ux" in reason or "design" in reason, f"Reason does not mention UI/UX: {top_match['reason']}"

    # -------------------------------------------------------------
    # 7. POST /requests from User A to User B (Phone hidden initially)
    # -------------------------------------------------------------
    req_payload = {
        "receiver_id": me_b["id"],
        "requested_skill_id": uiux_skill["id"],
    }
    create_req = client.post("/api/v1/requests", json=req_payload, headers=headers_a)
    assert create_req.status_code == 201, f"Failed to create learning request: {create_req.text}"
    req_data = create_req.json()
    request_id = req_data["id"]
    # Phone must NOT be revealed while pending
    assert req_data.get("contact_phone") is None, "Phone number must not be revealed on pending requests"

    # -------------------------------------------------------------
    # 8. PATCH /requests/{id}/accept as User B (Mutual Phone Exchanged!)
    # -------------------------------------------------------------
    accept_res = client.patch(f"/api/v1/requests/{request_id}/accept", headers=headers_b)
    assert accept_res.status_code == 200, f"Failed to accept request: {accept_res.text}"
    accept_data = accept_res.json()
    assert accept_data["status"] == "accepted"
    # Receiver (User B) now sees Sender's (User A) phone number
    assert accept_data.get("contact_phone") == "+1-555-111-2222", f"User B should see User A's phone, got {accept_data.get('contact_phone')}"

    # Sender (User A) now sees Receiver's (User B) phone number when querying requests
    sent_requests = client.get("/api/v1/requests?type=sent", headers=headers_a).json()
    matching_sent = next((r for r in sent_requests if r["id"] == request_id), None)
    assert matching_sent is not None
    assert matching_sent.get("contact_phone") == "+1-555-333-4444", f"User A should see User B's phone, got {matching_sent.get('contact_phone')}"

    # -------------------------------------------------------------
    # 9. Complete Exchange (POST /exchanges/{id}/complete)
    # -------------------------------------------------------------
    initial_credits_teacher = me_b["skill_credits"]
    initial_credits_learner = me_a["skill_credits"]

    # Fetch created exchange for this request
    exchanges_res = client.get("/api/v1/exchanges", headers=headers_b)
    assert exchanges_res.status_code == 200
    exchanges = exchanges_res.json()
    assert len(exchanges) > 0, "Expected scheduled exchange to exist"
    exchange_id = exchanges[0]["id"]

    # Complete 60min exchange with verified mentor
    complete_payload = {
        "duration_minutes": 60,
        "is_verified_mentor": True,
    }
    complete_res = client.post(f"/api/v1/exchanges/{exchange_id}/complete", json=complete_payload, headers=headers_b)
    assert complete_res.status_code == 200, f"Failed to complete exchange: {complete_res.text}"
    exchange_data = complete_res.json()
    assert exchange_data["status"] == "completed"

    # Expected teacher credits: +20 (60min duration) + 5 (completion) + 25 (verified mentor) = +50 credits
    # Expected learner credits: +5 (completion bonus)
    final_teacher = client.get("/api/v1/users/me", headers=headers_b).json()
    final_learner = client.get("/api/v1/users/me", headers=headers_a).json()

    assert final_teacher["skill_credits"] == initial_credits_teacher + 50, (
        f"Teacher expected {initial_credits_teacher + 50} credits, got {final_teacher['skill_credits']}"
    )
    assert final_learner["skill_credits"] == initial_credits_learner + 5, (
        f"Learner expected {initial_credits_learner + 5} credits, got {final_learner['skill_credits']}"
    )

    # -------------------------------------------------------------
    # 10. POST feedback for exchange
    # -------------------------------------------------------------
    exchange_id = exchange_data["id"]
    feedback_payload = {
        "rating": 5,
        "comment": "Sarah explained Figma autolayout and design tokens brilliantly! 10/10 mentor.",
    }
    feedback_res = client.post(f"/api/v1/exchanges/{exchange_id}/feedback", json=feedback_payload, headers=headers_a)
    assert feedback_res.status_code == 201, f"Failed to submit feedback: {feedback_res.text}"
    fb_data = feedback_res.json()
    assert fb_data["rating"] == 5
    assert fb_data["exchange_id"] == exchange_id


if __name__ == "__main__":
    test_full_campus_skill_exchange_flow()
    print("\n✅ All End-to-End integration tests passed successfully!")
