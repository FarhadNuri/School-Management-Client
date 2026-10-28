export default function TableInput({
  value,
  onChange,
  type = 'text',
  placeholder = '',
  disabled = false,
  min,
  max,
  style,
  ...props
}) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      style={{
        border: '1px solid var(--g-line, #E3ECEA)',
        background: disabled ? 'var(--g-soft, #F1F6F5)' : 'var(--g-card, #fff)',
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '13px',
        color: disabled ? 'var(--g-mute, #60797F)' : 'var(--g-ink, #0A1C24)',
        width: '100%',
        boxSizing: 'border-box',
        outline: 'none',
        ...style
      }}
      {...props}
    />
  );
}
