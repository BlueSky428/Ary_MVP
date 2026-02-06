/**
 * Ary V0 — Backend API
 * Protocol runner: fixed questions, verbatim capture, immutable artifacts.
 * AI proposes. Rules decide. (In V0, humans perform the decide step.)
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getDb } from './db/client.js';
import casesRouter from './routes/cases.js';
import sessionsRouter from './routes/sessions.js';
import entriesRouter from './routes/entries.js';
import proposalsRouter from './routes/proposals.js';
import decisionsRouter from './routes/decisions.js';
import artifactsRouter from './routes/artifacts.js';

// Initialize SQLite (creates file + schema if needed)
getDb();

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : undefined;

const app = express();
app.use(cors(corsOrigins ? { origin: corsOrigins } : {}));
app.use(express.json());

app.use('/cases', casesRouter);
app.use('/sessions', sessionsRouter);
app.use('/sessions/:session_id/entries', entriesRouter);
app.use('/entries/:entry_id/proposals', proposalsRouter);
app.use('/proposals/:proposal_id/decision', decisionsRouter);
app.use('/artifacts', artifactsRouter);

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Ary V0 API listening on http://localhost:${PORT}`);
});
