export default function EmptyState({ title, message, style, className = "" }) {
  return (
    <div className={`cd em ${className}`.trim()} style={style}>
      <b>{title}</b>
      {message}
    </div>
  );
}
