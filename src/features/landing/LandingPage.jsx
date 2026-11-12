import { useEffect, useState } from 'react';
import '@fontsource-variable/geist';
import './landing.css';
import { useLandingTheme } from './useLandingTheme';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import TaglineReveal from './components/TaglineReveal';
import Benefits from './components/Benefits';
import HowItWorks from './components/HowItWorks';
import Proof from './components/Proof';
import FAQ from './components/FAQ';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

const SECTION_IDS = ['benefits', 'workflow', 'voices', 'faq'];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('');
  const { theme } = useLandingTheme();

  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (elements.length === 0 || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      { threshold: 0.3 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-root" data-lp-theme={theme}>
      <a href="#main-content" className="lp-skip-link button-sm">
        Skip to content
      </a>

      <Navbar activeSection={activeSection} />

      <main id="main-content" className="lp-main">
        <Hero />
        <ProblemSolution />
        <TaglineReveal />
        <Benefits />
        <HowItWorks />
        <Proof />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
