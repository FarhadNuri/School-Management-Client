export default function Skeleton({ width = '100%', height = '20px', borderRadius = '12px', style = {}, className = '' }) {
  return (
    <div
      className={`portal-skeleton ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--g-soft, #F1F6F5)',
        ...style
      }}
    />
  );
}
