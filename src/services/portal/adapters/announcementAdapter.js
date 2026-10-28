import { formatDate } from './studentAdapter';

const capitalize = (str) => {
  if (!str) return '—';
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
};

export const adaptAnnouncement = (raw) => {
  if (!raw) return null;

  const id = String(raw.id || raw._id || '');
  const title = raw.title || 'Notice';
  const description = raw.description || '';

  // category: array, use first
  const rawCat = Array.isArray(raw.category) ? raw.category[0] : raw.category;
  const category = rawCat ? capitalize(rawCat) : 'General';

  // severity: array, use first
  const rawSev = Array.isArray(raw.severity) ? raw.severity[0] : raw.severity;
  const severity = rawSev ? capitalize(rawSev) : 'Medium';

  // targetAudience: array, show joined
  const audiences = Array.isArray(raw.targetAudience) ? raw.targetAudience : [raw.targetAudience].filter(Boolean);
  const targetAudience = audiences.length ? audiences.map(capitalize).join(', ') : 'All';

  // Date formatting for tile & "Posted 7 Aug 2026"
  const createdDate = raw.createdAt ? new Date(raw.createdAt) : new Date();
  const dateFormatted = formatDate(raw.createdAt);
  const monthName = !isNaN(createdDate.getTime())
    ? createdDate.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
    : 'AUG';
  const dayNum = !isNaN(createdDate.getTime()) ? String(createdDate.getDate()).padStart(2, '0') : '01';

  const attachments = Array.isArray(raw.attachments) ? raw.attachments : [];
  const createdBy = raw.createdBy ? String(raw.createdBy) : null;

  return {
    id,
    _id: id,
    title,
    description,
    category,
    rawCategory: rawCat ? String(rawCat).toLowerCase() : 'general',
    severity,
    rawSeverity: rawSev ? String(rawSev).toLowerCase() : 'medium',
    targetAudience,
    rawAudience: Array.isArray(raw.targetAudience) ? raw.targetAudience : (raw.targetAudience ? [raw.targetAudience] : ['all']),
    attachments,
    createdBy,
    createdAt: raw.createdAt,
    dateFormatted: `Posted ${dateFormatted}`,
    dateTile: {
      month: monthName,
      day: dayNum
    }
  };
};

export const adaptAnnouncementsList = (data) => {
  const list = Array.isArray(data) ? data : data?.announcements || [];
  const count = typeof data?.count === 'number' ? data.count : list.length;
  return {
    count,
    announcements: list.map(adaptAnnouncement).filter(Boolean)
  };
};
