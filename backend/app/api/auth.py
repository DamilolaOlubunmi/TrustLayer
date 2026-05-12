import os
from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader
from passlib.context import CryptContext
from sqlmodel import Session, select
import hashlib

from app.database import get_session
from app.models import Platform, APIKey


SECRET_KEY = os.getenv("JWT_SECRET") or "change-me-in-prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES") or 60 * 24)

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")
api_key_header = APIKeyHeader(name="X-API-Key")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = {"sub": str(subject)}
    expire = datetime.now() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> Platform:
    payload = decode_access_token(token)
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    # try lookup by id (string) first
    platform = session.get(Platform, sub)
    if not platform:
        # fallback to email lookup
        statement = select(Platform).where(Platform.email == sub)
        results = session.exec(statement)
        platform = results.first()

    if not platform or not platform.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Platform not found or inactive")

    return platform


def get_api_key_platform(api_key: str = Depends(api_key_header), session: Session = Depends(get_session)) -> Platform:
    """Validate API key and return the associated Platform."""
    # Hash the provided API key to match stored hashes
    api_key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    
    statement = select(APIKey).where(APIKey.key_hash == api_key_hash, APIKey.is_active == True)
    api_key_obj = session.exec(statement).first()
    
    if not api_key_obj:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")
    
    # Get the platform associated with this API key
    platform = session.get(Platform, api_key_obj.platform_id)
    if not platform or not platform.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Platform not found or inactive")
    
    # Update last_used_at
    api_key_obj.last_used_at = datetime.now()
    session.add(api_key_obj)
    session.commit()
    
    return platform
