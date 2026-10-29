export const ALL_TABS = {
  subjects: {
    id: 'subjects',
    route: 'subjects',
    label: 'Subjects',
    icon: 'subjects',
    subtitle: 'Curriculum subjects and e-books'
  },

  dashboard: {
    id: 'dashboard',
    route: '',
    label: 'Dashboard',
    icon: 'dashboard',
    subtitle: 'Your day, lessons, and progress at a glance'
  },
  students: {
    id: 'students',
    route: 'students',
    label: 'Students',
    icon: 'students',
    subtitle: 'Enrollment and student records'
  },
  materials: {
    id: 'materials',
    route: 'materials',
    label: 'Materials',
    icon: 'lessons',
    subtitle: 'Upload and organize section study materials and notes'
  },
  lessons: {
    id: 'lessons',
    route: 'lessons',
    label: 'Lessons',
    icon: 'lessons',
    subtitle: 'Lesson plans and teaching sessions'
  },
  homeworks: {
    id: 'homeworks',
    route: 'homeworks',
    label: 'Homeworks',
    icon: 'homeworks',
    subtitle: 'Homework and coursework tasks'
  },
  exams: {
    id: 'exams',
    route: 'exams',
    label: 'Exams',
    icon: 'exams',
    subtitle: 'Assessments and exam sessions'
  },
  grades: {
    id: 'grades',
    route: 'grades',
    label: 'Grades',
    icon: 'grades',
    subtitle: 'Class grade sheets, marks and assessments'
  },
  attendance: {
    id: 'attendance',
    route: 'attendance',
    label: 'Attendance',
    icon: 'attendance',
    subtitle: 'Lesson roll call and presence records'
  },
  complaints: {
    id: 'complaints',
    route: 'complaints',
    label: 'Complaints',
    icon: 'complaints',
    subtitle: 'Incidents and case records'
  },
  announcements: {
    id: 'announcements',
    route: 'announcements',
    label: 'Announcements',
    icon: 'announcements',
    subtitle: 'School notices and updates'
  },
  payments: {
    id: 'payments',
    route: 'payments',
    label: 'Payments',
    icon: 'payments',
    subtitle: 'Invoices and payment history'
  },
  classes: {
    id: 'classes',
    route: 'classes',
    label: 'Classes',
    icon: 'classes',
    subtitle: 'Assigned classes and student rosters'
  },
  guardians: {
    id: 'guardians',
    route: 'guardians',
    label: 'Guardians',
    icon: 'guardians',
    subtitle: 'Parent and guardian directory'
  }
};

export const ROLES = {
  guardian: {
    basePath: '/guardian',
    label: 'GUARDIAN',
    tabIds: [
      'dashboard',
      'students',
      'subjects',
      'materials',
      'homeworks',
      'grades',
      'attendance',
      'complaints',
      'announcements',
      'payments'
    ],
    flags: { canPay: true, canMakeComplaint: true, showStudentFilter: false },
    stat1: 'Linked students'
  },
  student: {
    basePath: '/student',
    label: 'STUDENT',
    tabIds: [
      'dashboard',
      'subjects',
      'materials',
      'homeworks',
      'grades',
      'attendance',
      'complaints',
      'announcements',
      'payments'
    ],
    flags: { canPay: false, canMakeComplaint: true, showStudentFilter: false },
    stat1: 'My class'
  },
  teacher: {
    basePath: '/teacher',
    label: 'TEACHER',
    tabIds: [
      'dashboard',
      'classes',
      'subjects',
      'materials',
      'attendance',
      'homeworks',
      'grades',
      'guardians',
      'complaints',
      'announcements'
    ],
    flags: {
      canPay: false,
      canMakeComplaint: true,
      canCreateAnnouncement: true,
      canManageMaterials: true,
      canManageLessons: true,
      canManageHomeworks: true,
      canManageExams: true,
      canTakeAttendance: true
    },
    stat1: 'Assigned classes'
  }
};
