import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getProposal, getEntry, getSession, createDecision } from '../store/index.js';
import type { ProposalDecision, ProposalDecisionValue } from '../types/models.js';

const router = Router({ mergeParams: true });

const VALID_DECISIONS: ProposalDecisionValue[] = ['accepted_manual', 'rejected_manual', 'undecided'];

/** POST /proposals/:proposal_id/decision — Manual overlay (operator mode) */
router.post('/', (req, res) => {
  const proposal_id = (req.params as { proposal_id: string }).proposal_id;
  const proposal = getProposal(proposal_id);
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

  const entry = getEntry(proposal.entry_id);
  if (!entry) return res.status(404).json({ error: 'Entry not found' });
  const session = getSession(entry.session_id);
  if (!session || session.status !== 'draft') {
    return res.status(403).json({ error: 'Cannot set decision after session is finalized' });
  }

  const { decision, reason } = req.body ?? {};
  if (!decision || !VALID_DECISIONS.includes(decision)) {
    return res.status(400).json({ error: 'decision must be one of: accepted_manual, rejected_manual, undecided' });
  }

  const decision_id = uuidv4();
  const now = new Date().toISOString();
  const decided_by = (req as { userId?: string }).userId ?? 'operator';
  const d: ProposalDecision = { decision_id, proposal_id, decision, reason, decided_by, decided_at: now };
  createDecision(d);
  res.status(201).json(d);
});

export default router;
