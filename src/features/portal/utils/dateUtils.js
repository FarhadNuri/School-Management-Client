/**
 * Date helper utilities for teacher and portal pages.
 * All formatting uses the browser's local time.
 */

/**
 * Combines date ('YYYY-MM-DD') and time ('HH:mm') into an ISO string in local time.
 * @param {string} date - 'YYYY-MM-DD'
 * @param {string} time - 'HH:mm'
 * @returns {string} ISO 8601 string
 */
export function toISO(date, time) {
  if (!date) return '';
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = (time || '00:00').split(':').map(Number);
  const d = new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0);
  return d.toISOString();
}

/**
 * Formats a Date or date string to "Mon 10 Aug"
 * @param {Date|string|number} date
 * @returns {string} e.g. "Mon 10 Aug"
 */
export function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

/**
 * Formats a Date or date string or "HH:mm" time string to "09:00" or local 24h format
 * @param {Date|string} dateOrTime
 * @returns {string} e.g. "09:00"
 */
export function formatTime(dateOrTime) {
  if (!dateOrTime) return '—';
  if (typeof dateOrTime === 'string' && /^\d{2}:\d{2}$/.test(dateOrTime.trim())) {
    return dateOrTime.trim();
  }
  const d = new Date(dateOrTime);
  if (Number.isNaN(d.getTime())) return '—';

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Returns ISO strings for the start and end of the current local day.
 * @returns {{ startISO: string, endISO: string }}
 */
export function getTodayLocalRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return {
    startISO: start.toISOString(),
    endISO: end.toISOString()
  };
}

/**
 * Returns today's date in 'YYYY-MM-DD' local format for <input type="date">
 * @param {Date} [d=new Date()]
 * @returns {string} 'YYYY-MM-DD'
 */
export function getTodayDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a future date in 'YYYY-MM-DD' local format
 * @param {number} days
 * @returns {string} 'YYYY-MM-DD'
 */
export function getFutureDateString(days = 14) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return getTodayDateString(d);
}

/**
 * Formats full schedule text for a lesson, e.g. "Mon 10 Aug · 09:00 · 60 min"
 * @param {Date|string} scheduledAt
 * @param {number} durationMinutes
 * @returns {string}
 */
export function formatLessonSchedule(scheduledAt, durationMinutes = 60) {
  if (!scheduledAt) return '—';
  const dateStr = formatDate(scheduledAt);
  const timeStr = formatTime(scheduledAt);
  return `${dateStr} · ${timeStr} · ${durationMinutes} min`;
}
