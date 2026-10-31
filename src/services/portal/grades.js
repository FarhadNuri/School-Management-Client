import apiRequest from '../api';

export const getStudentGrades = async () => {
  const raw = await apiRequest('/grading/user/grades');
  return raw;
};
