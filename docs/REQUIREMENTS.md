# Ary V0 — Requirements (Guided Protocol Pilot MVP)

Single source of truth for the V0 spec. Section references (e.g. §4, §8) are used in [DEVELOPMENT.md](DEVELOPMENT.md) for traceability.

---

## 1. What V0 is / is not

### 1.1 What this is

V0 is the first real MVP slice, built to run client sessions and generate immutable strategy artifacts. It is not a "prototype" and not a "marketing demo."

### 1.2 What this is not

V0 is not an AI chat product, not a summarizer, and not a tool that "interprets reasoning." In V0, rules are not automated; they will be applied manually in guided sessions, while the system logs the same structure we will later enforce deterministically.

### 1.3 V0 vs old demo

**Old demo behavior (do not recreate):**

- Add follow-up questions dynamically
- Summarize user statements (the compiler)
- Present AI output as authoritative
- Hide ambiguity by "making it sound right"

This is incompatible with Ary's thesis.

**V0 behavior (what we ship):**

V0 is a protocol runner:

- Fixed question set
- Fixed order
- Verbatim capture
- Immutable artifact output
- Optional LLM "semantic proposals" (strictly non-authoritative)
- Manual "accept/reject" overlays only (audit seed)

**Core axiom:** AI proposes. Rules decide. In V0, humans perform the "decide" step; the system only records it.

---

## 2. Goals and non-goals

### 2.1 Objective

Ship the minimum product that allows:

1. Running real client sessions (guided)
2. Producing a clean, read-only Strategy Artifact
3. Capturing user feedback on usefulness of the format
4. Keeping architecture fully compatible with future deterministic enforcement

### 2.2 Non-goals

- Full automated admissibility rules
- Open conversation / freeform chat
- Any automatic inference or rewriting of reasoning
- AI-driven "decision authority"

---

## 3. Core invariants (non-negotiable)

### 3.1 Two-phase structure

**Phase 0 — Context Declaration (non-evidentiary)**  
Case metadata only. Not evidence of reasoning.

**Phase 1 — Fixed Question Protocol (evidentiary)**  
Once started:

- Question wording fixed
- Question order fixed
- No extra prompting, no "follow-ups," no probing
- The system never deviates

### 3.2 Strategy atomicity

One session = one strategy.

- Q1 defines the strategy scope.
- Q2–Q5 must refer to that one strategy.
- If user shifts strategy, start a new session.

### 3.3 Separation of powers

- LLM = proposal only, no authority.
- Backend and UI must never silently infer or rewrite.
- Future deterministic rules will be sole authority. V0 must be built so rules can plug in later without refactoring the architecture.

---

## 4. Product surface (what users can do)

### 4.1 Create Case (Phase 0)

Create a Case via a small context form (QCM-style).

**Fields:**

- domain (default: Legal Strategy)
- case name / reference
- participant role (Partner / Associate / Counsel / etc.)
- jurisdiction (optional)

**Output:** case_id

### 4.2 Start Strategy Session (Phase 1)

Inside Case:

- "New Strategy Session"
- System creates session_id and binds it to versioned config (question set + mechanism set).

### 4.3 Run Fixed Questions (Q1–Q5)

UI shows exactly 5 questions, in order.

- Q1 is single input.
- Q2–Q5 are atomic-entry lists (Add another / Done).

### 4.4 Finalize

Finalize session:

- Lock inputs
- Generate artifact
- Render artifact read-only

### 4.5 View Artifacts

Case shows list of sessions/artifacts (versioned).

---

## 5. Fixed question set (Legal V0)

| Question | Purpose | Prompt |
|----------|---------|--------|
| **Q1** | Strategy Under Consideration (single) | "What is the legal strategy or course of action you are considering in this matter?" |
| **Q2** | Considerations for / against (multi-atomic) | "What factors made this strategy more or less suitable in that situation?" |
| **Q3** | Constraints recognized (multi-atomic) | "What legal, procedural, practical, or resource constraints affected whether or how this strategy could be pursued?" |
| **Q4** | Uncertainty acknowledged (multi-atomic) | "What was uncertain or unknown to you at that stage regarding this strategy?" |
| **Q5** | Alternatives considered but not pursued (multi-atomic) | "Were there other legal strategies you considered but decided not to pursue at that time?" |

---

## 6. Config-first design

Frontend and backend must load the same structure. Sessions bind config versions at creation; do not live-update sessions already started.

### 6.1 question_set.json (versioned)

