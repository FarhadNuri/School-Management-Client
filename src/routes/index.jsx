import SubjectDetail from '../features/portal/pages/SubjectDetail';
import Subjects from '../features/portal/pages/Subjects';
import StudentGrades from '../features/portal/pages/StudentGrades';
﻿import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../features/landing/LandingPage';
import Login from '../features/portal/pages/Login';
import AuthGuard from './AuthGuard';
import RoleGuard from './RoleGuard';
import PortalLayout from '../features/portal/layout/PortalLayout';
import Dashboard from '../features/portal/pages/Dashboard';
import Students from '../features/portal/pages/Students';
import Materials from '../features/portal/pages/Materials';
import Homeworks from '../features/portal/pages/Homeworks';
import Exams from '../features/portal/pages/Exams';
import Attendance from '../features/portal/pages/Attendance';
import Complaints from '../features/portal/pages/Complaints';
import Announcements from '../features/portal/pages/Announcements';
import Payments from '../features/portal/pages/Payments';
import StudentProfile from '../features/portal/pages/StudentProfile';

// Teacher-specific pages
import TeacherClasses from '../features/portal/pages/teacher/Classes';
import TeacherLessons from '../features/portal/pages/teacher/Lessons';
import TeacherAttendance from '../features/portal/pages/teacher/Attendance';
import TeacherHomeworks from '../features/portal/pages/teacher/Homeworks';
import TeacherGrades from '../features/portal/pages/teacher/Grades';
import TeacherExams from '../features/portal/pages/teacher/Grades';
import TeacherGuardians from '../features/portal/pages/teacher/Guardians';

function DashboardRedirect() {
  let target = '/guardian';
  try {
    const session = JSON.parse(
      localStorage.getItem('portal_session') ||
      localStorage.getItem('guardian_session') ||
      '{}'
    );
    if (session.role === 'student') target = '/student';
    else if (session.role === 'teacher') target = '/teacher';
  } catch {
    target = '/guardian';
  }
  return <Navigate to={target} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Legacy /dashboard redirect */}
      <Route path="/dashboard" element={<DashboardRedirect />} />
      <Route path="/dashboard/*" element={<DashboardRedirect />} />

      {/* Protected Routes */}
      <Route element={<AuthGuard />}>
        {/* Guardian Portal Branch */}
        <Route element={<RoleGuard allowedRole="guardian" />}>
          <Route path="/guardian" element={<PortalLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:id" element={<StudentProfile />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="subjects/:id" element={<SubjectDetail />} />
            <Route path="materials" element={<Materials />} />
            <Route path="lessons" element={<Navigate to="/guardian/materials" replace />} />
            <Route path="homeworks" element={<Homeworks />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="exams" element={<Navigate to="/guardian/grades" replace />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="payments" element={<Payments />} />
            <Route path="*" element={<Navigate to="/guardian" replace />} />
          </Route>
        </Route>

        {/* Student Portal Branch */}
        <Route element={<RoleGuard allowedRole="student" />}>
          <Route path="/student" element={<PortalLayout />}>
            <Route index element={<Dashboard />} />
            {/* If a student opens /student/students or any guardian-only path, redirect to /student */}
            <Route path="students" element={<Navigate to="/student" replace />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="materials" element={<Materials />} />
            <Route path="lessons" element={<Navigate to="/student/materials" replace />} />
            <Route path="homeworks" element={<Homeworks />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="exams" element={<Navigate to="/student/grades" replace />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="payments" element={<Payments />} />
            <Route path="*" element={<Navigate to="/student" replace />} />
          </Route>
        </Route>

        {/* Teacher Portal Branch */}
        <Route element={<RoleGuard allowedRole="teacher" />}>
          <Route path="/teacher" element={<PortalLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="subjects/:id" element={<SubjectDetail />} />
            <Route path="classes" element={<TeacherClasses />} />
            <Route path="materials" element={<TeacherLessons />} />
            <Route path="lessons" element={<Navigate to="/teacher/materials" replace />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="homeworks" element={<TeacherHomeworks />} />
            <Route path="grades" element={<TeacherGrades />} />
            <Route path="exams" element={<Navigate to="/teacher/grades" replace />} />
            <Route path="guardians" element={<TeacherGuardians />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="announcements" element={<Announcements />} />
            {/* Redirect /teacher/payments and unknown paths to /teacher */}
            <Route path="payments" element={<Navigate to="/teacher" replace />} />
            <Route path="*" element={<Navigate to="/teacher" replace />} />
          </Route>
        </Route>
      </Route>

      {/* Global Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
