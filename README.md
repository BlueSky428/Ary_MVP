# Ary V0 — Guided Protocol Pilot (MVP)

V0 is the first real MVP slice: a **protocol runner** for client sessions that produces **immutable strategy artifacts**. It is not a chat product, summarizer, or tool that interprets reasoning. **AI proposes. Rules decide.** In V0, humans perform the decide step; the system records it.

## Core invariants

- **Two-phase**: Phase 0 (context declaration) → Phase 1 (fixed question protocol).
- **Fixed questions**: Q1–Q5 in fixed order; no extra prompts or follow-ups.
- **Verbatim capture**: User text is never rewritten or inferred.
- **Config-first**: `question_set.json` and `mechanism_set.json` are versioned; sessions bind versions at creation.
- **Immutability**: After finalize, no edits to entries; new version = new session.

## Repository structure

```
Ary_MVP/
├── config/                    # Versioned protocol config (shared concept)
│   ├── question_set.json       # Q1–Q5, answer_mode, expected_mechanisms
│   └── mechanism_set.json     # M1–M8 mechanisms, allowed_question_ids
├── backend/                   # Node + Express + TypeScript
│   ├── src/
│   │   ├── index.ts           # API entry
│   │   ├── config/            # Load question_set + mechanism_set
│   │   ├── types/             # Case, Session, AnswerEntry, Artifact, etc.
│   │   ├── db/                # SQLite: schema, client, store (persistence)
│   │   ├── store/             # Re-exports db store for routes
│   │   └── routes/            # cases, sessions, entries, proposals, decisions, artifacts
│   └── package.json
├── frontend/                  # React + TypeScript + Vite
│   ├── public/config/         # question_set.json for UI (no hardcoding)
│   ├── src/
│   │   ├── main.tsx, App.tsx
│   │   ├── api/               # API client
│   │   ├── config/            # loadQuestionSet()
│   │   ├── types/             # Aligned with backend models
│   │   ├── pages/             # CaseList, CreateCase, CaseDetail, SessionWizard, ArtifactViewer
│   │   └── components/
│   └── package.json
└── README.md
```

## Quick start

1. **Install (root)**  
   `npm install`

2. **Run backend**  
   `npm run dev:backend`  
   API: `http://localhost:3001`

3. **Run frontend**  
   `npm run dev:frontend`  
   App: `http://localhost:5173` (proxies `/api` to backend)

4. **Run both**  
   `npm run dev`

## Database (SQLite)

The backend uses **SQLite** for persistence. On first run it creates:

- **Default path**: `backend/data/ary.sqlite` (directory created if needed).
- **Override**: set `DATABASE_PATH` to a full file path (e.g. `/var/lib/ary/ary.sqlite`).

Schema is applied automatically on startup. Backup by copying the `.sqlite` file.

## API (minimum endpoints)

| Method | Path | Description |
|--------|------|-------------|
| POST   | /cases | Create case (Phase 0) |
| GET    | /cases | List cases |
| GET    | /cases/:case_id | Get case |
| GET    | /cases/:case_id/sessions | List sessions for case |
| POST   | /sessions | Create session (binds question_set + mechanism_set versions) |
| GET    | /sessions/:session_id | Get session |
| POST   | /sessions/:session_id/entries | Add entry (draft only) |
| GET    | /sessions/:session_id/entries | List entries |
| POST   | /entries/:entry_id/proposals | Generate LLM proposals (stub in V0) |
| GET    | /entries/:entry_id/proposals | List proposals |
| POST   | /proposals/:proposal_id/decision | Manual accept/reject (operator mode) |
| POST   | /artifacts | Finalize session + generate artifact |
| GET    | /artifacts/:artifact_id | Get artifact (read-only) |

## Fixed question set (Legal V0)

- **Q1** — Strategy under consideration (single).
- **Q2** — Factors for/against (multi-atomic).
- **Q3** — Constraints recognized (multi-atomic).
- **Q4** — Uncertainty acknowledged (multi-atomic).
- **Q5** — Alternatives considered but not pursued (multi-atomic).

Questions and mechanisms are defined in `config/question_set.json` and `config/mechanism_set.json`. Frontend and backend load the same structure; sessions store `question_set_id` + `question_set_version` and `mechanism_set_id` + `mechanism_set_version` at creation.

## Development plan

Full weekly plan (MVP + production) is in **[DEVELOPMENT.md](./DEVELOPMENT.md)** — Weeks 1–17 with checkboxes. Summary:

- **Weeks 1–3:** Setup, data model, SQLite, UI shell.
- **Weeks 4–10:** Case/session, Q1–Q5 flow, proposals, operator overlay, finalize, artifact view/export, pilot testing.
- **Weeks 11–12:** Guardrails, observability, env/CORS, first deployment.
- **Weeks 13–17:** Production hardening (env, auth, observability, deploy, optional Postgres/HTTPS/backups, docs).

## Do not

- Add extra prompts or follow-ups.
- Let the model rewrite or “clean up” user text.
- Use model confidence as authority.
- Allow edits after finalize.
