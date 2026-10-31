import apiRequest from '../api';
import { LIVE } from './sources';

export const getMyCourses = async ({ classId = '', studentId = '' } = {}) => {
  const params = {};
  if (classId) params.classId = classId;
  if (studentId) params.studentId = studentId;

  const raw = await apiRequest('/academics/user/courses', { params });
  return {
    count: raw?.count ?? (raw?.courses?.length || 0),
    courses: Array.isArray(raw?.courses) ? raw.courses : [],
    wards: Array.isArray(raw?.wards) ? raw.wards : []
  };
};

export const getMyCourseById = async (id) => {
  const raw = await apiRequest(`/academics/user/courses/${id}`);
  return raw?.course || raw;
};
