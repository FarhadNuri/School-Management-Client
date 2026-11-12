import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUp, Mail, MapPin, Phone } from 'lucide-react';
import BrandLogo from './BrandLogo';

const EASE_CURVE = [0.22, 1, 0.36, 1];

const footerConfig = {
  brand: {
    description: 'School portal for guardians, students and teachers.',
    contact: {
      location: 'Muradpur, Chattogram',
      phone: '+880 1800-000000',
      phoneHref: 'tel:+8801800000000',
      email: 'hello@sunrisemodelschool.edu.bd',
      emailHref: 'mailto:hello@sunrisemodelschool.edu.bd',
    },
  },
  groups: [
    {
      heading: 'Portal',
      links: [
        { label: 'Log in', type: 'route', to: '/login' },
        { label: 'Open portal', type: 'portal' },
        { label: 'How it works', type: 'section', id: 'workflow' },
      ],
    },
    {
      heading: 'School',
      links: [
        { label: 'About', type: 'route', to: '/about' },
        { label: 'Programs', type: 'route', to: '/programs' },
        { label: 'Activities', type: 'route', to: '/activities' },
        { label: 'Contact', type: 'route', to: '/contact' },
      ],
    },
    {
      heading: 'Resources',
      links: [
        { label: 'Benefits', type: 'section', id: 'benefits' },
        { label: 'Voices', type: 'section', id: 'voices' },
        { label: 'FAQ', type: 'section', id: 'faq' },
      ],
    },
  ],
  socials: [
    {
      label: 'Facebook',
      href: 'https://facebook.com',
      icon: 'facebook',
      ariaLabel: 'Sunrise Model School on Facebook',
    },
    {
      label: 'YouTube',
      href: 'https://youtube.com',
      icon: 'youtube',
      ariaLabel: 'Sunrise Model School on YouTube',
    },
    {
      label: 'Instagram',
      href: 'https://instagram.com',
      icon: 'instagram',
      ariaLabel: 'Sunrise Model School on Instagram',
    },
  ],
  bottom: {
    copyright: '© 2026 Sunrise Model School. All rights reserved.',
    legal: [
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
    ],
    backToTopLabel: 'Back to top',
  },
};

const getPortalTarget = () => {
  if (typeof window === 'undefined') return '/login';
  const token = localStorage.getItem('auth_token');
  if (!token) return '/login';
  try {
    const raw =
      localStorage.getItem('portal_session') ||
      localStorage.getItem('guardian_session');
    if (!raw) return '/login';
    const data = JSON.parse(raw);
    const role = (data.role || '').toLowerCase();
    if (role === 'teacher') return '/teacher';
    if (role === 'student') return '/student';
    if (role === 'guardian') return '/guardian';
    return '/guardian';
  } catch {
    return '/login';
  }
};

function SocialGlyph({ icon }) {
  if (icon === 'facebook') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }
  if (icon === 'youtube') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3v6Z" />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [portalTarget, setPortalTarget] = useState(getPortalTarget);

  useEffect(() => {
    const syncTarget = () => setPortalTarget(getPortalTarget());
    window.addEventListener('storage', syncTarget);
    window.addEventListener('auth-changed', syncTarget);
    return () => {
      window.removeEventListener('storage', syncTarget);
      window.removeEventListener('auth-changed', syncTarget);
    };
  }, []);

  const handleSectionClick = (event, id) => {
    event.preventDefault();
    if (location.pathname === '/') {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
      return;
    }
    navigate(`/#${id}`);
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  };

  const revealProps = (index) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.15 },
          transition: {
            duration: 0.42,
            delay: index * 0.08,
            ease: EASE_CURVE,
          },
        };

  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="lp-footer-grid">
          <motion.div className="lp-footer-brand" {...revealProps(0)}>
            <BrandLogo />
            <p className="lp-footer-description">
              {footerConfig.brand.description}
            </p>

            <ul className="lp-footer-contact">
              <li className="lp-footer-contact-item">
                <MapPin size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>{footerConfig.brand.contact.location}</span>
              </li>
              <li className="lp-footer-contact-item">
                <Phone size={16} strokeWidth={1.8} aria-hidden="true" />
                <a
                  href={footerConfig.brand.contact.phoneHref}
                  className="lp-footer-contact-link"
                >
                  {footerConfig.brand.contact.phone}
                </a>
              </li>
              <li className="lp-footer-contact-item">
                <Mail size={16} strokeWidth={1.8} aria-hidden="true" />
                <a
                  href={footerConfig.brand.contact.emailHref}
                  className="lp-footer-contact-link"
                >
                  {footerConfig.brand.contact.email}
                </a>
              </li>
            </ul>
          </motion.div>

          <nav className="lp-footer-nav" aria-label="Footer">
            {footerConfig.groups.map((group, groupIndex) => (
              <motion.div
                key={group.heading}
                className="lp-footer-group"
                {...revealProps(groupIndex + 1)}
              >
                <h2 className="lp-footer-group-heading">{group.heading}</h2>
                <ul className="lp-footer-link-list">
                  {group.links.map((item) => (
                    <li key={item.label}>
                      {item.type === 'section' ? (
                        <a
                          href={`/#${item.id}`}
                          onClick={(event) => handleSectionClick(event, item.id)}
                          className="lp-footer-link"
                        >
                          <span className="lp-footer-link-label">
                            {item.label}
                          </span>
                        </a>
                      ) : (
                        <Link
                          to={item.type === 'portal' ? portalTarget : item.to}
                          className="lp-footer-link"
                        >
                          <span className="lp-footer-link-label">
                            {item.label}
                          </span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            <motion.div
              className="lp-footer-group"
              {...revealProps(footerConfig.groups.length + 1)}
            >
              <h2 className="lp-footer-group-heading">Socials</h2>
              <ul className="lp-footer-link-list">
                {footerConfig.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      className="lp-footer-link lp-footer-social-link"
                    >
                      <SocialGlyph icon={social.icon} />
                      <span className="lp-footer-link-label">
                        {social.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </nav>
        </div>

        <div className="lp-footer-bottom">
          <p className="lp-footer-copy">{footerConfig.bottom.copyright}</p>

          <div className="lp-footer-bottom-right">
            {footerConfig.bottom.legal.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="lp-footer-legal-link"
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={handleBackToTop}
              className="lp-footer-top-btn"
              aria-label="Back to top"
            >
              <span>{footerConfig.bottom.backToTopLabel}</span>
              <ArrowUp size={12} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
