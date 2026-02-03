/**
 * Load versioned question_set and mechanism_set from config.
 * Hard rule: sessions bind these versions at creation; no live-update of started sessions.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { QuestionSetConfig, MechanismSetConfig } from '../types/models.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configRoot = join(__dirname, '../../../config');

export function loadQuestionSet(): QuestionSetConfig {
  const path = join(configRoot, 'question_set.json');
  const raw = readFileSync(path, 'utf-8');
  return JSON.parse(raw) as QuestionSetConfig;
}

export function loadMechanismSet(): MechanismSetConfig {
  const path = join(configRoot, 'mechanism_set.json');
  const raw = readFileSync(path, 'utf-8');
  return JSON.parse(raw) as MechanismSetConfig;
}
