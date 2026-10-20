import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const LIBRARY_DIR = path.resolve(__dirname, 'library');

app.use(cors());
app.use(express.json());

const isImage = (file) => /\.(jpe?g|png|webp|gif|bmp)$/i.test(file);

// Get all manhwas joined with SQLite metadata
app.get('/api/manhwas', (req, res) => {
  try {
    if (!fs.existsSync(LIBRARY_DIR)) {
      return res.json([]);
    }
    const entries = fs.readdirSync(LIBRARY_DIR, { withFileTypes: true });
    const manhwas = [];

    // Prepared statement for metadata
    const getMetaStmt = db.prepare('SELECT * FROM manhwa_meta WHERE id = ?');
    const getHistoryStmt = db.prepare('SELECT chapter_number FROM reading_history WHERE manhwa_id = ?');

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dirName = entry.name;
        const manhwaPath = path.join(LIBRARY_DIR, dirName);
        const subEntries = fs.readdirSync(manhwaPath, { withFileTypes: true });
        
        const chapterDirs = subEntries
          .filter(e => e.isDirectory() && e.name.toLowerCase().startsWith('chapter-'))
          .map(e => {
            const match = e.name.match(/chapter-(\d+)/i);
            return {
              folder: e.name,
              number: match ? parseInt(match[1], 10) : 0
            };
          })
          .sort((a, b) => a.number - b.number);

        if (chapterDirs.length > 0) {
          let coverImage = null;
          const firstChapter = chapterDirs[0];
          const firstChPath = path.join(manhwaPath, firstChapter.folder);
          const images = fs.readdirSync(firstChPath).filter(isImage).sort();
          if (images.length > 0) {
            coverImage = `/api/image/${encodeURIComponent(dirName)}/${encodeURIComponent(firstChapter.folder)}/${encodeURIComponent(images[0])}`;
          }

          // Fetch SQLite metadata
          let meta = getMetaStmt.get(dirName);
          if (!meta) {
            meta = {
              id: dirName,
              title: dirName.replace(/[-_]/g, ' '),
              is_favorite: 0,
              status: 'Reading',
              rating: 0,
              notes: '',
              last_read_chapter: chapterDirs[0].number,
              last_read_page: 0
            };
            db.prepare(`
              INSERT INTO manhwa_meta (id, title, is_favorite, status, rating, notes, last_read_chapter)
              VALUES (@id, @title, @is_favorite, @status, @rating, @notes, @last_read_chapter)
            `).run(meta);
          }

          const readChapters = getHistoryStmt.all(dirName).map(r => r.chapter_number);

          manhwas.push({
            id: dirName,
            title: dirName.replace(/[-_]/g, ' '),
            totalChapters: chapterDirs.length,
            coverImage,
            firstChapter: chapterDirs[0].number,
            lastChapter: chapterDirs[chapterDirs.length - 1].number,
            isFavorite: Boolean(meta.is_favorite),
            status: meta.status || 'Reading',
            rating: meta.rating || 0,
            notes: meta.notes || '',
            lastReadChapter: meta.last_read_chapter || chapterDirs[0].number,
            readCount: readChapters.length,
            readChapters
          });
        }
      }
    }

    res.json(manhwas);
  } catch (err) {
    console.error('Failed to list manhwas:', err);
    res.status(500).json({ error: 'Failed to list manhwas' });
  }
});

