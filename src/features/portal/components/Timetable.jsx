import { useState, useMemo } from 'react';
import { usePortalRole } from '../hooks/usePortalRole';
import { useMyRoutine } from '../hooks/usePortalQueries';
import Skeleton from './Skeleton';
import { Clock, Coffee, Sparkles, User, RefreshCw } from 'lucide-react';

const SUBJECT_COLORS = {
  Math: '#D6ECEC',
  'English 1st': '#E8E4F3',
  'English 2nd': '#E0DDF0',
  English: '#E8E4F3',
  Science: '#DDEBDD',
  'Bangla 1st': '#FBE3D6',
  'Bangla 2nd': '#F7D9C9',
  Bangla: '#FBE3D6',
  BGS: '#F6E7CF',
  'Agri/Home Ec': '#E3EAEE',
  ICT: '#E2F0D9',
  Religion: '#FFF2CC',
  'Physical Ed': '#D9E1F2',
  'Arts & Crafts': '#FCE4D6',
  'Free Period': 'rgba(255, 255, 255, 0.04)',
};

const getSubjectBg = (subject) => {
  if (!subject || subject === 'Free Period') return 'rgba(255, 255, 255, 0.04)';
  if (SUBJECT_COLORS[subject]) return SUBJECT_COLORS[subject];
  for (const [key, color] of Object.entries(SUBJECT_COLORS)) {
    if (subject.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return 'var(--g-soft, #DDEBDD)';
};

const PERIOD_ROWS = [
  { period: 1, label: '8:30 AM', time: '08:30–09:15', isBreak: false },
  { period: 2, label: '9:15 AM', time: '09:15–10:00', isBreak: false },
  { period: 3, label: '10:00 AM', time: '10:00–10:45', isBreak: false },
  { period: 'break', label: '10:45 AM', time: '10:45–11:15', isBreak: true },
  { period: 4, label: '11:15 AM', time: '11:15–12:00', isBreak: false },
  { period: 5, label: '12:00 PM', time: '12:00–12:45', isBreak: false },
  { period: 6, label: '12:45 PM', time: '12:45–01:30', isBreak: false },
];

const WEEK_DAYS = [
  { full: 'Sunday', short: 'SUN', num: '1' },
  { full: 'Monday', short: 'MON', num: '2' },
  { full: 'Tuesday', short: 'TUE', num: '3' },
  { full: 'Wednesday', short: 'WED', num: '4' },
  { full: 'Thursday', short: 'THU', num: '5' },
];

export default function Timetable() {
  const { role, user } = usePortalRole();
  const [activeTab, setActiveTab] = useState(0); // 0 = This week, 1 = Day
  const [selectedDayIdx, setSelectedDayIdx] = useState(0); // 0..4
  const [activeStudentId, setActiveStudentId] = useState('');

  const { data: routineRes, isLoading, isError, refetch, isFetching } = useMyRoutine(activeStudentId);

  const wards = routineRes?.wards || [];
  const isGuardian = role === 'guardian';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  // Active routine
  const routine = routineRes?.routine;
  const schedule = routine?.schedule || [];

  // Active ward or student info
  const currentWard = useMemo(() => {
    if (!wards.length) return null;
    return wards.find((w) => w.studentId === activeStudentId) || wards[0];
  }, [wards, activeStudentId]);

  const routineTitle = isGuardian
    ? currentWard
      ? `${currentWard.studentName}'s Routine (${currentWard.className || 'Class'})`
      : 'Ward Routine'
    : isTeacher
    ? `${routine?.title || 'Faculty Routine'} (Weekly Schedule)`
    : routine?.title || 'Weekly Class Timetable';

  return (
    <div className="cd" style={{ position: 'relative' }}>
      {/* Top Header Row */}
      <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '18px', margin: 0, fontWeight: 800 }}>Timetable</h3>
            {isFetching && (
              <RefreshCw
                size={13}
                style={{ color: 'var(--p1)', animation: 'spin 1s linear infinite' }}
              />
            )}
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: 'var(--mute)' }}>
            {routineTitle} • Sunday – Thursday
          </p>
        </div>

        {/* View Chips (This Week / Day) */}
        <span className="chips" style={{ margin: '0 0 0 auto' }}>
          <span
            className={`ch ${activeTab === 0 ? 'on' : ''}`}
            onClick={() => setActiveTab(0)}
          >
            This week
          </span>
          <span
            className={`ch ${activeTab === 1 ? 'on' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            Day
          </span>
        </span>
      </div>

      {/* GUARDIAN SECTION SWITCHER (When guardian has 1+ enrolled students) */}
      {isGuardian && wards.length > 1 && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--mute)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <User size={13} style={{ color: 'var(--p1)' }} /> Switch Class:
          </span>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {wards.map((ward) => {
              const isActive = (activeStudentId ? activeStudentId === ward.studentId : wards[0]?.studentId === ward.studentId);
              return (
                <button
                  key={ward.studentId}
                  type="button"
                  onClick={() => setActiveStudentId(ward.studentId)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isActive ? '1px solid var(--p1)' : '1px solid var(--line)',
                    background: isActive ? 'var(--p1)' : 'var(--soft, rgba(255,255,255,0.04))',
                    color: isActive ? '#FFFFFF' : 'var(--ink)',
                  }}
                >
                  {ward.studentName} — <span style={{ opacity: 0.9 }}>{ward.className}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} width="100%" height="42px" borderRadius="10px" />
          ))}
        </div>
      ) : isError || !routine ? (
        <div
          style={{
            padding: '30px 16px',
            textAlign: 'center',
            color: 'var(--mute)',
            fontSize: '13px',
          }}
        >
          <Clock size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
          <p style={{ margin: 0, fontWeight: 600 }}>No routine published yet.</p>
          <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
            The administration will publish the updated timetable shortly.
          </p>
        </div>
      ) : (
        <>
          {/* TAB 0: THIS WEEK VIEW (Exact 5-Day Grid from User Screenshot & PDF) */}
          {activeTab === 0 && (
            <div className="tt" style={{ marginTop: '14px', overflowX: 'auto' }}>
              {/* Top Row: Empty corner followed by 5 Days */}
              <i></i>
              {WEEK_DAYS.map((d) => (
                <div key={d.short} className="h">
                  {d.short}
                  <b>{d.num}</b>
                </div>
              ))}

              {/* Rows for each Period & Break */}
              {PERIOD_ROWS.map((row) => {
                if (row.isBreak) {
                  return (
                    <div key="tiffin-break" style={{ display: 'contents' }}>
                      <div className="t" style={{ fontSize: '10px', color: '#B25E29', fontWeight: 800 }}>
                        {row.label}
                      </div>
                      {WEEK_DAYS.map((d) => (
                        <div
                          key={`break-${d.short}`}
                          className="s"
                          style={{
                            background: 'rgba(245, 158, 108, 0.16)',
                            color: '#B25E29',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            border: '1px dashed rgba(245, 158, 108, 0.4)',
                          }}
                        >
                          <Coffee size={11} />
                          <span>Tiffin</span>
                        </div>
                      ))}
                    </div>
                  );
                }

                // Regular Period Row (1, 2, 3, 4, 5, 6)
                return (
                  <div key={row.period} style={{ display: 'contents' }}>
                    <div className="t" title={row.time}>
                      {row.label}
                    </div>

                    {WEEK_DAYS.map((d) => {
                      const daySchedule = schedule.find(
                        (s) => s.day.toLowerCase() === d.full.toLowerCase()
                      );
                      const periodData = daySchedule?.periods?.find(
                        (p) => p.periodNumber === row.period
                      );
                      const rawSubject = periodData?.subject || '—';
                      const isFree = !rawSubject || rawSubject === 'Free Period' || rawSubject === '—';
                      const displayTitle = isFree ? (isTeacher ? 'Free' : '—') : rawSubject;
                      const displaySub = isTeacher ? periodData?.sectionName : periodData?.teacherName;
                      const bg = getSubjectBg(rawSubject);

                      return (
                        <div
                          key={`${d.short}-p${row.period}`}
                          className="s"
                          style={{
                            background: bg,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            minHeight: '46px',
                            opacity: isFree ? 0.45 : 1,
                            transition: 'transform 0.1s ease',
                          }}
                          title={isFree ? 'Free Period' : `${rawSubject} ${displaySub ? `(${displaySub})` : ''} - ${row.time}`}
                        >
                          <span style={{ fontSize: '12px', fontWeight: 800, color: isFree ? 'var(--mute)' : '#0A1C24' }}>
                            {displayTitle}
                          </span>
                          {!isFree && displaySub && (
                            <span
                              style={{
                                fontSize: '10px',
                                color: '#3A5055',
                                fontWeight: 600,
                                marginTop: '1px',
                              }}
                            >
                              {displaySub}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 1: DAY VIEW (Detailed view for selected day) */}
          {activeTab === 1 && (
            <div style={{ marginTop: '14px' }}>
              {/* Day selector tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  marginBottom: '16px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                }}
              >
                {WEEK_DAYS.map((d, idx) => {
                  const isSelected = selectedDayIdx === idx;
                  return (
                    <button
                      key={d.full}
                      type="button"
                      onClick={() => setSelectedDayIdx(idx)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: isSelected ? '1px solid var(--p1)' : '1px solid var(--line)',
                        background: isSelected ? 'var(--p1)' : 'var(--soft)',
                        color: isSelected ? '#FFFFFF' : 'var(--ink)',
                      }}
                    >
                      {d.full}
                    </button>
                  );
                })}
              </div>

              {/* Day period cards list */}
              {(() => {
                const selectedDay = WEEK_DAYS[selectedDayIdx];
                const daySchedule = schedule.find(
                  (s) => s.day.toLowerCase() === selectedDay.full.toLowerCase()
                );
                const dayPeriods = daySchedule?.periods || [];

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {PERIOD_ROWS.map((row) => {
                      if (row.isBreak) {
                        return (
                          <div
                            key="day-break"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 16px',
                              borderRadius: '12px',
                              background: 'rgba(245, 158, 108, 0.12)',
                              border: '1px dashed rgba(245, 158, 108, 0.35)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Coffee size={15} style={{ color: '#B25E29' }} />
                              <span style={{ fontSize: '13px', fontWeight: 800, color: '#B25E29' }}>
                                Tiffin Break
                              </span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#B25E29', fontWeight: 600 }}>
                              {row.time}
                            </span>
                          </div>
                        );
                      }

                      const periodData = dayPeriods.find((p) => p.periodNumber === row.period);
                      const rawSubject = periodData?.subject || 'Free Period';
                      const isFree = !rawSubject || rawSubject === 'Free Period';
                      const displayTitle = isFree ? 'Free Period' : rawSubject;
                      const displaySub = isTeacher
                        ? periodData?.sectionName ? `Section: ${periodData.sectionName}` : ''
                        : periodData?.teacherName ? `Instructor: ${periodData.teacherName}` : '';
                      const bg = getSubjectBg(rawSubject);

                      return (
                        <div
                          key={`day-p${row.period}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid var(--line)',
                            opacity: isFree ? 0.6 : 1,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '12px',
                                color: isFree ? 'var(--mute)' : '#0A1C24',
                              }}
                            >
                              P{row.period}
                            </div>
                            <div>
                              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
                                {displayTitle}
                              </div>
                              {displaySub && (
                                <div style={{ fontSize: '12px', color: 'var(--mute)' }}>
                                  {displaySub}
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ fontSize: '12px', color: 'var(--mute)', fontWeight: 600 }}>
                            {row.time}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
