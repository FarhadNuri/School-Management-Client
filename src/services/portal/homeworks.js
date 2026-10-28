import apiRequest from '../api';
import { LIVE } from './sources';
import { homeworksData as mockHomeworks } from '../../features/portal/data/homeworks';

export const getStudentHomeworks = async ({ search = '', status = 'all' } = {}) => {
  if (!LIVE.homeworks) {
    return { count: mockHomeworks.length, homeworks: mockHomeworks };
  }

  const raw = await apiRequest('/user/homeworks', {
    params: {
      search: search?.trim() || undefined,
      status: status && status !== 'all' ? status : undefined
    }
  });

  const list = Array.isArray(raw?.homeworks) ? raw.homeworks : [];
  return {
    count: raw?.count ?? list.length,
    homeworks: list
  };
};

export const getStudentHomeworkById = async (id) => {
  if (!LIVE.homeworks) {
    const found = mockHomeworks.find((h) => String(h.id) === String(id));
    return found || null;
  }
  const raw = await apiRequest(`/user/homeworks/${id}`);
  return raw?.homework || raw || null;
};
