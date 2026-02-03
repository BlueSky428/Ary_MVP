# Ary V0 — Development plan (MVP + production)

Single weekly plan from setup through production. Mark tasks with ✅ when done, 🔲 when not started.

**Legend:** ✅ Done · 🔲 Not done

---

## Phase 1 — Setup (Weeks 1–3)

### Week 1: Project structure and data model

| Done | Task |
|------|------|
| ✅ | Frontend: React + Vite + TypeScript; backend: Express + TypeScript |
| ✅ | Define domain types: Case, Session, AnswerEntry, SemanticProposal, ProposalDecision, Artifact |
| ✅ | Version binding: session stores `question_set_id` + `question_set_version`, `mechanism_set_id` + `mechanism_set_version` |
| ✅ | Backend: load `question_set.json` and `mechanism_set.json`; no hardcoded questions |

**Outcome:** Repo and data model ready; config-driven versioning in place.

---

### Week 2: Backend and frontend shell

| Done | Task |
|------|------|
| ✅ | Backend: API routes (cases, sessions, entries, proposals, decisions, artifacts) |
| ✅ | Backend: SQLite schema and store (create/read/update/delete); init DB on startup |
| ✅ | Frontend: pages and routing (CaseList, CreateCase, CaseDetail, SessionWizard, ArtifactViewer) |
| ✅ | Frontend: API client; load question set from config for UI |
| ✅ | Frontend: app shell (header, nav), design system (cards, buttons, forms, verbatim blocks) |

**Outcome:** Full stack runs; UI shows structure; data persists.

---

### Week 3: Core flows and UI polish

| Done | Task |
|------|------|
| ✅ | Create Case form (Phase 0); validation; redirect to Case Detail |
| ✅ | Start Session (binds current config versions); list sessions on Case Detail |
| ✅ | Entry delete: `DELETE /sessions/:id/entries/:entry_id` (draft only) |
| ✅ | Professional UI: breadcrumbs, badges (draft/finalized), empty states |

**Outcome:** Users can create cases and start sessions; UI is consistent and clear.

---

## Phase 2 — Functionality (Weeks 4–10)

### Week 4: Case and session (complete)

| Done | Task |
|------|------|
| ✅ | Create Case (domain, case name, participant role, jurisdiction) |
| ✅ | New Strategy Session; list sessions with status |
| ✅ | GET case, GET sessions for case |

**Outcome:** Case and session creation flow complete.

---

### Week 5: Fixed question flow (Q1–Q5)

| Done | Task |
|------|------|
| ✅ | Render Q1–Q5 from config in fixed order |
| ✅ | Q1: single textarea + Save (replace existing Q1 entry) |
| ✅ | Q2–Q5: text input + “Add entry”; list entries with Delete (pre-finalize only) |
| 🔲 | Optional: edit entry (PATCH or delete + re-add) |

**Outcome:** Full protocol run in UI; verbatim capture only.

---

### Week 6: AI proposals (non-authoritative)

| Done | Task |
|------|------|
| ✅ | Backend: `POST /entries/:id/proposals` (stub returns empty) |
| 🔲 | Backend: LLM integration — return only `mechanism_id` + verbatim `span_text`; no summarization |
| 🔲 | Frontend: “Request proposals” per entry; display proposals below entry text |
| ✅ | Proposals stored separately; never alter user text |

**Outcome:** Proposals (stub or real) requestable and visible; non-authoritative.

---

### Week 7: Operator accept/reject overlay

| Done | Task |
|------|------|
| ✅ | Backend: `POST /proposals/:id/decision` (accepted_manual / rejected_manual / undecided) |
| ✅ | Session Wizard: operator mode toggle |
| 🔲 | UI: list proposals per entry; in operator mode show Accept / Reject (+ optional reason) |
| ✅ | Decisions stored as overlays; entry text unchanged |

**Outcome:** Operators can accept/reject proposals; decisions in artifact.

---

### Week 8: Finalize and artifact

| Done | Task |
|------|------|
| ✅ | Finalize button; backend finalizes session and generates artifact |
| ✅ | Reject entry/proposal changes when session is finalized |
| ✅ | Lock UI for finalized sessions (read-only answers) |
| ✅ | Artifact JSON: session, strategy (Q1), answers Q2–Q5, proposals + decisions |

**Outcome:** Sessions lock and produce immutable artifacts.

---

### Week 9: Artifact view and export

| Done | Task |
|------|------|
| ✅ | Read-only artifact viewer (metadata, strategy, answers, proposals, integrity) |
| 🔲 | Export artifact as JSON (download button) |
| ✅ | Display hash/signature in viewer when present |

**Outcome:** View and export finalized artifacts.

---

### Week 10: Pilot testing

| Done | Task |
|------|------|
| 🔲 | Internal testing with real-case scenarios |
| 🔲 | Fix bugs and usability issues |
| 🔲 | Confirm protocol: fixed order, no edits after finalize |

**Outcome:** MVP validated for pilot use.

---

