import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortalRole } from '../hooks/usePortalRole';
import StatCard from '../components/StatCard';
import Timetable from '../components/Timetable';
import Tag from '../components/Tag';
import Icon from '../../../components/ui/Icon';
import Skeleton from '../components/Skeleton';
import ErrorRetry from '../components/ErrorRetry';
import {
  useMyStudents,
  useAnnouncements,
  useTeacherClasses,
  useTeacherLessons,
  useTeacherHomeworks,
  useTeacherGradebooks,
  useAttendanceLessons,
  useStudentMaterials,
  useStudentHomeworks,
  useStudentAttendance,
  useStudentAttendanceSummary
} from '../hooks/usePortalQueries';
import {
  getTodayLocalRange,
  formatTime,
  formatDate
} from '../utils/dateUtils';
import {
  BookOpen,
  Calendar,
  User,
  Paperclip,
  ExternalLink,
  FileText,
  Clock,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

const getFileName = (url) => {
  if (!url) return 'Attachment';
  try {
    const parts = url.split('/');
    const last = decodeURIComponent(parts[parts.length - 1] || 'Attachment');
    return last.split('?')[0];
  } catch {
    return 'Attachment';
  }
};

export default function Dashboard() {
  const { role, stat1, user, basePath, flags } = usePortalRole();
  const navigate = useNavigate();

  const isTeacher = Boolean(flags.canTakeAttendance);
  const isGuardian = role === 'guardian';
  const isStudent = role === 'student';

  const [studentActiveTab, setStudentActiveTab] = useState('materials'); // 'materials' | 'attendance'

  // Guardian: Linked students stat from real GET /user/students
  const { data: studentsData, isLoading: isLoadingStudents } = useMyStudents('', {
    enabled: isGuardian
  });

  // Announcements query (top 4 items)
  const {
    data: announcementsData,
    isLoading: isLoadingAnnouncements,
    isError: isAnnouncementsError,
    refetch: refetchAnnouncements
  } = useAnnouncements();

  // ==================== TEACHER QUERIES ====================
  const { data: teacherClassesData, isLoading: isLoadingClasses } = useTeacherClasses({}, { enabled: isTeacher });
  const { data: materialsData, isLoading: isLoadingMaterials } = useTeacherLessons({}, { enabled: isTeacher });
  const { data: homeworksData, isLoading: isLoadingHomeworks } = useTeacherHomeworks({}, { enabled: isTeacher });
  const { data: gradebooksData, isLoading: isLoadingGradebooks } = useTeacherGradebooks({ enabled: isTeacher });

  const todayRange = useMemo(() => getTodayLocalRange(), []);
  const {
    data: todayLessonsData,
    isLoading: isLoadingTodayLessons,
    isError: isTodayLessonsError,
    refetch: refetchTodayLessons
  } = useTeacherLessons(
    { startDate: todayRange.startISO, endDate: todayRange.endISO },
    { enabled: isTeacher }
  );
  const { data: attendanceData } = useAttendanceLessons({ enabled: isTeacher });

  // ==================== STUDENT QUERIES ====================
  const {
    data: studentMaterialsData,
    isLoading: isLoadingStudentMaterials,
    isError: isStudentMaterialsError,
    refetch: refetchStudentMaterials
  } = useStudentMaterials({}, { enabled: isStudent });

  const {
    data: studentHomeworksData,
    isLoading: isLoadingStudentHomeworks
  } = useStudentHomeworks({}, { enabled: isStudent });

  const {
    data: studentAttendanceData,
    isLoading: isLoadingStudentAttendance
  } = useStudentAttendance({}, { enabled: isStudent });

  const {
    data: studentAttendanceSummaryData,
    isLoading: isLoadingStudentAttendanceSummary
  } = useStudentAttendanceSummary({ enabled: isStudent });

  // Parse first name from session user
  const displayName = user.name ? user.name.split(' ')[0] : 'there';

  // Teacher derived values
  const assignedClassesCount = teacherClassesData?.count ?? teacherClassesData?.classes?.length ?? 0;
  const materialsUploadedCount = materialsData?.count ?? materialsData?.lessons?.length ?? 0;
  const pendingTeacherHomeworksCount = useMemo(() => {
    const list = homeworksData?.homeworks || [];
    if (!list.length) return 0;
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    return list.filter((h) => {
      if (!h.dueDate) return true;
      const due = new Date(h.dueDate).getTime();
      return !isNaN(due) && due >= startOfToday;
    }).length;
  }, [homeworksData]);
  const gradebooksCount = gradebooksData?.count ?? gradebooksData?.gradebooks?.length ?? 0;

  // Student derived values
  const studentMaterialsList = studentMaterialsData?.materials || studentMaterialsData?.lessons || [];
  const studentMaterialsCount = studentMaterialsList.length;

  const studentHomeworksList = studentHomeworksData?.homeworks || [];
  const pendingStudentHomeworksCount = useMemo(() => {
    if (!studentHomeworksList.length) return 0;
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    return studentHomeworksList.filter((h) => {
      if (!h.dueDate) return true;
      const due = new Date(h.dueDate).getTime();
      return !isNaN(due) && due >= startOfToday;
    }).length;
  }, [studentHomeworksList]);

  const studentAttendanceRecords = studentAttendanceData?.attendance || [];
  const studentAttendanceSummary = studentAttendanceSummaryData || {};
  const studentAttendanceRate =
    studentAttendanceSummary.rate !== undefined
      ? studentAttendanceSummary.rate
      : (studentAttendanceSummary.total > 0
          ? Math.round(((studentAttendanceSummary.present + (studentAttendanceSummary.late || 0)) / studentAttendanceSummary.total) * 100)
          : 100);

  // Today's schedule lessons (Teacher)
  const todayScheduleLessons = useMemo(() => {
    const list = todayLessonsData?.lessons || [];
    const attList = attendanceData?.lessons || [];
    const attMap = new Map(attList.map((a) => [String(a.id), a]));
    const now = Date.now();

    return [...list]
      .sort((a, b) => {
        const timeA = new Date(a.scheduledAt || 0).getTime();
        const timeB = new Date(b.scheduledAt || 0).getTime();
        return timeA - timeB;
      })
      .map((lesson) => {
        const attItem = attMap.get(String(lesson.id));
        const isComplete = attItem?.isComplete ?? lesson.attendance?.isComplete ?? false;
        const scheduledTime = lesson.scheduledAt ? new Date(lesson.scheduledAt).getTime() : 0;
        const hasStarted = scheduledTime <= now;

        let statusText = 'Upcoming';
        let statusTag = 'b';
        if (isComplete) {
          statusText = 'Roll call done';
          statusTag = 'g';
        } else if (hasStarted) {
          statusText = 'Roll call pending';
          statusTag = 'a';
        }

        return {
          id: lesson.id,
          timeText: lesson.scheduledAt ? formatTime(lesson.scheduledAt) : '—',
          subject: lesson.subject || '—',
          className: lesson.className || '—',
          statusText,
          statusTag
        };
      });
  }, [todayLessonsData, attendanceData]);

  // Stat1 label and value for non-teachers
  let resolvedStat1Value = '—';
  let resolvedStat1Note = '';

  if (isGuardian) {
    resolvedStat1Value = isLoadingStudents ? '...' : String(studentsData?.count ?? 0);
    resolvedStat1Note = 'In your care';
  } else if (isStudent) {
    resolvedStat1Value = user?.className || user?.classGrade || user?.class?.className || 'Grade 6 A';
    resolvedStat1Note = 'Enrolled session';
  }

  const announcements = announcementsData?.announcements?.slice(0, 4) || [];

  return (
    <>
      <div className="bn">
        <small>GOOD MORNING</small>
        <h2>Welcome back, {displayName}</h2>
      </div>

      {isTeacher ? (
        <div className="st4">
          <StatCard
            label={stat1}
            value={isLoadingClasses ? '...' : String(assignedClassesCount)}
            note="Assigned sections"
            showArrow={true}
            onClick={() => navigate('/teacher/classes')}
          />
          <StatCard
            label="Materials uploaded"
            value={isLoadingMaterials ? '...' : String(materialsUploadedCount)}
            note="Course files & notes"
            showArrow={true}
            onClick={() => navigate('/teacher/materials')}
          />
          <StatCard
            label="Pending homeworks"
            value={isLoadingHomeworks ? '...' : String(pendingTeacherHomeworksCount)}
            note={pendingTeacherHomeworksCount > 0 ? 'Active assignments' : 'All caught up'}
            className={pendingTeacherHomeworksCount > 0 ? 'ta' : ''}
            showArrow={true}
            onClick={() => navigate('/teacher/homeworks')}
          />
          <StatCard
            label="Gradebooks"
            value={isLoadingGradebooks ? '...' : String(gradebooksCount)}
            note="Sections with grades"
            showArrow={true}
            onClick={() => navigate('/teacher/grades')}
          />
        </div>
      ) : isStudent ? (
        <div className="st4">
          <StatCard
            label="My class"
            value={resolvedStat1Value}
            note="Enrolled session"
            showArrow={true}
          />
          <StatCard
            label="Materials"
            value={isLoadingStudentMaterials ? '...' : String(studentMaterialsCount)}
            note="Class learning resources"
            showArrow={true}
            onClick={() => navigate('/student/materials')}
          />
          <StatCard
            label="Homework due"
            value={isLoadingStudentHomeworks ? '...' : String(pendingStudentHomeworksCount)}
            note={pendingStudentHomeworksCount > 0 ? 'Active assignments' : 'All caught up'}
            className={pendingStudentHomeworksCount > 0 ? 'ta' : ''}
            showArrow={true}
            onClick={() => navigate('/student/homeworks')}
          />
          <StatCard
            label="Attendance"
            value={isLoadingStudentAttendanceSummary ? '...' : `${studentAttendanceRate}%`}
            note={`${studentAttendanceSummary?.present || 0} of ${studentAttendanceSummary?.total || 0} sessions`}
            showArrow={true}
            onClick={() => navigate('/student/attendance')}
          />
        </div>
      ) : (
        <div className="st4">
          <StatCard
            label={stat1}
            value={resolvedStat1Value}
            note={resolvedStat1Note}
            showArrow={true}
          />
          <StatCard
            label="Upcoming lessons"
            value="1"
            note="Next 14 days"
            showArrow={true}
          />
          <StatCard
            label="Homework due"
            value="1"
            note="Looking good"
            showArrow={true}
          />
          <StatCard
            label="Attendance"
            value="0%"
            note="No records yet"
            showArrow={true}
          />
        </div>
      )}

      <div className="dg">
        {isTeacher ? (
          <div className="cd">
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '18px', margin: 0 }}>Today's schedule</h3>
              <span className="tg" style={{ marginLeft: 'auto' }}>
                {formatDate(new Date())}
              </span>
            </div>

            {isLoadingTodayLessons ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} width="100%" height="56px" borderRadius="14px" />
                ))}
              </div>
            ) : isTodayLessonsError ? (
              <ErrorRetry
                message="Unable to load today's lessons."
                onRetry={refetchTodayLessons}
              />
            ) : todayScheduleLessons.length === 0 ? (
              <p style={{ color: 'var(--g-mute, #60797F)', fontSize: '13px', margin: '14px 0' }}>
                No lessons scheduled for today.
              </p>
            ) : (
              todayScheduleLessons.map((s) => (
                <div
                  key={s.id}
                  className="an"
                  onClick={() => navigate('/teacher/attendance')}
                  style={{ cursor: 'pointer', transition: 'transform 0.1s ease' }}
                >
                  <span
                    className="dt"
                    style={{
                      width: '64px',
                      height: 'auto',
                      padding: '10px 4px',
                      fontSize: '11px',
                      textAlign: 'center'
                    }}
                  >
                    {s.timeText}
                  </span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '14px', margin: 0 }}>{s.subject}</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px' }}>{s.className}</p>
                  </div>
                  <span className={`tg ${s.statusTag}`} style={{ alignSelf: 'center' }}>
                    {s.statusText}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : isStudent ? (
          <div className="cd" style={{ padding: '20px' }}>
            {/* Header with Switcher Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', margin: 0, fontWeight: 800 }}>Class Hub</h3>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(30,111,120,.12)',
                    color: 'var(--p1)',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  {user?.className || 'Enrolled Class'}
                </span>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setStudentActiveTab('materials')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: studentActiveTab === 'materials' ? 'var(--p1)' : 'rgba(255,255,255,0.05)',
                    color: studentActiveTab === 'materials' ? '#fff' : 'var(--mute)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Materials ({studentMaterialsCount})
                </button>
                <button
                  onClick={() => setStudentActiveTab('attendance')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: studentActiveTab === 'attendance' ? 'var(--p1)' : 'rgba(255,255,255,0.05)',
                    color: studentActiveTab === 'attendance' ? '#fff' : 'var(--mute)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Attendance ({studentAttendanceRecords.length})
                </button>
              </div>
            </div>

            {/* Content: Materials Tab */}
            {studentActiveTab === 'materials' && (
              <div>
                {isLoadingStudentMaterials ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[1, 2, 3].map((n) => (
                      <Skeleton key={n} width="100%" height="60px" borderRadius="12px" />
                    ))}
                  </div>
                ) : studentMaterialsList.length === 0 ? (
                  <p style={{ color: 'var(--mute)', fontSize: '13px', margin: '14px 0' }}>
                    No learning materials uploaded yet for your class.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {studentMaterialsList.slice(0, 3).map((mat) => {
                      const files = Array.isArray(mat.materials) ? mat.materials : [];

                      return (
                        <div
                          key={mat.id || mat._id}
                          className="an"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            padding: '12px 14px',
                            borderRadius: '14px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid var(--line)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: 'var(--p1)',
                                textTransform: 'uppercase'
                              }}
                            >
                              <BookOpen size={13} />
                              <span>{mat.subject || 'General'}</span>
                            </span>
                            <span style={{ fontSize: '11.5px', color: 'var(--mute)' }}>
                              {formatDate(mat.createdAt || mat.scheduledAt || new Date())}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                                {mat.title}
                              </h4>
                              {mat.teacherName && (
                                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--mute)' }}>
                                  Uploaded by {mat.teacherName}
                                </p>
                              )}
                            </div>

                            {files.length > 0 && (
                              <a
                                href={files[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  background: 'rgba(30,111,120,0.12)',
                                  color: 'var(--p1)',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  textDecoration: 'none'
                                }}
                              >
                                <ExternalLink size={12} />
                                <span>{files.length === 1 ? 'Open File' : `${files.length} Files`}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div style={{ marginTop: '8px', textAlign: 'right' }}>
                      <Link
                        to="/student/materials"
                        style={{
                          color: 'var(--p1)',
                          fontSize: '13px',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        View all materials ({studentMaterialsCount}) →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content: Attendance Tab */}
            {studentActiveTab === 'attendance' && (
              <div>
                {isLoadingStudentAttendance ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[1, 2, 3].map((n) => (
                      <Skeleton key={n} width="100%" height="50px" borderRadius="12px" />
                    ))}
                  </div>
                ) : studentAttendanceRecords.length === 0 ? (
                  <p style={{ color: 'var(--mute)', fontSize: '13px', margin: '14px 0' }}>
                    No attendance records logged yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {studentAttendanceRecords.slice(0, 4).map((rec) => {
                      const st = (rec.status || 'present').toLowerCase();
                      const isPresent = st === 'present';
                      const isLate = st === 'late';
                      const badgeTag = isPresent ? 'g' : isLate ? 'a' : 'r';
                      const badgeText = isPresent ? 'Present' : isLate ? 'Late' : 'Absent';

                      return (
                        <div
                          key={rec.id || rec._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid var(--line)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--mute)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={13} style={{ color: 'var(--p1)' }} />
                              <span>{formatDate(rec.date || rec.createdAt)}</span>
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                              {rec.className || user?.className || 'Roll Call'}
                            </span>
                          </div>

                          <span className={`tg ${badgeTag}`} style={{ textTransform: 'capitalize' }}>
                            {badgeText}
                          </span>
                        </div>
                      );
                    })}

                    <div style={{ marginTop: '8px', textAlign: 'right' }}>
                      <Link
                        to="/student/attendance"
                        style={{
                          color: 'var(--p1)',
                          fontSize: '13px',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        View attendance records ({studentAttendanceRecords.length}) →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <Timetable />
        )}

        <div className="cd">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '18px', margin: 0 }}>Announcements</h3>
            <Link
              to={`${basePath}/announcements`}
              className="ghost"
              style={{ border: 0, padding: 0, color: 'var(--g-p1, #1E6F78)', textDecoration: 'none' }}
            >
              View all →
            </Link>
          </div>

          {isLoadingAnnouncements ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Skeleton width="36px" height="36px" borderRadius="11px" />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Skeleton width="140px" height="16px" />
                    <Skeleton width="220px" height="12px" />
                  </div>
                </div>
              ))}
            </div>
          ) : isAnnouncementsError ? (
            <ErrorRetry
              message="Unable to load announcements."
              onRetry={refetchAnnouncements}
            />
          ) : announcements.length === 0 ? (
            <p style={{ color: 'var(--g-mute, #60797F)', fontSize: '13px', margin: '14px 0' }}>
              No recent announcements.
            </p>
          ) : (
            announcements.map((a) => {
              const sevColor = a.severity === 'High' ? 'r' : a.severity === 'Medium' ? 'a' : 'g';
              return (
                <div key={a.id} className="an">
                  <span className="ib">
                    <Icon name="mega" />
                  </span>
                  <div>
                    <h3>
                      {a.title}
                      <Tag color={sevColor}>{a.severity}</Tag>
                    </h3>
                    <p>{a.description}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
