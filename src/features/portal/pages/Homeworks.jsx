import React, { useState, useMemo, useEffect } from 'react';
import { usePortalRole } from '../hooks/usePortalRole';
import { useStudentHomeworks, useDebounce } from '../hooks/usePortalQueries';
import SearchBar from '../components/SearchBar';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorRetry from '../components/ErrorRetry';
import SubmitHomeworkModal from '../components/SubmitHomeworkModal';
import {
  BookOpen,
  User,
  Paperclip,
  ExternalLink,
  FileText,
  Clock,
  Eye,
  X,
  CheckCircle,
  UploadCloud,
  RotateCcw
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
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'submitted', 'past_due'
  const [viewingHomework, setViewingHomework] = useState(null);
  const [submittingHomework, setSubmittingHomework] = useState(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setViewingHomework(null);
        setSubmittingHomework(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const {
    data: homeworksData,
    isLoading,
    isError,
    error,
    refetch
  } = useStudentHomeworks({ search: debouncedSearch });

  const rawHomeworks = useMemo(() => {
    const list = homeworksData?.homeworks;
    if (Array.isArray(list)) return list;
    if (Array.isArray(homeworksData?.data)) return homeworksData.data;
    if (Array.isArray(homeworksData)) return homeworksData;
    return [];
  }, [homeworksData]);

  const filteredHomeworks = useMemo(() => {
    const startOfToday = new Date().setHours(0, 0, 0, 0);

    return rawHomeworks.filter((h) => {
      // Status filter
      if (statusFilter === 'pending') {
        const isPast = h.dueDate && new Date(h.dueDate).getTime() < startOfToday;
        if (isPast || h.isSubmitted || h.isDone) return false;
      } else if (statusFilter === 'submitted') {
        if (!h.isSubmitted && !h.isDone) return false;
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
          View, submit and track your homework assignments
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
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('submitted')}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              background: statusFilter === 'submitted' ? '#10B981' : 'var(--card)',
              color: statusFilter === 'submitted' ? '#fff' : 'var(--ink)',
              border: statusFilter === 'submitted' ? '1px solid #10B981' : '1px solid var(--line)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Submitted / Done
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '18px'
          }}
        >
          {filteredHomeworks.map((hw) => {
            const fileList = Array.isArray(hw.materials) ? hw.materials : [];
            const isPastDue = Boolean(hw.isPastDue || (hw.dueDate && new Date(hw.dueDate).getTime() < startOfToday));
            const isDone = Boolean(hw.isDone || hw.isSubmitted);

            return (
              <div
                key={hw.id || hw._id}
                className="cd"
                style={{
                  padding: '22px',
                  borderRadius: '20px',
                  background: 'var(--card)',
                  border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--line)',
                  boxShadow: 'var(--sh)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
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
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

                      {/* Done Badge */}
                      {isDone && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 9px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.16)',
                            color: '#10B981',
                            letterSpacing: '0.3px',
                            textTransform: 'uppercase'
                          }}
                        >
                          <CheckCircle size={12} />
                          <span>Done</span>
                        </span>
                      )}
                    </div>

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
                      <span>{hw.subject || 'General'}</span>
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

                  {/* Instructions Snippet */}
                  {(hw.instructions || hw.description) && (
                    <p
                      style={{
                        margin: '0 0 10px',
                        fontSize: '13px',
                        color: 'var(--mute)',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}
                    >
                      {hw.instructions || hw.description}
                    </p>
                  )}

                  {/* Submitted Info Callout */}
                  {isDone && (
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#10B981',
                        marginBottom: '4px'
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <CheckCircle size={13} />
                        <span>Submitted {hw.submission?.submittedAt ? formatDate(hw.submission.submittedAt) : 'Successfully'}</span>
                      </span>
                      {hw.submission?.isResubmitted && (
                        <span style={{ fontSize: '10.5px', color: '#60A5FA', fontWeight: 700 }}>Resubmitted</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div
                  style={{
                    paddingTop: '14px',
                    borderTop: '1px solid var(--line)',
                    width: '100%',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        color: fileList.length > 0 ? '#2DD4BF' : 'var(--mute)',
                        fontWeight: 600
                      }}
                    >
                      <Paperclip size={13} />
                      <span>{fileList.length} resource{fileList.length === 1 ? '' : 's'}</span>
                    </span>
                  </div>

                  {/* Button Row: View Details & Submit / Resubmit */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setViewingHomework(hw)}
                      style={{
                        flex: '1 1 0',
                        minWidth: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        height: '38px',
                        padding: '0 12px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        background: 'var(--soft)',
                        border: '1px solid var(--line)',
                        color: 'var(--ink)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </button>

                    {/* Submit Homework / Resubmit Button */}
                    {isPastDue ? (
                      <button
                        type="button"
                        disabled
                        style={{
                          flex: '1.4 1 0',
                          minWidth: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          height: '38px',
                          padding: '0 12px',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          background: 'var(--soft)',
                          border: '1px solid var(--line)',
                          color: 'var(--mute)',
                          cursor: 'not-allowed',
                          opacity: 0.7
                        }}
                        title="Submission deadline has passed"
                      >
                        <Clock size={14} />
                        <span>Past Due</span>
                      </button>
                    ) : isDone ? (
                      <button
                        type="button"
                        onClick={() => setSubmittingHomework(hw)}
                        style={{
                          flex: '1.4 1 0',
                          minWidth: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          height: '38px',
                          padding: '0 12px',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          background: 'rgba(16, 185, 129, 0.14)',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          color: '#10B981',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <RotateCcw size={14} />
                        <span>Resubmit</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSubmittingHomework(hw)}
                        style={{
                          flex: '1.4 1 0',
                          minWidth: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          height: '38px',
                          padding: '0 12px',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                          border: 'none',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(20, 184, 166, 0.25)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <UploadCloud size={14} />
                        <span>Submit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingHomework && (
        <div
          className="md on"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingHomework(null);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            padding: '16px',
            display: 'grid',
            placeItems: 'center',
            overflowY: 'auto'
          }}
        >
          <div
            className="mc no-scrollbar"
            style={{
              position: 'relative',
              width: '640px',
              maxWidth: '96vw',
              maxHeight: '90vh',
              borderRadius: '24px',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header with Teal Gradient */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--p2), var(--p1))',
                color: '#fff',
                padding: '22px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                flexShrink: 0
              }}
            >
              <div style={{ flex: 1, paddingRight: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {viewingHomework.className || user?.className || 'CLASS'}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.25)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    <BookOpen size={11} />
                    {viewingHomework.subject || 'General'}
                  </span>
                  {viewingHomework.dueDate && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 10px',
                        borderRadius: '8px',
                        background: new Date(viewingHomework.dueDate).getTime() < startOfToday
                          ? 'rgba(239, 68, 68, 0.25)'
                          : 'rgba(251, 191, 36, 0.25)',
                        color: new Date(viewingHomework.dueDate).getTime() < startOfToday ? '#FCA5A5' : '#FEF08A',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      <Clock size={11} />
                      {new Date(viewingHomework.dueDate).getTime() < startOfToday ? 'Past Due: ' : 'Due: '}
                      {formatDate(viewingHomework.dueDate)}
                    </span>
                  )}
                </div>

                <h3
                  style={{
                    margin: '0 0 6px',
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: '-0.01em',
                    wordBreak: 'break-word'
                  }}
                >
                  {viewingHomework.title}
                </h3>

                {viewingHomework.teacher && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.85)'
                    }}
                  >
                    <User size={13} />
                    <span>Teacher: {viewingHomework.teacher}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewingHomework(null)}
                title="Close"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'background 0.15s ease'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Assignment Instructions */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '12.5px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--mute)', letterSpacing: '0.5px' }}>
                  Assignment Instructions
                </h4>
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: 'var(--soft)',
                    border: '1px solid var(--line)',
                    fontSize: '13.5px',
                    lineHeight: 1.6,
                    color: 'var(--ink)',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {viewingHomework.instructions || viewingHomework.description || 'No special instructions provided for this assignment.'}
                </div>
              </div>

              {/* Attachments Section */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '12.5px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--mute)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Paperclip size={14} />
                  <span>Homework Attachments ({(Array.isArray(viewingHomework.materials) ? viewingHomework.materials : []).length})</span>
                </h4>

                {(Array.isArray(viewingHomework.materials) ? viewingHomework.materials : []).length === 0 ? (
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--mute)', fontStyle: 'italic' }}>
                    No attachment files provided with this assignment.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(Array.isArray(viewingHomework.materials) ? viewingHomework.materials : []).map((fileUrl, idx) => {
                      const fileName = getFileName(fileUrl);
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: 'var(--soft)',
                            border: '1px solid var(--line)',
                            transition: 'border-color 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                            <FileText size={18} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'var(--ink)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={fileName}
                            >
                              {fileName}
                            </span>
                          </div>

                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              background: 'var(--card)',
                              border: '1px solid var(--line)',
                              color: 'var(--p1)',
                              textDecoration: 'none',
                              flexShrink: 0,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>Open</span>
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'flex-end',
                background: 'var(--card)',
                borderBottomLeftRadius: '24px',
                borderBottomRightRadius: '24px'
              }}
            >
              <button
                type="button"
                onClick={() => setViewingHomework(null)}
                className="ghost"
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  margin: 0
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT HOMEWORK MODAL */}
      <SubmitHomeworkModal
        homework={submittingHomework}
        isOpen={Boolean(submittingHomework)}
        onClose={() => setSubmittingHomework(null)}
      />

      
    </>
  );
}
