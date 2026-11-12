import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion';

function StatNumber({ value, suffix, shouldReduceMotion, isInView }) {
  const count = useMotionValue(shouldReduceMotion ? value : 0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (shouldReduceMotion) {
      count.set(value);
      return undefined;
    }
    if (!isInView) return undefined;
    const controls = animate(count, value, {
      duration: 1.2,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [count, isInView, shouldReduceMotion, value]);

  return (
    <span className="lp-stat-value heading-5">
      <motion.span>{shouldReduceMotion ? value : rounded}</motion.span>
      <span>{suffix}</span>
    </span>
  );
}

export default function StatCounter({ stats, shouldReduceMotion, variants }) {
  const stripRef = useRef(null);
  const isInView = useInView(stripRef, { once: true, amount: 0.35 });

  return (
    <motion.div
      ref={stripRef}
      className="lp-stats-strip"
      variants={variants}
      aria-label="Portal highlights"
    >
      {stats.map((stat) => (
        <div key={stat.id} className="lp-stat-item">
          <StatNumber
            value={stat.value}
            suffix={stat.suffix}
            shouldReduceMotion={shouldReduceMotion}
            isInView={isInView}
          />
          <span className="lp-stat-label caption-2">{stat.label}</span>
        </div>
      ))}
    </motion.div>
  );
}

