import $ from 'jquery';

// ── Songs (read-only) ─────────────────────────────────────────────────────────
export function fetchSongs() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/api/songs',
      method: 'GET',
      dataType: 'json',
      success: data => resolve(data),
      error: (xhr, status, err) => reject(new Error(err || 'Failed to load songs')),
    });
  });
}

// ── Generic JSON POST (profile, settings) ────────────────────────────────────
export function postJSON(url, payload) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      success: () => resolve(),
      error: xhr => {
        if (xhr.status === 204) return resolve();
        reject(new Error(`Request failed for ${url}`));
      },
    });
  });
}

// ── Playlists ─────────────────────────────────────────────────────────────────
export function fetchPlaylists() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/api/playlists',
      method: 'GET',
      dataType: 'json',
      success: data => resolve(data),
      error: (xhr, status, err) => reject(new Error(err || 'Failed to load playlists')),
    });
  });
}

export function apiCreatePlaylist(playlist) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/api/playlists',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(playlist),
      dataType: 'json',
      success: data => resolve(data),
      error: (xhr, status, err) => reject(new Error(err || 'Failed to create playlist')),
    });
  });
}

export function apiUpdatePlaylist(id, playlist) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `/api/playlists/${encodeURIComponent(id)}`,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(playlist),
      dataType: 'json',
      success: data => resolve(data),
      error: (xhr, status, err) => reject(new Error(err || 'Failed to update playlist')),
    });
  });
}

export function apiDeletePlaylist(id) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `/api/playlists/${encodeURIComponent(id)}`,
      method: 'DELETE',
      success: () => resolve(),
      error: xhr => {
        if (xhr.status === 204 || xhr.status === 404) return resolve();
        reject(new Error('Failed to delete playlist'));
      },
    });
  });
}

// ── localStorage helpers ──────────────────────────────────────────────────────
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
