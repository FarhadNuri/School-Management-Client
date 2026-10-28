export default function DataTable({ columns = [], data = [], keyField = 'id', emptyMessage = 'No records found' }) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          padding: '32px',
          textAlign: 'center',
          color: 'var(--g-mute, #60797F)',
          background: 'var(--g-card, #fff)',
          borderRadius: '16px',
          border: '1px solid var(--g-line, #E3ECEA)'
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: 'auto',
        background: 'var(--g-card, #fff)',
        borderRadius: '20px',
        border: '1px solid var(--g-line, #E3ECEA)',
        boxShadow: 'var(--g-sh, 0 6px 20px rgba(15,59,68,.07))'
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', font: 'inherit' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--g-line, #E3ECEA)', background: 'var(--g-soft, #F1F6F5)' }}>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  padding: '14px 16px',
                  fontSize: '11px',
                  letterSpacing: '.08em',
                  fontWeight: 700,
                  color: 'var(--g-mute, #60797F)',
                  textTransform: 'uppercase',
                  width: col.width,
                  textAlign: col.align || 'left'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => {
            const rowKey = row[keyField] ?? rowIdx;
            return (
              <tr
                key={rowKey}
                style={{
                  borderBottom: rowIdx === data.length - 1 ? 'none' : '1px solid var(--g-line, #E3ECEA)',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--g-soft, #F1F6F5)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    style={{
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: 'var(--g-ink, #0A1C24)',
                      textAlign: col.align || 'left',
                      verticalAlign: 'middle'
                    }}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
