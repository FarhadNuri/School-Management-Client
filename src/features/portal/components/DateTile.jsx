export default function DateTile({ month = "AUG", day = "6", className = "" }) {
  return (
    <span className={`dt ${className}`.trim()}>
      {month}
      <b>{day}</b>
    </span>
  );
}
