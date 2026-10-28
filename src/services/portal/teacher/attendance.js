import apiRequest from '../../api';
import { LIVE_TEACHER } from '../sources';
import { adaptAttendanceLesson, adaptRosterItem } from './adapters/attendanceAdapter';
import { adaptTeacherLesson } from './adapters/lessonAdapter';

export async function getTeacherAttendanceSections() {
  if (!LIVE_TEACHER.attendance) {
    return { count: 0, sections: [] };
  }
  const raw = await apiRequest('/teacher/attendance/sections');
  return {
    count: raw?.count ?? (raw?.sections?.length || 0),
    sections: raw?.sections || []
  };
}

export async function getSectionMonthlyAttendance(classId, year, month) {
  if (!LIVE_TEACHER.attendance || !classId) {
    return null;
  }
  const raw = await apiRequest(`/teacher/attendance/sections/${classId}/monthly`, {
    params: { year, month }
  });
  return raw;
}

export async function getSectionDailyAttendance(classId, date) {
  if (!LIVE_TEACHER.attendance || !classId || !date) {
    return null;
  }
  const raw = await apiRequest(`/teacher/attendance/sections/${classId}/date/${date}`);
  const roster = Array.isArray(raw?.roster) ? raw.roster.map(adaptRosterItem) : [];

  return {
    class: raw?.class || null,
    date: raw?.date || date,
    roster,
    summary: raw?.summary || {
      rosterSize: roster.length,
      markedCount: 0,
      unmarkedCount: roster.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      attendanceRate: 0,
      isComplete: false
    }
  };
}

export async function saveSectionDailyAttendance(classId, date, records) {
  if (!LIVE_TEACHER.attendance) return { success: true };
  const raw = await apiRequest(`/teacher/attendance/sections/${classId}/date/${date}`, {
    method: 'PUT',
    body: { records }
  });
  return raw;
}

// Legacy lesson-based attendance
export async function getAttendanceLessons() {
  if (!LIVE_TEACHER.attendance) {
    return { count: 0, lessons: [] };
  }

  const raw = await apiRequest('/teacher/attendance/lessons');
  const list = Array.isArray(raw?.lessons) ? raw.lessons.map(adaptAttendanceLesson) : [];
  return {
    count: raw?.count ?? list.length,
    lessons: list
  };
}

export async function getLessonRoster(lessonId) {
  if (!LIVE_TEACHER.attendance) return null;
  const raw = await apiRequest(`/teacher/attendance/lessons/${lessonId}`);

  const lesson = adaptTeacherLesson(raw?.lesson);
  const roster = Array.isArray(raw?.roster) ? raw.roster.map(adaptRosterItem) : [];

  return {
    lesson,
    roster,
    summary: raw?.summary || {
      rosterSize: roster.length,
      markedCount: 0,
      unmarkedCount: roster.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      attendanceRate: 0,
      isComplete: false
    }
  };
}

export async function saveRollCall(lessonId, records) {
  if (!LIVE_TEACHER.attendance) return { success: true };
  const raw = await apiRequest(`/teacher/attendance/lessons/${lessonId}`, {
    method: 'PUT',
    body: { records }
  });
  return raw;
}
