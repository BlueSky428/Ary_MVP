/**
 * Ary V0 — Frontend types (aligned with backend; verbatim capture, no inference).
 */

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

export interface Case {
  case_id: string;
  domain: string;
  case_name_or_reference: string;
  jurisdiction?: string;
  participant_role: string;
  created_by: string;
  created_at: string;
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
  text: string;
  created_at: string;
}

export interface SemanticProposal {
  proposal_id: string;
  entry_id: string;
  mechanism_id: string;
  span_text: string;
  rationale?: string;
  confidence?: number;
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
  integrity: { hash_sha256?: string; signature?: string };
}
