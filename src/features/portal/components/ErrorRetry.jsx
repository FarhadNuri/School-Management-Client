export default function ErrorRetry({ message = 'Failed to load data', onRetry, style = {} }) {
  return (
    <div
      className="cd em"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 20px',
        textAlign: 'center',
        gap: '12px',
        ...style
      }}
    >
      <b style={{ color: '#C23A52' }}>Something went wrong</b>
      <p style={{ color: 'var(--g-mute, #60797F)', margin: 0, fontSize: '13px' }}>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="pb"
          style={{ height: '38px', padding: '0 18px', fontSize: '13px', marginTop: '4px' }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
