/**
 * Ary V0 — API client.
 * Dev: /api (Vite proxy to backend). Production: set VITE_API_URL at build time (e.g. Vercel env).
 */

import type {
  Case,
  Session,
  AnswerEntry,
  SemanticProposal,
  ProposalDecision,
  ProposalDecisionValue,
  ArtifactOutput,
} from '../types/models';

const BASE = typeof import.meta.env.VITE_API_URL === 'string' && import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : '/api';

// #region agent log
(function () {
  const url = `${BASE}/cases`;
  const hasHttp = /^https?:\/\//i.test(BASE);
  fetch('http://127.0.0.1:7247/ingest/dc048cb9-747b-4b76-a396-d8c5c8d575f4', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'client.ts:BASE', message: 'API base and first URL', data: { BASE, fullUrl: url, hasExplicitProtocol: hasHttp, rawEnv: typeof import.meta.env.VITE_API_URL !== 'undefined' ? String(import.meta.env.VITE_API_URL).slice(0, 80) : 'undefined' }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'H1-H3' }) }).catch(() => {});
})();
// #endregion

/** Resolved API base URL (for debugging: check DevTools or UI footer). */
export function getApiBase(): string {
  return BASE;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const fullUrl = `${BASE}${path}`;
  // #region agent log
  fetch('http://127.0.0.1:7247/ingest/dc048cb9-747b-4b76-a396-d8c5c8d575f4', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'client.ts:request', message: 'fetch URL', data: { path, fullUrl }, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId: 'H1' }) }).catch(() => {});
  // #endregion
  const res = await fetch(fullUrl, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface CreateCaseBody {
  domain?: string;
  case_name_or_reference: string;
  participant_role: string;
  jurisdiction?: string;
}

export const api = {
  cases: {
    list: () => request<Case[]>(`/cases`),
    get: (caseId: string) => request<Case>(`/cases/${caseId}`),
    getSessions: (caseId: string) => request<Session[]>(`/cases/${caseId}/sessions`),
    create: (body: CreateCaseBody) =>
      request<Case>(`/cases`, { method: 'POST', body: JSON.stringify(body) }),
  },
  sessions: {
    get: (sessionId: string) => request<Session>(`/sessions/${sessionId}`),
    create: (caseId: string) =>
      request<Session>(`/sessions`, { method: 'POST', body: JSON.stringify({ case_id: caseId }) }),
  },
  entries: {
    list: (sessionId: string) => request<AnswerEntry[]>(`/sessions/${sessionId}/entries`),
    create: (sessionId: string, body: { question_id: string; text: string }) =>
      request<AnswerEntry>(`/sessions/${sessionId}/entries`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    delete: (sessionId: string, entryId: string) =>
      request<void>(`/sessions/${sessionId}/entries/${entryId}`, { method: 'DELETE' }),
  },
  proposals: {
    list: (entryId: string) => request<SemanticProposal[]>(`/entries/${entryId}/proposals`),
    create: (entryId: string) =>
      request<SemanticProposal[]>(`/entries/${entryId}/proposals`, { method: 'POST' }),
  },
  decisions: {
    create: (proposalId: string, body: { decision: ProposalDecisionValue; reason?: string }) =>
      request<ProposalDecision>(`/proposals/${proposalId}/decision`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
  artifacts: {
    create: (sessionId: string) =>
      request<ArtifactOutput>(`/artifacts`, {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId }),
      }),
    get: (artifactId: string) => request<ArtifactOutput>(`/artifacts/${artifactId}`),
  },
};
