import { useId } from 'react';

export default function SunriseLogo({
  size = 32,
  variant = 'emblem', // 'emblem' | 'mark'
  withText = false,
  className = '',
  style = {}
}) {
  const id = useId();
  const bgId = `sunrise-bg-${id}`;
  const sunId = `sunrise-sun-${id}`;
  const wingLId = `sunrise-wing-l-${id}`;
  const wingRId = `sunrise-wing-r-${id}`;
  const glowId = `sunrise-glow-${id}`;
  const borderId = `sunrise-border-${id}`;

  return (
    <div
      className={`sunrise-logo-wrap ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: withText ? '12px' : 0,
        textDecoration: 'none',
        ...style
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width={size}
        height={size}
        fill="none"
        aria-hidden="true"
        style={{ flexShrink: 0, display: 'block' }}
      >
        <defs>
          <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E2D36" />
            <stop offset="60%" stopColor="#091E24" />
            <stop offset="100%" stopColor="#051217" />
          </linearGradient>

          <linearGradient id={sunId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFBD7A" />
            <stop offset="45%" stopColor="#F59E6C" />
            <stop offset="100%" stopColor="#E26D38" />
          </linearGradient>

          <linearGradient id={wingLId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2CB0A1" />
            <stop offset="100%" stopColor="#14525B" />
          </linearGradient>

          <linearGradient id={wingRId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#47D1C3" />
            <stop offset="100%" stopColor="#1E6F78" />
          </linearGradient>

          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E6C" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#F59E6C" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#F59E6C" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={borderId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E6C" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#1E6F78" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#07171D" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {variant === 'emblem' && (
          <rect
            x="1.5"
            y="1.5"
            width="61"
            height="61"
            rx="17"
            fill={`url(#${bgId})`}
            stroke={`url(#${borderId})`}
            strokeWidth="1.5"
          />
        )}

        <circle cx="32" cy="29" r="17" fill={`url(#${glowId})`} />

        {/* 5 Symmetrical Dawn Rays */}
        <path d="M32 9.5 L33.8 17.5 L30.2 17.5 Z" fill={`url(#${sunId})`} />
        <path d="M19 15.5 L25.8 21.2 L24.2 22.8 Z" fill={`url(#${sunId})`} />
        <path d="M45 15.5 L39.8 22.8 L38.2 21.2 Z" fill={`url(#${sunId})`} />
        <path d="M13 26.5 L21.5 28 L21.1 26 Z" fill={`url(#${sunId})`} />
        <path d="M51 26.5 L42.9 26 L42.5 28 Z" fill={`url(#${sunId})`} />

        {/* Rising Sun Orb */}
        <circle cx="32" cy="29" r="8" fill={`url(#${sunId})`} />

        {/* Open Book Pages / Rising Wings */}
        <path
          d="M32 46.5 C24 43 16 44.5 13 48 C14 39.5 22 35.5 32 38.5 Z"
          fill={`url(#${wingLId})`}
        />
        <path
          d="M32 46.5 C40 43 48 44.5 51 48 C50 39.5 42 35.5 32 38.5 Z"
          fill={`url(#${wingRId})`}
        />

        {/* Dawn light catching page rims */}
        <path
          d="M32 38.5 C22 35.5 14 39.5 13 48"
          stroke="#F6F1E7"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.65"
        />
        <path
          d="M32 38.5 C42 35.5 50 39.5 51 48"
          stroke="#F6F1E7"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />

        {/* Center Spine / Path of Enlightenment */}
        <path
          d="M32 36.5 L32 48.5"
          stroke="#F6F1E7"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Core Star / Light of Wisdom */}
        <circle cx="32" cy="29" r="2.2" fill="#FFFBF5" />
      </svg>

      {withText && (
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <b
            style={{
              font: "800 20px/1.05 'Bricolage Grotesque', Georgia, serif",
              color: 'var(--cream, #F6F1E7)',
              letterSpacing: '-0.02em'
            }}
          >
            Sunrise
          </b>
          <small
            style={{
              fontSize: '9.5px',
              letterSpacing: '0.16em',
              fontWeight: 700,
              color: 'var(--acc, #F59E6C)',
              marginTop: '3px'
            }}
          >
            MODEL SCHOOL
          </small>
        </div>
      )}
    </div>
  );
}

