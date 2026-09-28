import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import UserResponse, UserUpdate, PublicUserResponse
from app.routers.deps import get_current_user
from app.db.models.user import User
from app.services.auth_service import AuthService

logger = logging.getLogger("skillloop.users")

router = APIRouter(prefix="/users", tags=["Users"])

# Define avatars storage directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
AVATARS_DIR = os.path.join(UPLOAD_DIR, "avatars")
os.makedirs(AVATARS_DIR, exist_ok=True)

ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/webp"}
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
MAX_AVATAR_SIZE = 2 * 1024 * 1024  # 2 MB


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Fetch current authenticated student profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update current student user profile."""
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Handle links serialization to JSON-friendly list of dicts
    if "links" in update_data and update_data["links"] is not None:
        update_data["links"] = [
            l if isinstance(l, dict) else l.model_dump()
            for l in update_data["links"]
        ]
        
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/v1/users/me/avatar
    Multipart upload for avatar images (PNG, JPEG, WebP, max 2MB).
    Saves image under backend/uploads/avatars/{user_id}_{uuid}.{ext} and updates user.avatar_url.
    """
    # 1. Verify content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image type '{file.content_type}'. Allowed types: PNG, JPEG, WebP.",
        )

    # 2. Verify file extension
    filename = file.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '.{ext}'. Allowed extensions: .png, .jpg, .jpeg, .webp.",
        )

    # Normalize extension (e.g. jpeg -> jpg)
    norm_ext = "jpg" if ext == "jpeg" else ext

    # 3. Read and verify size (<= 2MB)
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}",
        )

    if not contents or len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if len(contents) > MAX_AVATAR_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit of 2 MB.",
        )

    # 4. Generate unique secure filename
    new_filename = f"{current_user.id}_{uuid.uuid4().hex[:12]}.{norm_ext}"
    target_path = os.path.join(AVATARS_DIR, new_filename)

    # 5. Delete old avatar if present on disk
    if current_user.avatar_url and current_user.avatar_url.startswith("/uploads/avatars/"):
        old_filename = current_user.avatar_url.replace("/uploads/avatars/", "").strip()
        if old_filename:
            old_path = os.path.join(AVATARS_DIR, old_filename)
            if os.path.exists(old_path) and os.path.isfile(old_path):
                try:
                    os.remove(old_path)
                    logger.info(f"Removed old avatar: {old_path}")
                except Exception as e:
                    logger.warning(f"Could not remove old avatar file: {e}")

    # 6. Save new file
    try:
        with open(target_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        logger.error(f"Failed to save avatar image to {target_path}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save avatar image on server.",
        )

    # 7. Update user avatar_url
    relative_url = f"/uploads/avatars/{new_filename}"
    current_user.avatar_url = relative_url
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {
        "avatar_url": current_user.avatar_url,
        "user": UserResponse.model_validate(current_user),
    }


@router.get("/{user_id}", response_model=PublicUserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch public user profile by user ID. Email is omitted for privacy."""
    user = AuthService.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found.",
        )
    return user
