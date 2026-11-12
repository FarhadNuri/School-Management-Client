import { motion, useReducedMotion } from 'framer-motion';
import { Check, X } from '@phosphor-icons/react';

const EASE_CURVE = [0.22, 1, 0.36, 1];

const PROBLEM_ITEMS = [
  'Notices on paper and in chat groups that many parents never see',
  'Absences that guardians learn about days later',
  'Fee receipts lost between bank, school office and home',
  'Complaints with no record of who replied or when',
];

const SOLUTION_ITEMS = [
  'Announcements sent to the right role, with an unread badge',
  'Live attendance with a percentage ring for each student',
  'Stripe receipts saved against every paid invoice',
  'Complaints tracked from filing to resolution',
];

export default function ProblemSolution() {
  const shouldReduceMotion = useReducedMotion();

  const cards = [
    {
      id: 'scattered',
      title: 'Scattered updates',
      items: PROBLEM_ITEMS,
      tone: 'error',
    },
    {
      id: 'portal',
      title: 'One school portal',
      items: SOLUTION_ITEMS,
      tone: 'success',
    },
  ];

  return (
    <section className="lp-section" aria-labelledby="problem-heading">
      <div className="lp-container">
        <motion.div
          className="lp-section-header"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
          whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_CURVE }}
        >
          <span className="lp-eyebrow-pill caption-3">The school day problem</span>
          <h2 id="problem-heading" className="heading-2 lp-section-title">
            Stop losing school updates in chat groups
          </h2>
          <p className="body-2 lp-section-subtitle">
            When notices, absences and fees travel through paper, calls and
            messages, families find out late. Sunrise puts them in one place.
          </p>
        </motion.div>

        <div className="lp-grid-2">
          {cards.map((card, idx) => {
            const isError = card.tone === 'error';
            return (
              <motion.article
                key={card.id}
                className="lp-card lp-compare-card"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
                whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                transition={{
                  duration: 0.5,
                  delay: shouldReduceMotion ? 0 : idx * 0.08,
                  ease: EASE_CURVE,
                }}
              >
                <div className="lp-compare-header">
                  <span
                    className={`lp-status-badge ${isError ? 'is-error' : 'is-success'}`}
                    aria-hidden="true"
                  >
                    {isError ? (
                      <X size={18} weight="bold" />
                    ) : (
                      <Check size={18} weight="bold" />
                    )}
                  </span>
                  <h3 className="heading-5 lp-card-title">{card.title}</h3>
                </div>

                <ul className="lp-compare-list">
                  {card.items.map((item) => (
                    <li key={item} className="lp-compare-item body-3">
                      <span
                        className={`lp-compare-bullet ${isError ? 'is-error' : 'is-success'}`}
                        aria-hidden="true"
                      >
                        {isError ? (
                          <X size={14} weight="bold" />
                        ) : (
                          <Check size={14} weight="bold" />
                        )}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

