/**
 * Ary V0 — Data model types (immutable artifact–compatible).
 * Backend and frontend must not silently infer or rewrite.
 */

// ─── Config (versioned, bound at session creation) ─────────────────────────

export type AnswerMode = 'single' | 'multi_atomic';

export interface QuestionConfig {
  question_id: string;
  prompt: string;
  purpose: string;
  must_elicit: string[];
  must_not_elicit: string[];
  answer_mode: AnswerMode;
  expected_mechanisms: string[];
}

export interface QuestionSetConfig {
  question_set_id: string;
  version: string;
  questions: QuestionConfig[];
}

export interface MechanismConfig {
  mechanism_id: string;
  name: string;
  definition: string;
  allowed_question_ids: string[];
  required_fields: string[];
}

export interface MechanismSetConfig {
  mechanism_set_id: string;
  version: string;
  mechanisms: MechanismConfig[];
}

// ─── Domain entities ───────────────────────────────────────────────────────

export interface Case {
  case_id: string;
  domain: string;
  case_name_or_reference: string;
  jurisdiction?: string;
  participant_role: string;
  created_by: string;
  created_at: string; // ISO
}

export type SessionStatus = 'draft' | 'finalized';

export interface Session {
  session_id: string;
  case_id: string;
  question_set_id: string;
  question_set_version: string;
  mechanism_set_id: string;
  mechanism_set_version: string;
  status: SessionStatus;
  created_by: string;
  created_at: string;
  finalized_at?: string;
}

export interface AnswerEntry {
  entry_id: string;
  session_id: string;
  question_id: string;
  text: string; // verbatim only
  created_at: string;
}

export interface SemanticProposal {
  proposal_id: string;
  entry_id: string;
  mechanism_id: string;
  span_text: string; // exact substring from entry
  rationale?: string;
  confidence?: number; // never authoritative
  created_at: string;
}

export type ProposalDecisionValue = 'accepted_manual' | 'rejected_manual' | 'undecided';

export interface ProposalDecision {
  decision_id: string;
  proposal_id: string;
  decision: ProposalDecisionValue;
  reason?: string;
  decided_by: string;
  decided_at: string;
}

export interface Artifact {
  artifact_id: string;
  session_id: string;
  artifact_json: string; // serialized ArtifactOutput
  hash_sha256?: string;
  signature?: string;
  created_at: string;
}

// ─── Artifact JSON output (V0 structure) ───────────────────────────────────

export interface ArtifactOutput {
  artifact_id: string;
  session: {
    session_id: string;
    case_id: string;
    question_set: { id: string; version: string };
    mechanism_set: { id: string; version: string };
    created_by: string;
    created_at: string;
    finalized_at: string;
  };
  strategy: { q1_text: string };
  answers: {
    Q2: Array<{ entry_id: string; text: string }>;
    Q3: Array<{ entry_id: string; text: string }>;
    Q4: Array<{ entry_id: string; text: string }>;
    Q5: Array<{ entry_id: string; text: string }>;
  };
  semantic_proposals: Array<{
    proposal_id: string;
    entry_id: string;
    mechanism_id: string;
    span_text: string;
    decision: string;
    decision_reason?: string;
  }>;
  integrity: {
    hash_sha256?: string;
    signature?: string;
  };
}
