import { Link } from 'react-router-dom';

export default function BackLink({ to = '/guardian/students', label = '← Back to students', onBack }) {
  if (onBack) {
    return (
      <div style={{ marginBottom: '16px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'var(--g-mute, #60797F)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {label}
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <Link
        to={to}
        style={{
          color: 'var(--g-mute, #60797F)',
          fontSize: '13px',
          fontWeight: 700,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        {label}
      </Link>
    </div>
  );
}
