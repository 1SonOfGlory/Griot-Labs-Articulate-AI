from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(default="learner", pattern="^(learner|coach|super_admin)$")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    mfa_code: str | None = None
    device_id: str = Field(min_length=6, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    role: str


class GoogleLoginRequest(BaseModel):
    id_token: str
    device_id: str = Field(min_length=6, max_length=128)
    mfa_code: str | None = None


class MfaSetupResponse(BaseModel):
    secret: str
    otpauth_url: str
    enabled: bool


class MfaVerifyRequest(BaseModel):
    code: str = Field(min_length=6, max_length=10)


class SessionCreateRequest(BaseModel):
    learner_name: str
    learner_role: str
    goal_text: str
    audience_text: str
    focus_areas: list[str] = []
    additional_notes: str = ""
    additional_notes: str = ""


class SessionResponse(BaseModel):
    session_id: str
    created_at: datetime
    owner_email: EmailStr


class UploadItem(BaseModel):
    file_name: str
    content_type: str
    size_bytes: int
    extraction_status: str


class UploadResponse(BaseModel):
    accepted: int
    max_allowed: int
    items: list[UploadItem]


class SimulationEvaluateRequest(BaseModel):
    difficulty: str = Field(pattern="^(easy|standard|hard|expert)$")
    transcript: str = Field(min_length=4, max_length=15000)


class SimulationEvaluateResponse(BaseModel):
    pulse: str
    breakdown: list[str]
    challenge: str
    overall: int


class CoachDashboardResponse(BaseModel):
    total_sessions: int
    active_learners: int
    average_score: int
