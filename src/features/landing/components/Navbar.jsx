import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CaretDown, Moon, SignOut, SquaresFour, Sun } from '@phosphor-icons/react';
import { clearAuthSession } from '../../../services/portal/account';
import { useLandingTheme } from '../useLandingTheme';
import BrandLogo from './BrandLogo';

const NAV_ITEMS = [
  { id: 'benefits', label: 'Benefits' },
  { id: 'workflow', label: 'How it works' },
  { id: 'voices', label: 'Voices' },
  { id: 'faq', label: 'FAQ' },
];

const EASE_CURVE = [0.22, 1, 0.36, 1];

const getStoredSession = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  try {
    const raw =
      localStorage.getItem('portal_session') ||
      localStorage.getItem('guardian_session');
    if (!raw) return null;
    const data = JSON.parse(raw);
    const name =
      [data.firstName, data.lastName].filter(Boolean).join(' ') ||
      data.name ||
      'User';
    const photo =
      typeof data.photo === 'object' ? data.photo?.url || '' : data.photo || '';
    const role = (data.role || 'guardian').toLowerCase();
    return { ...data, name, photo, role };
  } catch {
    return null;
  }
};

const getDashboardPath = (role) => {
  const normalized = (role || '').toLowerCase();
  if (normalized === 'teacher') return '/teacher';
  if (normalized === 'student') return '/student';
  return '/guardian';
};

const getRoleLabel = (role) => {
  const normalized = (role || '').toLowerCase();
  if (normalized === 'teacher') return 'Teacher';
  if (normalized === 'student') return 'Student';
  if (normalized === 'guardian') return 'Guardian';
  return 'User';
};

export default function Navbar({ activeSection }) {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { isDark, toggleTheme } = useLandingTheme();

  const [userSession, setUserSession] = useState(getStoredSession);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const syncSession = () => {
      setUserSession(getStoredSession());
    };
    window.addEventListener('storage', syncSession);
    window.addEventListener('user-updated', syncSession);
    window.addEventListener('auth-changed', syncSession);
    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('user-updated', syncSession);
      window.removeEventListener('auth-changed', syncSession);
    };
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return undefined;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  const handleSectionClick = (e, id) => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
      }
    } else {
      e.preventDefault();
      navigate(`/#${id}`);
    }
  };

  const handleGoToDashboard = () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate(getDashboardPath(userSession?.role));
  };

  const handleLogout = () => {
    clearAuthSession();
    setUserSession(null);
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  const userInitial = (userSession?.name || 'U').charAt(0).toUpperCase();

  return (
    <>
      <header className="lp-navbar-wrap">
        <div className="lp-navbar-pill">
          <BrandLogo onNavigate={() => setMobileOpen(false)} />

          <nav className="lp-nav-links" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleSectionClick(e, item.id)}
                  className={`lp-nav-link title-4${isActive ? ' is-active' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="lp-nav-actions">
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`lp-theme-switch${isDark ? ' is-dark' : ''}`}
              onClick={toggleTheme}
            >
              <span className="lp-theme-switch-thumb" aria-hidden="true" />
              <span
                className={`lp-theme-switch-icon${!isDark ? ' is-active' : ''}`}
                aria-hidden="true"
              >
                <Sun size={14} weight={!isDark ? 'fill' : 'regular'} />
              </span>
              <span
                className={`lp-theme-switch-icon${isDark ? ' is-active' : ''}`}
                aria-hidden="true"
              >
                <Moon size={14} weight={isDark ? 'fill' : 'regular'} />
              </span>
            </button>

            {userSession ? (
              <div className="lp-profile-wrap" ref={dropdownRef}>
                <button
                  type="button"
                  className="lp-avatar-pill"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                >
                  <span className="lp-avatar-circle" aria-hidden="true">
                    {userSession.photo ? (
                      <img src={userSession.photo} alt="" className="lp-avatar-img" />
                    ) : (
                      userInitial
                    )}
                  </span>
                  <span className="lp-avatar-name button-sm">{userSession.name}</span>
                  <CaretDown
                    size={14}
                    weight="bold"
                    className={`lp-avatar-caret${dropdownOpen ? ' is-open' : ''}`}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      className="lp-profile-dropdown"
                      role="menu"
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
                      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: EASE_CURVE }}
                    >
                      <div className="lp-dropdown-header">
                        <span className="lp-dropdown-name body-4">{userSession.name}</span>
                        <span className="lp-role-badge caption-3">
                          {getRoleLabel(userSession.role)}
                        </span>
                      </div>

                      <div className="lp-dropdown-divider" />

                      <button
                        type="button"
                        role="menuitem"
                        className="lp-dropdown-item button-sm"
                        onClick={handleGoToDashboard}
                      >
                        <SquaresFour size={16} weight="regular" aria-hidden="true" />
                        <span>Dashboard</span>
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        className="lp-dropdown-item is-danger button-sm"
                        onClick={handleLogout}
                      >
                        <SignOut size={16} weight="regular" aria-hidden="true" />
                        <span>Log out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                className="lp-desktop-cta"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.2, ease: EASE_CURVE }}
              >
                <Link to="/login" className="lp-btn-primary button-sm">
                  Open portal
                </Link>
              </motion.div>
            )}

            <button
              type="button"
              className={`lp-menu-toggle${mobileOpen ? ' is-open' : ''}`}
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-controls="lp-mobile-drawer"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              <span className="lp-menu-bars" aria-hidden="true">
                <span className="lp-menu-bar lp-menu-bar-top" />
                <span className="lp-menu-bar lp-menu-bar-mid" />
                <span className="lp-menu-bar lp-menu-bar-bot" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="lp-mobile-drawer"
            className="lp-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: EASE_CURVE }}
          >
            <div className="lp-mobile-drawer-inner">
              <nav className="lp-mobile-nav" aria-label="Mobile sections">
                {NAV_ITEMS.map((item, idx) => {
                  const isActive = activeSection === item.id;
                  return (
                    <motion.a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => handleSectionClick(e, item.id)}
                      className={`lp-mobile-link heading-5${isActive ? ' is-active' : ''}`}
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
                      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.22,
                        delay: shouldReduceMotion ? 0 : idx * 0.06,
                        ease: EASE_CURVE,
                      }}
                    >
                      {item.label}
                    </motion.a>
                  );
                })}
              </nav>

              <motion.div
                className="lp-mobile-footer"
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                transition={{
                  duration: 0.22,
                  delay: shouldReduceMotion ? 0 : 0.24,
                  ease: EASE_CURVE,
                }}
              >
                {userSession ? (
                  <div className="lp-mobile-user-card">
                    <div className="lp-dropdown-header">
                      <span className="lp-dropdown-name body-1">{userSession.name}</span>
                      <span className="lp-role-badge caption-3">
                        {getRoleLabel(userSession.role)}
                      </span>
                    </div>
                    <div className="lp-mobile-user-actions">
                      <motion.button
                        type="button"
                        className="lp-btn-primary button-md lp-btn-full"
                        onClick={handleGoToDashboard}
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                        transition={{ duration: 0.2, ease: EASE_CURVE }}
                      >
                        Dashboard
                      </motion.button>
                      <motion.button
                        type="button"
                        className="lp-btn-secondary button-md lp-btn-full"
                        onClick={handleLogout}
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                        transition={{ duration: 0.2, ease: EASE_CURVE }}
                      >
                        Log out
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                    transition={{ duration: 0.2, ease: EASE_CURVE }}
                  >
                    <Link
                      to="/login"
                      className="lp-btn-primary button-md lp-btn-full"
                      onClick={() => setMobileOpen(false)}
                    >
                      Open portal
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
