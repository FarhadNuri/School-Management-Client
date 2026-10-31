import apiRequest from '../../api';
import { LIVE_TEACHER } from '../sources';
import { adaptTeacherClass, adaptTeacherClassDetail } from './adapters/classAdapter';

export async function getTeacherClasses({ search = '', isActive } = {}) {
  if (!LIVE_TEACHER.classes) {
    return { count: 0, classes: [] };
  }

  const raw = await apiRequest('/academics/teacher/classes', {
    params: {
      search: search?.trim() || undefined,
      isActive: typeof isActive === 'boolean' ? isActive : undefined
    }
  });

  const list = Array.isArray(raw?.classes) ? raw.classes.map(adaptTeacherClass) : [];
  return {
    count: raw?.count ?? list.length,
    classes: list
  };
}

export async function getTeacherClass(id) {
  if (!LIVE_TEACHER.classes) return null;
  const raw = await apiRequest(`/academics/teacher/classes/${id}`);
  return adaptTeacherClassDetail(raw?.class || raw);
}

export async function getTeacherCourses() {
  const raw = await apiRequest('/academics/teacher/courses');
  const list = Array.isArray(raw?.courses) ? raw.courses : [];
  return {
    count: raw?.count ?? list.length,
    courses: list.map((c) => ({
      id: c._id || c.id,
      _id: c._id || c.id,
      courseName: c.courseName || '',
      courseCode: c.courseCode || '',
      courseType: c.courseType || 'Core',
      courseClass: c.courseClass
    }))
  };
}
