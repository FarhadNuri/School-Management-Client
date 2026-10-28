export default function ConfirmModal({
  isOpen,
  title = 'Unsaved changes',
  message = 'You have unsaved changes. Are you sure you want to leave without saving?',
  confirmText = 'Leave',
  cancelText = 'Stay',
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div
      className="md on"
      style={{ zIndex: 100 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="mc" style={{ maxWidth: '420px', borderRadius: '20px' }}>
        <div className="mh" style={{ background: '#0F3B44', padding: '16px 20px' }}>
          <h3 style={{ fontSize: '18px', margin: 0 }}>{title}</h3>
          <span
            onClick={onCancel}
            style={{ cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}
          >
            ×
          </span>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--g-ink, #0A1C24)', lineHeight: 1.5 }}>
            {message}
          </p>
          <div className="row" style={{ justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="ghost"
              onClick={onCancel}
              style={{ margin: 0 }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={{
                background: '#B3263E',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '8px 16px',
                font: '700 13px Manrope, sans-serif',
                cursor: 'pointer'
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
