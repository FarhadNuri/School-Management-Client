export default function Button({
  as: Component = 'button',
  variant = 'primary', // 'primary' (.pb) | 'ghost' (.ghost) | 'landing' (.btn)
  className = '',
  children,
  ...props
}) {
  let baseClass = 'pb';
  if (variant === 'ghost') baseClass = 'ghost';
  if (variant === 'landing') baseClass = 'btn';

  const combinedClass = className ? `${baseClass} ${className}` : baseClass;
  return (
    <Component className={combinedClass} {...props}>
      {children}
    </Component>
  );
}
