import apiRequest from '../api';
import { LIVE } from './sources';
import { attendanceSummary as mockSummary } from '../../features/portal/data/attendance';

export const getStudentAttendance = async ({ status = 'all', startDate, endDate } = {}) => {
  if (!LIVE.attendance) {
    return { count: 0, attendance: [] };
  }

  const raw = await apiRequest('/user/attendance', {
    params: {
      status: status && status !== 'all' ? status : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    }
  });

  const list = Array.isArray(raw?.attendance) ? raw.attendance : [];
  return {
    count: raw?.count ?? list.length,
    attendance: list
  };
};

export const getStudentAttendanceSummary = async () => {
  if (!LIVE.attendance) {
    return {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      presentRate: 0,
      rate: 0
    };
  }

  const raw = await apiRequest('/user/attendance/summary');
  return raw?.summary || raw || {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    presentRate: 0,
    rate: 0
  };
};