**Required shape:**

- question_set_id
- version
- questions[] in order

**Each question has:**

- question_id (Q1..Q5)
- prompt
- purpose
- must_elicit[]
- must_not_elicit[]
- answer_mode = single or multi_atomic
- expected_mechanisms[]

**Hard rule:** When a session is created, store question_set_id and question_set_version on the session.

### 6.2 mechanism_set.json (versioned)

**Required shape:**

- mechanism_set_id
- version
- mechanisms[]

**Each mechanism has:**

- mechanism_id (M1..M8)
- name
- definition
- allowed_question_ids[]
- required_fields[] (used later; keep now for compatibility)

**Hard rule:** Store mechanism_set_id and mechanism_set_version on session and artifact.

---

## 7. Mechanisms and mapping

### 7.1 Mechanisms list (Legal set M1–M8)

Define these in mechanism_set.json:

- M1 — Strategy Description
- M2 — Trade-off Articulation
- M3 — Constraint Recognition
- M4 — Uncertainty Acknowledgment
- M5 — Rejected Alternative Strategy
- M6 — Priority Declaration
- M7 — Conditional Strategy Logic
- M8 — Information Basis Reference

V0 does not enforce rule admissibility; it just stores proposals and manual decisions.

### 7.2 Question → expected mechanisms mapping (LLM proposal constraints)

This is NOT rule enforcement. It only restricts what the LLM is allowed to propose per question.

| Question | Expected mechanisms |
|----------|---------------------|
| Q1 | M1 |
| Q2 | M2, M6, M7, M8 |
| Q3 | M3, M8 (only if the constraint is grounded in cited info) |
| Q4 | M4, M7 (if uncertainty is paired with contingent action) |
| Q5 | M5, M2 (if explicit pros/cons of rejected strategy are stated) |

---

## 8. Data model (minimum objects)

### 8.1 Case

- case_id (uuid)
- domain
- case_name_or_reference
- jurisdiction?
- participant_role
- created_by
- created_at

### 8.2 Session

- session_id (uuid)
- case_id
- question_set_id
- question_set_version
- mechanism_set_id
- mechanism_set_version
- status: draft | finalized
- created_by
- created_at
- finalized_at?

### 8.3 AnswerEntry (atomic)

One atomic entry belongs to one question in one session.

- entry_id (uuid)
- session_id
- question_id
- text (verbatim)
- created_at

### 8.4 SemanticProposal (LLM output, stored)

- proposal_id (uuid)
- entry_id
- mechanism_id (must be allowed for question)
- span_text (exact substring copied from entry)
- rationale? (optional)
- confidence? (optional; never authoritative)
- created_at

### 8.5 ProposalDecision (manual overlay, operator mode)

- decision_id (uuid)
- proposal_id
- decision: accepted_manual | rejected_manual | undecided
- reason? (short note)
- decided_by
- decided_at

### 8.6 Artifact

Generated on finalize:

- artifact_id
- session_id
- artifact_json
- hash_sha256?
- signature?
- created_at

---

## 9. Artifact JSON (V0 output)

Must include:

- Bound config versions
- Strategy (Q1)
- Verbatim entries for Q2–Q5
- Proposals + manual decisions (if any)
- Explicit absence as empty arrays (do not fill)

**Example structure:**

```json
{
  "artifact_id": "uuid",
  "session": {
    "session_id": "uuid",
    "case_id": "uuid",
    "question_set": {"id": "legal_v1", "version": "0.1.0"},
    "mechanism_set": {"id": "legal_mechanisms_v1", "version": "0.1.0"},
    "created_by": "user_id",
    "created_at": "iso",
    "finalized_at": "iso"
  },
  "strategy": {
    "q1_text": "verbatim"
  },
  "answers": {
    "Q2": [{"entry_id": "uuid", "text": "verbatim"}],
    "Q3": [{"entry_id": "uuid", "text": "verbatim"}],
    "Q4": [{"entry_id": "uuid", "text": "verbatim"}],
    "Q5": [{"entry_id": "uuid", "text": "verbatim"}]
  },
  "semantic_proposals": [
    {
      "proposal_id": "uuid",
      "entry_id": "uuid",
      "mechanism_id": "M3",
      "span_text": "exact quote",
      "decision": "accepted_manual",
      "decision_reason": "optional"
    }
  ],
  "integrity": {
    "hash_sha256": "optional",
    "signature": "optional"
  }
}
```

---

## 10. LLM and operator behavior

