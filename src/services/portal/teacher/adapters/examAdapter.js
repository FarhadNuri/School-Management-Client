import { formatDate } from '../../../../features/portal/utils/dateUtils';

const TYPE_LABELS = {
  midterm: 'Midterm',
  final: 'Final',
  quiz: 'Quiz',
  unit_test: 'Unit test',
  other: 'Other'
};

const STATUS_TAGS = {
  scheduled: 'a', // amber
  ongoing: 'b',    // blue
  completed: 'g',  // green
  cancelled: 'r'   // red
};

export function calculateGrade(marks, totalMarks) {
  if (totalMarks <= 0 || marks == null || isNaN(marks)) return '—';
  const percentage = (marks / totalMarks) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

function resolvePhoto(photo) {
  if (!photo) return '';
  if (typeof photo === 'string') return photo;
  if (typeof photo === 'object' && photo.url) return photo.url;
  return '';
}

export function adaptTeacherExam(e) {
  if (!e) return null;
  const id = e.id || e._id || '';
  const classItem = e.class || {};
  const className = classItem.className || e.className || '—';
  const classId = classItem._id || classItem.id || e.classId || null;

  const type = String(e.examType || 'other').toLowerCase();
  const typeLabel = TYPE_LABELS[type] || 'Other';

  const status = String(e.status || 'scheduled').toLowerCase();
  const statusTag = STATUS_TAGS[status] || 'mute';

  const examDate = e.examDate || null;
  const startTime = e.startTime || '';
  const endTime = e.endTime || '';

  return {
    id,
    _id: id,
    title: e.title || '—',
    subject: e.subject || '—',
    classId,
    className,
    examType: type,
    typeLabel,
    status,
    statusTag,
    examDate,
    examDateText: examDate ? formatDate(examDate) : '—',
    startTime,
    endTime,
    timeRange: startTime && endTime ? `${startTime} - ${endTime}` : startTime || '—',
    duration: Number(e.duration) || 60,
    venue: e.venue || '—',
    totalMarks: Number(e.totalMarks) || 0,
    passingMarks: Number(e.passingMarks ?? e.passMarks) || 0,
    instructions: e.instructions || e.description || ''
  };
}

export function adaptExamRosterRow(row, totalMarks = 0, passingMarks = 0) {
  const student = row.student || {};
  const studentId = row.studentId || student.id || student._id || '';
  const name =
    row.name ||
    student.name ||
    `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
    '—';
  const photo = resolvePhoto(row.photo || student.photo);

  const isAbsent = Boolean(row.isAbsent);
  const marksObtained = row.marksObtained != null ? Number(row.marksObtained) : null;
  const remarks = row.remarks || '';
  const grade = isAbsent ? 'Absent' : (row.grade || calculateGrade(marksObtained, totalMarks));

  return {
    studentId,
    name,
    photo,
    marksObtained,
    isAbsent,
    remarks,
    grade,
    isGraded: marksObtained != null || isAbsent
  };
}
