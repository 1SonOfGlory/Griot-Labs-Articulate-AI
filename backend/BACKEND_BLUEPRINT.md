# Articulate AI Backend Blueprint (Phase 1)

## Core stack (selected)
- Frontend hosting: Vercel or Netlify
- Realtime backend: dedicated service (Cloud Run/Fly/Render) for live audio sessions
- API: FastAPI (Python 3.11+)
- Database: PostgreSQL 16
- Object storage: S3-compatible bucket for uploaded files/audio
- Queue: Redis + worker for async file extraction/transcription/scoring
- Auth: OIDC + JWT (short-lived access token, rotating refresh token)
- Realtime transport: WebSocket/WebRTC gateway for simulation events

## Domain services
- Identity service (users, orgs, roles: learner/coach/admin)
- Session service (arena setup, simulation state, transcripts)
- Lexicon service (strategic words, mastery progress, streak/XP)
- Assessment service (rubric scoring + feedback generation)
- Coach insights service (cohort summaries, interventions)
- File processing service (extract text/audio metadata from all file types)

## Security baseline
- OWASP ASVS L2 controls minimum
- TLS 1.2+ everywhere
- Argon2id for password hashing (if local auth is used)
- JWT signed with asymmetric keys (kid rotation)
- RBAC + row-level access control by org/cohort/user
- Encrypt sensitive data at rest (DB and object storage)
- Secrets in vault (not .env in production)
- Central audit logs (auth events, data access, admin actions)
- Rate limiting + brute-force controls + bot detection
- Malware scan on upload (ClamAV or managed scanner)
- File type/content sniffing (never trust extension)
- CSP, CORS allowlist, secure cookies, CSRF mitigation

## Privacy and compliance
- Data classification: public/internal/confidential/biometric-sensitive
- Consent capture for voice recording and AI analysis
- Configurable retention policy (e.g., 30/90/365 days)
- Right to access/export/delete per account
- DPA + subprocessors inventory for enterprise clients
- PII minimization and redaction pipeline for transcripts

## API outline (v1)
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /users`
- `POST /sessions`
- `POST /sessions/{id}/files` (multipart, any file type)
- `POST /sessions/{id}/notes/audio`
- `POST /sessions/{id}/words/generate`
- `POST /sessions/{id}/sprint/start`
- `POST /sessions/{id}/simulation/evaluate`
- `GET /sessions/{id}/report`
- `GET /coach/cohorts/{id}/dashboard`

## Confirmed product constraints
- Auth: Google + email/password.
- Roles: learner, coach, super admin.
- MFA required.
- Session timeout/device policy required.
- File upload limits: 10MB max/file, 10 files/request.
- Coach frameworks are private per coach.
- Latency target for simulations: near real-time.
- Retention baseline: 90 days.

## Upload protocol (all file types)
1. Accept upload with metadata + checksum.
2. Quarantine and malware scan.
3. MIME sniff and type classification.
4. Async extraction pipeline:
   - text-like: parse directly
   - docs/slides/pdfs: OCR/text extraction worker
   - audio/video: transcription worker
   - binary/unknown: store safely, mark extraction_pending
5. Attach extracted artifacts to session context.

## Threat model checkpoints
- Broken access control between cohorts
- Prompt injection through uploaded documents
- Insecure direct object references for files
- Token theft/replay
- Model output leakage of other tenant data

## SDLC protocol
- Trunk-based development with protected main
- Mandatory PR review + security checklist
- SAST + dependency scanning + secret scanning
- Unit/integration/e2e tests in CI
- Infrastructure as code + staged environments
- Incident response runbook + backup/restore drill

## Deployment note (important)
- Vercel/Netlify are ideal for frontend delivery, but low-latency live audio should run on a dedicated long-lived backend service.
- Keep secrets in backend secret manager only; do not expose model keys to browser clients.
