import apiRequest from '../api';

export const getMyRoutine = async (studentId) => {
  const params = {};
  if (studentId) params.studentId = studentId;
  const raw = await apiRequest('/academics/user/routine', { params });
  return raw;
};
