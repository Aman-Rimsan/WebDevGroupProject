import $ from 'jquery';

/**
 * Fetch all songs from the server using jQuery AJAX.
 * @returns {Promise<Array>}
 */
export function fetchSongs() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/api/songs',
      method: 'GET',
      dataType: 'json',
      success: (data) => resolve(data),
      error: (xhr, status, err) => reject(new Error(err || 'Failed to load songs')),
    });
  });
}

/**
 * Add a new song via jQuery AJAX POST.
 * @param {Object} song
 * @returns {Promise<Object>}
 */
export function addSong(song) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/api/songs',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(song),
      dataType: 'json',
      success: (data) => resolve(data),
      error: (xhr, status, err) => reject(new Error(err || 'Failed to add song')),
    });
  });
}

/**
 * Delete a song by ID via jQuery AJAX DELETE.
 * @param {string} id
 * @returns {Promise<void>}
 */
export function deleteSong(id) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `/api/songs/${encodeURIComponent(id)}`,
      method: 'DELETE',
      success: () => resolve(),
      error: (xhr) => {
        if (xhr.status === 204 || xhr.status === 404) return resolve();
        reject(new Error('Failed to remove song'));
      },
    });
  });
}

/**
 * POST JSON payload to a URL via jQuery AJAX.
 * @param {string} url
 * @param {Object} payload
 * @returns {Promise<void>}
 */
export function postJSON(url, payload) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      success: () => resolve(),
      error: (xhr) => {
        if (xhr.status === 204) return resolve();
        reject(new Error(`Request failed for ${url}`));
      },
    });
  });
}

/**
 * Load a value from localStorage, returning a fallback if missing or unparseable.
 */
export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Save a value to localStorage as JSON.
 */
export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
