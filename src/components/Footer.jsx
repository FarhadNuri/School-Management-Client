import { Link } from 'react-router-dom';
import { MapPin } from '@phosphor-icons/react';
import '@fontsource-variable/geist';
import SunriseLogo from './ui/SunriseLogo';

const PAGE_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/programs', label: 'Programs' },
  { to: '/activities', label: 'Activities' },
  { to: '/contact', label: 'Contact' },
  { to: '/login', label: 'Log in' },
];

export default function Footer() {
  return (
    <footer className="sms-sub-footer">
      <div className="sms-sub-footer-inner">
        <div className="sms-sub-footer-top">
          <div className="sms-sub-footer-brand">
            <Link to="/" className="header-brand">
              <SunriseLogo size={32} />
              <span className="sub-brand-text">
                <b>Sunrise</b>
                <small>Model School</small>
              </span>
            </Link>
            <p className="sms-sub-footer-tagline">
              School portal for guardians, students and teachers
            </p>
            <p className="sms-sub-footer-location">
              <MapPin size={14} weight="regular" aria-hidden="true" />
              <span>Muradpur, Chattogram</span>
            </p>
          </div>

          <nav className="sms-sub-footer-nav" aria-label="Footer navigation">
            {PAGE_LINKS.map((item) => (
              <Link key={item.to} to={item.to} className="sms-sub-footer-link">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="sms-sub-footer-bottom">
          <p className="sms-sub-footer-copy">
            © 2026 Sunrise Model School. All rights reserved.
          </p>
          <div className="sms-sub-footer-legal">
            <Link to="/privacy" className="sms-sub-footer-legal-link">
              Privacy
            </Link>
            <Link to="/terms" className="sms-sub-footer-legal-link">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
