# Articulate AI Product Inputs (Captured)

## 1) Customer + Pricing
- Primary customers: coaches, accelerator hubs/incubators, businesses.
- Secondary customers: students and individuals.
- Pricing direction: hybrid (B2B + B2C).

## 2) Identity + Roles
- Auth methods: Google + email/password.
- Roles at launch: learner, coach, super admin.

## 3) Data + Privacy
- Owner approved to proceed with privacy/security defaults.
- Retention default: 90 days.
- Compliance/legal copy still to be finalized.

## 4) AI + Coach Framework
- Model preference: Gemini.
- Coach frameworks: private per coach.
- Prompt/version audit logging: not required for v1.

## 5) File + Media
- File types: all allowed.
- Upload limits: 10 MB max per file, 10 files max per upload.
- Simulation latency target: as close to real-time as possible.

## 6) Security Controls
- MFA: required.
- Session timeout + device policy: required.
- IP allowlisting: undecided (optional enterprise feature).

## 7) Deployment
- Frontend hosting target: Vercel or Netlify.
- Backend selected: Cloud Run for realtime API + workers.
- Budget/SLA details: still to be finalized.

## 8) Demo Content
- Coach framework examples and scenario pack: to be provided later.

## Critical Security Note
- An API key was shared in chat. Treat it as compromised.
- Action required: revoke/rotate it immediately and create a new key.
- Never commit keys to source control or plaintext docs.
