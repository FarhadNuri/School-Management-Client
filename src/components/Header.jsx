import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CaretDown,
  List,
  SignOut,
  SquaresFour,
  X,
} from '@phosphor-icons/react';
import '@fontsource-variable/geist';
import SunriseLogo from './ui/SunriseLogo';
import { clearAuthSession } from '../services/portal/account';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Programs', path: '/programs' },
  { label: 'Activities', path: '/activities' },
  { label: 'Contact', path: '/contact' },
];

const getStoredSession = () => {
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
  if (normalized === 'guardian') return '/guardian';
  return '/guardian';
};

const getRoleLabel = (role) => {
  const normalized = (role || '').toLowerCase();
  if (normalized === 'teacher') return 'TEACHER';
  if (normalized === 'student') return 'STUDENT';
  if (normalized === 'guardian') return 'GUARDIAN';
  return 'USER';
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userSession, setUserSession] = useState(getStoredSession);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  useEffect(() => {
    const syncSession = () => setUserSession(getStoredSession());
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
    if (!isDropdownOpen) return undefined;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const handleGoToDashboard = () => {
    setIsDropdownOpen(false);
    setMobileOpen(false);
    navigate(getDashboardPath(userSession?.role));
  };

  const handleLogout = () => {
    clearAuthSession();
    setUserSession(null);
    setIsDropdownOpen(false);
    setMobileOpen(false);
  };

  const isCurrent = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="main-header">
      <div className="main-header-inner">
        <Link
          to="/"
          className="header-brand"
          onClick={() => {
            setIsDropdownOpen(false);
            setMobileOpen(false);
          }}
        >
          <SunriseLogo size={32} />
          <span className="sub-brand-text">
            <b>Sunrise</b>
            <small>Model School</small>
          </span>
        </Link>

        <nav className="header-nav" aria-label="Primary navigation">
          {NAV_LINKS.map((item) => {
            const active = isCurrent(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item${active ? ' active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => setIsDropdownOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-actions">
          {userSession ? (
            <div className="header-profile-container" ref={dropdownRef}>
              <button
                type="button"
                className="header-profile-btn"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="menu"
                title={`${userSession.name} (${getRoleLabel(userSession.role)})`}
              >
                <span className="header-avatar-circle" aria-hidden="true">
                  {userSession.photo ? (
                    <img
                      src={userSession.photo}
                      alt=""
                      className="header-profile-avatar-img"
                    />
                  ) : (
                    (userSession.name || 'U').charAt(0).toUpperCase()
                  )}
                </span>
                <span className="header-avatar-name">{userSession.name}</span>
                <CaretDown size={14} weight="bold" aria-hidden="true" />
              </button>

              {isDropdownOpen && (
                <div className="header-profile-dropdown" role="menu">
                  <div className="header-profile-info">
                    <div className="header-profile-name" title={userSession.name}>
                      {userSession.name}
                    </div>
                    <span className="header-profile-role-badge">
                      {getRoleLabel(userSession.role)}
                    </span>
                  </div>

                  <div className="header-profile-divider" />

                  <button
                    type="button"
                    className="header-profile-menu-item"
                    onClick={handleGoToDashboard}
                    role="menuitem"
                  >
                    <SquaresFour size={16} weight="regular" aria-hidden="true" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    type="button"
                    className="header-profile-menu-item header-profile-logout"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <SignOut size={16} weight="regular" aria-hidden="true" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="header-auth-links">
              <Link
                to="/login"
                className="enroll-btn"
                onClick={() => setIsDropdownOpen(false)}
              >
                Open portal
              </Link>
            </div>
          )}

          <button
            type="button"
            className="header-mobile-toggle"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="subpage-mobile-nav"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? (
              <X size={20} weight="bold" aria-hidden="true" />
            ) : (
              <List size={20} weight="bold" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="subpage-mobile-nav" className="header-mobile-drawer">
          <nav className="header-mobile-nav" aria-label="Mobile navigation">
            {NAV_LINKS.map((item) => {
              const active = isCurrent(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`header-mobile-link${active ? ' active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to={userSession ? getDashboardPath(userSession.role) : '/login'}
              className="enroll-btn header-mobile-cta"
              onClick={() => setMobileOpen(false)}
            >
              {userSession ? 'Dashboard' : 'Open portal'}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
