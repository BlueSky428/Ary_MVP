import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createCase, listCases, getCase, getSessionsByCaseId } from '../store/index.js';
import type { Case } from '../types/models.js';

const router = Router();

/** POST /cases — Create case (Phase 0 context) */
router.post('/', (req, res) => {
  const { domain = 'Legal Strategy', case_name_or_reference, participant_role, jurisdiction } = req.body ?? {};
  if (!case_name_or_reference || !participant_role) {
    return res.status(400).json({ error: 'case_name_or_reference and participant_role are required' });
  }
  const case_id = uuidv4();
  const now = new Date().toISOString();
  const created_by = (req as { userId?: string }).userId ?? 'system';
  const c: Case = {
    case_id,
    domain: domain ?? 'Legal Strategy',
    case_name_or_reference,
    participant_role,
    jurisdiction,
    created_by,
    created_at: now,
  };
  createCase(c);
  res.status(201).json(c);
});

/** GET /cases — List cases */
router.get('/', (_req, res) => {
  const list = listCases();
  res.json(list);
});

/** GET /cases/:case_id/sessions — List sessions for case (must be before /:case_id) */
router.get('/:case_id/sessions', (req, res) => {
  const c = getCase(req.params.case_id);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  const list = getSessionsByCaseId(c.case_id);
  res.json(list);
});

/** GET /cases/:case_id — Get case */
router.get('/:case_id', (req, res) => {
  const c = getCase(req.params.case_id);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  res.json(c);
});

export default router;
