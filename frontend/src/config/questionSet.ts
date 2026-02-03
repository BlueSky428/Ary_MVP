/**
 * Load question set from config. No hardcoding — same structure as backend.
 * V0: served from public/config (copy of repo config) or from API later.
 */

import type { QuestionSetConfig } from '../types/models';

let cached: QuestionSetConfig | null = null;

export async function loadQuestionSet(): Promise<QuestionSetConfig> {
  if (cached) return cached;
  const res = await fetch('/config/question_set.json');
  if (!res.ok) throw new Error('Failed to load question set');
  cached = (await res.json()) as QuestionSetConfig;
  return cached;
}
