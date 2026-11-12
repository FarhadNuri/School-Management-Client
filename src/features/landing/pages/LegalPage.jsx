import { Link } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import '@fontsource-variable/geist';
import '../landing.css';
import { useLandingTheme } from '../useLandingTheme';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LEGAL_COPY = {
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy policy',
    summary:
      'How Sunrise Model School handles account, attendance, grade and payment records in the school portal.',
    sections: [
      {
        heading: 'Role based data access',
        body: 'Portal routes are protected by authentication and role guards. Guardians see linked student records, students see their own coursework and attendance, and teachers access their assigned classes.',
      },
      {
        heading: 'Billing and receipts',
        body: 'Online fee payments are processed through Stripe checkout, and paid invoices store the official Stripe receipt details.',
      },
      {
        heading: 'Policy updates and questions',
        body: '{{privacy_policy_details}} For questions about portal records, contact {{contact}}.',
      },
    ],
  },
  terms: {
    eyebrow: 'Legal',
    title: 'Terms of use',
    summary:
      'Guidelines for guardians, students and teachers signing into the Sunrise Model School portal.',
    sections: [
      {
        heading: 'Authorized accounts',
        body: 'Access is limited to registered guardians, students and teachers of Sunrise Model School. Users must sign in under their assigned role.',
      },
      {
        heading: 'Acceptable use',
        body: 'Homework submissions, study materials, complaint reports and payment actions must be used strictly for school communication and coursework.',
      },
      {
        heading: 'Additional terms',
        body: '{{terms_of_service_details}} For support or account issues, contact {{contact}}.',
      },
    ],
  },
};

export default function LegalPage({ type = 'privacy' }) {
  const { theme } = useLandingTheme();
  const doc = LEGAL_COPY[type] || LEGAL_COPY.privacy;

  return (
    <div className="landing-root" data-lp-theme={theme}>
      <a href="#main-content" className="lp-skip-link button-sm">
        Skip to content
      </a>
      <Navbar activeSection="" />

      <main id="main-content" className="lp-main">
        <section className="lp-hero">
          <div className="lp-container">
            <div className="lp-legal-wrap">
              <Link to="/" className="lp-back-link button-sm">
                <ArrowLeft size={16} weight="bold" aria-hidden="true" />
                <span>Back to home</span>
              </Link>

              <span className="lp-eyebrow-pill caption-3">{doc.eyebrow}</span>
              <h1 className="heading-2 lp-section-title">{doc.title}</h1>
              <p className="body-2 lp-section-subtitle">{doc.summary}</p>

              <div className="lp-legal-cards">
                {doc.sections.map((section) => (
                  <article key={section.heading} className="lp-card lp-legal-card">
                    <h2 className="heading-5 lp-card-title">{section.heading}</h2>
                    <p className="body-3 lp-card-text">{section.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

