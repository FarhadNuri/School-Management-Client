import apiRequest from '../../api';
import { LIVE_TEACHER } from '../sources';
import { adaptTeacherExam, adaptExamRosterRow } from './adapters/examAdapter';

export async function getTeacherExams({
  classId,
  examType,
  status,
  startDate,
  endDate,
  search = ''
} = {}) {
  if (!LIVE_TEACHER.exams) {
    return { count: 0, exams: [] };
  }

  const raw = await apiRequest('/teacher/exams', {
    params: {
      classId: classId && classId !== 'all' ? classId : undefined,
      examType: examType && examType !== 'all' ? examType : undefined,
      status: status && status !== 'all' ? status : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: search?.trim() || undefined
    }
  });

  const list = Array.isArray(raw?.exams) ? raw.exams.map(adaptTeacherExam) : [];
  return {
    count: raw?.count ?? list.length,
    exams: list
  };
}

export async function getTeacherExam(id) {
  if (!LIVE_TEACHER.exams) return null;
  const raw = await apiRequest(`/teacher/exams/${id}`);
  const exam = adaptTeacherExam(raw?.exam || raw);
  const totalMarks = exam?.totalMarks || 0;
  const passingMarks = exam?.passingMarks || 0;

  const results = Array.isArray(raw?.results)
    ? raw.results.map((r) => adaptExamRosterRow(r, totalMarks, passingMarks))
    : [];

  return {
    exam,
    results,
    summary: raw?.summary || {
      average: 0,
      highest: 0,
      lowest: 0,
      passPercentage: 0,
      passRate: 0,
      passed: 0,
      failed: 0,
      appeared: 0,
      absent: 0,
      totalStudents: results.length
    }
  };
}

export async function createExam(examData) {
  if (!LIVE_TEACHER.exams) return { success: true };
  const raw = await apiRequest('/teacher/exams', {
    method: 'POST',
    body: examData
  });
  return adaptTeacherExam(raw?.exam || raw);
}

export async function updateExam(id, examData) {
  if (!LIVE_TEACHER.exams) return { success: true };
  const raw = await apiRequest(`/teacher/exams/${id}`, {
    method: 'PATCH',
    body: examData
  });
  return adaptTeacherExam(raw?.exam || raw);
}

export async function saveExamResults(id, results) {
  if (!LIVE_TEACHER.exams) return { success: true };
  const raw = await apiRequest(`/teacher/exams/${id}/results`, {
    method: 'PUT',
    body: { results }
  });
  return raw;
}


export async function getTeacherGradebook(classId, params = {}) {
  if (!classId) return null;
  const query = new URLSearchParams(params).toString();
  const raw = await apiRequest(`/teacher/grades/${classId}${query ? `?${query}` : ''}`);
  return raw;
}

export async function saveTeacherGradebook(classId, data) {
  if (!classId) return null;
  const raw = await apiRequest(`/teacher/grades/${classId}`, {
    method: 'PUT',
    body: data
  });
  return raw;
}

export async function getTeacherGradebooks() {
  const raw = await apiRequest('/teacher/grades');
  return raw;
}
