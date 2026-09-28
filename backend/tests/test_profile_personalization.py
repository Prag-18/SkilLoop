import io
import os
import sys
import pytest
from fastapi.testclient import TestClient
from PIL import Image

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

from app.main import app
from app.db.database import Base, engine
from app.db.schema_helper import upgrade_user_columns
from app.db.seed_taxonomy import seed_taxonomy


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    """Ensure database tables and taxonomy are initialized."""
    Base.metadata.create_all(bind=engine)
    upgrade_user_columns(engine)
    seed_taxonomy()


def create_test_image_bytes(format="PNG", size=(50, 50), color="blue"):
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    buf.seek(0)
    return buf.getvalue()


def test_profile_personalization_flow():
    client = TestClient(app)

    # 1. Register with no profile fields (default/minimal)
    minimal_user = {
        "email": "minimal.user@campus.edu",
        "password": "password123",
        "full_name": "Minimal User",
        "department": "Mathematics",
        "year_of_study": "1st Year",
    }
    res = client.post("/api/v1/auth/register", json=minimal_user)
    if res.status_code == 400:
        res = client.post("/api/v1/auth/login", json={"email": minimal_user["email"], "password": minimal_user["password"]})
    assert res.status_code in (200, 201), f"Minimal user register failed: {res.text}"
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify defaults are None / empty
    me_res = client.get("/api/v1/users/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "minimal.user@campus.edu"
    assert me_data["bio"] is None
    assert me_data["headline"] is None
    assert me_data["avatar_url"] is None
    user_id = me_data["id"]

    # 2. Update profile via PUT /api/v1/users/me
    update_payload = {
        "headline": "Undergrad Math & CS Researcher",
        "bio": "Interested in algebraic topology and machine learning systems.",
        "interests": ["Topology", "Machine Learning", "FastAPI"],
        "links": [
            {"label": "GitHub", "url": "https://github.com/minimal-math"},
            {"label": "Personal Website", "url": "http://minimal-math.io"},
        ],
        "availability": "Weekday afternoons",
        "favorite_quote": "Pure mathematics is, in its way, the poetry of logical ideas.",
    }
    put_res = client.put("/api/v1/users/me", json=update_payload, headers=headers)
    assert put_res.status_code == 200, f"Profile update failed: {put_res.text}"
    updated_data = put_res.json()
    assert updated_data["headline"] == "Undergrad Math & CS Researcher"
    assert updated_data["bio"] == "Interested in algebraic topology and machine learning systems."
    assert updated_data["interests"] == ["Topology", "Machine Learning", "FastAPI"]
    assert len(updated_data["links"]) == 2
    assert updated_data["favorite_quote"] == "Pure mathematics is, in its way, the poetry of logical ideas."

    # 3. Avatar upload - Valid PNG
    png_bytes = create_test_image_bytes(format="PNG")
    files = {"file": ("avatar.png", png_bytes, "image/png")}
    avatar_res = client.post("/api/v1/users/me/avatar", files=files, headers=headers)
    assert avatar_res.status_code == 200, f"Avatar upload failed: {avatar_res.text}"
    avatar_data = avatar_res.json()
    assert "avatar_url" in avatar_data
    assert avatar_data["avatar_url"].startswith("/uploads/avatars/")
    uploaded_avatar_url = avatar_data["avatar_url"]

    # 4. Avatar upload - Reject non-image file
    text_files = {"file": ("malicious.txt", b"Hello world text file", "text/plain")}
    bad_type_res = client.post("/api/v1/users/me/avatar", files=text_files, headers=headers)
    assert bad_type_res.status_code == 400, "Expected rejection of non-image file"

    # 5. Avatar upload - Reject file with bad extension
    fake_png = {"file": ("script.exe", png_bytes, "image/png")}
    bad_ext_res = client.post("/api/v1/users/me/avatar", files=fake_png, headers=headers)
    assert bad_ext_res.status_code == 400, "Expected rejection of non-image extension"

    # 6. Avatar upload - Reject file > 2MB
    huge_bytes = b"0" * (2 * 1024 * 1024 + 1024)
    huge_files = {"file": ("huge.png", huge_bytes, "image/png")}
    huge_res = client.post("/api/v1/users/me/avatar", files=huge_files, headers=headers)
    assert huge_res.status_code == 400, "Expected rejection of >2MB file"

    # 7. Public profile view GET /api/v1/users/{id} - email MUST NOT be exposed
    pub_res = client.get(f"/api/v1/users/{user_id}", headers=headers)
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    assert "email" not in pub_data, "Public profile must not expose email address"
    assert pub_data["full_name"] == "Minimal User"
    assert pub_data["avatar_url"] == uploaded_avatar_url
    assert pub_data["headline"] == "Undergrad Math & CS Researcher"
    assert pub_data["interests"] == ["Topology", "Machine Learning", "FastAPI"]
    assert len(pub_data["links"]) == 2

    # 8. Link validation - reject invalid URL protocols like javascript: or data:
    invalid_link_payload = {
        "links": [{"label": "Malicious", "url": "javascript:alert(1)"}]
    }
    invalid_res = client.put("/api/v1/users/me", json=invalid_link_payload, headers=headers)
    assert invalid_res.status_code == 422 or invalid_res.status_code == 400, "Expected rejection of javascript: URL"
