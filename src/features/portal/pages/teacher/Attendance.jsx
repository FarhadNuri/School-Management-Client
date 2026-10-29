import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit3,
  Users,
  Search,
  School,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CalendarCheck,
  Plus,
  BookOpen
} from 'lucide-react';
import {
  useTeacherAttendanceSections,
  useSectionMonthlyAttendance,
  useSectionDailyAttendance,
  useSaveSectionDailyAttendance,
  useDebounce
} from '../../hooks/usePortalQueries';
import { getTodayDateString } from '../../utils/dateUtils';
import { showToast } from '../../../../components/ui/Toast';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TeacherAttendance() {
  // Navigation State
  const [selectedSection, setSelectedSection] = useState(null);
  // mode: 'give' | 'view'
  const [mode, setMode] = useState('give');
  // selectedDate: 'YYYY-MM-DD' | null
  const [selectedDate, setSelectedDate] = useState(null);

  // Selected section filter card
  const [selectedClassId, setSelectedClassId] = useState('all');

  // Search filter for sections
  const [sectionSearch, setSectionSearch] = useState('');
  const debouncedSectionSearch = useDebounce(sectionSearch, 300);

  // Month navigation state
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-indexed

  // Fetch teacher sections
  const {
    data: sectionsData,
    isLoading: isLoadingSections,
    isError: isSectionsError,
    error: sectionsError,
    refetch: refetchSections
  } = useTeacherAttendanceSections();

  const sections = sectionsData?.sections || [];

  // Filter sections by selected section filter card and search
  const filteredSections = useMemo(() => {
    let list = sections;

    if (selectedClassId !== 'all') {
      list = list.filter((s) => String(s.id || s._id) === String(selectedClassId));
    }

    if (debouncedSectionSearch.trim()) {
      const q = debouncedSectionSearch.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.className?.toLowerCase().includes(q) ||
          s.classCode?.toLowerCase().includes(q) ||
          String(s.grade).includes(q)
      );
    }

    return list;
  }, [sections, selectedClassId, debouncedSectionSearch]);

  // Fetch monthly attendance when section & month are selected
  const {
    data: monthlyData,
    isLoading: isLoadingMonthly,
    refetch: refetchMonthly
  } = useSectionMonthlyAttendance(
    selectedSection?.id || selectedSection?._id,
    currentYear,
    currentMonth,
    { enabled: Boolean(selectedSection && !selectedDate) }
  );

  // Fetch daily attendance when date is selected
  const {
    data: dailyData,
    isLoading: isLoadingDaily,
    refetch: refetchDaily
  } = useSectionDailyAttendance(
    selectedSection?.id || selectedSection?._id,
    selectedDate,
    { enabled: Boolean(selectedSection && selectedDate) }
  );

  // Mutation to save daily attendance
  const saveDailyMutation = useSaveSectionDailyAttendance();
  const isSaving = saveDailyMutation.isPending;

  // Local state for roll call roster
  const [localRoster, setLocalRoster] = useState([]);
  const [isEditingInViewMode, setIsEditingInViewMode] = useState(false);

  // Sync dailyData into local editable roster
  useEffect(() => {
    if (dailyData?.roster) {
      setLocalRoster(
        dailyData.roster.map((s) => ({
          studentId: s.studentId,
          name: s.name,
          photo: s.photo,
          status: s.status || null,
          note: s.note || ''
        }))
      );
      if (mode === 'view') {
        setIsEditingInViewMode(false);
      } else {
        setIsEditingInViewMode(true);
      }
    }
  }, [dailyData, mode]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  };

  // Mark all students present locally
  const handleMarkAllPresent = () => {
    setLocalRoster((prev) =>
      prev.map((student) => ({
        ...student,
        status: 'present'
      }))
    );
  };

  // Change individual student status
  const handleStatusChange = (studentId, newStatus) => {
    setLocalRoster((prev) =>
      prev.map((student) =>
        student.studentId === studentId ? { ...student, status: newStatus } : student
      )
    );
  };

  // Change individual student note
  const handleNoteChange = (studentId, newNote) => {
    setLocalRoster((prev) =>
      prev.map((student) =>
        student.studentId === studentId ? { ...student, note: newNote } : student
      )
    );
  };

  // Save attendance submission
  const handleSaveAttendance = async () => {
    if (!selectedSection || !selectedDate) return;

    const recordsToSave = localRoster
      .filter((s) => s.status)
      .map((s) => ({
        studentId: s.studentId,
        status: s.status,
        note: s.note || ''
      }));

    if (recordsToSave.length === 0) {
      showToast('Please mark at least one student before saving.', 'error');
      return;
    }

    try {
      await saveDailyMutation.mutateAsync({
        classId: selectedSection.id || selectedSection._id,
        date: selectedDate,
        records: recordsToSave
      });

      setIsEditingInViewMode(false);
      refetchMonthly();
      refetchDaily();
    } catch (err) {
      // Error handled by mutation
    }
  };

  // Helper: compute summary counts from local roster
  const rosterCounts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    let unmarked = 0;

    localRoster.forEach((s) => {
      if (s.status === 'present') present++;
      else if (s.status === 'absent') absent++;
      else if (s.status === 'late') late++;
      else if (s.status === 'excused') excused++;
      else unmarked++;
    });

    const total = localRoster.length;
    const marked = total - unmarked;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { total, marked, unmarked, present, absent, late, excused, rate };
  }, [localRoster]);

  // Calendar math for monthly grid
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ empty: true, key: `empty-${i}` });
    }

    const todayStr = getTodayDateString();
    const dayStats = monthlyData?.days || {};

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const stat = dayStats[d] || {
        hasRecords: false,
        markedCount: 0,
        rosterSize: selectedSection?.studentCount || 0,
        present: 0,
        absent: 0,
        late: 0,
        attendanceRate: 0
      };

      days.push({
        empty: false,
        day: d,
        dateStr,
        isToday: dateStr === todayStr,
        stat,
        key: dateStr
      });
    }

    return days;
  }, [currentYear, currentMonth, monthlyData, selectedSection]);

  // =========================================================================
  // RENDER 1: DAILY ROLL CALL / VIEW DETAILS VIEW
  // =========================================================================
  if (selectedSection && selectedDate) {
    const isEditMode = mode === 'give';
    const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Top Header & Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '12px 18px',
            background: 'var(--card)',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            boxShadow: 'var(--sh)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => {
                setSelectedDate(null);
                refetchMonthly();
              }}
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 14px',
                borderRadius: '10px',
                background: 'var(--soft)',
                border: '1px solid var(--line)',
                color: '#F8FAFC',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Calendar</span>
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>
                  {selectedSection.className}
                </h2>
                {selectedSection.mySubject && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(20, 184, 166, 0.15)',
                      color: '#14B8A6',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <BookOpen size={12} />
                    <span>{selectedSection.mySubject}</span>
                    {selectedSection.myCourseCode ? ` (${selectedSection.myCourseCode})` : ''}
                  </span>
                )}
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: mode === 'give' ? 'rgba(20,184,166,.18)' : 'rgba(37,99,235,.18)',
                    color: mode === 'give' ? '#2DD4BF' : '#60A5FA',
                    textTransform: 'uppercase'
                  }}
                >
                  {mode === 'give' ? 'Take Attendance' : 'Attendance Record'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', color: 'var(--mute)', fontSize: '12.5px' }}>
                {formattedDate} • Daily School Roll Call
              </p>
            </div>
          </div>

          {/* Mode or Action toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            

            {isEditMode && (
              <button
                onClick={handleMarkAllPresent}
                className="btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: 'rgba(22,163,74,.15)',
                  color: '#4ADE80',
                  border: '1px solid rgba(22,163,74,.3)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <Check size={16} strokeWidth={2.5} />
                <span>Mark All Present</span>
              </button>
            )}

            {isEditMode && (
              <button
                onClick={handleSaveAttendance}
                disabled={isSaving}
                className="btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--p1), var(--p2))',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(15,59,68,.3)'
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Save Attendance</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Top Summary Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px'
          }}
        >
          <div
            className="cd"
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderLeft: '4px solid var(--mute)'
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--mute)', fontWeight: 700 }}>
              TOTAL ROSTER
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC', marginTop: '2px' }}>
              {rosterCounts.total}
            </div>
          </div>

          <div
            className="cd"
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderLeft: '4px solid #16A34A'
            }}
          >
            <span style={{ fontSize: '11px', color: '#4ADE80', fontWeight: 700 }}>
              PRESENT
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#4ADE80', marginTop: '2px' }}>
              {rosterCounts.present}
            </div>
          </div>

          <div
            className="cd"
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderLeft: '4px solid #DC2626'
            }}
          >
            <span style={{ fontSize: '11px', color: '#F87171', fontWeight: 700 }}>
              ABSENT
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#F87171', marginTop: '2px' }}>
              {rosterCounts.absent}
            </div>
          </div>

          <div
            className="cd"
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderLeft: '4px solid #D97706'
            }}
          >
            <span style={{ fontSize: '11px', color: '#FBBF24', fontWeight: 700 }}>
              LATE
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#FBBF24', marginTop: '2px' }}>
              {rosterCounts.late}
            </div>
          </div>

          <div
            className="cd"
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderLeft: '4px solid #2563EB'
            }}
          >
            <span style={{ fontSize: '11px', color: '#60A5FA', fontWeight: 700 }}>
              EXCUSED
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#60A5FA', marginTop: '2px' }}>
              {rosterCounts.excused}
            </div>
          </div>

          <div
            className="cd"
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderLeft: '4px solid var(--p1)'
            }}
          >
            <span style={{ fontSize: '11px', color: '#2DD4BF', fontWeight: 700 }}>
              ATTENDANCE RATE
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#2DD4BF', marginTop: '2px' }}>
              {rosterCounts.rate}%
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingDaily ? (
          <div
            className="cd"
            style={{
              padding: '50px',
              textAlign: 'center',
              borderRadius: '16px',
              background: 'var(--card)'
            }}
          >
            <Loader2 size={32} className="spin" style={{ color: 'var(--p1)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--mute)' }}>Loading section student roster...</p>
          </div>
        ) : localRoster.length === 0 ? (
          <div
            className="cd"
            style={{
              padding: '50px 24px',
              textAlign: 'center',
              borderRadius: '16px',
              background: 'var(--card)',
              border: '1px solid var(--line)'
            }}
          >
            <Users size={40} style={{ color: 'var(--mute)', margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 6px', fontWeight: 700, color: '#F8FAFC' }}>No Students Enrolled</h3>
            <p style={{ color: 'var(--mute)', margin: 0, fontSize: '13px' }}>
              There are no students assigned to this section yet.
            </p>
          </div>
        ) : (
          /* Students Roster Card */
          <div
            className="cd"
            style={{
              borderRadius: '16px',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              overflow: 'hidden',
              boxShadow: 'var(--sh)'
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <b style={{ fontSize: '14.5px', color: '#F8FAFC' }}>Student Attendance Roster</b>
                <span style={{ marginLeft: '10px', fontSize: '12px', color: 'var(--mute)' }}>
                  {localRoster.length} Students Total
                </span>
              </div>
              {rosterCounts.unmarked > 0 && isEditMode && (
                <span
                  style={{
                    fontSize: '11.5px',
                    color: '#FBBF24',
                    background: 'rgba(217,119,6,.15)',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontWeight: 700
                  }}
                >
                  {rosterCounts.unmarked} students unmarked
                </span>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--line)',
                      background: 'rgba(255,255,255,0.03)',
                      fontSize: '11px',
                      color: '#CBD5E1',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em'
                    }}
                  >
                    <th style={{ padding: '12px 18px', width: '50px' }}>#</th>
                    <th style={{ padding: '12px 18px' }}>Student</th>
                    <th style={{ padding: '12px 18px', minWidth: '320px' }}>Attendance Status</th>
                    <th style={{ padding: '12px 18px', minWidth: '220px' }}>Remarks / Note</th>
                  </tr>
                </thead>
                <tbody>
                  {localRoster.map((student, idx) => {
                    const status = student.status;
                    return (
                      <tr
                        key={student.studentId}
                        style={{
                          borderBottom: '1px solid var(--line)',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td
                          style={{
                            padding: '12px 18px',
                            color: 'var(--mute)',
                            fontSize: '13px',
                            fontWeight: 600
                          }}
                        >
                          {idx + 1}
                        </td>

                        <td style={{ padding: '12px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {student.photo ? (
                              <img
                                src={student.photo}
                                alt={student.name}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '10px',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <span
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '10px',
                                  background: 'rgba(20,184,166,.18)',
                                  color: '#2DD4BF',
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontWeight: 800,
                                  fontSize: '14px'
                                }}
                              >
                                {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                              </span>
                            )}
                            <div>
                              <b style={{ display: 'block', fontSize: '13.5px', color: '#F8FAFC' }}>
                                {student.name}
                              </b>
                              <span style={{ fontSize: '11px', color: 'var(--mute)' }}>
                                ID: {student.studentId.slice(-6).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '12px 18px' }}>
                          {isEditMode ? (
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              {[
                                { key: 'present', label: 'Present', color: '#16A34A', bg: '#16A34A' },
                                { key: 'absent', label: 'Absent', color: '#DC2626', bg: '#DC2626' },
                                { key: 'late', label: 'Late', color: '#D97706', bg: '#D97706' },
                                { key: 'excused', label: 'Excused', color: '#2563EB', bg: '#2563EB' }
                              ].map((opt) => {
                                const isSelected = status === opt.key;
                                return (
                                  <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => handleStatusChange(student.studentId, opt.key)}
                                    style={{
                                      padding: '6px 13px',
                                      borderRadius: '8px',
                                      border: isSelected ? `2px solid ${opt.color}` : '1px solid var(--line)',
                                      background: isSelected ? opt.bg : 'rgba(255,255,255,0.03)',
                                      color: isSelected ? '#fff' : '#CBD5E1',
                                      fontWeight: isSelected ? 800 : 600,
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div>
                              {status ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    textTransform: 'capitalize',
                                    background:
                                      status === 'present'
                                        ? 'rgba(22,163,74,.15)'
                                        : status === 'absent'
                                        ? 'rgba(220,38,38,.15)'
                                        : status === 'late'
                                        ? 'rgba(217,119,6,.15)'
                                        : 'rgba(37,99,235,.15)',
                                    color:
                                      status === 'present'
                                        ? '#4ADE80'
                                        : status === 'absent'
                                        ? '#F87171'
                                        : status === 'late'
                                        ? '#FBBF24'
                                        : '#60A5FA'
                                  }}
                                >
                                  {status === 'present' && <CheckCircle2 size={13} />}
                                  {status === 'absent' && <XCircle size={13} />}
                                  {status === 'late' && <Clock size={13} />}
                                  {status === 'excused' && <AlertCircle size={13} />}
                                  <span>{status}</span>
                                </span>
                              ) : (
                                <span style={{ color: 'var(--mute)', fontSize: '12.5px' }}>Unrecorded</span>
                              )}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '12px 18px' }}>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={student.note || ''}
                              onChange={(e) => handleNoteChange(student.studentId, e.target.value)}
                              placeholder="Optional remarks..."
                              maxLength={200}
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: '1px solid var(--line)',
                                background: 'rgba(255,255,255,0.03)',
                                color: '#F8FAFC',
                                fontSize: '12px',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <span style={{ color: student.note ? '#F8FAFC' : 'var(--mute)', fontSize: '12.5px' }}>
                              {student.note || '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Save Bar when editing */}
            {isEditMode && (
              <div
                style={{
                  padding: '14px 20px',
                  background: 'rgba(255,255,255,0.02)',
                  borderTop: '1px solid var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px'
                }}
              >
                {mode === 'view' && (
                  <button
                    type="button"
                    onClick={() => setIsEditingInViewMode(false)}
                    className="btn"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: 'var(--soft)',
                      border: '1px solid var(--line)',
                      color: 'var(--mute)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '12.5px'
                    }}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={isSaving}
                  className="btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 22px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, var(--p1), var(--p2))',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(15,59,68,.3)'
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Save Attendance</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // RENDER 2: MONTHLY CALENDAR GRID VIEW (SINGLE-PAGE FIXED, ZERO SCROLL)
  // =========================================================================
  if (selectedSection && !selectedDate) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Unified Command & Navigation Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 18px',
            background: 'var(--card)',
            borderRadius: '16px',
            border: '1px solid var(--line)',
            boxShadow: 'var(--sh)',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          {/* Left: Back button & Section details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSelectedSection(null)}
              className="btn"
              title="Back to Sections"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '10px',
                background: 'var(--soft)',
                border: '1px solid var(--line)',
                color: '#F8FAFC',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12.5px'
              }}
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>
                {selectedSection.className}
              </h2>
              {selectedSection.mySubject && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(20, 184, 166, 0.15)',
                    color: '#14B8A6',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <BookOpen size={12} />
                  <span>{selectedSection.mySubject}</span>
                  {selectedSection.myCourseCode ? ` (${selectedSection.myCourseCode})` : ''}
                </span>
              )}
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'rgba(20,184,166,.15)',
                  color: '#2DD4BF'
                }}
              >
                {selectedSection.studentCount} Students
              </span>
            </div>
          </div>

          {/* Center: Perfectly Aligned Month Navigator & Today Button */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '4px 8px',
              borderRadius: '12px',
              border: '1px solid var(--line)',
              height: '38px',
              boxSizing: 'border-box'
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                margin: 0,
                lineHeight: 1,
                transition: 'all 0.15s ease'
              }}
            >
              <ChevronLeft size={16} style={{ display: 'block' }} />
            </button>

            <div
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#FFFFFF',
                padding: '0 10px',
                minWidth: '135px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                userSelect: 'none'
              }}
            >
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                margin: 0,
                lineHeight: 1,
                transition: 'all 0.15s ease'
              }}
            >
              <ChevronRight size={16} style={{ display: 'block' }} />
            </button>

            <button
              type="button"
              onClick={handleGoToToday}
              title="Jump to Today"
              style={{
                height: '30px',
                padding: '0 12px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                marginLeft: '6px',
                boxShadow: '0 2px 8px rgba(20, 184, 166, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              Today
            </button>
          </div>

          {/* Right: Mode Switcher */}
          <div
            style={{
              display: 'inline-flex',
              padding: '3px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid var(--line)'
            }}
          >
            <button
              onClick={() => setMode('give')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9px',
                border: 'none',
                background: mode === 'give' ? 'var(--p1)' : 'transparent',
                color: mode === 'give' ? '#fff' : '#94A3B8',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <CheckCircle2 size={14} />
              <span>Give Attendance</span>
            </button>

            <button
              onClick={() => setMode('view')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9px',
                border: 'none',
                background: mode === 'view' ? 'var(--p1)' : 'transparent',
                color: mode === 'view' ? '#fff' : '#94A3B8',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Eye size={14} />
              <span>View Attendance</span>
            </button>
          </div>
        </div>

        {/* Calendar Month Grid Card (Fixed single page, no scroll) */}
        <div
          className="cd"
          style={{
            padding: '14px 18px',
            borderRadius: '18px',
            background: 'var(--card)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--sh)'
          }}
        >
          {/* Weekday Labels Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
              textAlign: 'center',
              marginBottom: '8px'
            }}
          >
            {WEEKDAY_NAMES.map((name, i) => (
              <div
                key={name}
                style={{
                  padding: '4px 0',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: (i === 5 || i === 6) ? '#38BDF8' : '#CBD5E1'
                }}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Month Day Cells */}
          {isLoadingMonthly ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Loader2 size={32} className="spin" style={{ color: 'var(--p1)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--mute)' }}>Loading monthly attendance grid...</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '6px'
              }}
            >
              {calendarDays.map((item) => {
                if (item.empty) {
                  return (
                    <div
                      key={item.key}
                      style={{
                        height: '56px',
                        background: 'transparent',
                        borderRadius: '12px',
                        border: '1px dashed rgba(255,255,255,0.03)'
                      }}
                    />
                  );
                }

                const { day, dateStr, isToday, stat } = item;
                const hasRecords = stat?.hasRecords;
                const isClickable = mode === 'give' || hasRecords;

                return (
                  <div
                    key={item.key}
                    onClick={isClickable ? () => setSelectedDate(dateStr) : undefined}
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : -1}
                    className={`att-day-cell ${isClickable ? 'att-day-cell-clickable' : ''}`}
                    style={{
                      height: '56px',
                      padding: '6px 8px',
                      borderRadius: '12px',
                      background: isToday
                        ? 'rgba(20,184,166,0.12)'
                        : hasRecords
                        ? 'rgba(34,197,94,0.06)'
                        : 'rgba(255,255,255,0.035)',
                      border: isToday
                        ? '1.5px solid #14B8A6'
                        : hasRecords
                        ? '1px solid rgba(34,197,94,0.35)'
                        : '1px solid rgba(255,255,255,0.08)',
                      cursor: isClickable ? 'pointer' : 'default',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      boxShadow: isToday ? '0 0 10px rgba(20,184,166,0.2)' : 'none',
                      opacity: mode === 'view' && !hasRecords ? 0.75 : 1
                    }}
                  >
                    {/* Top Row: Date Number and Today Indicator */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '13.5px',
                          width: isToday ? '24px' : 'auto',
                          height: isToday ? '24px' : 'auto',
                          borderRadius: isToday ? '6px' : '0',
                          background: isToday ? '#14B8A6' : 'transparent',
                          color: isToday ? '#042F2E' : '#F8FAFC',
                          display: 'grid',
                          placeItems: 'center'
                        }}
                      >
                        {day}
                      </span>

                      {isToday && (
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 800,
                            color: '#2DD4BF',
                            letterSpacing: '0.5px'
                          }}
                        >
                          TODAY
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Clear, High-Contrast Attendance Status */}
                    {hasRecords ? (
                      <div>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '1px 6px',
                            borderRadius: '5px',
                            background: 'rgba(34,197,94,0.2)',
                            color: '#4ADE80',
                            fontSize: '10.5px',
                            fontWeight: 700
                          }}
                        >
                          <Check size={11} strokeWidth={3} />
                          <span>Marked ({stat.present + stat.late}/{stat.rosterSize})</span>
                        </div>
                      </div>
                    ) : mode === 'give' ? (
                      <div
                        className="att-add-record-text"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          color: '#2DD4BF',
                          opacity: 0.65,
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '0.2px',
                          transition: 'opacity 0.15s ease'
                        }}
                      >
                        <Plus size={10} strokeWidth={2.5} />
                        <span>Add Record</span>
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: '10.5px',
                          color: '#64748B',
                          fontWeight: 500,
                          userSelect: 'none'
                        }}
                      >
                        No records
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER 3: SECTION CARDS SELECTION (ENTRY VIEW)
  // =========================================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title & Introduction */}
      <div>
        <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>
          Section Attendance
        </h2>
        <p style={{ margin: 0, color: 'var(--mute)', fontSize: '13.5px', lineHeight: 1.5 }}>
          Pre-scheduled fixed routines: daily roll call ensures attendance across all classes for that day.
          Select your class section to take or view attendance.
        </p>
      </div>

      {/* Section Selection Cards - Same as Materials & Homeworks */}
      {sections.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--mute)',
              textTransform: 'uppercase',
              marginBottom: '10px',
              letterSpacing: '0.5px'
            }}
          >
            Select Section
          </div>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '6px'
            }}
          >
            {/* All Sections Card */}
            <div
              onClick={() => setSelectedClassId('all')}
              role="button"
              tabIndex={0}
              style={{
                padding: '14px 24px',
                borderRadius: '16px',
                background: selectedClassId === 'all' ? 'var(--p1)' : 'var(--card)',
                color: selectedClassId === 'all' ? '#fff' : 'var(--ink)',
                border: selectedClassId === 'all' ? '1px solid var(--p1)' : '1px solid var(--line)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: selectedClassId === 'all' ? '0 6px 16px rgba(15,59,68,.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <b style={{ fontSize: '15px' }}>All Sections</b>
            </div>

            {/* Individual Section Cards */}
            {sections.map((cls) => {
              const isSelected = String(cls.id || cls._id) === String(selectedClassId);

              return (
                <div
                  key={cls.id || cls._id}
                  onClick={() => setSelectedClassId(cls.id || cls._id)}
                  role="button"
                  tabIndex={0}
                  style={{
                    padding: '14px 24px',
                    borderRadius: '16px',
                    background: isSelected ? 'var(--p1)' : 'var(--card)',
                    color: isSelected ? '#fff' : 'var(--ink)',
                    border: isSelected ? '1px solid var(--p1)' : '1px solid var(--line)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: isSelected ? '0 6px 16px rgba(15,59,68,.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <b style={{ fontSize: '15px' }}>{cls.className}</b>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Bar for Sections */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          height: '46px',
          borderRadius: '14px',
          padding: '0 16px',
          background: 'var(--card)',
          border: '1px solid var(--line)',
          maxWidth: '420px'
        }}
      >
        <Search size={18} style={{ color: 'var(--mute)' }} />
        <input
          type="text"
          value={sectionSearch}
          onChange={(e) => setSectionSearch(e.target.value)}
          placeholder="Search assigned sections..."
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '13.5px',
            color: 'var(--ink)'
          }}
        />
      </div>

      <div style={{ margin: '-6px 0 0', color: 'var(--mute)', fontSize: '13px' }}>
        Showing <b style={{ color: 'var(--ink)' }}>{filteredSections.length}</b> section{filteredSections.length === 1 ? '' : 's'}
      </div>

      {/* Loading or Error State */}
      {isLoadingSections ? (
        <div
          className="cd"
          style={{
            padding: '60px',
            textAlign: 'center',
            borderRadius: '20px',
            background: 'var(--card)'
          }}
        >
          <Loader2 size={32} className="spin" style={{ color: 'var(--p1)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--mute)' }}>Loading your assigned sections...</p>
        </div>
      ) : isSectionsError ? (
        <div
          className="cd"
          style={{
            padding: '40px',
            textAlign: 'center',
            borderRadius: '20px',
            background: 'var(--card)',
            border: '1px solid #DC2626'
          }}
        >
          <AlertCircle size={36} style={{ color: '#DC2626', margin: '0 auto 10px' }} />
          <p style={{ color: '#DC2626', fontWeight: 700 }}>
            {sectionsError?.message || 'Failed to load sections.'}
          </p>
          <button
            onClick={() => refetchSections()}
            className="btn btn-p"
            style={{ marginTop: '10px', padding: '8px 18px', borderRadius: '10px' }}
          >
            Retry
          </button>
        </div>
      ) : filteredSections.length === 0 ? (
        <div
          className="cd"
          style={{
            padding: '50px 24px',
            textAlign: 'center',
            borderRadius: '20px',
            background: 'var(--card)',
            border: '1px solid var(--line)'
          }}
        >
          <School size={40} style={{ color: 'var(--mute)', margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 6px', fontWeight: 700 }}>No Sections Found</h3>
          <p style={{ color: 'var(--mute)', margin: 0, fontSize: '13px' }}>
            {sectionSearch ? 'No section matches your search.' : 'You have not been assigned to any class sections.'}
          </p>
        </div>
      ) : (
        /* Sections Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '18px'
          }}
        >
          {filteredSections.map((section) => (
            <div
              key={section.id || section._id}
              className="cd"
              style={{
                padding: '20px',
                borderRadius: '20px',
                overflow: 'hidden',
                boxSizing: 'border-box',
                background: 'var(--card)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--sh)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'transform 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '8px',
                      background: 'rgba(30,111,120,.12)',
                      color: 'var(--p1)',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    GRADE {section.grade || '—'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--mute)', fontWeight: 600 }}>
                    {section.academicYear || 'Current Year'}
                  </span>
                </div>

                {/* Subject Name above Class Name */}
                {section.mySubject ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '6px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: '#14B8A6',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <BookOpen size={14} />
                      <span>{section.mySubject}</span>
                    </span>
                    {section.myCourseCode && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background: 'rgba(20, 184, 166, 0.12)',
                          color: '#14B8A6'
                        }}
                      >
                        {section.myCourseCode}
                      </span>
                    )}
                  </div>
                ) : null}

                <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: 'var(--ink)' }}>
                  {section.className}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--mute)', fontSize: '13px' }}>
                  <Users size={15} />
                  <span>{section.studentCount} Students Enrolled</span>
                </div>
              </div>

              {/* Perfectly Proportioned Responsive Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--line)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <button
                  type="button"
                  className="att-card-btn-give"
                  onClick={() => {
                    setSelectedSection(section);
                    setMode('give');
                    setSelectedDate(null);
                  }}
                  style={{
                    flex: '1 1 0',
                    minWidth: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    height: '38px',
                    padding: '0 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(20, 184, 166, 0.25)',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box'
                  }}
                >
                  <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Give Attendance</span>
                </button>

                <button
                  type="button"
                  className="att-card-btn-view"
                  onClick={() => {
                    setSelectedSection(section);
                    setMode('view');
                    setSelectedDate(null);
                  }}
                  style={{
                    flex: '1 1 0',
                    minWidth: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    height: '38px',
                    padding: '0 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#F8FAFC',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box'
                  }}
                >
                  <Eye size={14} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>View Attendance</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
