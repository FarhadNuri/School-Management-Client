import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

const listeners = new Set();

export const showToast = (message, type = 'success') => {
  listeners.forEach((listener) => listener({ id: Date.now() + Math.random(), message, type }));
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ id, message, type = 'success' }) => {
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => {
      listeners.delete(addToast);
    };
  }, [addToast]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isError = toast.type === 'error';
  const borderColor = isError ? '#C23A52' : '#23895B';

  return (
    <div
      style={{
        pointerEvents: 'auto',
        background: 'var(--g-card, #132228)',
        color: 'var(--g-ink, #EAF2F1)',
        padding: '14px 18px',
        borderRadius: '16px',
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        fontSize: '14px',
        fontWeight: 500,
        maxWidth: '380px',
        minWidth: '260px',
        lineHeight: 1.4,
        animation: 'slideUp 0.2s ease-out'
      }}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--g-mute, #6F8B88)',
          cursor: 'pointer',
          padding: '2px 4px',
          fontSize: '16px',
          lineHeight: 1
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  return context || { showToast };
}

export default ToastProvider;
