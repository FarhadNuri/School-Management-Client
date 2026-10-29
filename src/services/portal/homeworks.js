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

  const list = Array.isArray(raw?.homeworks)
    ? raw.homeworks
    : Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw)
    ? raw
    : [];
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

export const submitHomework = async (id, data) => {
  return await apiRequest('/user/homeworks/' + id + '/submit', {
    method: 'POST',
    body: data
  });
};

export const getHomeworkSubmissions = async (id, role = 'student') => {
  const endpoint = role === 'teacher' ? ('/teacher/homeworks/' + id + '/submissions') : ('/user/homeworks/' + id + '/submissions');
  return await apiRequest(endpoint);
};
