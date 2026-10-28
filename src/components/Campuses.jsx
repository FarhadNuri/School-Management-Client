import { useState } from 'react';
import { campusesContent } from '../data/content';

export default function Campuses() {
  const [activeTab, setActiveTab] = useState(0);
  const currentRegion = campusesContent.regions[activeTab];

  return (
    <section className="camp">
      <div className="w">
        <div className="cg">
          <div>
            <span className="eb">{campusesContent.eyebrow}</span>
            <h2 style={{ fontSize: 'clamp(32px, 4.4vw, 52px)' }}>
              {campusesContent.heading}
            </h2>
            <p style={{ color: 'var(--mute)', marginTop: '14px' }}>
              {campusesContent.description}
            </p>
            <div className="tabs" id="tabs">
              {campusesContent.regions.map((region, index) => (
                <button
                  type="button"
                  key={region.name}
                  className={activeTab === index ? 'on' : ''}
                  onClick={() => setActiveTab(index)}
                >
                  {region.name}
                  <small>{region.cities}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="sl" id="sl">
            {currentRegion.schools.map((school, index) => (
              <a key={school}>
                <span>{`0${index + 1}`}</span>
                <div>
                  <h3>{school}</h3>
                  <em>{campusesContent.phone}</em>
                </div>
                <b>↗</b>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
