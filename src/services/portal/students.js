import apiRequest from '../api';
import { LIVE } from './sources';
import { adaptStudentsList, adaptStudent } from './adapters/studentAdapter';
import { studentsData as mockStudents } from '../../features/portal/data/students';

export const getMyStudents = async (search = '') => {
  if (!LIVE.students) {
    const q = (search || '').toLowerCase().trim();
    const filtered = mockStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.course && s.course.toLowerCase().includes(q)) ||
        (s.campus && s.campus.toLowerCase().includes(q))
    );
    return adaptStudentsList({ count: filtered.length, students: filtered });
  }

  const raw = await apiRequest('/academics/user/students', {
    params: { search: search?.trim() || undefined }
  });

  return adaptStudentsList(raw);
};

export const getStudentById = async (id) => {
  if (!LIVE.students) {
    const match = mockStudents.find((s) => s.id === id) || mockStudents[0];
    return adaptStudent(match);
  }

  const raw = await apiRequest(`/academics/user/students/${id}`);
  return adaptStudent(raw?.student || raw);
};
