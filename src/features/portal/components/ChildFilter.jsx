export default function ChildFilter({
  value = "All linked students",
  onChange,
  className = ""
}) {
  const options = ["All linked students", "Kofi Asante"];

  const handleClick = () => {
    const nextIdx = (options.indexOf(value) + 1) % options.length;
    if (onChange) onChange(options[nextIdx]);
  };

  return (
    <div
      className={`sel ${className}`.trim()}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title="Click to toggle student filter"
    >
      <small>STUDENT / CHILD</small>
      <b>{value}</b>
    </div>
  );
}
