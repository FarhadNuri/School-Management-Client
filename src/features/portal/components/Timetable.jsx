import { useState } from 'react';
import { timetableDays, timetableRows, subjectColors } from '../data/dashboard';

export default function Timetable() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="cd">
      <div className="row">
        <div>
          <h3 style={{ fontSize: '18px' }}>Timetable</h3>
          <p>August 3 – 7</p>
        </div>
        <span className="chips" style={{ margin: '0 0 0 auto' }}>
          <span
            className={`ch ${activeTab === 0 ? 'on' : ''}`}
            onClick={() => setActiveTab(0)}
          >
            This week
          </span>
          <span
            className={`ch ${activeTab === 1 ? 'on' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            Day
          </span>
        </span>
      </div>

      <div className="tt">
        <i></i>
        {timetableDays.map((d) => {
          const [day, date] = d.split(' ');
          return (
            <div key={d} className="h">
              {day}
              <b>{date}</b>
            </div>
          );
        })}
        {timetableRows.map((r, rowIdx) => (
          <div key={rowIdx} style={{ display: 'contents' }}>
            <div className="t">{r[0]}</div>
            {r.slice(1).map((subject, colIdx) => (
              <div
                key={colIdx}
                className="s"
                style={{ background: subjectColors[subject] || 'var(--g-soft)' }}
              >
                {subject}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
