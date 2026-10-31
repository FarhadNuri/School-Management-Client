import React, { useEffect } from 'react';
import {
  X,
  FileText,
  ExternalLink,
  Download,
  Link2,
  CheckCircle,
  Clock,
  User,
  BookOpen,
  Calendar,
  MessageSquare,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';
import { formatDate, formatTime } from '../utils/dateUtils';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileName = (url) => {
  if (!url) return 'Submission Attachment';
  try {
    const parts = url.split('/');
    const last = decodeURIComponent(parts[parts.length - 1] || 'Submission Attachment');
    return last.split('?')[0];
  } catch {
    return 'Submission Attachment';
  }
};

const isImageFile = (url, type) => {
  if (type && String(type).startsWith('image/')) return true;
  if (!url) return false;
  return /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url);
};

export default function ViewSubmissionModal({ homework, isOpen, onClose }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !homework) return null;

  const submission = homework.submission;
  const hasFile = Boolean(submission?.fileUrl);
  const hasLink = Boolean(submission?.link);
  const hasComment = Boolean(submission?.comment?.trim());
  const fileName = submission?.fileName || getFileName(submission?.fileUrl);
  const isImage = isImageFile(submission?.fileUrl, submission?.fileType);

  const formattedSubmittedAt = submission?.submittedAt
    ? `${formatDate(submission.submittedAt)} at ${formatTime(submission.submittedAt)}`
    : 'Recorded';

  const formattedResubmittedAt = submission?.resubmittedAt
    ? `${formatDate(submission.resubmittedAt)} at ${formatTime(submission.resubmittedAt)}`
    : null;

  return (
    <div
      className="md on"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 130,
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
          width: '620px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          borderRadius: '24px',
          background: 'var(--card)',
          border: '1px solid var(--line)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header with Green Gradient for Submission */}
        <div
          style={{
            background: 'linear-gradient(135deg, #059669, #10B981)',
            color: '#FFFFFF',
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 10px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase'
                }}
              >
                <CheckCircle size={12} />
                <span>Submitted</span>
              </span>

              {submission?.isResubmitted && (
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.3)',
                    color: '#BFDBFE',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  Resubmitted
                </span>
              )}

              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.15)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                {homework.className || 'CLASS'}
              </span>
            </div>

            <h3
              style={{
                margin: '0 0 6px',
                fontSize: '20px',
                fontWeight: 800,
                color: '#FFFFFF',
                wordBreak: 'break-word',
                lineHeight: 1.3
              }}
            >
              {homework.title}
            </h3>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '12.5px',
                color: 'rgba(255, 255, 255, 0.9)',
                flexWrap: 'wrap'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <BookOpen size={13} />
                <span>{homework.subject || 'General'}</span>
              </span>

              {submission?.studentName && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <User size={13} />
                  <span>Student: <b>{submission.studentName}</b></span>
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            title="Close"
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Submission Timing Box */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              background: 'var(--soft)',
              border: '1px solid var(--line)',
              display: 'grid',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--mute)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} style={{ color: '#10B981' }} />
                <span>Submitted at:</span>
              </span>
              <b style={{ color: 'var(--ink)' }}>{formattedSubmittedAt}</b>
            </div>

            {formattedResubmittedAt && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid var(--line)', paddingTop: '6px' }}>
                <span style={{ color: 'var(--mute)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} style={{ color: '#3B82F6' }} />
                  <span>Last Resubmitted:</span>
                </span>
                <b style={{ color: '#3B82F6' }}>{formattedResubmittedAt}</b>
              </div>
            )}

            {homework.dueDate && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--mute)', borderTop: '1px solid var(--line)', paddingTop: '6px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} />
                  <span>Deadline:</span>
                </span>
                <span>{formatDate(homework.dueDate)}</span>
              </div>
            )}
          </div>

          {/* Submitted Files Section */}
          <div>
            <h4
              style={{
                margin: '0 0 10px',
                fontSize: '12.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--mute)',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Paperclip size={14} />
              <span>Submitted Files</span>
            </h4>

            {hasFile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: 'var(--soft)',
                    border: '1px solid var(--line)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#10B981',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0
                      }}
                    >
                      {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: 'var(--ink)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={fileName}
                      >
                        {fileName}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--mute)', marginTop: '2px' }}>
                        {formatFileSize(submission.fileSize)}
                        {submission.fileType ? ` • ${submission.fileType.split('/')[1]?.toUpperCase() || submission.fileType}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <a
                      href={submission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        background: 'var(--card)',
                        border: '1px solid var(--line)',
                        color: 'var(--p1)',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title="Open file in a new tab"
                    >
                      <ExternalLink size={14} />
                      <span>Open</span>
                    </a>

                    <a
                      href={submission.fileUrl}
                      download={fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        border: 'none',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title="Download file"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </a>
                  </div>
                </div>

                {/* Inline Image Preview */}
                {isImage && (
                  <div
                    style={{
                      borderRadius: '14px',
                      overflow: 'hidden',
                      border: '1px solid var(--line)',
                      background: 'var(--bg)',
                      display: 'grid',
                      placeItems: 'center',
                      padding: '8px'
                    }}
                  >
                    <img
                      src={submission.fileUrl}
                      alt={fileName}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '320px',
                        objectFit: 'contain',
                        borderRadius: '10px'
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'var(--soft)',
                  border: '1px dashed var(--line)',
                  color: 'var(--mute)',
                  fontSize: '13px',
                  fontStyle: 'italic'
                }}
              >
                No file attachment was included in this submission.
              </div>
            )}
          </div>

          {/* Submitted Link Section */}
          <div>
            <h4
              style={{
                margin: '0 0 10px',
                fontSize: '12.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--mute)',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Link2 size={14} />
              <span>Submitted Link</span>
            </h4>

            {hasLink ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: 'var(--soft)',
                  border: '1px solid var(--line)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  <Link2 size={18} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                  <a
                    href={submission.link.startsWith('http') ? submission.link : `https://${submission.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--p1)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      textDecoration: 'underline'
                    }}
                    title={submission.link}
                  >
                    {submission.link}
                  </a>
                </div>

                <a
                  href={submission.link.startsWith('http') ? submission.link : `https://${submission.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    background: 'var(--card)',
                    border: '1px solid var(--line)',
                    color: 'var(--p1)',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <span>Visit</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            ) : (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'var(--soft)',
                  border: '1px dashed var(--line)',
                  color: 'var(--mute)',
                  fontSize: '13px',
                  fontStyle: 'italic'
                }}
              >
                No web link was provided with this submission.
              </div>
            )}
          </div>

          {/* Student Comment / Notes Section */}
          {hasComment && (
            <div>
              <h4
                style={{
                  margin: '0 0 8px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'var(--mute)',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <MessageSquare size={14} />
                <span>Student Comments</span>
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
                {submission.comment}
              </div>
            </div>
          )}
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
            onClick={onClose}
            className="ghost"
            style={{
              padding: '8px 22px',
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
  );
}

