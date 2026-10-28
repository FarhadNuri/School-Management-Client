import { formatLessonSchedule } from '../../../../features/portal/utils/dateUtils';

export function adaptTeacherLesson(l) {
  if (!l) return null;
  const id = l.id || l._id || '';
  const classItem = l.class || {};
  const className = classItem.className || l.className || '—';
  const classId = classItem._id || classItem.id || l.classId || null;

  const courseItem = l.course || {};
  const courseId = courseItem._id || courseItem.id || l.courseId || null;
  const subject = l.subject || courseItem.courseName || '—';

  const scheduledAt = l.scheduledAt || null;
  const durationMinutes = Number(l.durationMinutes) || 60;
  const materials = Array.isArray(l.materials) ? l.materials : [];

  const now = Date.now();
  const scheduledTime = scheduledAt ? new Date(scheduledAt).getTime() : 0;
  const isPast = scheduledTime + durationMinutes * 60 * 1000 < now;

  return {
    id,
    _id: id,
    title: l.title || '—',
    subject,
    courseId,
    classId,
    className,
    scheduledAt,
    durationMinutes,
    notes: l.notes || '',
    publicNotes: l.notes || '',
    teacherNotes: l.teacherNotes || '',
    materials,
    materialsCount: materials.length,
    dateText: scheduledAt ? formatLessonSchedule(scheduledAt, durationMinutes) : '—',
    status: isPast ? 'past' : 'upcoming',
    attendance: l.attendance || null
  };
}
