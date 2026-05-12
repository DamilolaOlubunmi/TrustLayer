from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from uuid import uuid4
import hashlib
import secrets

from app.database import get_session
from app.models import Platform, APIKey
from app.schema import SignupRequest, TokenResponse, UpdateProfileRequest, ChangePasswordRequest, APIKeyResponse
from app.api.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api", tags=["auth"])


# Authentication
def _create_api_key_for_platform(session: Session, platform_id: str) -> APIKey:
    """Helper to create a new API key for a platform."""
    raw_key = secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    
    api_key = APIKey(
        id=f"key_{uuid4().hex[:16]}",
        platform_id=platform_id,
        key=raw_key,
        key_hash=key_hash,
        name=None,
        is_active=True
    )
    session.add(api_key)
    session.commit()
    session.refresh(api_key)
    return api_key


@router.post("/signup", response_model=TokenResponse)
def signup(payload: SignupRequest, session: Session = Depends(get_session)):
    statement = select(Platform).where(Platform.email == payload.email)
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if not payload.username or not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="Username, email, and password are required")
    
    platform = Platform(id=str(uuid4()), name=payload.username or payload.email.split("@")[0], email=payload.email, password_hash=get_password_hash(payload.password))
    session.add(platform)
    session.commit()
    session.refresh(platform)
    
    # Create API key for the new platform
    _create_api_key_for_platform(session, platform.id)

    token = create_access_token(subject=str(platform.id))
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=TokenResponse)
def login(payload: SignupRequest, session: Session = Depends(get_session)):
    # JSON-based login for frontend
    statement = select(Platform).where(Platform.email == payload.email)
    platform = session.exec(statement).first()
    if not platform or not verify_password(payload.password, platform.password_hash or ""):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=str(platform.id))
    return {"access_token": token, "token_type": "bearer"}


@router.post("/token", response_model=TokenResponse)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    # Form-based login for Swagger UI authorization
    statement = select(Platform).where(Platform.email == form_data.username)
    platform = session.exec(statement).first()
    if not platform or not verify_password(form_data.password, platform.password_hash or ""):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=str(platform.id))
    return {"access_token": token, "token_type": "bearer"}


# Profile management
@router.get("/profile")
def get_profile(current_user: Platform = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "name": current_user.name}


@router.patch("/profile")
def update_profile(payload: UpdateProfileRequest, session: Session = Depends(get_session), current_user: Platform = Depends(get_current_user)):
    changed = False
    if payload.username is not None:
        current_user.name = payload.username
        changed = True
    if payload.email is not None:
        # ensure no other user has this email
        statement = select(Platform).where(Platform.email == payload.email, Platform.id != current_user.id)
        other = session.exec(statement).first()
        if other:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = payload.email
        changed = True

    if changed:
        session.add(current_user)
        session.commit()
        session.refresh(current_user)

    return {"status": "success", "profile": {"id": current_user.id, "email": current_user.email, "name": current_user.name}}


@router.post("/profile/change-password")
def change_password(payload: ChangePasswordRequest, session: Session = Depends(get_session), current_user: Platform = Depends(get_current_user)):
    if not verify_password(payload.old_password, current_user.password_hash or ""):
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    current_user.password_hash = get_password_hash(payload.new_password)
    session.add(current_user)
    session.commit()

    return {"status": "success"}


@router.delete("/profile")
def delete_account(session: Session = Depends(get_session), current_user: Platform = Depends(get_current_user)):
    session.delete(current_user)
    session.commit()
    return {"status": "deleted"}


# API Key Management
@router.get("/api-key", response_model=APIKeyResponse)
def get_api_key(session: Session = Depends(get_session), current_user: Platform = Depends(get_current_user)):
    """Get the API key for the authenticated platform."""
    statement = select(APIKey).where(APIKey.platform_id == current_user.id)
    api_key = session.exec(statement).first()
    
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    return {
        "id": api_key.id,
        "api_key": api_key.key,  # Return plaintext key for copying
        "name": api_key.name,
        "created_at": api_key.created_at
    }


@router.post("/api-key/regenerate", response_model=APIKeyResponse)
def regenerate_api_key(session: Session = Depends(get_session), current_user: Platform = Depends(get_current_user)):
    """Regenerate the API key for the authenticated platform."""
    statement = select(APIKey).where(APIKey.platform_id == current_user.id)
    api_key = session.exec(statement).first()
    
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    # Generate a new API key
    raw_key = secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    
    # Update the existing key
    api_key.key = raw_key
    api_key.key_hash = key_hash
    api_key.is_active = True
    session.add(api_key)
    session.commit()
    session.refresh(api_key)
    
    return {
        "id": api_key.id,
        "api_key": raw_key,
        "name": api_key.name,
        "created_at": api_key.created_at
    }
