import React from 'react';
import { X, Loader2 } from 'lucide-react';

export default function FormModal({
  isOpen,
  onClose,
  title,
  subtitle,
  submitText = 'Save',
  submitLabel,
  submittingText,
  submittingTitle,
  submittingMessage,
  onSubmit,
  isSubmitting = false,
  maxWidth = '520px',
  children
}) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  const finalSubmitText = submitLabel || submitText;

  // Infer dynamic button text while submitting
  const getSubmittingText = () => {
    if (submittingText) return submittingText;
    const lower = finalSubmitText.toLowerCase();
    if (lower.includes('upload')) return 'Uploading...';
    if (lower.includes('save') || lower.includes('update')) return 'Saving...';
    if (lower.includes('create') || lower.includes('add')) return 'Creating...';
    return 'Processing...';
  };

  // Infer dynamic overlay title & message
  const getOverlayTitle = () => {
    if (submittingTitle) return submittingTitle;
    const lower = finalSubmitText.toLowerCase();
    if (lower.includes('upload')) return 'Uploading Study Material...';
    if (lower.includes('save') || lower.includes('update')) return 'Saving Changes...';
    return 'Processing Request...';
  };

  const getOverlayMessage = () => {
    if (submittingMessage) return submittingMessage;
    const lower = finalSubmitText.toLowerCase();
    if (lower.includes('upload')) return 'Please wait while documents are securely uploaded to the cloud.';
    return 'Please wait a moment while updates are saved.';
  };

  return (
    <div
      className="md on"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose?.();
      }}
      style={{
        zIndex: 100,
        padding: '16px'
      }}
    >
      <div
        className="mc no-scrollbar"
        style={{
          position: 'relative',
          width: maxWidth,
          maxWidth: '96vw',
          maxHeight: '92vh',
          borderRadius: '24px',
          background: 'var(--card)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.45)',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Full-Modal Submitting Blur Overlay */}
        {isSubmitting && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(5, 15, 20, 0.78)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 60,
              borderRadius: '24px',
              padding: '24px',
              textAlign: 'center',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* Pulsing Spinning Ring */}
            <div
              style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                display: 'grid',
                placeItems: 'center',
                marginBottom: '16px'
              }}
            >
              <div
                className="spin"
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  border: '3.5px solid rgba(255, 255, 255, 0.15)',
                  borderTopColor: 'var(--p1, #1e6f78)',
                  borderRightColor: 'var(--p2, #14b8a6)',
                  animation: 'spin 0.75s linear infinite'
                }}
              />
              <Loader2
                size={22}
                className="spin"
                style={{
                  position: 'absolute',
                  color: '#fff',
                  animation: 'spin 1.2s linear infinite reverse'
                }}
              />
            </div>

            <h4
              style={{
                margin: '0 0 6px',
                fontSize: '17px',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.01em'
              }}
            >
              {getOverlayTitle()}
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.75)',
                maxWidth: '320px',
                lineHeight: 1.45
              }}
            >
              {getOverlayMessage()}
            </p>
          </div>
        )}

        {/* Modal Header */}
        <div
          className="mh"
          style={{
            background: 'linear-gradient(135deg, var(--p2), var(--p1))',
            color: '#fff',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            flexShrink: 0
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.35 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            title="Close"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              display: 'grid',
              placeItems: 'center',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              color: '#fff',
              transition: 'background 0.15s ease',
              opacity: isSubmitting ? 0.5 : 1
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '18px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            flex: 1
          }}
        >
          <div style={{ flex: 1 }}>
            {children}
          </div>

          {/* Modal Actions Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '10px',
              borderTop: '1px solid var(--line)',
              marginTop: '4px'
            }}
          >
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '9px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#F8FAFC',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={isSubmitting}
              style={{
                padding: '9px 24px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                color: '#FFFFFF',
                border: 'none',
                boxShadow: '0 4px 14px rgba(20, 184, 166, 0.28)',
                opacity: isSubmitting ? 0.85 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {isSubmitting && (
                <Loader2
                  size={16}
                  className="spin"
                  style={{ animation: 'spin 0.75s linear infinite' }}
                />
              )}
              <span>{isSubmitting ? getSubmittingText() : finalSubmitText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
