import { formatDate, formatTime } from '../../../../features/portal/utils/dateUtils';

function resolvePhoto(photo) {
  if (!photo) return '';
  if (typeof photo === 'string') return photo;
  if (typeof photo === 'object' && photo.url) return photo.url;
  return '';
}

export function adaptAttendanceLesson(l) {
  if (!l) return null;
  const id = l.id || l._id || '';
  const classItem = l.class || {};
  const className = classItem.className || l.className || '—';
  const classId = classItem._id || classItem.id || l.classId || null;

  const scheduledAt = l.scheduledAt || null;
  const att = l.attendance || {};

  const rosterSize = Number(att.rosterSize) || 0;
  const markedCount = Number(att.markedCount) || 0;
  const present = Number(att.present) || 0;
  const absent = Number(att.absent) || 0;
  const late = Number(att.late) || 0;
  const excused = Number(att.excused) || 0;
  const attended = Number(att.attended) || (present + late);
  const attendanceRate = Number(att.attendanceRate) || (rosterSize > 0 ? (attended / rosterSize) * 100 : 0);
  const isComplete = Boolean(att.isComplete) || (rosterSize > 0 && markedCount === rosterSize);

  return {
    id,
    _id: id,
    title: l.title || '—',
    subject: l.subject || '—',
    classId,
    className,
    scheduledAt,
    dateText: scheduledAt ? `${formatDate(scheduledAt)} · ${formatTime(scheduledAt)}` : '—',
    rosterSize,
    markedCount,
    unmarkedCount: Math.max(0, rosterSize - markedCount),
    present,
    absent,
    late,
    excused,
    attended,
    attendanceRate: Math.round(attendanceRate),
    isComplete
  };
}

export function adaptRosterItem(item) {
  const studentId = item.studentId || item.student?._id || item.student?.id || '';
  const name = item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || '—';
  const photo = resolvePhoto(item.photo);
  const status = item.status ? String(item.status).toLowerCase() : null;

  return {
    studentId,
    name,
    photo,
    status, // 'present' | 'absent' | 'late' | 'excused' | null
    note: item.note || '',
    markedAt: item.markedAt || null
  };
}
