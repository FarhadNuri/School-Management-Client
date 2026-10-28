import React, { useState, useMemo } from 'react';
import { usePortalRole } from '../hooks/usePortalRole';
import { useStudentHomeworks, useDebounce } from '../hooks/usePortalQueries';
import SearchBar from '../components/SearchBar';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorRetry from '../components/ErrorRetry';
import {
  BookOpen,
  Calendar,
  User,
  Paperclip,
  ExternalLink,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

// Helper to extract a friendly file name from a URL
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

export default function StudentHomeworks() {
  const { user } = usePortalRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'past_due'
  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    data: homeworksData,
    isLoading,
    isError,
    error,
    refetch
  } = useStudentHomeworks({ search: debouncedSearch });

  const rawHomeworks = homeworksData?.homeworks || [];

  const filteredHomeworks = useMemo(() => {
    const startOfToday = new Date().setHours(0, 0, 0, 0);

    return rawHomeworks.filter((h) => {
      // Status filter
      if (statusFilter === 'pending') {
        const isPending = !h.dueDate || new Date(h.dueDate).getTime() >= startOfToday;
        if (!isPending) return false;
      } else if (statusFilter === 'past_due') {
        const isPastDue = h.dueDate && new Date(h.dueDate).getTime() < startOfToday;
        if (!isPastDue) return false;
      }

      // Search filter
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const matches =
          h.title?.toLowerCase().includes(q) ||
          h.subject?.toLowerCase().includes(q) ||
          h.teacher?.toLowerCase().includes(q) ||
          h.instructions?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [rawHomeworks, statusFilter, debouncedSearch]);

  const startOfToday = new Date().setHours(0, 0, 0, 0);

  return (
    <>
      <div className="pt" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px', color: 'var(--ink)' }}>
          Homeworks
        </h2>
        <p style={{ margin: 0, color: 'var(--mute)', fontSize: '14px' }}>
          View and track homework assignments uploaded for your class
        </p>
      </div>

      {/* Search & Filter Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SearchBar
          placeholder="Search homework by title, subject, or teacher..."
          value={searchTerm}
          onChange={setSearchTerm}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              background: statusFilter === 'all' ? 'var(--p1)' : 'var(--card)',
              color: statusFilter === 'all' ? '#fff' : 'var(--ink)',
              border: statusFilter === 'all' ? '1px solid var(--p1)' : '1px solid var(--line)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            All Assignments ({rawHomeworks.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              background: statusFilter === 'pending' ? 'var(--p1)' : 'var(--card)',
              color: statusFilter === 'pending' ? '#fff' : 'var(--ink)',
              border: statusFilter === 'pending' ? '1px solid var(--p1)' : '1px solid var(--line)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Active / Upcoming
          </button>
          <button
            onClick={() => setStatusFilter('past_due')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              background: statusFilter === 'past_due' ? 'var(--p1)' : 'var(--card)',
              color: statusFilter === 'past_due' ? '#fff' : 'var(--ink)',
              border: statusFilter === 'past_due' ? '1px solid var(--p1)' : '1px solid var(--line)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Past Due
          </button>
        </div>
      </div>

      <div style={{ margin: '14px 0', color: 'var(--mute)', fontSize: '13.5px' }}>
        Showing <b style={{ color: 'var(--ink)' }}>{filteredHomeworks.length}</b> homework assignment
        {filteredHomeworks.length === 1 ? '' : 's'}
        {user?.className && (
          <span> for <b style={{ color: 'var(--p1)' }}>{user.className}</b></span>
        )}
      </div>

      {isLoading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '18px'
          }}
        >
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="cd" style={{ padding: '20px', borderRadius: '20px', gap: '14px' }}>
              <Skeleton width="180px" height="20px" />
              <Skeleton width="120px" height="14px" />
              <Skeleton width="100%" height="48px" borderRadius="10px" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <ErrorRetry
          message={error?.message || 'Unable to load homework assignments.'}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && filteredHomeworks.length === 0 && (
        <EmptyState
          title="No homework assignments"
          message={
            searchTerm
              ? 'No homework assignments match your search.'
              : 'You have no homework assignments in this category.'
          }
        />
      )}

      {!isLoading && !isError && filteredHomeworks.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '18px'
          }}
        >
          {filteredHomeworks.map((hw) => {
            const fileList = Array.isArray(hw.materials) ? hw.materials : [];
            const isPastDue = hw.dueDate && new Date(hw.dueDate).getTime() < startOfToday;

            return (
              <div
                key={hw.id || hw._id}
                className="cd"
                style={{
                  padding: '22px',
                  borderRadius: '20px',
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
                  {/* Top Badges */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                      gap: '8px'
                    }}
                  >
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '8px',
                        background: 'rgba(30,111,120,.12)',
                        color: 'var(--p1)',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}
                    >
                      {hw.className || user?.className || 'CLASS'}
                    </span>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '7px',
                        background: isPastDue ? 'rgba(239, 68, 68, 0.14)' : 'rgba(251, 191, 36, 0.14)',
                        color: isPastDue ? '#EF4444' : '#FBBF24',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Clock size={12} />
                      <span>{isPastDue ? 'Past Due: ' : 'Due: '}{hw.dueDate ? formatDate(hw.dueDate) : 'No deadline'}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      margin: '0 0 6px',
                      fontSize: '18px',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      lineHeight: 1.3
                    }}
                  >
                    {hw.title}
                  </h3>

                  {/* Subject & Teacher Metadata */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                      color: 'var(--mute)',
                      fontSize: '13px',
                      marginBottom: '10px'
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontWeight: 600,
                        color: 'var(--ink)'
                      }}
                    >
                      <BookOpen size={14} style={{ color: 'var(--p1)' }} />
                      <span>{hw.subject || 'Subject'}</span>
                    </span>

                    {hw.teacher && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--mute)',
                          fontSize: '12.5px'
                        }}
                      >
                        <User size={13} />
                        <span>{hw.teacher}</span>
                      </span>
                    )}
                  </div>

                  {/* Instructions */}
                  {(hw.instructions || hw.description) && (
                    <p
                      style={{
                        margin: '0 0 12px',
                        fontSize: '13px',
                        color: 'var(--ink)',
                        opacity: 0.85,
                        lineHeight: 1.5,
                        background: 'rgba(255,255,255,0.03)',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid var(--line)'
                      }}
                    >
                      {hw.instructions || hw.description}
                    </p>
                  )}
                </div>

                {/* Attachments Section */}
                <div>
                  <div
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--mute)',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Paperclip size={12} />
                    <span>Homework Materials ({fileList.length})</span>
                  </div>

                  {fileList.length === 0 ? (
                    <span style={{ fontSize: '12.5px', color: 'var(--mute)', fontStyle: 'italic' }}>
                      No attachments provided
                    </span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {fileList.map((fileUrl, idx) => {
                        const name = getFileName(fileUrl);
                        return (
                          <a
                            key={idx}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              background: 'rgba(30,111,120,0.08)',
                              border: '1px solid rgba(30,111,120,0.2)',
                              color: 'var(--ink)',
                              textDecoration: 'none',
                              fontSize: '12.5px',
                              fontWeight: 600,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <FileText size={15} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                            </span>
                            <ExternalLink size={14} style={{ color: 'var(--p1)', flexShrink: 0, marginLeft: '8px' }} />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
