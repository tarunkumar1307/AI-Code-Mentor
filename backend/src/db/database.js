const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'codementor.db');

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function initializeDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      language TEXT NOT NULL,
      readability_score REAL DEFAULT 0,
      maintainability_score REAL DEFAULT 0,
      overall_score REAL DEFAULT 0,
      issues TEXT DEFAULT '[]',
      suggestions TEXT DEFAULT '[]',
      explanation TEXT DEFAULT '',
      concepts TEXT DEFAULT '[]',
      ai_feedback TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database initialized');
}

module.exports = { getDb, initializeDatabase };
