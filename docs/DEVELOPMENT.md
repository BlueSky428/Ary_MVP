# Ary V0 — Development plan (12 weeks)

Single weekly plan from setup through production. Mark tasks with ✅ when done, 🔲 when not started.

Milestones are aligned with [docs/REQUIREMENTS.md](REQUIREMENTS.md); section references (e.g. §8) point to that document.

**Legend:** ✅ Done · 🔲 Not done

**Current state (as of last review):** Phase 1–2 (Weeks 1–6) largely complete except: no "Request proposals" / Accept-Reject UI in SessionWizard, no artifact JSON download. Week 9: env, CORS, VITE_API_URL, and deploy docs are in place; guardrails (Week 8) and client onboarding still open.

---

## Phase 1 — Setup (Weeks 1–3)

### Week 1: Project structure and data model (§6, §8, §1–3)

| Done | Task |
|------|------|
| ✅ | Frontend: React + Vite + TypeScript; backend: Express + TypeScript |
| ✅ | Define domain types: Case, Session, AnswerEntry, SemanticProposal, ProposalDecision, Artifact (§8) |
| ✅ | Version binding: session stores `question_set_id` + `question_set_version`, `mechanism_set_id` + `mechanism_set_version` (§6) |
| ✅ | Backend: load `question_set.json` and `mechanism_set.json`; no hardcoded questions (§6) |

**Outcome:** Repo and data model ready; config-driven versioning in place.

---

### Week 2: Backend API and frontend shell (§11, §13 steps 1–2)

| Done | Task |
|------|------|
| ✅ | Backend: API routes (cases, sessions, entries, proposals, decisions, artifacts) (§11) |
| ✅ | Backend: SQLite schema and store (create/read/update/delete); init DB on startup (§8) |
| ✅ | Frontend: pages and routing (CaseList, CreateCase, CaseDetail, SessionWizard, ArtifactViewer) |
| ✅ | Frontend: API client; load question set from config for UI (§6) |
| ✅ | Frontend: app shell (header, nav), design system (cards, buttons, forms, verbatim blocks) |

**Outcome:** Full stack runs; UI shell and data persistence in place.

---

### Week 3: Case and session flows (§4.1–4.2, §4.5, §13 steps 2–3)

| Done | Task |
|------|------|
| ✅ | Create Case form (Phase 0): domain, case name, participant role, jurisdiction (§4.1, §8); validation; redirect to Case Detail |
| ✅ | Start Strategy Session: bind current question_set + mechanism_set versions (§4.2, §6) |
| ✅ | Case Detail: list sessions/artifacts; "New Strategy Session" (§4.5) |
| ✅ | GET case, GET sessions for case |
| ✅ | Entry delete: `DELETE /sessions/:id/entries/:entry_id` (draft only) (§12) |
| ✅ | Professional UI: breadcrumbs, badges (draft/finalized), empty states |

**Outcome:** Users can create cases and start sessions; Phase 0 and session creation complete.

---

## Phase 2 — Functionality (Weeks 4–7)

### Week 4: Fixed question protocol Q1–Q5 (§4.3, §5, §13 step 4)

| Done | Task |
|------|------|
| ✅ | Render Q1–Q5 from question_set.json in fixed order (§5, §6) |
| ✅ | Q1: single textarea + Save (replace existing Q1 entry) |
| ✅ | Q2–Q5: text input + "Add entry"; list entries with Delete (pre-finalize only) (§12) |
| 🔲 | Optional: edit entry (PATCH or delete + re-add) pre-finalize only |

**Outcome:** Full protocol run in UI; verbatim capture only (§3, §14).

---

### Week 5: Proposals and operator overlay (§10, §13 step 5)

| Done | Task |
|------|------|
| ✅ | Backend: `POST /entries/:id/proposals` (stub returns empty) |
| 🔲 | Backend: LLM integration — return only `mechanism_id` + verbatim `span_text`; no summarization (§10) |
| 🔲 | Frontend: "Request proposals" per entry; display proposals below entry text |
| ✅ | Proposals stored separately; never alter user text (§10) |
| ✅ | Backend: `POST /proposals/:id/decision` (accepted_manual / rejected_manual / undecided) (§8) |
| ✅ | Session Wizard: operator mode toggle (§10) |
| 🔲 | UI: list proposals per entry; in operator mode show Accept / Reject (+ optional reason) (§10) |
| ✅ | Decisions stored as overlays; entry text unchanged (§10, §14) |

**Outcome:** Proposals (stub or real) requestable and visible; operators can accept/reject; non-authoritative (§1–3).

---

### Week 6: Finalize and artifact (§4.4–4.5, §9, §13 steps 6–7)

| Done | Task |
|------|------|
| ✅ | Finalize: lock inputs; generate artifact; reject entry/proposal changes after finalize (§12) |
| ✅ | Artifact JSON per §9: session (bound config versions), strategy (Q1), verbatim answers Q2–Q5, semantic_proposals + decisions, integrity (optional) |
| ✅ | Artifact Viewer: read-only; metadata, Q1–Q5 verbatim, proposals + decisions, hash/signature if present (§13 step 7) |
| 🔲 | Export artifact as JSON (download button) |
| ✅ | Display hash/signature in viewer when present |

