/**
 * SQLite-backed store. Same domain types; persistence via getDb().
 */

import type {
  Case,
  Session,
  AnswerEntry,
  SemanticProposal,
  ProposalDecision,
  Artifact,
} from '../types/models.js';
import { getDb } from './client.js';

function rowToCase(r: Record<string, unknown>): Case {
  return {
    case_id: r.case_id as string,
    domain: r.domain as string,
    case_name_or_reference: r.case_name_or_reference as string,
    jurisdiction: r.jurisdiction as string | undefined,
    participant_role: r.participant_role as string,
    created_by: r.created_by as string,
    created_at: r.created_at as string,
  };
}

function rowToSession(r: Record<string, unknown>): Session {
  return {
    session_id: r.session_id as string,
    case_id: r.case_id as string,
    question_set_id: r.question_set_id as string,
    question_set_version: r.question_set_version as string,
    mechanism_set_id: r.mechanism_set_id as string,
    mechanism_set_version: r.mechanism_set_version as string,
    status: r.status as Session['status'],
    created_by: r.created_by as string,
    created_at: r.created_at as string,
    finalized_at: r.finalized_at as string | undefined,
  };
}

function rowToEntry(r: Record<string, unknown>): AnswerEntry {
  return {
    entry_id: r.entry_id as string,
    session_id: r.session_id as string,
    question_id: r.question_id as string,
    text: r.text as string,
    created_at: r.created_at as string,
  };
}

function rowToProposal(r: Record<string, unknown>): SemanticProposal {
  return {
    proposal_id: r.proposal_id as string,
    entry_id: r.entry_id as string,
    mechanism_id: r.mechanism_id as string,
    span_text: r.span_text as string,
    rationale: r.rationale as string | undefined,
    confidence: r.confidence as number | undefined,
    created_at: r.created_at as string,
  };
}

function rowToDecision(r: Record<string, unknown>): ProposalDecision {
  return {
    decision_id: r.decision_id as string,
    proposal_id: r.proposal_id as string,
    decision: r.decision as ProposalDecision['decision'],
    reason: r.reason as string | undefined,
    decided_by: r.decided_by as string,
    decided_at: r.decided_at as string,
  };
}

function rowToArtifact(r: Record<string, unknown>): Artifact {
  return {
    artifact_id: r.artifact_id as string,
    session_id: r.session_id as string,
    artifact_json: r.artifact_json as string,
    hash_sha256: r.hash_sha256 as string | undefined,
    signature: r.signature as string | undefined,
    created_at: r.created_at as string,
  };
}

// Cases
export function getCase(id: string): Case | undefined {
  const row = getDb().prepare('SELECT * FROM cases WHERE case_id = ?').get(id);
  return row ? rowToCase(row as Record<string, unknown>) : undefined;
}

export function listCases(): Case[] {
  const rows = getDb().prepare('SELECT * FROM cases ORDER BY created_at DESC').all();
  return (rows as Record<string, unknown>[]).map(rowToCase);
}

