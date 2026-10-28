import apiRequest from '../api';

export const getStudentGrades = async () => {
  const raw = await apiRequest('/user/grades');
  return raw;
};
