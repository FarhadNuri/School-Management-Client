import { useEffect, useRef, useState, useCallback } from 'react';
import { testimonialsContent } from '../data/content';

export default function Testimonials() {
  const railRef = useRef(null);
  const [prevDisabled, setPrevDisabled] = useState(true);
  const [nextDisabled, setNextDisabled] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const rl = railRef.current;
    if (!rl) return;
    const maxScroll = rl.scrollWidth - rl.clientWidth;
    setPrevDisabled(rl.scrollLeft < 4);
    setNextDisabled(rl.scrollLeft > maxScroll - 4);
  }, []);

  const handleNext = () => {
    const rl = railRef.current;
    if (!rl || !rl.firstElementChild) return;
    rl.scrollBy({ left: rl.firstElementChild.offsetWidth + 18, behavior: 'smooth' });
  };

  const handlePrev = () => {
    const rl = railRef.current;
    if (!rl || !rl.firstElementChild) return;
    rl.scrollBy({ left: -(rl.firstElementChild.offsetWidth + 18), behavior: 'smooth' });
  };

  useEffect(() => {
    const rl = railRef.current;
    if (!rl) return;

    updateScrollButtons();
    rl.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      rl.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons]);

  return (
    <section>
      <div className="w">
        <div className="sh">
          <h2>{testimonialsContent.heading}</h2>
          <div>
            <p>{testimonialsContent.description}</p>
            <div className="ar">
              <button
                id="rp"
                aria-label="Previous"
                disabled={prevDisabled}
                onClick={handlePrev}
              >
                ←
              </button>
              <button
                id="rn"
                aria-label="Next"
                disabled={nextDisabled}
                onClick={handleNext}
              >
                →
              </button>
            </div>
          </div>
        </div>
        <div className="rail" ref={railRef}>
          {testimonialsContent.testimonials.map((item, index) => (
            <article key={index}>
              <q>{item.quote}</q>
              <div className="who">
                <i>{item.initials}</i>
                <div>
                  {item.name}
                  <small>{item.role}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