### 10.1 When to call LLM

For each AnswerEntry created for Q2–Q5 (optionally Q1): generate proposals restricted to expected mechanisms for that question.

### 10.2 Hard constraints for LLM prompt

**LLM must NEVER:**

- Summarize
- Rewrite
- "Improve" wording
- Infer missing reasoning
- Combine entries
- Add justification

**LLM must ONLY return:**

- mechanism_id from allowed list
- span_text copied verbatim from entry
- Optional short rationale pointing to the span

### 10.3 Operator mode

A toggle in UI:

- **Operator mode OFF:** Proposals may be hidden or shown read-only.
- **Operator mode ON:** Allow marking each proposal as accepted_manual or rejected_manual, and optionally writing a short reason.

**Important:**

- Accepting/rejecting a proposal must NOT modify the verbatim entry text.
- The decision is an overlay, not a transformation.

---

## 11. Backend API (minimum endpoints)

### Cases

- POST /cases
- GET /cases
- GET /cases/{case_id}

### Sessions

- POST /sessions — Input: case_id. Server binds current question_set and mechanism_set versions to the session.
- GET /cases/{case_id}/sessions
- GET /sessions/{session_id}

### Entries

- POST /sessions/{session_id}/entries — Input: {question_id, text}
- GET /sessions/{session_id}/entries

### Proposals

- POST /entries/{entry_id}/proposals — Server calls LLM and stores proposals.
- GET /entries/{entry_id}/proposals

### Proposal decisions

- POST /proposals/{proposal_id}/decision — Input: {decision, reason?}

### Artifacts

- POST /artifacts — Input: {session_id}. Server finalizes session + generates artifact + (optional) hash/signature.
- GET /artifacts/{artifact_id}

---

## 12. Immutability rules (must enforce)

**Before finalize:**

- User can add entries
- User can delete entries (optional; only allowed pre-finalize)

**After finalize:**

- No edits to entries
- No deletions
- No prompt changes
- No mechanism reinterpretation
- New version requires new session

---

## 13. Frontend build order (implementation steps)

1. **Case List** — Display cases; create case button.
2. **Create Case** — Phase 0 context form; submit → redirect to Case Detail.
3. **Case Detail** — List strategy sessions/artifacts; "New Strategy Session."
4. **Session Wizard** — Render questions from question_set.json; Q1 single text input; Q2–Q5 list input (text field, "Add entry," list preview with edit/delete pre-finalize only); "Done" to proceed.
5. **Proposals panel** — For each entry, show proposals (optional); include operator mode toggle; allow accept/reject decisions in operator mode.
6. **Finalize** — Finalize session; lock UI; generate artifact.
7. **Artifact Viewer** — Read-only; show metadata + Q1–Q5 verbatim entries; show proposals + decisions (if any); show hash/signature if present.

---

## 14. Acceptance criteria (definition of "V0 done")

V0 is complete when:

- A user can create a Case
- A user can run a Session Q1–Q5
- Q2–Q5 support multiple atomic entries
- The system can finalize and generate an immutable artifact
- The artifact is readable, structured, versioned, and includes verbatim text
- LLM proposals (if enabled) are restricted and never rewrite content
- Manual accept/reject decisions are stored as overlays
- Finalized artifacts cannot be edited

---

## 15. Do-not list (to prevent future corruption)

Do not:

- Add extra prompts
- Let the model generate "cleaned up" reasoning
- Merge entries automatically
- Infer mechanisms not mapped to the question
- Use model confidence as authority
- Overwrite user text with model text
- Allow edits after finalize

---

## Traceability (requirement → development week)

| Requirement | DEVELOPMENT.md |
|-------------|----------------|
| §1–3 (What V0 is, goals, invariants) | Week 1 (context); all weeks (constraints) |
| §4 Product surface | Weeks 3–7 (flows) |
| §5 Fixed question set | Week 4 |
| §6 Config-first | Weeks 1–2, 4 |
| §7 Mechanisms and mapping | Weeks 5, 8 |
| §8 Data model | Weeks 1–2 |
| §9 Artifact JSON | Week 6 |
| §10 LLM and operator | Week 5 |
| §11 Backend API | Weeks 2, 3, 5, 6, 8 |
| §12 Immutability | Weeks 3, 4, 6 |
| §13 Frontend build order | Weeks 2–7 |
| §14 Acceptance criteria | Week 7 (sign-off), Week 12 (re-validate) |
| §15 Do-not list | Applied throughout |
