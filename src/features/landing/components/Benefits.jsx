import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';

const EASE_CURVE = [0.22, 1, 0.36, 1];
const SLIDE_INTERVAL_MS = 3000;

const BENEFIT_SLIDES = [
  {
    id: 'routine',
    title: 'Dynamic Class Routine',
    subtitle: 'Dynamic daily class routines, period schedules, and teacher assignments right on the dashboard',
    url: 'sunrisemodelschool.edu.bd/portal/routine',
    image: '/studentdashboardnew.png',
    fallbackImage: '/studentdashboard.png',
    alt: 'Dynamic class routine and period schedule on the student dashboard',
  },
  {
    id: 'attendance',
    title: 'Attendance Tracking',
    subtitle: 'Guardians know about an absence the same day with real-time digital roll call',
    url: 'sunrisemodelschool.edu.bd/portal/attendance',
    image: '/attendance.png',
    fallbackImage: '/grades.png',
    alt: 'Attendance tracking dashboard showing attendance percentage and roll call',
  },
  {
    id: 'homework',
    title: 'Homework & Coursework',
    subtitle: 'Students track due dates, submit tasks online, and review teacher remarks',
    url: 'sunrisemodelschool.edu.bd/portal/homework',
    image: '/studenthomeworksnew.png',
    fallbackImage: '/homeworks.png',
    alt: 'Student homework assignments and coursework submission portal',
  },
  {
    id: 'announcements',
    title: 'Notices & Announcements',
    subtitle: 'Official school circulars, exam schedules, and urgent updates broadcast in real time',
    url: 'sunrisemodelschool.edu.bd/portal/announcements',
    image: '/studentannouncement.png',
    fallbackImage: '/studentannouncement.png',
    alt: 'Official school announcements and noticeboard portal',
  },
  {
    id: 'grades',
    title: 'Term Grades & Feedback',
    subtitle: 'Subject scores, GPA, grading scale and teacher feedback in one report',
    url: 'sunrisemodelschool.edu.bd/portal/grades',
    image: '/teachergrades.png',
    fallbackImage: '/grades.png',
    alt: 'Academic report and grading breakdown for students and guardians',
  },
  {
    id: 'fees',
    title: 'Online Fee Payments',
    subtitle: 'Pay open tuition and fees online with instant downloadable receipts',
    url: 'sunrisemodelschool.edu.bd/portal/payments',
    image: '/studentpayments.png',
    fallbackImage: '/studentpayments.png',
    alt: 'School fee invoices and payment history dashboard',
  },
];

export default function Benefits() {
  const shouldReduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % BENEFIT_SLIDES.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused, currentIndex]);

  const selectSlide = (index) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + BENEFIT_SLIDES.length) % BENEFIT_SLIDES.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % BENEFIT_SLIDES.length);
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartXRef.current = null;
  };

  const currentSlide = BENEFIT_SLIDES[currentIndex];

  const slideVariants = {
    enter: (dir) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.32 },
      },
    },
    exit: (dir) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? -60 : 60,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.25 },
      },
    }),
  };

  return (
    <section
      id="benefits"
      className="lp-section lp-anchored"
      aria-labelledby="benefits-heading"
    >
      <div className="lp-container">
        {/* Centered Section Header */}
        <motion.div
          className="lp-section-header lp-benefits-header"
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
            Class routine, attendance, homework, announcements, grades and fees in one place.
          </p>
        </motion.div>

        {/* DevPulse-style Centered Mockup Frame */}
        <motion.div
          className="lp-browser-mockup"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
          whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, ease: EASE_CURVE }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Browser Bar */}
          <div className="lp-browser-topbar">
            {/* Left 3 Window Dots */}
            <div className="lp-browser-dots" aria-hidden="true">
              <span className="lp-browser-dot dot-red" />
              <span className="lp-browser-dot dot-yellow" />
              <span className="lp-browser-dot dot-green" />
            </div>

            {/* Center URL Pill */}
            <div className="lp-browser-url-pill">
              <Lock size={12} strokeWidth={2.2} className="lp-browser-lock-icon" aria-hidden="true" />
              <span className="lp-browser-url-text">{currentSlide.url}</span>
            </div>

            {/* Right Slide Counter */}
            <div className="lp-browser-counter" aria-label={`Slide ${currentIndex + 1} of ${BENEFIT_SLIDES.length}`}>
              <span>{currentIndex + 1}</span>
              <span className="lp-browser-counter-divider">/</span>
              <span>{BENEFIT_SLIDES.length}</span>
            </div>
          </div>

          {/* Main Screenshot Viewport */}
          <div className="lp-browser-viewport">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentSlide.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="lp-browser-slide"
              >
                <img
                  src={currentSlide.image}
                  alt={currentSlide.alt}
                  width={1200}
                  height={750}
                  loading="lazy"
                  className="lp-browser-img"
                  onError={(e) => {
                    if (currentSlide.fallbackImage && e.currentTarget.src !== currentSlide.fallbackImage) {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = currentSlide.fallbackImage;
                    }
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Control Bar */}
          <div className="lp-browser-bottombar">
            {/* Left: Active Feature Title with Indicator Dot */}
            <div className="lp-browser-active-info">
              <span className="lp-browser-status-dot" aria-hidden="true" />
              <span className="lp-browser-feature-title">{currentSlide.title}</span>
            </div>

            {/* Center: Pagination Dots */}
            <div
              className="lp-browser-dots-nav"
              role="tablist"
              aria-label="Benefit screenshots pagination"
            >
              {BENEFIT_SLIDES.map((slide, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Show ${slide.title}`}
                    className={`lp-browser-dot-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => selectSlide(idx)}
                  />
                );
              })}
            </div>

            {/* Right: Prev / Next Navigation Arrows */}
            <div className="lp-browser-arrows" aria-label="Slide navigation">
              <button
                type="button"
                className="lp-browser-arrow-btn"
                onClick={handlePrev}
                aria-label="Previous screenshot"
              >
                <ChevronLeft size={16} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                className="lp-browser-arrow-btn"
                onClick={handleNext}
                aria-label="Next screenshot"
              >
                <ChevronRight size={16} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