**Outcome:** Sessions lock and produce immutable artifacts; view (and when done, export) them (§14).

---

### Week 7: Pilot and V0 acceptance (§14)

| Done | Task |
|------|------|
| 🔲 | Internal testing with real-case scenarios |
| 🔲 | Fix bugs and usability issues |
| 🔲 | Confirm: fixed order, no edits after finalize, verbatim only, proposals non-authoritative, decisions as overlays (§12, §14) |

**Outcome:** MVP validated for pilot use; "V0 done" criteria met.

---

## Phase 3 — Guardrails and first deploy (Weeks 8–9)

### Week 8: Guardrails and observability

| Done | Task |
|------|------|
| 🔲 | Validate `question_id` on POST entries (must be Q1–Q5 from session's question set) (§6, §8) |
| 🔲 | Validate `mechanism_id` for proposals/decisions (allowed for question + session mechanism set) (§7–8) |
| 🔲 | Rate limiting on `POST /entries/:id/proposals` (configurable via env) |
| 🔲 | Backend: structured logging (level, timestamp, request id); no secrets in logs |
| 🔲 | Backend: `GET /health` (200 + DB ping) for load balancer / process manager |

**Outcome:** Protocol enforced server-side; rate limits and basic observability.

---

### Week 9: Config, CORS, and first deployment

| Done | Task |
|------|------|
| ✅ | Env-only config: `PORT`, `DATABASE_PATH`, `NODE_ENV`, `CORS_ORIGINS`; add `.env.example` |
| ✅ | Backend: CORS from env (`CORS_ORIGINS`); no `*` in production |
| 🔲 | Backend: no verbose stack traces in production |
| ✅ | Frontend: `VITE_API_URL` for production API base; document in README |
| ✅ | Deploy backend (persistent SQLite path, process manager); deploy frontend (static host, SPA fallback); docs in DEPLOY.md and docs/BACKEND_DEPLOY_STEPS.md |
| 🔲 | Client onboarding docs and first pilot support |

**Outcome:** App deployable; env and CORS production-safe; clients can use it.

---

## Phase 4 — Production hardening (Weeks 10–12)

### Week 10: Environment, security, observability, and backend deploy

| Done | Task |
|------|------|
| 🔲 | Centralise config in env; document every key in README and `.env.example` |
| 🔲 | Require `NODE_ENV=production` for production behaviour |
| 🔲 | Restrict CORS to explicit origins in production |
| 🔲 | Log request method, path, status; optional request id; keep logs free of secrets |
| 🔲 | Document log location and log level |
| 🔲 | Choose production host (Railway, Render, Fly.io, VPS, etc.); document deploy steps |
| 🔲 | Set env on host: `NODE_ENV`, `PORT`, `DATABASE_PATH`, `CORS_ORIGINS`, auth/LLM keys |
| 🔲 | SQLite on persistent volume; process manager (e.g. PM2) or platform default |
| 🔲 | Optional: Docker; document `Dockerfile` / `docker-compose` |

**Outcome:** Backend runs reliably in production with persistent data.

---

### Week 11: Optional upgrades and documentation

| Done | Task |
|------|------|
| 🔲 | Optional: Auth — JWT or OAuth/SSO; backend auth middleware; frontend login + `Authorization` header |
| 🔲 | Optional: Postgres (e.g. Neon, Supabase); migrations; swap store without changing API |
| 🔲 | Optional: HTTPS (host or reverse proxy); HTTP → HTTPS redirect |
| 🔲 | Optional: compute and store `hash_sha256` (and signature) on artifact; show in viewer |
| 🔲 | Optional: scheduled DB backups; document restore |
| ✅ | README: quick start, env table, link to this plan and REQUIREMENTS.md |
| ✅ | Deploy doc: env checklist, deploy order (health URL in Week 8; logs TBD) |
| 🔲 | Optional: "How to use Ary" for clients; runbook for common issues |

**Outcome:** Production-ready; optional auth/scale/integrity/backups; team can deploy and support.

---

### Week 12: Buffer and acceptance sign-off

| Done | Task |
|------|------|
| 🔲 | Re-validate all §14 acceptance criteria against running system |
| 🔲 | Fix any gaps; document known limitations |
| 🔲 | Optional: remaining items from Week 11 |

**Outcome:** V0 acceptance sign-off; handover to pilot.

---

## Summary

| Phase | Weeks | Focus | Key requirement refs |
|-------|--------|--------|------------------------|
| 1 | 1–3 | Setup, data model, config, Case/Session flows | §6, §8, §11, §13 (1–3) |
| 2 | 4–7 | Q1–Q5, proposals, operator, finalize, artifact, pilot | §4–5, §9–10, §12–14 |
| 3 | 8–9 | Guardrails, env/CORS, first deploy | §6, §8, §12 |
| 4 | 10–12 | Production hardening, optional auth/upgrades, docs | — |

Update this file as you complete each task (🔲 → ✅).
