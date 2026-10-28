import apiRequest from '../api';
import { LIVE } from './sources';
import { lessonsData as mockLessons } from '../../features/portal/data/lessons';

export const getStudentMaterials = async ({ search = '', courseId = '' } = {}) => {
  if (!LIVE.lessons) {
    return { count: mockLessons.length, lessons: mockLessons, materials: mockLessons };
  }

  const raw = await apiRequest('/user/lessons', {
    params: {
      search: search?.trim() || undefined,
      courseId: courseId && courseId !== 'all' ? courseId : undefined
    }
  });

  const list = Array.isArray(raw?.lessons) ? raw.lessons : [];
  return {
    count: raw?.count ?? list.length,
    lessons: list,
    materials: list
  };
};

export const getStudentMaterialById = async (id) => {
  if (!LIVE.lessons) {
    const found = mockLessons.find((l) => String(l.id) === String(id));
    return found || null;
  }
  const raw = await apiRequest(`/user/lessons/${id}`);
  return raw?.lesson || raw || null;
};
