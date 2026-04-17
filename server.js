const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const ROOT           = __dirname;
const DATA_DIR       = path.join(ROOT, 'data');
const SONGS_PATH     = path.join(DATA_DIR, 'songs.json');
const PROFILE_PATH   = path.join(DATA_DIR, 'profile.json');
const SETTINGS_PATH  = path.join(DATA_DIR, 'settings.json');
const PLAYLISTS_PATH = path.join(DATA_DIR, 'playlists.json');
const DIST_DIR       = path.join(ROOT, 'dist');
const INDEX_HTML     = path.join(ROOT, 'index.html');

app.use(express.json({ limit: '10mb' }));

// ── Helpers ───────────────────────────────────────────────────────────────────
function readJSON(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

// Preload the song catalog once at startup — it's read-only
const SONGS = readJSON(SONGS_PATH, []);
console.log(`Loaded ${SONGS.length} songs from catalog`);

// ── Songs (read-only) ─────────────────────────────────────────────────────────
app.get('/api/songs', (req, res) => {
  res.json(SONGS);
});

// ── Profile / Settings ────────────────────────────────────────────────────────
app.post('/api/profile', (req, res) => {
  try {
    writeJSON(PROFILE_PATH, req.body ?? {});
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    writeJSON(SETTINGS_PATH, req.body ?? {});
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// ── Playlists ─────────────────────────────────────────────────────────────────
app.get('/api/playlists', (req, res) => {
  try {
    res.json(readJSON(PLAYLISTS_PATH, []));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read playlists' });
  }
});

app.post('/api/playlists', (req, res) => {
  try {
    const playlists = readJSON(PLAYLISTS_PATH, []);
    const payload   = req.body || {};
    if (playlists.some(p => p.id === payload.id)) {
      return res.status(409).json({ error: 'Playlist already exists' });
    }
    const newPlaylist = {
      id:        payload.id        || `pl_${Date.now()}`,
      name:      payload.name      ?? 'New Playlist',
      createdAt: payload.createdAt || new Date().toISOString(),
      songIds:   Array.isArray(payload.songIds) ? payload.songIds : [],
    };
    playlists.push(newPlaylist);
    writeJSON(PLAYLISTS_PATH, playlists);
    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

app.put('/api/playlists/:id', (req, res) => {
  try {
    const playlists = readJSON(PLAYLISTS_PATH, []);
    const index     = playlists.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    const updated = { ...playlists[index], ...req.body, id: req.params.id };
    playlists[index] = updated;
    writeJSON(PLAYLISTS_PATH, playlists);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

app.delete('/api/playlists/:id', (req, res) => {
  try {
    const playlists = readJSON(PLAYLISTS_PATH, []);
    const filtered  = playlists.filter(p => p.id !== req.params.id);
    if (filtered.length === playlists.length) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    writeJSON(PLAYLISTS_PATH, filtered);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

// ── Vite / Static ─────────────────────────────────────────────────────────────
async function start() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      appType: 'custom',
      server: { middlewareMode: true },
    });
    app.use(vite.middlewares);
    app.use(async (req, res, next) => {
      if (req.method !== 'GET') return next();
      if (!req.headers.accept || !req.headers.accept.includes('text/html')) return next();
      if (req.path.startsWith('/api')) return next();
      try {
        let template = fs.readFileSync(INDEX_HTML, 'utf8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (error) {
        next(error);
      }
    });
  } else {
    app.use(express.static(DIST_DIR));
    app.get('*', (req, res) => {
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
