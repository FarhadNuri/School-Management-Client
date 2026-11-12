import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from '@phosphor-icons/react';

const EASE_CURVE = [0.22, 1, 0.36, 1];

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

export default function FinalCTA() {
  const shouldReduceMotion = useReducedMotion();
  const [portalTarget, setPortalTarget] = useState(getPortalTarget);

  useEffect(() => {
    const syncTarget = () => setPortalTarget(getPortalTarget());
    window.addEventListener('storage', syncTarget);
    window.addEventListener('auth-changed', syncTarget);
    return () => {
      window.removeEventListener('storage', syncTarget);
      window.removeEventListener('auth-changed', syncTarget);
    };
  }, []);

  return (
    <section
      className="lp-section lp-final-cta-section"
      aria-labelledby="final-cta-heading"
    >
      <div className="lp-container">
        <motion.div
          className="lp-final-cta"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
          whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_CURVE }}
        >
          <span className="lp-eyebrow-pill caption-3">Get started</span>

          <h2 id="final-cta-heading" className="heading-2 lp-section-title">
            Open your school portal
          </h2>

          <p className="body-2 lp-final-cta-sub">
            Attendance, grades, homework, fees and notices, ready when you are.
          </p>

          <motion.div
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE_CURVE }}
          >
            <Link to={portalTarget} className="lp-btn-primary lp-cta-btn button-md">
              <span>Open the portal</span>
              <ArrowRight size={18} weight="bold" className="lp-cta-arrow" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

