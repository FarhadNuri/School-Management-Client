import { motion, useReducedMotion } from 'framer-motion';
import {
  BookOpenText,
  CalendarCheck,
  ChartLineUp,
  Receipt,
} from '@phosphor-icons/react';

import attendanceImg from '../../../assets/landing/benefit-attendance.webp';
import gradesImg from '../../../assets/landing/benefit-grades.webp';
import homeworkImg from '../../../assets/landing/benefit-homework.webp';
import feesImg from '../../../assets/landing/benefit-fees.webp';

const EASE_CURVE = [0.22, 1, 0.36, 1];

const BENEFIT_CARDS = [
  {
    id: 'attendance',
    tag: 'Attendance',
    Icon: CalendarCheck,
    title: 'Guardians know about an absence the same day',
    text: 'Teachers mark present, absent, late or excused for each class. Guardians and students see the percentage and the full history.',
    image: attendanceImg,
    alt: 'Cropped view of student attendance percentage ring and daily attendance log',
    slotLabel: 'benefit-attendance.webp',
  },
  {
    id: 'grades',
    tag: 'Grades',
    Icon: ChartLineUp,
    title: 'Term results and teacher feedback in one report',
    text: 'Subject marks, term GPA, grading scale and instructor comments, shown clearly to students and guardians.',
    image: gradesImg,
    alt: 'Cropped view of term grades report showing subject scores, GPA and teacher feedback',
    slotLabel: 'benefit-grades.webp',
  },
  {
    id: 'homework',
    tag: 'Homework and materials',
    Icon: BookOpenText,
    title: 'Students see what is due, guardians see what was handed in',
    text: 'Only students submit. Guardians can open the submission to check files and notes. Teachers upload lesson notes and study guides.',
    image: homeworkImg,
    alt: 'Cropped view of homework submission status and study materials list',
    slotLabel: 'benefit-homework.webp',
  },
  {
    id: 'fees',
    tag: 'Fees',
    Icon: Receipt,
    title: 'Pay online and keep the receipt',
    text: 'Guardians pay open invoices online. Paid invoices show the Stripe receipt with method, date and amount. Students can view their fee statement.',
    image: feesImg,
    alt: 'Cropped view of school fee invoices and paid Stripe receipt details',
    slotLabel: 'benefit-fees.webp',
  },
];

export default function Benefits() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="benefits"
      className="lp-section lp-anchored"
      aria-labelledby="benefits-heading"
    >
      <div className="lp-container">
        <motion.div
          className="lp-section-header"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
          whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_CURVE }}
        >
          <span className="lp-eyebrow-pill caption-3">Core benefits</span>
          <h2 id="benefits-heading" className="heading-2 lp-section-title">
            Built for how schools actually run
          </h2>
          <p className="body-2 lp-section-subtitle">
            Each role sees the tools it needs and nothing else.
          </p>
        </motion.div>

        <div className="lp-grid-2">
          {BENEFIT_CARDS.map((card, idx) => {
            const IconComponent = card.Icon;
            return (
              <motion.article
                key={card.id}
                className="lp-card lp-benefit-card"
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
                <div className="lp-benefit-top">
                  <span className="lp-benefit-icon" aria-hidden="true">
                    <IconComponent size={20} weight="regular" />
                  </span>
                  <span className="lp-tag-pill caption-4">{card.tag}</span>
                </div>

                <h3 className="heading-5 lp-card-title">{card.title}</h3>
                <p className="body-3 lp-card-text">{card.text}</p>

                <div className="lp-benefit-media">
                  <img
                    src={card.image}
                    alt={card.alt}
                    width={800}
                    height={500}
                    loading="lazy"
                    className="lp-benefit-img"
                  />
                  <span className="lp-media-slot-caption caption-5" aria-hidden="true">
                    {card.slotLabel}
                  </span>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

