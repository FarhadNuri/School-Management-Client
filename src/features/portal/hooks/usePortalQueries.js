import {
  getStudentMaterials,
  getStudentMaterialById,
  getStudentHomeworks,
  getStudentHomeworkById,
  getStudentAttendance,
  getStudentAttendanceSummary,
  getStudentGrades
} from '../../../services/portal';
﻿import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyStudents,
  getStudentById
} from '../../../services/portal/students';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../../services/portal/announcements';
import {
  getComplaints,
  createComplaint
} from '../../../services/portal/complaints';
import { getPayments } from '../../../services/portal/payments';
import {
  getCurrentUser,
  changePassword,
  login
} from '../../../services/portal/account';
import { showToast } from '../../../components/ui/Toast';

/**
 * 400ms debounce helper for search inputs.
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

import {
  getTeacherClasses,
  getTeacherCourses,
  getTeacherClass,
  getTeacherGuardians,
  getTeacherGuardian,
  getTeacherLessons,
  getTeacherLesson,
  createLesson,
  updateLesson,
  getTeacherHomeworks,
  getTeacherHomework,
  createHomework,
  updateHomework,
  getTeacherExams,
  getTeacherExam,
  createExam,
  updateExam,
  saveExamResults,
  getTeacherGradebooks,
  getTeacherGradebook,
  saveTeacherGradebook,
  getAttendanceLessons,
  getLessonRoster,
  saveRollCall,
  deleteLesson,
  getTeacherAttendanceSections,
  getSectionMonthlyAttendance,
  getSectionDailyAttendance,
  saveSectionDailyAttendance
} from '../../../services/portal/teacher';

// QUERY KEYS
export const QUERY_KEYS = {
  // Student keys
  studentMaterials: (params = {}) => ['portal', 'student', 'materials', params],
  studentMaterial: (id) => ['portal', 'student', 'material', id],
  studentHomeworks: (params = {}) => ['portal', 'student', 'homeworks', params],
  studentHomework: (id) => ['portal', 'student', 'homework', id],
  studentAttendance: (params = {}) => ['portal', 'student', 'attendance', params],
  studentAttendanceSummary: () => ['portal', 'student', 'attendance', 'summary'],

  students: (search = '') => ['portal', 'students', search],
  student: (id) => ['portal', 'student', id],
  announcements: (filters = {}) => ['portal', 'announcements', filters],
  complaints: () => ['portal', 'complaints'],
  payments: (search = '') => ['portal', 'payments', search],
  currentUser: () => ['portal', 'currentUser'],
  // Teacher keys
  teacherClasses: (params = {}) => ['teacher', 'classes', params],
  teacherClass: (id) => ['teacher', 'class', id],
  teacherGuardians: (params = {}) => ['teacher', 'guardians', params],
  teacherGuardian: (id) => ['teacher', 'guardian', id],
  teacherLessons: (params = {}) => ['teacher', 'lessons', params],
  teacherLesson: (id) => ['teacher', 'lesson', id],
  teacherHomeworks: (params = {}) => ['teacher', 'homeworks', params],
  teacherHomework: (id) => ['teacher', 'homework', id],
  teacherExams: (params = {}) => ['teacher', 'exams', params],
  teacherExam: (id) => ['teacher', 'exam', id],
  teacherAttendanceLessons: () => ['teacher', 'attendance', 'lessons'],
  teacherAttendanceSections: () => ['teacher', 'attendance', 'sections'],
  sectionMonthlyAttendance: (classId, year, month) => ['teacher', 'attendance', 'section', classId, 'monthly', year, month],
  sectionDailyAttendance: (classId, date) => ['teacher', 'attendance', 'section', classId, 'daily', date],
  teacherLessonRoster: (lessonId) => ['teacher', 'attendance', 'lesson', lessonId],
  teacherDashboard: () => ['teacher', 'dashboard']
};


/**
 * Hook to get linked students (guardian only).
 */
export function useMyStudents(search = '', options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.students(search),
    queryFn: () => getMyStudents(search),
    staleTime: 0,
    refetchOnWindowFocus: 'always',
    refetchOnMount: 'always',
    ...options
  });
}

/**
 * Hook to get student by ID.
 */
export function useStudent(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.student(id),
    queryFn: () => getStudentById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options
  });
}

/**
 * Hook to fetch announcements.
 */
export function useAnnouncements(filters = {}, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.announcements(filters),
    queryFn: () => getAnnouncements(filters),
    staleTime: 60 * 1000,
    ...options
  });
}

/**
 * Hook to fetch complaints.
 */
export function useComplaints(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.complaints(),
    queryFn: () => getComplaints(),
    staleTime: 30 * 1000,
    ...options
  });
}

/**
 * Hook to create a complaint.
 */
