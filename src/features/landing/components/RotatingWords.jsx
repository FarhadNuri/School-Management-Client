import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function RotatingWords({
  prefix,
  words,
  intervalMs = 2200,
  shouldReduceMotion,
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || words.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, shouldReduceMotion, words.length]);

  const currentWord = words[index % words.length];
  const staticList = words.join(', ');

  return (
    <p className="lp-rotating-line body-2">
      <span>{prefix} </span>
      {shouldReduceMotion ? (
        <span className="lp-rotating-static">{staticList}</span>
      ) : (
        <>
          <span className="lp-rotating-slot" aria-live="off" aria-hidden="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={currentWord}
                className="lp-rotating-word"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                {currentWord}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="lp-sr-only">{staticList}</span>
        </>
      )}
    </p>
  );
}

