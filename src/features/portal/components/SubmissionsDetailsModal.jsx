import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Users,
  CheckCircle,
  Clock,
  Search,
  Paperclip,
  ExternalLink,
  RotateCcw,
  UserCheck,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useHomeworkSubmissions } from '../hooks/usePortalQueries';
import Skeleton from './Skeleton';
import { formatDate } from '../utils/dateUtils';

export default function SubmissionsDetailsModal({ homeworkId, isOpen, onClose, role = 'student' }) {
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'submitted', 'not_submitted'
  const [searchTerm, setSearchTerm] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const { data, isLoading, isError, error, refetch } = useHomeworkSubmissions(homeworkId, role, {
    enabled: Boolean(isOpen && homeworkId)
  });

  const homework = data?.homework;
  const totalAssigned = data?.totalAssigned || 0;
  const submittedCount = data?.submittedCount || 0;
  const notSubmittedCount = data?.notSubmittedCount || 0;
  const students = data?.students || [];

  const submissionPercentage = totalAssigned > 0 ? Math.round((submittedCount / totalAssigned) * 100) : 0;

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (filterTab === 'submitted' && !s.isSubmitted) return false;
      if (filterTab === 'not_submitted' && s.isSubmitted) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matches = s.studentName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [students, filterTab, searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      className="md on"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        zIndex: 120,
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
          width: '760px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          borderRadius: '24px',
          background: 'var(--card)',
          border: '1px solid var(--line)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px 20px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(30, 111, 120, 0.12), transparent)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '8px',
                  background: 'rgba(30, 111, 120, 0.18)',
                  color: 'var(--p1)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              >
                {homework?.className || 'CLASS'} • {homework?.subject || 'SUBJECT'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--mute)' }}>
                Due: {homework?.dueDate ? formatDate(homework.dueDate) : 'No due date'}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--ink)' }}>
              Submissions Overview
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--mute)' }}>
              {homework?.title || 'Assignment Details'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'var(--soft)',
              border: '1px solid var(--line)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              color: 'var(--mute)',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <Skeleton height="70px" borderRadius="14px" />
                <Skeleton height="70px" borderRadius="14px" />
                <Skeleton height="70px" borderRadius="14px" />
              </div>
              <Skeleton height="200px" borderRadius="16px" />
            </div>
          ) : isError ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--mute)' }}>
              <p style={{ color: '#EF4444', fontWeight: 700 }}>Failed to load submissions</p>
              <button
                type="button"
                onClick={() => refetch()}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: 'var(--p1)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* 3 Stat Cards Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px'
                }}
              >
                {/* Total Assigned */}
                <div
                  className="cd"
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'var(--soft)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(30, 111, 120, 0.15)',
                      color: 'var(--p1)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Users size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Assigned
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)' }}>
                      {totalAssigned}
                    </div>
                  </div>
                </div>

                {/* Submitted */}
                <div
                  className="cd"
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'var(--soft)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10B981',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}
                  >
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Submitted
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#10B981' }}>
                      {submittedCount}
                    </div>
                  </div>
                </div>

                {/* Not Submitted */}
                <div
                  className="cd"
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'var(--soft)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#EF4444',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Clock size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Not Submitted
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#EF4444' }}>
                      {notSubmittedCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: '14px',
                  background: 'var(--soft)',
                  border: '1px solid var(--line)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12.5px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--mute)' }}>Class Submission Rate</span>
                  <span style={{ fontWeight: 800, color: 'var(--p1)' }}>{submissionPercentage}%</span>
                </div>
                <div style={{ height: '7px', borderRadius: '4px', background: 'var(--line)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${submissionPercentage}%`,
                      background: 'linear-gradient(90deg, #10B981, #14B8A6)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>

              {/* Filter Tabs & Search Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--mute)' }} />
                  <input
                    type="text"
                    placeholder="Search student by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      borderRadius: '10px',
                      border: '1px solid var(--line)',
                      background: 'var(--soft)',
                      color: 'var(--ink)',
                      padding: '0 12px 0 34px',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Filter Chips */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setFilterTab('all')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: filterTab === 'all' ? '1px solid var(--p1)' : '1px solid var(--line)',
                      background: filterTab === 'all' ? 'var(--p1)' : 'var(--card)',
                      color: filterTab === 'all' ? '#fff' : 'var(--ink)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    All ({totalAssigned})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('submitted')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: filterTab === 'submitted' ? '1px solid #10B981' : '1px solid var(--line)',
                      background: filterTab === 'submitted' ? '#10B981' : 'var(--card)',
                      color: filterTab === 'submitted' ? '#fff' : 'var(--ink)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Submitted ({submittedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('not_submitted')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: filterTab === 'not_submitted' ? '1px solid #EF4444' : '1px solid var(--line)',
                      background: filterTab === 'not_submitted' ? '#EF4444' : 'var(--card)',
                      color: filterTab === 'not_submitted' ? '#fff' : 'var(--ink)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Not Submitted ({notSubmittedCount})
                  </button>
                </div>
              </div>

              {/* Student Roster List */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  maxHeight: '380px',
                  overflowY: 'auto'
                }}
              >
                {filteredStudents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--mute)', fontSize: '13.5px' }}>
                    No students match the selected filter.
                  </div>
                ) : (
                  filteredStudents.map((s) => (
                    <div
                      key={s.studentId}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '14px',
                        background: 'var(--soft)',
                        border: '1px solid var(--line)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}
                      >
                        {/* Student Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                          {s.photo ? (
                            <img
                              src={s.photo}
                              alt={s.studentName}
                              style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: 'rgba(30, 111, 120, 0.15)',
                                color: 'var(--p1)',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 800,
                                fontSize: '14px'
                              }}
                            >
                              {s.studentName ? s.studentName.slice(0, 2).toUpperCase() : 'ST'}
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                              {s.studentName}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--mute)' }}>
                              {s.email}
                            </div>
                          </div>
                        </div>

                        {/* Status Tag & Submission Details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginLeft: 'auto' }}>
                          {s.isSubmitted ? (
                            <>
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  background: 'rgba(16, 185, 129, 0.14)',
                                  color: '#10B981',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <CheckCircle size={13} />
                                <span>Submitted</span>
                              </span>

                              {s.submission?.isResubmitted && (
                                <span
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    background: 'rgba(59, 130, 246, 0.12)',
                                    color: '#60A5FA',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="Student resubmitted assignment"
                                >
                                  <RotateCcw size={11} />
                                  <span>Resubmitted</span>
                                </span>
                              )}

                              {s.submission?.fileUrl && (
                                <button
                                  type="button"
                                  onClick={() => window.open(s.submission.fileUrl, '_blank')}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    height: '32px',
                                    padding: '0 12px',
                                    borderRadius: '8px',
                                    background: 'var(--card)',
                                    border: '1px solid var(--line)',
                                    color: 'var(--p1)',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  title="Download / View submitted file"
                                >
                                  <Paperclip size={12} />
                                  <span>{s.submission.fileName || 'File'}</span>
                                </button>
                              )}

                              {s.submission?.link && (
                                <button
                                  type="button"
                                  onClick={() => window.open(s.submission.link, '_blank')}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    height: '32px',
                                    padding: '0 12px',
                                    borderRadius: '8px',
                                    background: 'var(--card)',
                                    border: '1px solid var(--line)',
                                    color: '#38BDF8',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  title="Open student online link"
                                >
                                  <ExternalLink size={12} />
                                  <span>Open Link</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '8px',
                                background: 'rgba(239, 68, 68, 0.12)',
                                color: '#EF4444',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <Clock size={13} />
                              <span>Not Submitted</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comment note if present */}
                      {s.submission?.comment && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'var(--card)',
                            border: '1px solid var(--line)',
                            fontSize: '12px',
                            color: 'var(--mute)'
                          }}
                        >
                          <MessageSquare size={13} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--p1)' }} />
                          <span style={{ fontStyle: 'italic', wordBreak: 'break-word' }}>"{s.submission.comment}"</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 28px',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'var(--card)'
          }}
        >
          <button
            type="button"
            className="ghost"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
