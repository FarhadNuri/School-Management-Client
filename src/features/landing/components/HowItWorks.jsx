import { motion, useReducedMotion } from 'framer-motion';

const EASE_CURVE = [0.22, 1, 0.36, 1];

const STEPS = [
  {
    number: '01',
    title: 'Pick your role and sign in',
    text: 'Select the Guardian, Student or Teacher tab and sign in with a password reveal toggle.',
  },
  {
    number: '02',
    title: 'Open your dashboard',
    text: 'Your greeting, timetable and latest notices are ready on arrival.',
  },
  {
    number: '03',
    title: 'Do what you came for',
    text: 'Teachers take attendance and post grades, guardians check results and pay fees, and students submit homework.',
  },
];

export default function HowItWorks() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="workflow"
      className="lp-section lp-anchored"
      aria-labelledby="workflow-heading"
    >
      <div className="lp-container">
        <motion.div
          className="lp-section-header"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
          whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_CURVE }}
        >
          <span className="lp-eyebrow-pill caption-3">How it works</span>
          <h2 id="workflow-heading" className="heading-2 lp-section-title">
            Three steps from login to answers
          </h2>
          <p className="body-2 lp-section-subtitle">
            Every user signs into one portal and lands directly on the tools built for their role.
          </p>
        </motion.div>

        <div className="lp-grid-3">
          {STEPS.map((step, idx) => (
            <motion.article
              key={step.number}
              className="lp-card lp-step-card"
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
              <span className="lp-step-number heading-5" aria-hidden="true">
                {step.number}
              </span>
              <h3 className="heading-5 lp-card-title">{step.title}</h3>
              <p className="body-3 lp-card-text">{step.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

