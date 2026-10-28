import { formatDate } from '../../../../features/portal/utils/dateUtils';

export function adaptTeacherHomework(h) {
  if (!h) return null;
  const id = h.id || h._id || '';
  const classItem = h.class || {};
  const className = classItem.className || h.className || '—';
  const classId = classItem._id || classItem.id || h.classId || null;

  const courseItem = h.course || {};
  const courseId = courseItem._id || courseItem.id || h.courseId || null;
  const subject = h.subject || courseItem.courseName || '—';

  const dueDate = h.dueDate || null;
  const materials = Array.isArray(h.materials) ? h.materials : [];

  return {
    id,
    _id: id,
    title: h.title || '—',
    subject,
    courseId,
    classId,
    className,
    dueDate,
    dueDateText: dueDate ? formatDate(dueDate) : '—',
    instructions: h.instructions || h.description || '',
    materials,
    materialsCount: materials.length
  };
}
