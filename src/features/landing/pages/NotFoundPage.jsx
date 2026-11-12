import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from '@phosphor-icons/react';
import '@fontsource-variable/geist';
import '../landing.css';
import { useLandingTheme } from '../useLandingTheme';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  const { theme } = useLandingTheme();

  return (
    <div className="landing-root" data-lp-theme={theme}>
      <a href="#main-content" className="lp-skip-link button-sm">
        Skip to content
      </a>

      <Navbar activeSection="" />

      <main id="main-content" className="lp-main">
        <section className="lp-hero" aria-labelledby="notfound-heading">
          <div className="lp-container">
            <div className="lp-notfound-card">
              <span className="lp-benefit-icon" aria-hidden="true">
                <Compass size={22} weight="regular" />
              </span>
              <span className="lp-eyebrow-pill caption-3">404</span>
              <h1 id="notfound-heading" className="heading-2 lp-section-title">
                Page not found
              </h1>
              <p className="body-2 lp-notfound-text">
                The page you requested does not exist or may have moved.
              </p>
              <div className="lp-notfound-actions">
                <Link to="/" className="lp-btn-primary lp-cta-btn button-md">
                  <ArrowLeft size={18} weight="bold" aria-hidden="true" />
                  <span>Back to home</span>
                </Link>
                <Link to="/login" className="lp-btn-secondary button-md">
                  Open portal
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

