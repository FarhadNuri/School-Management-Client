import { useEffect, useRef, useState } from 'react';

const TAGLINE_TEXT =
  'Every grade, every absence, every notice in one place. Nothing gets lost between school and home.';
const WORDS = TAGLINE_TEXT.split(' ');

const getInitialReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export default function TaglineReveal() {
  const containerRef = useRef(null);
  const [prefersReduced, setPrefersReduced] = useState(getInitialReducedMotion);
  const [revealedCount, setRevealedCount] = useState(() =>
    getInitialReducedMotion() ? WORDS.length : 0
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => {
      setPrefersReduced(e.matches);
      if (e.matches) {
        setRevealedCount(WORDS.length);
      }
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (prefersReduced) return undefined;

    let rafId = null;

    const updateReveal = () => {
      rafId = null;
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const startLine = vh * 0.85;
      const endLine = vh * 0.35;
      const rawProgress = (startLine - rect.top) / (startLine - endLine);
      const clamped = Math.max(0, Math.min(1, rawProgress));
      const nextCount = Math.round(clamped * WORDS.length);

      setRevealedCount((prev) => (prev === nextCount ? prev : nextCount));
    };

    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateReveal);
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [prefersReduced]);

  return (
    <section className="lp-section lp-tagline-section" aria-label="Core promise">
      <div className="lp-container">
        <div ref={containerRef} className="lp-tagline-wrap">
          <p className="heading-2 lp-tagline-text">
            {WORDS.map((word, idx) => {
              const isActive = prefersReduced || idx < revealedCount;
              return (
                <span
                  key={`${word}-${idx}`}
                  className={`lp-tagline-word${isActive ? ' is-active' : ''}`}
                >
                  {word}
                  {idx < WORDS.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
}

