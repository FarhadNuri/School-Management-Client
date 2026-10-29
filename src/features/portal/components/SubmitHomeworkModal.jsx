import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Link2,
  FileText,
  Paperclip,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useSubmitHomework } from '../hooks/usePortalQueries';
import { formatDate } from '../utils/dateUtils';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function SubmitHomeworkModal({ homework, isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [link, setLink] = useState('');
  const [comment, setComment] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const submitMutation = useSubmitHomework();

  // Populate existing submission info if resubmitting
  useEffect(() => {
    if (homework?.submission) {
      setLink(homework.submission.link || '');
      setComment(homework.submission.comment || '');
    } else {
      setLink('');
      setComment('');
      setFile(null);
    }
    setErrorMsg('');
  }, [homework, isOpen]);

  if (!isOpen || !homework) return null;

  const isResubmission = Boolean(homework.submission || homework.isSubmitted);
  const isPastDue = Boolean(homework.isPastDue);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMsg('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!file && !link.trim() && !homework.submission) {
      setErrorMsg('Please upload a file or enter a submission link.');
      return;
    }

    const formData = new FormData();
    if (file) {
      formData.append('materials', file);
    }
    if (link.trim()) {
      formData.append('link', link.trim());
    }
    if (comment.trim()) {
      formData.append('comment', comment.trim());
    }

    try {
      await submitMutation.mutateAsync({
        id: homework.id || homework._id,
        data: formData
      });
      onClose();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Submission failed');
    }
  };

  return (
    <div
      className="md on"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ zIndex: 120, padding: '16px' }}
    >
      <div
        className="mc no-scrollbar"
        style={{
          position: 'relative',
          width: '580px',
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
        {/* Header Bar */}
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
                {homework.subject || 'Assignment'}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: isPastDue ? '#EF4444' : '#FBBF24',
                  fontWeight: 700
                }}
              >
                • {isPastDue ? 'Past Due: ' : 'Due: '}{homework.dueDate ? formatDate(homework.dueDate) : 'No deadline'}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--ink)' }}>
              {isResubmission ? 'Resubmit Homework' : 'Submit Homework'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--mute)' }}>
              {homework.title}
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

        {/* Existing Submission Banner */}
        {isResubmission && homework.submission && (
          <div
            style={{
              margin: '18px 28px 0',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 700, fontSize: '13px' }}>
              <CheckCircle size={15} />
              <span>You submitted this assignment on {formatDate(homework.submission.submittedAt)}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--mute)' }}>
              {homework.submission.fileName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Paperclip size={12} /> {homework.submission.fileName}
                </div>
              )}
              {homework.submission.link && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ExternalLink size={12} /> {homework.submission.link}
                </div>
              )}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--mute)', fontStyle: 'italic', marginTop: '2px' }}>
              Uploading a new file or updating your link will replace your previous submission.
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 28px 26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* File Upload Box */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
              Upload File (Image, PDF, Word DOCX)
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragActive ? 'var(--p1)' : 'var(--line)'}`,
                borderRadius: '16px',
                padding: '24px 16px',
                textAlign: 'center',
                background: dragActive ? 'rgba(30, 111, 120, 0.08)' : 'var(--soft)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onClick={() => document.getElementById('hw-file-input').click()}
            >
              <input
                id="hw-file-input"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <FileText size={28} style={{ color: 'var(--p1)' }} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>{file.name}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--mute)' }}>{formatFileSize(file.size)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    style={{
                      marginLeft: '12px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '26px',
                      height: '26px',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#EF4444',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud size={32} style={{ color: 'var(--p1)', margin: '0 auto 8px', opacity: 0.8 }} />
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
                    Choose a file or drag & drop here
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--mute)', marginTop: '4px' }}>
                    Images (JPG, PNG), PDF, and Word docs up to 10MB
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Submission URL / Link */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
              Online Link (Google Drive, Docs, GitHub, etc.)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Link2 size={16} style={{ position: 'absolute', left: '14px', color: 'var(--mute)' }} />
              <input
                type="url"
                placeholder="https://drive.google.com/... or https://docs.google.com/..."
                value={link}
                onChange={(e) => {
                  setLink(e.target.value);
                  setErrorMsg('');
                }}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  background: 'var(--soft)',
                  color: 'var(--ink)',
                  padding: '0 14px 0 38px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Comment / Notes */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
              Note for Teacher (Optional)
            </label>
            <textarea
              placeholder="Add any comments or notes about your submission..."
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: '100%',
                borderRadius: '12px',
                border: '1px solid var(--line)',
                background: 'var(--soft)',
                color: 'var(--ink)',
                padding: '10px 14px',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '10px'
            }}
          >
            <button
              type="button"
              className="ghost"
              onClick={onClose}
              disabled={submitMutation.isPending}
              style={{ height: '40px', padding: '0 18px', borderRadius: '12px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitMutation.isPending || isPastDue}
              style={{
                height: '40px',
                padding: '0 24px',
                borderRadius: '12px',
                background: isPastDue
                  ? 'var(--mute)'
                  : 'linear-gradient(135deg, #14B8A6, #0D9488)',
                color: '#fff',
                border: 'none',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: isPastDue ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isPastDue ? 'none' : '0 4px 14px rgba(20, 184, 166, 0.3)'
              }}
            >
              {isResubmission ? <RotateCcw size={15} /> : <UploadCloud size={15} />}
              <span>
                {submitMutation.isPending
                  ? 'Submitting...'
                  : isResubmission
                  ? 'Resubmit Assignment'
                  : 'Submit Assignment'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