export function createCase(c: Case): void {
  getDb()
    .prepare(
      `INSERT INTO cases (case_id, domain, case_name_or_reference, jurisdiction, participant_role, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      c.case_id,
      c.domain,
      c.case_name_or_reference,
      c.jurisdiction ?? null,
      c.participant_role,
      c.created_by,
      c.created_at
    );
}

// Sessions
export function getSession(id: string): Session | undefined {
  const row = getDb().prepare('SELECT * FROM sessions WHERE session_id = ?').get(id);
  return row ? rowToSession(row as Record<string, unknown>) : undefined;
}

export function getSessionsByCaseId(caseId: string): Session[] {
  const rows = getDb()
    .prepare('SELECT * FROM sessions WHERE case_id = ? ORDER BY created_at DESC')
    .all(caseId);
  return (rows as Record<string, unknown>[]).map(rowToSession);
}

export function createSession(s: Session): void {
  getDb()
    .prepare(
      `INSERT INTO sessions (session_id, case_id, question_set_id, question_set_version, mechanism_set_id, mechanism_set_version, status, created_by, created_at, finalized_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      s.session_id,
      s.case_id,
      s.question_set_id,
      s.question_set_version,
      s.mechanism_set_id,
      s.mechanism_set_version,
      s.status,
      s.created_by,
      s.created_at,
      s.finalized_at ?? null
    );
}

export function updateSession(id: string, s: Session): void {
  getDb()
    .prepare(
      `UPDATE sessions SET status = ?, finalized_at = ? WHERE session_id = ?`
    )
    .run(s.status, s.finalized_at ?? null, id);
}

// Entries
export function getEntry(id: string): AnswerEntry | undefined {
  const row = getDb().prepare('SELECT * FROM entries WHERE entry_id = ?').get(id);
  return row ? rowToEntry(row as Record<string, unknown>) : undefined;
}

export function getEntriesBySessionId(sessionId: string): AnswerEntry[] {
  const rows = getDb()
    .prepare('SELECT * FROM entries WHERE session_id = ? ORDER BY created_at')
    .all(sessionId);
  return (rows as Record<string, unknown>[]).map(rowToEntry);
}

export function createEntry(e: AnswerEntry): void {
  getDb()
    .prepare(
      `INSERT INTO entries (entry_id, session_id, question_id, text, created_at) VALUES (?, ?, ?, ?, ?)`
    )
    .run(e.entry_id, e.session_id, e.question_id, e.text, e.created_at);
}

export function deleteEntry(entryId: string): void {
  getDb().prepare('DELETE FROM entries WHERE entry_id = ?').run(entryId);
}

// Proposals
export function getProposal(id: string): SemanticProposal | undefined {
  const row = getDb().prepare('SELECT * FROM proposals WHERE proposal_id = ?').get(id);
  return row ? rowToProposal(row as Record<string, unknown>) : undefined;
}

export function getProposalsByEntryId(entryId: string): SemanticProposal[] {
  const rows = getDb()
    .prepare('SELECT * FROM proposals WHERE entry_id = ? ORDER BY created_at')
    .all(entryId);
  return (rows as Record<string, unknown>[]).map(rowToProposal);
}

export function createProposal(p: SemanticProposal): void {
  getDb()
    .prepare(
      `INSERT INTO proposals (proposal_id, entry_id, mechanism_id, span_text, rationale, confidence, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      p.proposal_id,
      p.entry_id,
      p.mechanism_id,
      p.span_text,
      p.rationale ?? null,
      p.confidence ?? null,
      p.created_at
    );
}

// Decisions
export function getDecisionByProposalId(proposalId: string): ProposalDecision | undefined {
  const row = getDb()
    .prepare('SELECT * FROM decisions WHERE proposal_id = ?')
    .get(proposalId);
  return row ? rowToDecision(row as Record<string, unknown>) : undefined;
}

export function createDecision(d: ProposalDecision): void {
  getDb()
    .prepare(
      `INSERT INTO decisions (decision_id, proposal_id, decision, reason, decided_by, decided_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(d.decision_id, d.proposal_id, d.decision, d.reason ?? null, d.decided_by, d.decided_at);
}

// Artifacts
export function getArtifact(id: string): Artifact | undefined {
  const row = getDb().prepare('SELECT * FROM artifacts WHERE artifact_id = ?').get(id);
  return row ? rowToArtifact(row as Record<string, unknown>) : undefined;
}

export function getArtifactsBySessionId(sessionId: string): Artifact | undefined {
  const row = getDb()
    .prepare('SELECT * FROM artifacts WHERE session_id = ?')
    .get(sessionId);
  return row ? rowToArtifact(row as Record<string, unknown>) : undefined;
}

export function createArtifact(a: Artifact): void {
  getDb()
    .prepare(
      `INSERT INTO artifacts (artifact_id, session_id, artifact_json, hash_sha256, signature, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      a.artifact_id,
      a.session_id,
      a.artifact_json,
      a.hash_sha256 ?? null,
      a.signature ?? null,
      a.created_at
    );
}
