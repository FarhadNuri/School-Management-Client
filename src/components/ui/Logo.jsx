import SunriseLogo from './SunriseLogo';

export default function Logo({ className = "logo" }) {
  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <SunriseLogo size={32} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <b>Sunrise</b>
        <small>MODEL SCHOOL</small>
      </div>
    </div>
  );
}
