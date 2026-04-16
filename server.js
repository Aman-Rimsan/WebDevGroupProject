const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const SONGS_PATH = path.join(DATA_DIR, 'songs.csv');
const PROFILE_PATH = path.join(DATA_DIR, 'profile.json');
const SETTINGS_PATH = path.join(DATA_DIR, 'settings.json');
const DIST_DIR = path.join(ROOT, 'dist');
const INDEX_HTML = path.join(ROOT, 'index.html');

app.use(express.json());

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
  const lines = [headers.join(','), ...songs.map((song) => headers.map((header) => song[header] ?? '').join(','))];
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
      id: String(maxId + 1),
      title: payload.title ?? '',
      artist: payload.artist ?? '',
      genre: payload.genre ?? '',
      duration: payload.duration ?? '',
      year: payload.year ?? '',
      album: payload.album ?? '',
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
    const songs = readCSV();
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
