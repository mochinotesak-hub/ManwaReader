import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'reader.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS manhwa_meta (
    id TEXT PRIMARY KEY,
    title TEXT,
    is_favorite INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Reading', -- Reading, Completed, On Hold, Plan to Read
    rating INTEGER DEFAULT 0,       -- 1 to 5 stars
    notes TEXT DEFAULT '',
    last_read_chapter INTEGER DEFAULT 1,
    last_read_page INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reading_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    manhwa_id TEXT,
    chapter_number INTEGER,
    read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manhwa_id, chapter_number)
  );
`);

export default db;
