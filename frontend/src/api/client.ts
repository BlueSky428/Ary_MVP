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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
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
