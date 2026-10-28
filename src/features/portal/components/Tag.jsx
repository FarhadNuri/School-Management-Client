export default function Tag({
  children,
  color, // 'g' | 'a' | 'r' | 'b' or undefined
  icon,
  className = ""
}) {
  const colorClass = color ? color : "";
  return (
    <span className={`tg ${colorClass} ${className}`.trim()}>
      {icon}
      {children}
    </span>
  );
}
