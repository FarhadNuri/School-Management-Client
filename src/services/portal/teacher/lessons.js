import apiRequest from '../../api';
import { LIVE_TEACHER } from '../sources';
import { adaptTeacherLesson } from './adapters/lessonAdapter';

export async function getTeacherLessons({
  classId,
  courseId,
  startDate,
  endDate,
  search = ''
} = {}) {
  if (!LIVE_TEACHER.lessons) {
    return { count: 0, lessons: [] };
  }

  const raw = await apiRequest('/academics/teacher/lessons', {
    params: {
      classId: classId && classId !== 'all' ? classId : undefined,
      courseId: courseId && courseId !== 'all' ? courseId : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: search?.trim() || undefined
    }
  });

  const list = Array.isArray(raw?.lessons) ? raw.lessons.map(adaptTeacherLesson) : [];
  return {
    count: raw?.count ?? list.length,
    lessons: list
  };
}

export async function getTeacherLesson(id) {
  if (!LIVE_TEACHER.lessons) return null;
  const raw = await apiRequest(`/academics/teacher/lessons/${id}`);
  return adaptTeacherLesson(raw?.lesson || raw);
}

export async function createLesson(formDataOrData) {
  if (!LIVE_TEACHER.lessons) return { success: true };

  const raw = await apiRequest('/academics/teacher/materials', {
    method: 'POST',
    body: formDataOrData
  });
  return adaptTeacherLesson(raw?.lesson || raw);
}

export async function updateLesson(id, formDataOrData) {
  if (!LIVE_TEACHER.lessons) return { success: true };

  const raw = await apiRequest(`/academics/teacher/materials/${id}`, {
    method: 'PATCH',
    body: formDataOrData
  });
  return adaptTeacherLesson(raw?.lesson || raw);
}

export async function deleteLesson(id) {
  if (!LIVE_TEACHER.lessons) return { success: true };
  const raw = await apiRequest(`/academics/teacher/materials/${id}`, {
    method: 'DELETE'
  });
  return raw;
}
