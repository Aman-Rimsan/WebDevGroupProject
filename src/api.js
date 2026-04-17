import $ from 'jquery';

// Wrap jQuery $.ajax in a Promise. Used by all API functions below.
function ajax(options) {
  return new Promise((resolve, reject) => {
    $.ajax({
      ...options,
      success: data => resolve(data),
      error: (xhr, status, err) => {
        if (options.allowStatus?.includes(xhr.status)) return resolve();
        reject(new Error(err || options.errorMsg || 'Request failed'));
      },
    });
  });
}

export function fetchSongs() {
  return ajax({ url: '/api/songs', method: 'GET', dataType: 'json', errorMsg: 'Failed to load songs' });
}

export function postJSON(url, payload) {
  return ajax({
    url,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(payload),
    allowStatus: [204],
    errorMsg: `Request failed for ${url}`,
  });
}

export function fetchPlaylists() {
  return ajax({ url: '/api/playlists', method: 'GET', dataType: 'json', errorMsg: 'Failed to load playlists' });
}

export function apiCreatePlaylist(playlist) {
  return ajax({
    url: '/api/playlists',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(playlist),
    dataType: 'json',
    errorMsg: 'Failed to create playlist',
  });
}

export function apiUpdatePlaylist(id, playlist) {
  return ajax({
    url: `/api/playlists/${encodeURIComponent(id)}`,
    method: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify(playlist),
    dataType: 'json',
    errorMsg: 'Failed to update playlist',
  });
}

export function apiDeletePlaylist(id) {
  return ajax({
    url: `/api/playlists/${encodeURIComponent(id)}`,
    method: 'DELETE',
    allowStatus: [204, 404],
    errorMsg: 'Failed to delete playlist',
  });
}

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
