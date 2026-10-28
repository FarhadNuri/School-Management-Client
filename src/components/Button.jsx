export default function Button({
  as: Component = 'a',
  className = '',
  children,
  ...props
}) {
  const combinedClass = className ? `btn ${className}` : 'btn';
  return (
    <Component className={combinedClass} {...props}>
      {children}
    </Component>
  );
}
