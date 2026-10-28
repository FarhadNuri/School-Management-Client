export default function StatCard({
  label,
  value,
  note,
  showArrow = false,
  className = "",
  onClick
}) {
  return (
    <div
      className={`sc ${className}`.trim()}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <small>
        {label}
        {showArrow && <span>→</span>}
      </small>
      <b>{value}</b>
      {note && <span>{note}</span>}
    </div>
  );
}
