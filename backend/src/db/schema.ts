/**
 * SQLite schema for Ary V0. Run on first open.
 */

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS cases (
  case_id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  case_name_or_reference TEXT NOT NULL,
  jurisdiction TEXT,
  participant_role TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  question_set_id TEXT NOT NULL,
  question_set_version TEXT NOT NULL,
  mechanism_set_id TEXT NOT NULL,
  mechanism_set_version TEXT NOT NULL,
  status TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  finalized_at TEXT,
  FOREIGN KEY (case_id) REFERENCES cases(case_id)
);

CREATE TABLE IF NOT EXISTS entries (
  entry_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE IF NOT EXISTS proposals (
  proposal_id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  mechanism_id TEXT NOT NULL,
  span_text TEXT NOT NULL,
  rationale TEXT,
  confidence REAL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (entry_id) REFERENCES entries(entry_id)
);

CREATE TABLE IF NOT EXISTS decisions (
  decision_id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  reason TEXT,
  decided_by TEXT NOT NULL,
  decided_at TEXT NOT NULL,
  FOREIGN KEY (proposal_id) REFERENCES proposals(proposal_id)
);

CREATE TABLE IF NOT EXISTS artifacts (
  artifact_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  artifact_json TEXT NOT NULL,
  hash_sha256 TEXT,
  signature TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_case_id ON sessions(case_id);
CREATE INDEX IF NOT EXISTS idx_entries_session_id ON entries(session_id);
CREATE INDEX IF NOT EXISTS idx_proposals_entry_id ON proposals(entry_id);
CREATE INDEX IF NOT EXISTS idx_decisions_proposal_id ON decisions(proposal_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_session_id ON artifacts(session_id);
`;