export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (complaintData) => createComplaint(complaintData),
    onSuccess: () => {
      showToast('Complaint submitted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.complaints() });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to submit complaint', 'error');
    }
  });
}

/**
 * Hook to fetch payments.
 */
export function usePayments(search = '', options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.payments(search),
    queryFn: () => getPayments({ search }),
    staleTime: 60 * 1000,
    ...options
  });
}

/**
 * Hook to refresh and get current authenticated user.
 */
export function useCurrentUser(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.currentUser(),
    queryFn: () => getCurrentUser(),
    retry: false,
    ...options
  });
}

/**
 * Hook to change password.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword, confirmPassword }) =>
      changePassword({ currentPassword, newPassword, confirmPassword }),
    onSuccess: () => {
      showToast('Password changed successfully', 'success');
    },
    onError: (err) => {
      showToast(err.message || 'Failed to change password', 'error');
    }
  });
}

/**
 * Hook to perform login.
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }) => login({ email, password }),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.currentUser(), data.user);
    }
  });
}

// -------------------------------------------------------------
// TEACHER HOOKS
// -------------------------------------------------------------


export function useTeacherCourses(options = {}) {
  return useQuery({
    queryKey: ['teacher', 'courses'],
    queryFn: () => getTeacherCourses(),
    staleTime: 60 * 1000,
    ...options
  });
}

export function useTeacherClasses(params = {}, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.teacherClasses(params),
    queryFn: () => getTeacherClasses(params),
    staleTime: 60 * 1000,
    ...options
  });
}

export function useTeacherClassDetail(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.teacherClass(id),
    queryFn: () => getTeacherClass(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options
  });
}

export function useTeacherGuardians(params = {}, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.teacherGuardians(params),
    queryFn: () => getTeacherGuardians(params),
    staleTime: 60 * 1000,
    ...options
  });
}

export function useTeacherGuardianDetail(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.teacherGuardian(id),
    queryFn: () => getTeacherGuardian(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
    ...options
  });
}

export function useTeacherLessons(params = {}, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.teacherLessons(params),
    queryFn: () => getTeacherLessons(params),
    staleTime: 30 * 1000,
    ...options
  });
}

export function useTeacherLessonDetail(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.teacherLesson(id),
    queryFn: () => getTeacherLesson(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
    ...options
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formDataOrData) => createLesson(formDataOrData),
    onSuccess: () => {
      showToast('Lesson saved', 'success');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'lessons'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'attendance', 'lessons'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to save lesson', 'error');
    }
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateLesson(id, data),
    onSuccess: (_, { id }) => {
      showToast('Lesson saved', 'success');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'lessons'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'lesson', id] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'attendance', 'lessons'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to save lesson', 'error');
    }
  });
}

export function useTeacherHomeworks(params = {}, options = {}) {
  // Support both useTeacherHomeworks(options) and useTeacherHomeworks(params, options)
  const isSingleArgOptions =
    arguments.length === 1 &&
    typeof params === 'object' &&
    ('enabled' in params || 'staleTime' in params || 'select' in params);
  const actualOptions = isSingleArgOptions ? params : options;
  const actualParams = isSingleArgOptions ? {} : params;

  return useQuery({
    queryKey: QUERY_KEYS.teacherHomeworks(actualParams),
    queryFn: () => getTeacherHomeworks(actualParams),
    staleTime: 30 * 1000,
    ...actualOptions
  });
}

export function useTeacherHomeworkDetail(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.teacherHomework(id),
    queryFn: () => getTeacherHomework(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
    ...options
  });
}

export function useCreateHomework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formDataOrData) => createHomework(formDataOrData),
    onSuccess: () => {
      showToast('Homework saved', 'success');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'homeworks'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to save homework', 'error');
    }
  });
}

export function useUpdateHomework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateHomework(id, data),
    onSuccess: (_, { id }) => {
      showToast('Homework saved', 'success');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'homeworks'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'homework', id] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to save homework', 'error');
    }
  });
}

export function useTeacherExams(params = {}, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.teacherExams(params),
    queryFn: () => getTeacherExams(params),
    staleTime: 30 * 1000,
    ...options
  });
}

export function useTeacherExamDetail(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.teacherExam(id),
    queryFn: () => getTeacherExam(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
    ...options
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examData) => createExam(examData),
    onSuccess: () => {
      showToast('Exam saved', 'success');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'exams'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to save exam', 'error');
    }
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateExam(id, data),
    onSuccess: (_, { id }) => {
      showToast('Exam saved', 'success');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'exams'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'exam', id] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to save exam', 'error');
    }
  });
}

export function useSaveExamResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, results }) => saveExamResults(id, results),
    onSuccess: (_, { id }) => {
      showToast('Results saved', 'success');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'exams'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'exam', id] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to save exam results', 'error');
    }
  });
}

export function useAttendanceLessons(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.teacherAttendanceLessons(),
    queryFn: () => getAttendanceLessons(),
    staleTime: 30 * 1000,
    ...options
  });
}

export function useLessonRoster(lessonId, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.teacherLessonRoster(lessonId),
    queryFn: () => getLessonRoster(lessonId),
    enabled: Boolean(lessonId),
    staleTime: 15 * 1000,
    ...options
  });
}

export function useSaveRollCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, records }) => saveRollCall(lessonId, records),
    onSuccess: (_, { lessonId }) => {
      showToast('Roll call saved', 'success');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'attendance'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'attendance', 'lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'lessons'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to save roll call', 'error');
    }
  });
}



export function useTeacherAttendanceSections(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.teacherAttendanceSections(),
    queryFn: () => getTeacherAttendanceSections(),
    staleTime: 30 * 1000,
    ...options
  });
}

export function useSectionMonthlyAttendance(classId, year, month, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.sectionMonthlyAttendance(classId, year, month),
    queryFn: () => getSectionMonthlyAttendance(classId, year, month),
    enabled: Boolean(classId && year && month),
    staleTime: 15 * 1000,
    ...options
  });
}

export function useSectionDailyAttendance(classId, date, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.sectionDailyAttendance(classId, date),
    queryFn: () => getSectionDailyAttendance(classId, date),
    enabled: Boolean(classId && date),
    staleTime: 10 * 1000,
    ...options
  });
}

export function useSaveSectionDailyAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, date, records }) =>
      saveSectionDailyAttendance(classId, date, records),
    onSuccess: (_, { classId, date }) => {
      showToast('Attendance saved successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'attendance'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'attendance', 'section', classId] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to save attendance', 'error');
    }
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteLesson(id),
    onSuccess: () => {
      showToast('Material removed', 'success');
      queryClient.invalidateQueries({ queryKey: ['teacher', 'lessons'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to remove material', 'error');
    }
  });
}
/**
 * Hook to create an announcement.
 */
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementData) => createAnnouncement(announcementData),
    onSuccess: () => {
      showToast('Announcement created successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['portal', 'announcements'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to create announcement', 'error');
    }
  });
}

