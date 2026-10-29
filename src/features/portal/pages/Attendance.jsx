import React, { useState, useMemo } from 'react';
import { usePortalRole } from '../hooks/usePortalRole';
import {
  useStudentAttendance,
  useStudentAttendanceSummary,
  useDebounce
} from '../hooks/usePortalQueries';
import SearchBar from '../components/SearchBar';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorRetry from '../components/ErrorRetry';
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  User,
  School,
  FileText
} from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

export default function StudentAttendance() {
  const { user } = usePortalRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'present', 'late', 'absent'
  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    data: attendanceData,
    isLoading: isLoadingRecords,
    isError: isRecordsError,
    error: recordsError,
    refetch: refetchRecords
  } = useStudentAttendance({ status: statusFilter });

  const {
    data: summaryData,
    isLoading: isLoadingSummary
  } = useStudentAttendanceSummary();

  const rawRecords = attendanceData?.attendance || [];

  const filteredRecords = useMemo(() => {
    let list = [...rawRecords];

    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.className?.toLowerCase().includes(q) ||
          r.teacherName?.toLowerCase().includes(q) ||
          r.note?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [rawRecords, statusFilter, debouncedSearch]);

  const summary = summaryData || {};
  const hasSummaryCounts = Boolean(summary.total !== undefined && summary.total > 0);

  const total = hasSummaryCounts ? summary.total : rawRecords.length;
  const present = hasSummaryCounts && summary.present !== undefined
    ? summary.present
    : rawRecords.filter((r) => r.status?.toLowerCase() === 'present').length;
  const late = hasSummaryCounts && summary.late !== undefined
    ? summary.late
    : rawRecords.filter((r) => r.status?.toLowerCase() === 'late').length;
  const absent = hasSummaryCounts && summary.absent !== undefined
    ? summary.absent
    : rawRecords.filter((r) => r.status?.toLowerCase() === 'absent').length;

  const rate = summary.rate !== undefined && hasSummaryCounts
    ? summary.rate
    : (total > 0 ? Math.round(((present + late) / total) * 100) : 100);

  return (
    <>
      <div className="pt" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px', color: 'var(--ink)' }}>
          Attendance
        </h2>
        <p style={{ margin: 0, color: 'var(--mute)', fontSize: '14px' }}>
          Track your attendance records and session presence rate
        </p>
      </div>

      {/* 4 Presence KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div
          className="cd"
          style={{
            padding: '18px 22px',
            borderRadius: '18px',
            background: 'var(--card)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--sh)'
          }}
        >
          <small style={{ color: 'var(--mute)', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase' }}>
            Attendance Rate
          </small>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--p1)', margin: '4px 0' }}>
            {isLoadingSummary ? '...' : `${rate}%`}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--mute)' }}>Overall presence</span>
        </div>

        <div
          className="cd"
          style={{
            padding: '18px 22px',
            borderRadius: '18px',
            background: 'var(--card)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--sh)'
          }}
        >
          <small style={{ color: 'var(--mute)', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase' }}>
            Present
          </small>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#10B981', margin: '4px 0' }}>
            {isLoadingSummary ? '...' : present}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--mute)' }}>Sessions on time</span>
        </div>

        <div
          className="cd"
          style={{
            padding: '18px 22px',
            borderRadius: '18px',
            background: 'var(--card)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--sh)'
          }}
        >
          <small style={{ color: 'var(--mute)', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase' }}>
            Late
          </small>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#F59E0B', margin: '4px 0' }}>
            {isLoadingSummary ? '...' : late}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--mute)' }}>Tardy sessions</span>
        </div>

        <div
          className="cd"
          style={{
            padding: '18px 22px',
            borderRadius: '18px',
            background: 'var(--card)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--sh)'
          }}
        >
          <small style={{ color: 'var(--mute)', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase' }}>
            Absent
          </small>
          <div style={{ fontSize: '32px', fontWeight: 800, color: absent > 0 ? '#EF4444' : 'var(--mute)', margin: '4px 0' }}>
            {isLoadingSummary ? '...' : absent}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--mute)' }}>Missed sessions</span>
        </div>
      </div>

      {/* Search & Filter Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        <SearchBar
          placeholder="Search attendance by notes, class, or teacher..."
          value={searchTerm}
          onChange={setSearchTerm}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Records (${rawRecords.length})` },
            { id: 'present', label: 'Present' },
            { id: 'late', label: 'Late' },
            { id: 'absent', label: 'Absent' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                background: statusFilter === tab.id ? 'var(--p1)' : 'var(--card)',
                color: statusFilter === tab.id ? '#fff' : 'var(--ink)',
                border: statusFilter === tab.id ? '1px solid var(--p1)' : '1px solid var(--line)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoadingRecords && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} width="100%" height="64px" borderRadius="14px" />
          ))}
        </div>
      )}

      {isRecordsError && (
        <ErrorRetry
          message={recordsError?.message || 'Unable to load attendance records.'}
          onRetry={refetchRecords}
        />
      )}

      {!isLoadingRecords && !isRecordsError && filteredRecords.length === 0 && (
        <EmptyState
          title="No attendance records"
          message={
            searchTerm
              ? 'No attendance records match your search.'
              : 'No roll calls recorded yet for your account.'
          }
        />
      )}

      {!isLoadingRecords && !isRecordsError && filteredRecords.length > 0 && (
        <div
          className="cd"
          style={{
            padding: '16px 20px',
            borderRadius: '20px',
            background: 'var(--card)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--sh)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 140px 110px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--mute)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderBottom: '1px solid var(--line)'
            }}
          >
            <span>Date</span>
            <span>Class & Details</span>
            <span>Recorded By</span>
            <span style={{ textAlign: 'right' }}>Status</span>
          </div>

          {filteredRecords.map((rec) => {
            const st = (rec.status || 'present').toLowerCase();
            const isPresent = st === 'present';
            const isLate = st === 'late';
            const isAbsent = st === 'absent';

            const badgeBg = isPresent
              ? 'rgba(16, 185, 129, 0.14)'
              : isLate
              ? 'rgba(245, 158, 11, 0.14)'
              : 'rgba(239, 68, 68, 0.14)';
            const badgeColor = isPresent ? '#10B981' : isLate ? '#F59E0B' : '#EF4444';
            const badgeText = isPresent ? 'Present' : isLate ? 'Late' : 'Absent';

            return (
              <div
                key={rec.id || rec._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr 140px 110px',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--line)',
                  fontSize: '13px'
                }}
              >
                {/* Date */}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Calendar size={13} style={{ color: 'var(--p1)' }} />
                  <span>{formatDate(rec.date || rec.createdAt)}</span>
                </span>

                {/* Class & Details */}
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)' }}>
                    {rec.className || user?.className || 'Class Roll Call'}
                  </div>
                  {rec.note && (
                    <div style={{ fontSize: '11.5px', color: 'var(--mute)', marginTop: '2px' }}>
                      {rec.note}
                    </div>
                  )}
                </div>

                {/* Recorded By */}
                <span style={{ color: 'var(--mute)', fontSize: '12.5px' }}>
                  {rec.teacherName ? `By ${rec.teacherName.split(' ')[0]}` : 'Teacher'}
                </span>

                {/* Status Badge */}
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: badgeBg,
                      color: badgeColor,
                      textTransform: 'capitalize'
                    }}
                  >
                    {badgeText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
