# Articulate AI Backend (FastAPI)

## Confirmed decisions
- Framework: FastAPI
- Hosting recommendation: frontend on Vercel/Netlify + backend on Cloud Run
- Retention default: 90 days
- Auth: Google + email/password
- Roles: learner, coach, super_admin
- Security: MFA required, session timeout/device policy required
- Upload policy: max 10 files/request, max 10MB/file, all file types allowed
- Default retention: 90 days

## Security warning
An API key was shared in chat and is considered exposed. Revoke/rotate it immediately before using production.
Put the new key in backend env var `GEMINI_API_KEY` only.

## Local run
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health check:
- `GET http://127.0.0.1:8000/health`

## API routes (v1)
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/google`
- `POST /api/v1/auth/mfa/setup`
- `POST /api/v1/auth/mfa/verify`
- `POST /api/v1/sessions`
- `POST /api/v1/sessions/{session_id}/files`
- `POST /api/v1/sessions/{session_id}/notes/audio`
- `POST /api/v1/sessions/{session_id}/simulation/evaluate`
- `GET /api/v1/coach/dashboard`
- `WS /api/v1/sessions/ws/simulations/{session_id}`

## Auth/device policy usage
Protected routes require:
- `Authorization: Bearer <token>`
- `X-Device-Id: <same-device-id-used-at-login>`

## Next implementation steps
1. Add refresh token rotation and secure cookie strategy.
2. Add Redis queue + workers for file extraction/transcription.
3. Add true streaming audio bridge (WebRTC/SFU) for near-zero-latency conversation.
4. Add organization/cohort tables and tenant isolation policies.
5. Add audit logs and admin policy controls.
