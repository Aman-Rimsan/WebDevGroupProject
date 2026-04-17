const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const ROOT          = __dirname;
const DATA_DIR      = path.join(ROOT, 'data');
const SONGS_PATH    = path.join(DATA_DIR, 'songs.csv');
const PROFILE_PATH  = path.join(DATA_DIR, 'profile.json');
const SETTINGS_PATH = path.join(DATA_DIR, 'settings.json');
const PLAYLISTS_PATH = path.join(DATA_DIR, 'playlists.json');
const DIST_DIR      = path.join(ROOT, 'dist');
const INDEX_HTML    = path.join(ROOT, 'index.html');

app.use(express.json());

// ── Helpers ───────────────────────────────────────────────────────────────────
function readCSV() {
  const raw = fs.readFileSync(SONGS_PATH, 'utf8').trim();
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);
  const headers = lines[0].split(',');
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = line.split(',');
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

function writeCSV(songs) {
  const headers = ['id', 'title', 'artist', 'genre', 'duration', 'year', 'album'];
  const lines = [
    headers.join(','),
    ...songs.map((song) => headers.map((h) => song[h] ?? '').join(',')),
  ];
  fs.writeFileSync(SONGS_PATH, lines.join('\n'), 'utf8');
}

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

// ── Songs ─────────────────────────────────────────────────────────────────────
app.get('/api/songs', (req, res) => {
  try {
    res.json(readCSV());
  } catch (error) {
    res.status(500).json({ error: 'Failed to read songs' });
  }
});

app.post('/api/songs', (req, res) => {
  try {
    const songs = readCSV();
    const maxId = songs.reduce((max, song) => Math.max(max, Number.parseInt(song.id, 10) || 0), 0);
    const payload = req.body || {};
    const newSong = {
      id:       String(maxId + 1),
      title:    payload.title    ?? '',
      artist:   payload.artist   ?? '',
      genre:    payload.genre    ?? '',
      duration: payload.duration ?? '',
      year:     payload.year     ?? '',
      album:    payload.album    ?? '',
    };
    songs.push(newSong);
    writeCSV(songs);
    res.status(201).json(newSong);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add song' });
  }
});

app.delete('/api/songs/:id', (req, res) => {
  try {
    const songs    = readCSV();
    const filtered = songs.filter((song) => String(song.id) !== String(req.params.id));
    if (filtered.length === songs.length) {
      return res.status(404).json({ error: 'Song not found' });
    }
    writeCSV(filtered);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete song' });
  }
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
    // Reject if id already exists (idempotency guard)
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
    const updated = {
      ...playlists[index],
      ...req.body,
      id: req.params.id, // id is immutable
    };
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
