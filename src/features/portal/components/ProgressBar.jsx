export default function ProgressBar({
  value = 0,
  max = 100,
  height = '8px',
  color = 'var(--g-p1, #1E6F78)',
  backgroundColor = 'var(--g-line, #E3ECEA)',
  borderRadius = '999px',
  style
}) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div
      style={{
        width: '100%',
        height,
        backgroundColor,
        borderRadius,
        overflow: 'hidden',
        position: 'relative',
        ...style
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius,
          transition: 'width 0.3s ease'
        }}
      />
    </div>
  );
}
