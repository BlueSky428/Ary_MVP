import { Router } from 'express';
import { getEntry, getSession, getProposalsByEntryId } from '../store/index.js';
import { loadQuestionSet } from '../config/loadConfig.js';
import type { SemanticProposal } from '../types/models.js';

const router = Router({ mergeParams: true });

/**
 * POST /entries/:entry_id/proposals
 * Server calls LLM and stores proposals. V0: stub that returns empty;
 * LLM integration must only propose mechanism_id + span_text (verbatim), no rewriting.
 */
router.post('/', (req, res) => {
  const entry_id = (req.params as { entry_id: string }).entry_id;
  const entry = getEntry(entry_id);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });
  const session = getSession(entry.session_id);
  if (!session || session.status !== 'draft') return res.status(403).json({ error: 'Session not draft' });

  const qs = loadQuestionSet();
  const q = qs.questions.find((qu) => qu.question_id === entry.question_id);
  const _allowed = q?.expected_mechanisms ?? []; // Used when adding real LLM: restrict proposals to these

  // V0 stub: no real LLM call; return empty. Replace with LLM service that only returns mechanism_id + span_text (verbatim).
  const created: SemanticProposal[] = [];

  res.status(201).json(created);
});

/** GET /entries/:entry_id/proposals */
router.get('/', (req, res) => {
  const list = getProposalsByEntryId((req.params as { entry_id: string }).entry_id);
  res.json(list);
});

export default router;
