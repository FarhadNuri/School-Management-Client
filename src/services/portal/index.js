import { timetableDays, timetableRows, subjectColors } from '../../features/portal/data/dashboard';
import { lessonsData } from '../../features/portal/data/lessons';
import { homeworksData } from '../../features/portal/data/homeworks';
import { examsData } from '../../features/portal/data/exams';
import { attendanceSummary } from '../../features/portal/data/attendance';
import { getAnnouncements as fetchAnnouncements } from './announcements';

export * from './sources';
export * from './students';
export * from './announcements';
export * from './complaints';
export * from './payments';
export * from './account';

// Dashboard composite helper
export const getDashboard = async (_role = 'guardian') => {
  let announcements = [];
  try {
    const res = await fetchAnnouncements();
    announcements = (res.announcements || []).slice(0, 4);
  } catch {
    announcements = [];
  }

  return {
    timetable: { days: timetableDays, rows: timetableRows, colors: subjectColors },
    announcements
  };
};

// Mock-only resources (LIVE flags false)
export const getLessons = async (_role = 'guardian', _studentFilter = 'all') => {
  return Promise.resolve(lessonsData);
};

export const getHomeworks = async (_role = 'guardian', _studentFilter = 'all') => {
  return Promise.resolve(homeworksData);
};

export const getExams = async (_role = 'guardian', _studentFilter = 'all') => {
  return Promise.resolve(examsData);
};

export const getAttendance = async (_role = 'guardian', _studentFilter = 'all') => {
  return Promise.resolve({
    summary: attendanceSummary,
    hasRecords: false
  });
};

export * from './lessons';
export * from './homeworks';
export * from './attendance';

export * from './grades';
