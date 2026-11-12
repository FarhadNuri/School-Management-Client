import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  CaretLeft,
  CaretRight,
  ClipboardText,
  Receipt,
  ShieldCheck,
  Star,
} from '@phosphor-icons/react';

const EASE_CURVE = [0.22, 1, 0.36, 1];

const PILLARS = [
  {
    id: 'role-routes',
    Icon: ShieldCheck,
    title: 'Role based routes',
    text: "Guardians, students and teachers cannot open each other's pages.",
  },
  {
    id: 'official-receipts',
    Icon: Receipt,
    title: 'Official receipts',
    text: 'Every paid invoice carries its Stripe receipt.',
  },
  {
    id: 'complaint-tracking',
    Icon: ClipboardText,
    title: 'Complaint tracking',
    text: 'Every incident has a status from filing to follow up.',
  },
];

const TESTIMONIALS = [
  {
    id: 't1',
    topic: 'Attendance',
    quote:
      'On rainy school mornings, I used to worry after dropping my daughter at the gate. Now I check her attendance log from my desk and know she reached class safely.',
    name: 'Farhana Yasmin',
    role: 'Parent, Class 6',
    initials: 'FY',
  },
  {
    id: 't2',
    topic: 'Gradebook',
    quote:
      'Entering class test marks and final term remarks in one sheet saves our department hours after exams. Guardians read the full breakdown with GPA as soon as results are published.',
    name: 'Mahmudul Hasan',
    role: 'Mathematics teacher',
    initials: 'MH',
  },
  {
    id: 't3',
    topic: 'Fees',
    quote:
      'Both my husband and I work office hours, so visiting the accounts counter during school time was difficult. Paying tuition online and saving the Stripe receipt keeps our records clear.',
    name: 'Sadia Afrin',
    role: 'Parent, Class 4',
    initials: 'SA',
  },
  {
    id: 't4',
    topic: 'Homework',
    quote:
      'Every assignment due date and teacher guide stays listed under each subject. Before weekly tests, I open past lesson files and verify every task I handed in.',
    name: 'Nusrat Jahan',
    role: 'Class 8 student',
    initials: 'NJ',
  },
  {
    id: 't5',
    topic: 'Notices',
    quote:
      'Paper circulars used to get crumpled inside school bags or lost before reaching home. Posting holiday and exam schedules by class ensures every guardian sees the same notice.',
    name: 'Kamrul Islam',
    role: 'Class teacher',
    initials: 'KI',
  },
  {
    id: 't6',
    topic: 'Complaints',
    quote:
      'When we reported a school transport timing concern, we did not have to make repeated phone calls. We attached the details in one form and followed the review status until resolved.',
    name: 'Tahmidul Karim',
    role: 'Parent, Class 9',
    initials: 'TK',
  },
  {
    id: 't7',
    topic: 'Overview',
    quote:
      'Having two children in different classes used to mean checking two separate diaries every evening. Seeing both students under one guardian account keeps daily updates simple.',
    name: 'Sharmeen Akter',
    role: 'Parent, Class 3 and Class 7',
    initials: 'SA',
  },
  {
    id: 't8',
    topic: 'Attendance',
    quote:
      'Before term exams begin, small gaps in attendance can affect preparation quickly. Reviewing the attendance percentage ring alongside past dates helps our family stay consistent.',
    name: 'Tariqul Islam',
    role: 'Parent, Class 5',
    initials: 'TI',
  },
  {
    id: 't9',
    topic: 'Materials',
    quote:
      'Whenever my son misses school due to fever, I no longer need to message other parents for class notes. Subject slides and study guides stay organized inside his materials tab.',
    name: 'Tasnim Chowdhury',
    role: 'Parent, Class 7',
    initials: 'TC',
  },
  {
    id: 't10',
    topic: 'Fees',
    quote:
      'Keeping old paper payment slips in a home file used to be tedious at year end. Now every paid invoice shows the date, payment method and Stripe receipt number clearly.',
    name: 'Rezaul Karim',
    role: 'Parent, Class 10',
    initials: 'RK',
  },
];

const getInitialDesktop = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia('(min-width: 768px)').matches;
};

