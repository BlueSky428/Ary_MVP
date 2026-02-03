/**
 * SQLite client. Uses DATABASE_PATH env or default ./data/ary.sqlite.
 * Ensures data directory exists and runs schema on first open.
 */

import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCHEMA } from './schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const defaultPath = join(__dirname, '..', '..', 'data', 'ary.sqlite');
const dbPath = process.env.DATABASE_PATH ?? defaultPath;

function ensureDir(path: string) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function openDb(): Database.Database {
  ensureDir(dbPath);
  const db = new Database(dbPath);
  db.exec(SCHEMA);
  return db;
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) db = openDb();
  return db;
}
