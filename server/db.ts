import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

let dbInstance: Database | null = null;
const DB_FILE_PATH = path.resolve(process.cwd(), 'database', 'student_portal.sqlite');
const SCHEMA_FILE_PATH = path.resolve(process.cwd(), 'database', 'schema.sql');
const SEEDS_FILE_PATH = path.resolve(process.cwd(), 'database', 'seeds.sql');

export async function initDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure directory exists
  const dbDir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('Could not read existing sqlite file, initializing fresh:', e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Enable foreign keys
  dbInstance.run('PRAGMA foreign_keys = ON;');

  // Check if tables already exist
  const res = dbInstance.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='students';");
  if (!res.length || res[0].values.length === 0) {
    console.log('Bootstrapping database schema & seeds...');
    if (fs.existsSync(SCHEMA_FILE_PATH)) {
      const schemaSql = fs.readFileSync(SCHEMA_FILE_PATH, 'utf-8');
      dbInstance.run(schemaSql);
    }
    if (fs.existsSync(SEEDS_FILE_PATH)) {
      const seedsSql = fs.readFileSync(SEEDS_FILE_PATH, 'utf-8');
      dbInstance.run(seedsSql);
    }
    persistDatabase();
  }

  return dbInstance;
}

export function persistDatabase() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE_PATH, buffer);
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  if (!dbInstance) throw new Error('Database not initialized');
  const stmt = dbInstance.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const rows = queryAll<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function run(sql: string, params: any[] = []): { lastInsertRowid: number; changes: number } {
  if (!dbInstance) throw new Error('Database not initialized');
  dbInstance.run(sql, params);
  const rowidRes = queryOne<{ id: number }>('SELECT last_insert_rowid() AS id;');
  const changesRes = queryOne<{ count: number }>('SELECT changes() AS count;');
  persistDatabase();
  return {
    lastInsertRowid: rowidRes?.id ?? 0,
    changes: changesRes?.count ?? 0,
  };
}

export function getDatabaseInstance(): Database {
  if (!dbInstance) throw new Error('Database not initialized');
  return dbInstance;
}

export function exportMySQLDump(): string {
  if (!fs.existsSync(SCHEMA_FILE_PATH) || !fs.existsSync(SEEDS_FILE_PATH)) {
    return '-- Schema files missing';
  }
  const schema = fs.readFileSync(SCHEMA_FILE_PATH, 'utf-8');
  const seeds = fs.readFileSync(SEEDS_FILE_PATH, 'utf-8');
  return `/* MySQL Data Export - Student Internship & Skill Tracking Portal */
SET FOREIGN_KEY_CHECKS = 0;

${schema}

${seeds}

SET FOREIGN_KEY_CHECKS = 1;
`;
}
