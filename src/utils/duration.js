// Parse "m:ss" or "h:mm:ss" into total seconds. Returns 0 if unparseable.
export function parseDuration(str) {
  if (!str || typeof str !== 'string') return 0;
  const parts = str.trim().split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

// Format seconds into "4m 5s" or "1h 1m 1s".
export function formatDuration(totalSeconds) {
  const s = Math.floor(totalSeconds);
  if (s <= 0) return '0m 0s';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`;
}

// Sum durations from an array of song objects and return a formatted string.
export function totalDuration(songs) {
  return formatDuration(songs.reduce((acc, s) => acc + parseDuration(s.duration), 0));
}
