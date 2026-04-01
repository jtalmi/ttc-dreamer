# External Integrations

**Analysis Date:** 2026-03-31

## APIs & External Services

**Application Runtime:**
- None configured yet
  - SDK/Client: None
  - Auth: None
  - Endpoints used: None

**Notes:**
- The checked-in GSD assets under `.claude/` are local workflow files, not application runtime integrations
- There are no network calls in `app/layout.tsx` or `app/page.tsx`

## Data Storage

**Databases:**
- None configured
  - Connection: N/A
  - Client: N/A
  - Migrations: N/A

**File Storage:**
- None configured
  - SDK/Client: N/A
  - Auth: N/A
  - Buckets: N/A

**Caching:**
- None configured

## Authentication & Identity

**Auth Provider:**
- None configured
  - Implementation: N/A
  - Token storage: N/A
  - Session management: N/A

**OAuth Integrations:**
- None configured

## Monitoring & Observability

**Error Tracking:**
- None configured

**Analytics:**
- None configured

**Logs:**
- Default local Next.js stdout/stderr only when running `npm run dev` or `npm run build`

## CI/CD & Deployment

**Hosting:**
- No hosting platform is configured in repo code
  - Deployment: N/A
  - Environment vars: N/A

**CI Pipeline:**
- No `.github/workflows/` pipeline is present in the repo

## Environment Configuration

**Development:**
- Required env vars: None today
- Secrets location: `.env*` is ignored, but no environment contract exists yet
- Mock/stub services: Not needed for the current scaffold

**Staging:**
- Not configured

**Production:**
- Not configured

## Webhooks & Callbacks

**Incoming:**
- None configured

**Outgoing:**
- None configured

---
*Integration audit: 2026-03-31*
*Update when adding/removing external services*
