import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getSession, getEntry, createEntry, deleteEntry, getEntriesBySessionId } from '../store/index.js';
import type { AnswerEntry } from '../types/models.js';

const router = Router({ mergeParams: true });

/** POST /sessions/:session_id/entries — Add entry (only when session is draft) */
router.post('/', (req, res) => {
  const session_id = (req.params as { session_id: string }).session_id;
  const session = getSession(session_id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.status !== 'draft') return res.status(403).json({ error: 'Cannot add entries after finalize' });

  const { question_id, text } = req.body ?? {};
  if (!question_id || typeof text !== 'string') return res.status(400).json({ error: 'question_id and text required' });

  const entry_id = uuidv4();
  const now = new Date().toISOString();
  const entry: AnswerEntry = { entry_id, session_id, question_id, text: text.trim(), created_at: now };
  createEntry(entry);
  res.status(201).json(entry);
});

/** GET /sessions/:session_id/entries — List entries for session */
router.get('/', (req, res) => {
  const list = getEntriesBySessionId((req.params as { session_id: string }).session_id);
  res.json(list);
});

/** DELETE /sessions/:session_id/entries/:entry_id — Remove entry (draft only) */
router.delete('/:entry_id', (req, res) => {
  const session_id = (req.params as { session_id: string }).session_id;
  const entry_id = (req.params as { entry_id: string }).entry_id;
  const session = getSession(session_id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.status !== 'draft') return res.status(403).json({ error: 'Cannot delete entries after finalize' });
  const entry = getEntry(entry_id);
  if (!entry || entry.session_id !== session_id) return res.status(404).json({ error: 'Entry not found' });
  deleteEntry(entry_id);
  res.status(204).send();
});

export default router;
