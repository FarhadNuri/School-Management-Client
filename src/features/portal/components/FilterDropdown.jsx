export default function FilterDropdown({
  label,
  value,
  onClick,
  className = ""
}) {
  return (
    <div
      className={`sel ${className}`.trim()}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}
