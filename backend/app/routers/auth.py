from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
import pyotp
from google.oauth2 import id_token
from google.auth.transport import requests as grequests

from app.config import settings
from app.deps.db import get_db
from app.deps.security import hash_password, verify_password, create_access_token
from app.deps.auth import get_current_user
from app.models import User
from app.schemas import (
    RegisterRequest,
    LoginRequest,
    GoogleLoginRequest,
    TokenResponse,
    MfaSetupResponse,
    MfaVerifyRequest,
)


router = APIRouter(prefix="/auth", tags=["auth"])


def issue_token(user: User, device_id: str, mfa_code: str | None = None) -> TokenResponse:
    if settings.mfa_required:
        if not user.mfa_enabled:
            raise HTTPException(status_code=401, detail="MFA is not configured. Run /auth/mfa/setup and /auth/mfa/verify.")
        if not mfa_code or not pyotp.TOTP(user.mfa_secret).verify(mfa_code, valid_window=1):
            raise HTTPException(status_code=401, detail="Invalid MFA code")

    token, expires = create_access_token(user.email, user.role, device_id)
    return TokenResponse(access_token=token, expires_in_seconds=expires, role=user.role)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    exists = db.scalar(select(User).where(User.email == payload.email))
    if exists:
        raise HTTPException(status_code=409, detail="User already exists")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        mfa_enabled=False,
    )
    db.add(user)
    db.commit()
    return {"message": "Registered"}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return issue_token(user, payload.device_id, payload.mfa_code)


@router.post("/google", response_model=TokenResponse)
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    if not settings.google_client_id:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID not configured")
    try:
        info = id_token.verify_oauth2_token(payload.id_token, grequests.Request(), settings.google_client_id)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=401, detail="Invalid Google token") from exc

    email = info.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Google token missing email")

    user = db.scalar(select(User).where(User.email == email))
    if not user:
        user = User(email=email, password_hash=None, role="learner", mfa_enabled=False)
        db.add(user)
        db.commit()
        db.refresh(user)
    return issue_token(user, payload.device_id, payload.mfa_code)


@router.post("/mfa/setup", response_model=MfaSetupResponse)
def mfa_setup(user_ctx: dict = Depends(get_current_user), db: Session = Depends(get_db)) -> MfaSetupResponse:
    user = db.scalar(select(User).where(User.email == user_ctx["email"]))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    secret = pyotp.random_base32()
    user.mfa_secret = secret
    user.mfa_enabled = False
    db.add(user)
    db.commit()
    uri = pyotp.TOTP(secret).provisioning_uri(name=user.email, issuer_name="ArticulateAI")
    return MfaSetupResponse(secret=secret, otpauth_url=uri, enabled=False)


@router.post("/mfa/verify")
def mfa_verify(payload: MfaVerifyRequest, user_ctx: dict = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    user = db.scalar(select(User).where(User.email == user_ctx["email"]))
    if not user or not user.mfa_secret:
        raise HTTPException(status_code=400, detail="MFA setup required first")

    if not pyotp.TOTP(user.mfa_secret).verify(payload.code, valid_window=1):
        raise HTTPException(status_code=401, detail="Invalid MFA code")

    user.mfa_enabled = True
    db.add(user)
    db.commit()
    return {"message": "MFA enabled"}
