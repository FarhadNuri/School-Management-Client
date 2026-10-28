const SEGMENTS = [
  { id: 'present', label: 'Present', activeBg: '#DDF3E8', activeColor: '#1F7A4D', border: '#1F7A4D' },
  { id: 'absent', label: 'Absent', activeBg: '#FADADD', activeColor: '#B3263E', border: '#B3263E' },
  { id: 'late', label: 'Late', activeBg: '#FCEBC8', activeColor: '#9A5B00', border: '#9A5B00' },
  { id: 'excused', label: 'Excused', activeBg: '#DCEBF5', activeColor: '#1E5C86', border: '#1E5C86' }
];

export default function StatusSegment({ value, onChange, disabled = false }) {
  const current = value ? String(value).toLowerCase() : null;

  return (
    <div
      style={{
        display: 'inline-flex',
        background: 'var(--g-soft, #F1F6F5)',
        borderRadius: '10px',
        padding: '3px',
        gap: '3px',
        border: '1px solid var(--g-line, #E3ECEA)'
      }}
    >
      {SEGMENTS.map((seg) => {
        const isSelected = current === seg.id;
        return (
          <button
            key={seg.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(isSelected ? null : seg.id)}
            style={{
              border: 'none',
              borderRadius: '7px',
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              background: isSelected ? seg.activeBg : 'transparent',
              color: isSelected ? seg.activeColor : 'var(--g-mute, #60797F)',
              boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