export default function Proof() {
  const shouldReduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(getInitialDesktop);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(min-width: 768px)');
    const handleChange = (e) => {
      setIsDesktop(e.matches);
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  const slides = useMemo(() => {
    const perSlide = isDesktop ? 2 : 1;
    const groups = [];
    for (let i = 0; i < TESTIMONIALS.length; i += perSlide) {
      groups.push(TESTIMONIALS.slice(i, i + perSlide));
    }
    return groups;
  }, [isDesktop]);

  const totalSlides = slides.length;
  const safeSlide = currentSlide % totalSlides;

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return undefined;
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isPaused, totalSlides]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  return (
    <section
      id="voices"
      className="lp-section lp-anchored"
      aria-labelledby="proof-heading"
    >
      <div className="lp-container">
        {/* Part A: Access and trust */}
        <motion.div
          className="lp-section-header"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
          whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: EASE_CURVE }}
        >
          <span className="lp-eyebrow-pill caption-3">Access and trust</span>
          <h2 id="proof-heading" className="heading-2 lp-section-title">
            Every role sees only what it should
          </h2>
          <p className="body-2 lp-section-subtitle">
            Strict role boundaries, payment records and tracked incident statuses
            keep school information separated and clear.
          </p>
        </motion.div>

        <div className="lp-grid-3">
          {PILLARS.map((pillar, idx) => {
            const IconComponent = pillar.Icon;
            return (
              <motion.article
                key={pillar.id}
                className="lp-card lp-pillar-card"
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
                <span className="lp-benefit-icon" aria-hidden="true">
                  <IconComponent size={20} weight="regular" />
                </span>
                <h3 className="heading-5 lp-card-title">{pillar.title}</h3>
                <p className="body-3 lp-card-text">{pillar.text}</p>
              </motion.article>
            );
          })}
        </div>

        {/* Part B: Voices Carousel */}
        <div className="lp-voices-block">
          <motion.div
            className="lp-section-header"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
            whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: EASE_CURVE }}
          >
            <span className="lp-eyebrow-pill caption-3">Voices</span>
            <h3 className="heading-3 lp-section-title">
              What families and teachers say
            </h3>
            <p className="body-2 lp-section-subtitle">
              Notes from parents, students and teachers using the portal.
            </p>
          </motion.div>

          <div
            className="lp-voices-carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setIsPaused(false);
              }
            }}
            aria-roledescription="carousel"
            aria-label="Family and teacher voices"
          >
            <div className="lp-voices-viewport">
              <motion.div
                className="lp-voices-track"
                animate={{ x: `-${safeSlide * 100}%` }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.7,
                  ease: EASE_CURVE,
                }}
              >
                {slides.map((group, slideIdx) => (
                  <div
                    key={`slide-${slideIdx}-${group.map((g) => g.id).join('-')}`}
                    className={`lp-voices-slide${isDesktop ? ' is-two' : ''}`}
                  >
                    {group.map((item) => (
                      <motion.article
                        key={item.id}
                        className="lp-card lp-voice-card"
                        whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                        transition={{ duration: 0.3, ease: EASE_CURVE }}
                      >
                        <div className="lp-voice-top">
                          <div className="lp-stars" aria-label="5 out of 5 stars">
                            {[0, 1, 2, 3, 4].map((starIdx) => (
                              <Star
                                key={starIdx}
                                size={16}
                                weight="fill"
                                className="lp-star-icon"
                                aria-hidden="true"
                              />
                            ))}
                          </div>
                          <span className="lp-tag-pill caption-4">{item.topic}</span>
                        </div>

                        <p className="body-2 lp-voice-quote">{item.quote}</p>

                        <div className="lp-voice-author">
                          <span className="lp-voice-avatar caption-3" aria-hidden="true">
                            {item.initials}
                          </span>
                          <div className="lp-voice-meta">
                            <span className="body-4 lp-voice-name">{item.name}</span>
                            <span className="caption-2 lp-voice-role">{item.role}</span>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="lp-voices-controls">
              <div
                className="lp-browser-indicators"
                role="tablist"
                aria-label="Select testimonial slide"
              >
                {slides.map((_, idx) => {
                  const isActive = idx === safeSlide;
                  return (
                    <button
                      key={`voice-dot-${idx}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Show testimonial slide ${idx + 1}`}
                      onClick={() => setCurrentSlide(idx)}
                      className={`lp-slide-pill${isActive ? ' is-active' : ''}`}
                    />
                  );
                })}
              </div>

              <div className="lp-browser-controls">
                <motion.button
                  type="button"
                  className="lp-slide-btn button-sm"
                  onClick={handlePrev}
                  aria-label="Previous testimonials"
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.2, ease: EASE_CURVE }}
                >
                  <CaretLeft size={14} weight="bold" aria-hidden="true" />
                  <span className="lp-slide-btn-text">Prev</span>
                </motion.button>
                <motion.button
                  type="button"
                  className="lp-slide-btn button-sm"
                  onClick={handleNext}
                  aria-label="Next testimonials"
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.2, ease: EASE_CURVE }}
                >
                  <span className="lp-slide-btn-text">Next</span>
                  <CaretRight size={14} weight="bold" aria-hidden="true" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

