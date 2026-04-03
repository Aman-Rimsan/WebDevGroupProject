// WHEN THIS IS PULLED: if "node_modules" is filled with express modules, ignore the comments below

// to run you may need to get some node.js extension when you have node.js already installed on your pc
// when you have node.js installed from here: https://nodejs.org, install express if it doesnt already
// you can install express from this servers terminal by doing: npm install
// after that you run this in the terminal: node server.js
// if done properlly youll see something like this: Server running on http://localhost:3000
// visit the link and you should be good to go


const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const CSV_PATH = path.join(__dirname, 'data', 'songs.csv');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readCSV() {
  const lines = fs.readFileSync(CSV_PATH, 'utf8').trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  });
}

function writeCSV(songs) {
  const headers = ['id', 'title', 'artist', 'genre', 'duration', 'year', 'album'];
  const lines = [headers.join(','), ...songs.map(s => headers.map(h => s[h] ?? '').join(','))];
  fs.writeFileSync(CSV_PATH, lines.join('\n'), 'utf8');
}

app.get('/api/songs', (req, res) => {
  try {
    res.json(readCSV());
  } catch (err) {
    res.status(500).json({ error: 'Failed to read songs' });
  }
});

app.post('/api/songs', (req, res) => {
  try {
    const songs = readCSV();
    const maxId = songs.reduce((max, s) => Math.max(max, parseInt(s.id) || 0), 0);
    const newSong = { id: String(maxId + 1), album: '', ...req.body };
    songs.push(newSong);
    writeCSV(songs);
    res.status(201).json(newSong);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add song' });
  }
});

app.delete('/api/songs/:id', (req, res) => {
  try {
    const songs = readCSV();
    const filtered = songs.filter(s => s.id !== req.params.id);
    if (filtered.length === songs.length) return res.status(404).json({ error: 'Song not found' });
    writeCSV(filtered);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));