## Phase 3 — Guardrails and first deploy (Weeks 11–12)

### Week 11: Guardrails and observability

| Done | Task |
|------|------|
| 🔲 | Validate `question_id` on POST entries (must be Q1–Q5 from session’s question set) |
| 🔲 | Validate `mechanism_id` for proposals/decisions (allowed for question + session mechanism set) |
| 🔲 | Rate limiting on `POST /entries/:id/proposals` (and optionally auth); configurable via env |
| 🔲 | Backend: structured logging (level, timestamp, request id); no secrets in logs |
| 🔲 | Backend: `GET /health` (200 + DB ping) for load balancer / process manager |

**Outcome:** Protocol enforced server-side; rate limits and basic observability.

---

### Week 12: Config, CORS, and first deployment

| Done | Task |
|------|------|
| 🔲 | Env-only config: `PORT`, `DATABASE_PATH`, `NODE_ENV`; add `.env.example` |
| 🔲 | Backend: CORS from env (`CORS_ORIGINS`); no `*` in production |
| 🔲 | Backend: no verbose stack traces in production |
| 🔲 | Frontend: `VITE_API_URL` for production API base; document in README |
| 🔲 | Deploy backend (persistent SQLite path, process manager); deploy frontend (static host, SPA fallback) |
| 🔲 | Client onboarding docs and first pilot support |

**Outcome:** App deployable; env and CORS production-safe; clients can use it.

---

## Phase 4 — Production hardening (Weeks 13–17)

### Week 13: Environment and security

| Done | Task |
|------|------|
| 🔲 | Centralise config in env; document every key in README and `.env.example` |
| 🔲 | Require `NODE_ENV=production` for production behaviour |
| 🔲 | Restrict CORS to explicit origins in production |
| 🔲 | Frontend: build-time API URL; verify production build and preview |

**Outcome:** No secrets in code; production runs from env only.

---

### Week 14: Authentication and identity

| Done | Task |
|------|------|
| 🔲 | Choose auth: JWT or OAuth/SSO (e.g. Auth0, Clerk); add backend dependency |
| 🔲 | Backend: auth middleware; attach `userId` to `req`; set `created_by` / `decided_by` from user |
| 🔲 | Reject unauthenticated writes (or document “system” user for internal API) |
| 🔲 | Frontend: login/logout (or SSO); store token securely; send `Authorization` header |
| 🔲 | Frontend: protect routes; show current user in header |
| 🔲 | Optional: restrict cases by `user_id` or `org_id`; add column if needed |

**Outcome:** Real users; auditable identities; optional access control.

---

### Week 15: Observability and frontend production URL

| Done | Task |
|------|------|
| 🔲 | Log request method, path, status; optional request id; keep logs free of secrets |
| 🔲 | Document log location and log level |
| 🔲 | Optional: error tracking (e.g. Sentry) with env DSN; production only |
| 🔲 | Frontend: production build uses `VITE_API_URL`; test against staging/production backend |
| 🔲 | Deploy frontend to chosen static host; SPA fallback; CORS allows frontend origin |

**Outcome:** Observable backend; frontend correctly targets production API.

---

### Week 16: Backend deployment and persistence

| Done | Task |
|------|------|
| 🔲 | Choose production host (Railway, Render, Fly.io, VPS, etc.); document deploy steps |
| 🔲 | Set env on host: `NODE_ENV`, `PORT`, `DATABASE_PATH`, `CORS_ORIGINS`, auth/LLM keys |
| 🔲 | SQLite on persistent volume; or plan Postgres migration (Week 17) |
| 🔲 | Process manager (e.g. PM2) or platform default; restart on crash |
| 🔲 | Optional: Docker; document `Dockerfile` / `docker-compose` |

**Outcome:** Backend runs reliably in production with persistent data.

---

### Week 17: Optional upgrades and documentation

| Done | Task |
|------|------|
| 🔲 | Optional: Postgres (e.g. Neon, Supabase); migrations; swap store without changing API |
| 🔲 | Optional: HTTPS (host or reverse proxy); HTTP → HTTPS redirect |
| 🔲 | Optional: compute and store `hash_sha256` (and signature) on artifact; show in viewer |
| 🔲 | Optional: scheduled DB backups; document restore |
| 🔲 | README: quick start, env table, link to this plan |
| 🔲 | Deploy doc: env checklist, deploy order, health URL, logs |
| 🔲 | Optional: “How to use Ary” for clients; runbook for common issues |

**Outcome:** Production-ready; optional scale/integrity/backups; team can deploy and support.

---

## Summary

| Phase | Weeks | Focus |
|-------|--------|--------|
| 1 | 1–3 | Setup, data model, SQLite, UI shell, core flows |
| 2 | 4–10 | Case/session, Q1–Q5, proposals, operator, finalize, artifact, pilot |
| 3 | 11–12 | Guardrails, observability, env/CORS, first deploy |
| 4 | 13–17 | Env/security, auth, observability, deploy, optional upgrades, docs |

Update this file as you complete each task (🔲 → ✅).