/**
 * Hook to update an announcement.
 */
export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateAnnouncement(id, data),
    onSuccess: () => {
      showToast('Announcement updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['portal', 'announcements'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to update announcement', 'error');
    }
  });
}

/**
 * Hook to delete an announcement.
 */
export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteAnnouncement(id),
    onSuccess: () => {
      showToast('Announcement deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['portal', 'announcements'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to delete announcement', 'error');
    }
  });
}


export function useTeacherGradebooks(options = {}) {
  return useQuery({
    queryKey: ['portal', 'teacher', 'gradebooks'],
    queryFn: () => getTeacherGradebooks(),
    staleTime: 0,
    refetchOnMount: 'always',
    ...options
  });
}

export function useTeacherGradebook(classId, options = {}) {
  return useQuery({
    queryKey: ['portal', 'teacher', 'gradebook', classId],
    queryFn: () => getTeacherGradebook(classId),
    enabled: Boolean(classId && classId !== 'all'),
    staleTime: 0,
    refetchOnMount: 'always',
    ...options
  });
}

export function useSaveTeacherGradebook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, data }) => saveTeacherGradebook(classId, data),
    onSuccess: (_, { classId }) => {
      showToast('Gradebook saved successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['portal', 'teacher', 'gradebook', classId] });
      queryClient.invalidateQueries({ queryKey: ['portal', 'teacher', 'gradebooks'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to save gradebook', 'error');
    }
  });
}

// ==================== STUDENT / USER HOOKS ====================
export function useStudentMaterials(params = {}, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.studentMaterials(params),
    queryFn: () => getStudentMaterials(params),
    ...options
  });
}

export function useStudentMaterialDetail(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.studentMaterial(id),
    queryFn: () => getStudentMaterialById(id),
    enabled: Boolean(id),
    ...options
  });
}

export function useStudentHomeworks(params = {}, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.studentHomeworks(params),
    queryFn: () => getStudentHomeworks(params),
    ...options
  });
}

export function useStudentHomeworkDetail(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.studentHomework(id),
    queryFn: () => getStudentHomeworkById(id),
    enabled: Boolean(id),
    ...options
  });
}

export function useStudentAttendance(params = {}, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.studentAttendance(params),
    queryFn: () => getStudentAttendance(params),
    ...options
  });
}

export function useStudentAttendanceSummary(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.studentAttendanceSummary(),
    queryFn: () => getStudentAttendanceSummary(),
    ...options
  });
}

export function useStudentGrades(options = {}) {
  return useQuery({
    queryKey: ['portal', 'student', 'grades'],
    queryFn: () => getStudentGrades(),
    staleTime: 0,
    refetchOnMount: 'always',
    ...options
  });
}
