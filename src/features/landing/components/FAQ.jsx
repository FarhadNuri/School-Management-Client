import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CaretDown } from '@phosphor-icons/react';

const EASE_CURVE = [0.22, 1, 0.36, 1];

const FAQ_ITEMS = [
  {
    id: 'sign-in',
    question: 'Who can sign in?',
    answer:
      'Guardians, students and teachers with an active school account can sign in. Choose your role tab on the login page and enter your email and password.',
  },
  {
    id: 'guardian-privacy',
    question: "Can a guardian see other families' data?",
    answer:
      'No. Guardians only see the students linked to their account, and route guards prevent access to other roles or unrelated records.',
  },
  {
    id: 'submit-homework',
    question: 'Who can submit homework?',
    answer:
      'Only students can submit homework through file uploads or links. Guardians can inspect submitted files and notes, while teachers create, review and manage assignments.',
  },
  {
    id: 'pay-fees',
    question: 'Who can pay fees online?',
    answer:
      'Guardians can settle open invoices online and view Stripe receipts showing method, date, amount and receipt number. Students can view their fee statement and receipts in read only mode.',
  },
  {
    id: 'report-incident',
    question: 'How do I report an incident?',
    answer:
      'Open the Complaints section in your portal to file an incident report with category selection, witness details and photo attachments, then follow its status through resolution.',
  },
  {
    id: 'take-attendance',
    question: 'How do teachers take attendance?',
    answer:
      'Teachers select a class session and mark each student as present, absent, late or excused in daily roll call, with a monthly overview grid for tracking.',
  },
  {
    id: 'new-announcements',
    question: 'How will I know about new announcements?',
    answer:
      'School notices appear on your dashboard and in the Announcements page filtered by category and severity, with an unread counter badge in the top bar that updates as you read them.',
  },
  {
    id: 'login-help',
    question: 'Who do I contact if I cannot log in?',
    answer:
      'Please reach out to {{contact}} for account help or password assistance.',
  },
];

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function FAQ() {
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (idx) => {
    setOpenIndex((prev) => (prev === idx ? -1 : idx));
  };

  return (
    <section
      id="faq"
      className="lp-section lp-anchored"
      aria-labelledby="faq-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />

      <div className="lp-container">
        <motion.div
          className="lp-section-header"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
          whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_CURVE }}
        >
          <span className="lp-eyebrow-pill caption-3">Questions and answers</span>
          <h2 id="faq-heading" className="heading-2 lp-section-title">
            Frequently asked questions
          </h2>
          <p className="body-2 lp-section-subtitle">
            Everything guardians, students and teachers need to know about using the school portal.
          </p>
        </motion.div>

        <div className="lp-faq-list">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            const buttonId = `lp-faq-btn-${item.id}`;
            const panelId = `lp-faq-panel-${item.id}`;

            return (
              <div
                key={item.id}
                className={`lp-faq-item${isOpen ? ' is-open' : ''}`}
              >
                <button
                  id={buttonId}
                  type="button"
                  className="lp-faq-trigger"
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="title-2 lp-faq-question">{item.question}</span>
                  <motion.span
                    className="lp-faq-chevron"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.3,
                      ease: EASE_CURVE,
                    }}
                    aria-hidden="true"
                  >
                    <CaretDown size={18} weight="bold" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="lp-faq-panel"
                      initial={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : { height: 0, opacity: 0 }
                      }
                      animate={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { height: 'auto', opacity: 1 }
                      }
                      exit={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : { height: 0, opacity: 0 }
                      }
                      transition={{
                        duration: shouldReduceMotion ? 0.15 : 0.35,
                        ease: EASE_CURVE,
                      }}
                    >
                      <div className="lp-faq-answer body-3">{item.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

