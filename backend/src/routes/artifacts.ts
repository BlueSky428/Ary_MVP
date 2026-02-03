import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getSession,
  updateSession,
  getEntriesBySessionId,
  getProposalsByEntryId,
  getDecisionByProposalId,
  createArtifact,
  getArtifact,
} from '../store/index.js';
import type { Artifact, ArtifactOutput, SessionStatus } from '../types/models.js';

const router = Router();

/**
 * POST /artifacts — Finalize session + generate artifact.
 * Immutability: no further edits to entries/proposals after this.
 */
router.post('/', (req, res) => {
  const { session_id } = req.body ?? {};
  if (!session_id) return res.status(400).json({ error: 'session_id is required' });

  const session = getSession(session_id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.status === 'finalized') return res.status(400).json({ error: 'Session already finalized' });

  const now = new Date().toISOString();
  const updatedSession = {
    ...session,
    status: 'finalized' as SessionStatus,
    finalized_at: now,
  };
  updateSession(session_id, updatedSession);

  const entries = getEntriesBySessionId(session_id);
  const q1Entry = entries.find((e) => e.question_id === 'Q1');
  const strategyText = q1Entry?.text ?? '';

  const answers: ArtifactOutput['answers'] = {
    Q2: entries.filter((e) => e.question_id === 'Q2').map((e) => ({ entry_id: e.entry_id, text: e.text })),
    Q3: entries.filter((e) => e.question_id === 'Q3').map((e) => ({ entry_id: e.entry_id, text: e.text })),
    Q4: entries.filter((e) => e.question_id === 'Q4').map((e) => ({ entry_id: e.entry_id, text: e.text })),
    Q5: entries.filter((e) => e.question_id === 'Q5').map((e) => ({ entry_id: e.entry_id, text: e.text })),
  };

  const semantic_proposals: ArtifactOutput['semantic_proposals'] = [];
  for (const entry of entries) {
    const entryProposals = getProposalsByEntryId(entry.entry_id);
    for (const p of entryProposals) {
      const dec = getDecisionByProposalId(p.proposal_id);
      semantic_proposals.push({
        proposal_id: p.proposal_id,
        entry_id: p.entry_id,
        mechanism_id: p.mechanism_id,
        span_text: p.span_text,
        decision: dec?.decision ?? 'undecided',
        decision_reason: dec?.reason,
      });
    }
  }

  const artifact_id = uuidv4();
  const output: ArtifactOutput = {
    artifact_id,
    session: {
      session_id: updatedSession.session_id,
      case_id: updatedSession.case_id,
      question_set: { id: updatedSession.question_set_id, version: updatedSession.question_set_version },
      mechanism_set: { id: updatedSession.mechanism_set_id, version: updatedSession.mechanism_set_version },
      created_by: updatedSession.created_by,
      created_at: updatedSession.created_at,
      finalized_at: updatedSession.finalized_at!,
    },
    strategy: { q1_text: strategyText },
    answers,
    semantic_proposals,
    integrity: {},
  };

  const artifact: Artifact = {
    artifact_id,
    session_id,
    artifact_json: JSON.stringify(output, null, 2),
    hash_sha256: undefined,
    signature: undefined,
    created_at: now,
  };
  createArtifact(artifact);

  res.status(201).json({ artifact_id, ...JSON.parse(artifact.artifact_json) });
});

/** GET /artifacts/:artifact_id */
router.get('/:artifact_id', (req, res) => {
  const art = getArtifact(req.params.artifact_id);
  if (!art) return res.status(404).json({ error: 'Artifact not found' });
  const output = JSON.parse(art.artifact_json) as ArtifactOutput;
  res.json(output);
});

export default router;
