import apiRequest from '../../api';
import { LIVE_TEACHER } from '../sources';
import { adaptTeacherGuardian } from './adapters/guardianAdapter';

export async function getTeacherGuardians({ search = '', isActive } = {}) {
  if (!LIVE_TEACHER.guardians) {
    return { count: 0, guardians: [] };
  }

  const raw = await apiRequest('/teacher/guardians', {
    params: {
      search: search?.trim() || undefined,
      isActive: typeof isActive === 'boolean' ? isActive : undefined
    }
  });

  const list = Array.isArray(raw?.guardians) ? raw.guardians.map(adaptTeacherGuardian) : [];
  return {
    count: raw?.count ?? list.length,
    guardians: list
  };
}

export async function getTeacherGuardian(id) {
  if (!LIVE_TEACHER.guardians) return null;
  const raw = await apiRequest(`/teacher/guardians/${id}`);
  return adaptTeacherGuardian(raw?.guardian || raw);
}