// Update metadata (favorite, status, rating, notes)
app.post('/api/manhwa/:id/meta', (req, res) => {
  try {
    const manhwaId = req.params.id;
    const { isFavorite, status, rating, notes } = req.body;

    const current = db.prepare('SELECT * FROM manhwa_meta WHERE id = ?').get(manhwaId);
    if (!current) {
      db.prepare(`
        INSERT INTO manhwa_meta (id, title, is_favorite, status, rating, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        manhwaId,
        manhwaId.replace(/[-_]/g, ' '),
        isFavorite ? 1 : 0,
        status || 'Reading',
        rating || 0,
        notes || ''
      );
    } else {
      db.prepare(`
        UPDATE manhwa_meta
        SET is_favorite = COALESCE(?, is_favorite),
            status = COALESCE(?, status),
            rating = COALESCE(?, rating),
            notes = COALESCE(?, notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        isFavorite !== undefined ? (isFavorite ? 1 : 0) : null,
        status !== undefined ? status : null,
        rating !== undefined ? rating : null,
        notes !== undefined ? notes : null,
        manhwaId
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update meta:', err);
    res.status(500).json({ error: 'Failed to update metadata' });
  }
});

// Record chapter reading progress in SQLite
app.post('/api/manhwa/:id/progress', (req, res) => {
  try {
    const manhwaId = req.params.id;
    const { chapterNumber, page } = req.body;

    db.prepare(`
      INSERT INTO manhwa_meta (id, title, last_read_chapter, last_read_page, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        last_read_chapter = excluded.last_read_chapter,
        last_read_page = excluded.last_read_page,
        updated_at = CURRENT_TIMESTAMP
    `).run(manhwaId, manhwaId.replace(/[-_]/g, ' '), chapterNumber, page || 0);

    // Record in history table
    db.prepare(`
      INSERT OR IGNORE INTO reading_history (manhwa_id, chapter_number, read_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(manhwaId, chapterNumber);

    res.json({ success: true });
  } catch (err) {
    console.error('Failed to record progress:', err);
    res.status(500).json({ error: 'Failed to record progress' });
  }
});

// Get manhwa details with chapters
app.get('/api/manhwa/:id', (req, res) => {
  try {
    const manhwaId = req.params.id;
    const manhwaPath = path.join(LIBRARY_DIR, manhwaId);

    if (!fs.existsSync(manhwaPath)) {
      return res.status(404).json({ error: 'Manhwa not found' });
    }

    const subEntries = fs.readdirSync(manhwaPath, { withFileTypes: true });
    const chapters = [];

    for (const entry of subEntries) {
      if (entry.isDirectory() && entry.name.toLowerCase().startsWith('chapter-')) {
        const match = entry.name.match(/chapter-(\d+)/i);
        const chapterNum = match ? parseInt(match[1], 10) : 0;
        const chapterPath = path.join(manhwaPath, entry.name);
        const images = fs.readdirSync(chapterPath).filter(isImage).sort((a, b) => {
          return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });

        chapters.push({
          number: chapterNum,
          folder: entry.name,
          imageCount: images.length,
          images: images.map(img => `/api/image/${encodeURIComponent(manhwaId)}/${encodeURIComponent(entry.name)}/${encodeURIComponent(img)}`)
        });
      }
    }

    chapters.sort((a, b) => a.number - b.number);

    const meta = db.prepare('SELECT * FROM manhwa_meta WHERE id = ?').get(manhwaId) || {};
    const readChapters = db.prepare('SELECT chapter_number FROM reading_history WHERE manhwa_id = ?').all(manhwaId).map(r => r.chapter_number);

    res.json({
      id: manhwaId,
      title: manhwaId.replace(/[-_]/g, ' '),
      chapters,
      meta: {
        isFavorite: Boolean(meta.is_favorite),
        status: meta.status || 'Reading',
        rating: meta.rating || 0,
        notes: meta.notes || '',
        lastReadChapter: meta.last_read_chapter || chapters[0]?.number || 1,
        readChapters
      }
    });
  } catch (err) {
    console.error('Failed to get manhwa details:', err);
    res.status(500).json({ error: 'Failed to get manhwa details' });
  }
});

// Serve image files safely
app.get('/api/image/:manhwa/:chapter/:filename', (req, res) => {
  try {
    const { manhwa, chapter, filename } = req.params;
    const safePath = path.join(LIBRARY_DIR, manhwa, chapter, filename);

    if (!safePath.startsWith(LIBRARY_DIR)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(safePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.sendFile(safePath);
  } catch (err) {
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

app.listen(PORT, () => {
  console.log(`ManwaReader API server running on http://localhost:${PORT}`);
});
