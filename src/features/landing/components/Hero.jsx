// Note: hero-launch.jpg and hero-launch-dark.jpg currently have opaque
// backgrounds; re-exporting them as transparent PNG/SVG assets is preferred.
// Meanwhile, mix-blend-mode (--rocket-blend) + radial edge mask blend them seamlessly.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowRight } from '@phosphor-icons/react';

import { useLandingTheme } from '../useLandingTheme';
import heroLaunchImg from '../../../assets/landing/hero-launch.jpg';
import heroLaunchDarkImg from '../../../assets/landing/hero-launch-dark.jpg';
import { HERO_CONFIG } from './heroConfig';
import FloatingCard from './FloatingCard';
import RotatingWords from './RotatingWords';
import StatCounter from './StatCounter';

const EASE_CURVE = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: {},
  visible: (reduceMotion) => ({
    transition: reduceMotion
      ? { staggerChildren: 0 }
      : { staggerChildren: 0.08, delayChildren: 0.04 },
  }),
};

const itemVariants = {
  hidden: (reduceMotion) =>
    reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
  visible: (reduceMotion) =>
    reduceMotion
      ? { opacity: 1, transition: { duration: 0.2 } }
      : {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: EASE_CURVE },
        },
};

const cardsGroupVariants = {
  hidden: {},
  visible: (reduceMotion) => ({
    transition: reduceMotion
      ? { staggerChildren: 0 }
      : { staggerChildren: 0.12, delayChildren: 0.45 },
  }),
};

const getPortalTarget = () => {
  if (typeof window === 'undefined') return '/login';
  const token = localStorage.getItem('auth_token');
  if (!token) return '/login';
  try {
    const raw =
      localStorage.getItem('portal_session') ||
      localStorage.getItem('guardian_session');
    if (!raw) return '/login';
    const data = JSON.parse(raw);
    const role = (data.role || '').toLowerCase();
    if (role === 'teacher') return '/teacher';
    if (role === 'student') return '/student';
    if (role === 'guardian') return '/guardian';
    return '/guardian';
  } catch {
    return '/login';
  }
};

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { isDark } = useLandingTheme();
  const [portalTarget, setPortalTarget] = useState(getPortalTarget);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 140, damping: 24, mass: 0.4 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const cardsX = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);
  const cardsY = useTransform(smoothY, [-0.5, 0.5], [-18, 18]);

  useEffect(() => {
    const syncTarget = () => setPortalTarget(getPortalTarget());
    window.addEventListener('storage', syncTarget);
    window.addEventListener('auth-changed', syncTarget);
    return () => {
      window.removeEventListener('storage', syncTarget);
      window.removeEventListener('auth-changed', syncTarget);
    };
  }, []);

  const handleMouseMove = (event) => {
    if (shouldReduceMotion) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleScrollToWorkflow = (event) => {
    event.preventDefault();
    const target = document.getElementById(HERO_CONFIG.ctas.secondaryTargetId);
    if (target) {
      target.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <section
      className="lp-hero lp-hero-enhanced"
      aria-labelledby="hero-heading"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="lp-container lp-hero-inner"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        custom={shouldReduceMotion}
      >
        <div className="lp-hero-grid">
          <div className="lp-hero-left">
            <motion.div
              className="lp-live-eyebrow"
              variants={itemVariants}
              custom={shouldReduceMotion}
            >
              <span className="lp-ping-wrap" aria-hidden="true">
                {!shouldReduceMotion && <span className="lp-ping-ring" />}
                <span className="lp-ping-dot" />
              </span>
              <span className="caption-3 lp-live-eyebrow-text">
                {HERO_CONFIG.eyebrow}
              </span>
            </motion.div>

            <motion.h1
              id="hero-heading"
              className="lp-hero-display-title"
              variants={itemVariants}
              custom={shouldReduceMotion}
            >
              <span>{HERO_CONFIG.headline.prefix}</span>
              <span className="lp-hero-highlight">
                {HERO_CONFIG.headline.highlightPrefix}
                {HERO_CONFIG.headline.highlightUnderline}
              </span>
            </motion.h1>

            <motion.p
              className="lp-hero-subtitle body-2"
              variants={itemVariants}
              custom={shouldReduceMotion}
            >
              {HERO_CONFIG.subtitle}
            </motion.p>

            <motion.div variants={itemVariants} custom={shouldReduceMotion}>
              <RotatingWords
                prefix={HERO_CONFIG.rotatingLine.prefix}
                words={HERO_CONFIG.rotatingLine.words}
                intervalMs={HERO_CONFIG.rotatingLine.intervalMs}
                shouldReduceMotion={shouldReduceMotion}
              />
            </motion.div>

            <motion.div
              className="lp-hero-cta-row"
              variants={itemVariants}
              custom={shouldReduceMotion}
            >
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.2, ease: EASE_CURVE }}
              >
                <Link
                  to={portalTarget}
                  className="lp-btn-primary lp-hero-primary-btn lp-cta-btn button-md"
                >
                  <span>{HERO_CONFIG.ctas.primaryLabel}</span>
                  <ArrowRight
                    size={18}
                    weight="bold"
                    className="lp-cta-arrow"
                    aria-hidden="true"
                  />
                </Link>
              </motion.div>

              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.2, ease: EASE_CURVE }}
              >
                <a
                  href={`#${HERO_CONFIG.ctas.secondaryTargetId}`}
                  onClick={handleScrollToWorkflow}
                  className="lp-btn-ghost lp-cta-btn button-md"
                >
                  {HERO_CONFIG.ctas.secondaryLabel}
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              className="lp-hero-trust-row"
              variants={itemVariants}
              custom={shouldReduceMotion}
            >
              <div className="lp-trust-avatars" aria-hidden="true">
                {HERO_CONFIG.trust.initials.map((initials, idx) => (
                  <span
                    key={initials}
                    className={`lp-trust-avatar is-idx-${idx} caption-5`}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <p className="caption-2 lp-trust-text">{HERO_CONFIG.trust.text}</p>
            </motion.div>
          </div>

          <div className="lp-hero-right lp-hero-visual-stage">
            <div className="lp-hero-rocket-static">
              <img
                src={isDark ? heroLaunchDarkImg : heroLaunchImg}
                alt="Illustration of a pencil rocket launching past clouds and a sketched ringed planet"
                width={1024}
                height={1024}
                loading="eager"
                className="lp-hero-illustration"
              />
            </div>

            <motion.div
              className="lp-hero-cards-layer"
              style={shouldReduceMotion ? undefined : { x: cardsX, y: cardsY }}
              variants={cardsGroupVariants}
              custom={shouldReduceMotion}
            >
              {HERO_CONFIG.floatingCards.map((card) => (
                <FloatingCard
                  key={card.id}
                  card={card}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))}
            </motion.div>
          </div>
        </div>

        <StatCounter
          stats={HERO_CONFIG.stats}
          shouldReduceMotion={shouldReduceMotion}
          variants={itemVariants}
        />
      </motion.div>
    </section>
  );
}
