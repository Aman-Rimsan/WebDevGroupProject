export async function fetchSongs() {
  const response = await fetch('/api/songs');
  if (!response.ok) {
    throw new Error('Failed to load songs');
  }
  return response.json();
}

export async function addSong(song) {
  const response = await fetch('/api/songs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(song),
  });

  if (!response.ok) {
    throw new Error('Failed to add song');
  }

  return response.json();
}

export async function deleteSong(id) {
  const response = await fetch(`/api/songs/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to remove song');
  }
}

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export async function postJSON(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Request failed for ${url}`);
  }
}
