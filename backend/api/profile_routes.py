from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from app.database import get_session
from app.models import Platform
from app.api.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UpdateProfileRequest(BaseModel):
    username: Optional[str]
    email: Optional[EmailStr]


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


@router.post("/signup", response_model=TokenResponse)
def signup(payload: SignupRequest, session: Session = Depends(get_session)):
    statement = select(Platform).where(Platform.email == payload.email)
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # create platform id as uuid4 string
    from uuid import uuid4

    platform = Platform(id=str(uuid4()), name=payload.username or payload.email.split("@")[0], email=payload.email, password_hash=get_password_hash(payload.password))
    session.add(platform)
    session.commit()
    session.refresh(platform)

    token = create_access_token(subject=str(platform.id))
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=TokenResponse)
def login(form_data: SignupRequest, session: Session = Depends(get_session)):
    statement = select(Platform).where(Platform.email == form_data.email)
    platform = session.exec(statement).first()
    if not platform or not verify_password(form_data.password, platform.password_hash or ""):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=str(platform.id))
    return {"access_token": token, "token_type": "bearer"}


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
