function resolvePhoto(photo) {
  if (!photo) return '';
  if (typeof photo === 'string') return photo;
  if (typeof photo === 'object' && photo.url) return photo.url;
  return '';
}

export function adaptTeacherClass(cls) {
  if (!cls) return null;
  const id = cls.id || cls._id || '';
  const students = Array.isArray(cls.students) ? cls.students : [];
  const coursesRaw = Array.isArray(cls.courses) ? cls.courses : [];

  const courseNames = coursesRaw
    .map((c) => (typeof c === 'object' ? c.courseName || c.name || '' : String(c)))
    .filter(Boolean);

  const courseObjects = coursesRaw.filter((c) => typeof c === 'object' && c !== null);

  return {
    id,
    _id: id,
    className: cls.className || '—',
    classCode: cls.classCode || '—',
    grade: cls.grade != null ? String(cls.grade) : '—',
    academicYear: cls.academicYear || '—',
    description: cls.description || '',
    studentCount: students.length,
    students,
    courses: courseNames,
    courseObjects,
    coursesText: courseNames.length > 0 ? courseNames.join(', ') : '—',
    mySubject: cls.mySubject || '',
    myCourseCode: cls.myCourseCode || '',
    myCourses: cls.myCourses || [],
    coverImage: resolvePhoto(cls.coverImage),
    isActive: cls.isActive ?? true
  };
}

export function adaptTeacherClassDetail(cls) {
  if (!cls) return null;
  const base = adaptTeacherClass(cls);

  const students = (cls.students || []).map((s) => {
    const sId = s._id || s.id || '';
    const user = s.user || {};
    const guardianUser = s.guardian?.user || {};
    const guardianPhone =
      s.guardian?.user?.contactInfo?.phone ||
      s.guardian?.contactInfo?.phone ||
      s.emergencyContact ||
      '—';

    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const name = `${firstName} ${lastName}`.trim() || '—';

    const gFirst = guardianUser.firstName || '';
    const gLast = guardianUser.lastName || '';
    const guardianName = `${gFirst} ${gLast}`.trim() || '—';

    return {
      studentId: sId,
      id: sId,
      _id: sId,
      name,
      photo: resolvePhoto(user.photo),
      guardianName,
      phone: guardianPhone,
      email: user.email || '—'
    };
  });

  return {
    ...base,
    students
  };
}
