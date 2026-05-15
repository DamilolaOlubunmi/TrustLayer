from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from uuid import uuid4
import hashlib
import secrets

from app.database import get_session
from app.models import Platform, APIKey, Settings
from app.schema import (
    SignupRequest,
    TokenResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
    APIKeyResponse,
    SettingsResponse,
    SettingsUpdateRequest,
    SquadSecretUpdateRequest,
)
from app.api.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api", tags=["auth & profile"])


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

    # Initialize default settings for the platform
    default_settings = Settings(
        platform_id=platform.id,
        buyer_weight=0.4,
        vendor_weight=0.6,
        block_threshold=0.8,
        review_threshold=0.6,
        active_presets=[],
        notify_email=False,
        notify_sms=False,
        notify_phone=False,
    )
    session.add(default_settings)
    session.commit()
    session.refresh(default_settings)

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
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "phone_number": current_user.phone_number,
    }


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
    if payload.phone_number is not None:
        current_user.phone_number = payload.phone_number
        changed = True

    if changed:
        session.add(current_user)
        session.commit()
        session.refresh(current_user)

    return {
        "status": "success",
        "profile": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "phone_number": current_user.phone_number,
        },
    }


@router.put("/profile")
def update_profile_put(payload: UpdateProfileRequest, session: Session = Depends(get_session), current_user: Platform = Depends(get_current_user)):
    return update_profile(payload, session, current_user)


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


def _regenerate_api_key(session: Session, current_user: Platform) -> dict:
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
        "created_at": api_key.created_at,
    }


@router.post("/api-key/regenerate", response_model=APIKeyResponse)
def regenerate_api_key(session: Session = Depends(get_session), current_user: Platform = Depends(get_current_user)):
    return _regenerate_api_key(session, current_user)


@router.post("/profile/regenerate-api-key", response_model=APIKeyResponse)
def regenerate_api_key_from_profile(session: Session = Depends(get_session), current_user: Platform = Depends(get_current_user)):
    return _regenerate_api_key(session, current_user)


@router.put("/profile/squad-secret")
def update_squad_secret(payload: SquadSecretUpdateRequest, session: Session = Depends(get_session), current_user: Platform = Depends(get_current_user)):
    secret_value = payload.squad_secret_key.strip()
    current_user.squad_secret_key = secret_value or None
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return {"status": "success"}



# Settings management
@router.get("/settings", response_model=SettingsResponse)
def get_settings(session: Session = Depends(get_session), current_user: Platform = Depends(get_current_user)):
    statement = select(Settings).where(Settings.platform_id == current_user.id)
    settings = session.exec(statement).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")

    return {
        "buyer_weight": settings.buyer_weight,
        "vendor_weight": settings.vendor_weight,
        "block_threshold": settings.block_threshold,
        "review_threshold": settings.review_threshold,
        "active_presets": settings.active_presets or [],
        "notify_email": settings.notify_email,
        "notify_sms": settings.notify_sms,
        "notify_phone": settings.notify_phone,
        "created_at": settings.created_at,
        "callback_url": settings.callback_url,
    }


@router.patch("/settings", response_model=SettingsResponse)
def update_settings(payload: SettingsUpdateRequest, session: Session = Depends(get_session), current_user: Platform = Depends(get_current_user)):
    statement = select(Settings).where(Settings.platform_id == current_user.id)
    settings = session.exec(statement).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")

    changed = False
    if payload.buyer_weight is not None:
        settings.buyer_weight = payload.buyer_weight
        changed = True
    if payload.vendor_weight is not None:
        settings.vendor_weight = payload.vendor_weight
        changed = True
    if payload.block_threshold is not None:
        settings.block_threshold = payload.block_threshold
        changed = True
    if payload.review_threshold is not None:
        settings.review_threshold = payload.review_threshold
        changed = True
    if payload.active_presets is not None:
        settings.active_presets = payload.active_presets
        changed = True
    if payload.notify_email is not None:
        settings.notify_email = payload.notify_email
        changed = True
    if payload.notify_sms is not None:
        settings.notify_sms = payload.notify_sms
        changed = True
    if payload.notify_phone is not None:
        settings.notify_phone = payload.notify_phone
        changed = True
    if payload.callback_url is not None:
        settings.callback_url = payload.callback_url
        changed = True

    if changed:
        session.add(settings)
        session.commit()
        session.refresh(settings)

    return {
        "buyer_weight": settings.buyer_weight,
        "vendor_weight": settings.vendor_weight,
        "block_threshold": settings.block_threshold,
        "review_threshold": settings.review_threshold,
        "active_presets": settings.active_presets or [],
        "notify_email": settings.notify_email,
        "notify_sms": settings.notify_sms,
        "notify_phone": settings.notify_phone,
        "created_at": settings.created_at,
        "callback_url": settings.callback_url,
    }
