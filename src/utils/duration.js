/**
 * Parse a duration string like "3:45" or "1:02:30" into total seconds.
 * Returns 0 for anything unparseable.
 * @param {string} str
 * @returns {number}
 */
export function parseDuration(str) {
  if (!str || typeof str !== 'string') return 0;
  const parts = str.trim().split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];           // m:ss
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]; // h:mm:ss
  return 0;
}

/**
 * Format a total number of seconds into a human-readable string.
 * e.g. 3661 → "1h 1m 1s", 245 → "4m 5s"
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  const s = Math.floor(totalSeconds);
  if (s <= 0) return '0m 0s';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

/**
 * Sum durations from an array of song objects and return a formatted string.
 * @param {Array<{duration: string}>} songs
 * @returns {string}
 */
export function totalDuration(songs) {
  const seconds = songs.reduce((acc, s) => acc + parseDuration(s.duration), 0);
  return formatDuration(seconds);
}
