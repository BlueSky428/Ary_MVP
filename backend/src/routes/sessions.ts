import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getCase, createSession, getSession } from '../store/index.js';
import { loadQuestionSet, loadMechanismSet } from '../config/loadConfig.js';
import type { Session } from '../types/models.js';

const router = Router();

/** POST /sessions — Create session; bind current question_set and mechanism_set versions */
router.post('/', (req, res) => {
  const { case_id } = req.body ?? {};
  if (!case_id) return res.status(400).json({ error: 'case_id is required' });
  if (!getCase(case_id)) return res.status(404).json({ error: 'Case not found' });

  const qs = loadQuestionSet();
  const ms = loadMechanismSet();
  const session_id = uuidv4();
  const now = new Date().toISOString();
  const created_by = (req as { userId?: string }).userId ?? 'system';

  const session: Session = {
    session_id,
    case_id,
    question_set_id: qs.question_set_id,
    question_set_version: qs.version,
    mechanism_set_id: ms.mechanism_set_id,
    mechanism_set_version: ms.version,
    status: 'draft',
    created_by,
    created_at: now,
  };
  createSession(session);
  res.status(201).json(session);
});

/** GET /sessions/:session_id — Get session */
router.get('/:session_id', (req, res) => {
  const s = getSession(req.params.session_id);
  if (!s) return res.status(404).json({ error: 'Session not found' });
  res.json(s);
});

export default router;
