import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { headerContent } from '../data/content';
import SunriseLogo from './ui/SunriseLogo';
import { clearAuthSession } from '../services/portal/account';

const navLinks = [
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
    const raw = localStorage.getItem('portal_session') || localStorage.getItem('guardian_session');
    if (!raw) return null;
    const data = JSON.parse(raw);
    const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.name || 'User';
    const photo = typeof data.photo === 'object' ? data.photo?.url || '' : data.photo || '';
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
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Landing pages always use dark mode
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

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
    setUserSession(getStoredSession());
    setIsDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isDropdownOpen) return;
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

  const handleGoToDashboard = () => {
    setIsDropdownOpen(false);
    const target = getDashboardPath(userSession?.role);
    navigate(target);
  };

  const handleLogout = () => {
    clearAuthSession();
    setUserSession(null);
    setIsDropdownOpen(false);
  };

  const isCurrent = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="main-header">
      <div className="w">
        {/* Left: Brand & Logo */}
        <Link to="/" className="header-brand">
          <SunriseLogo size={32} />
          <b>{headerContent.brand}</b>
        </Link>

        {/* Middle: Navigation Links */}
        <nav className="header-nav">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`nav-item ${isCurrent(item.path) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Enroll Now & Login OR Profile Avatar Dropdown */}
        <div className="header-actions">
          {userSession ? (
            <div className="header-profile-container" ref={dropdownRef}>
              <button
                type="button"
                className="header-profile-btn"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                title={`${userSession.name} (${getRoleLabel(userSession.role)})`}
              >
                {userSession.photo ? (
                  <img
                    src={userSession.photo}
                    alt={userSession.name}
                    className="header-profile-avatar-img"
                  />
                ) : (
                  <span className="header-profile-avatar-text">
                    {(userSession.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
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
                    <LayoutDashboard size={17} />
                    <span>Dashboard</span>
                  </button>

                  <button
                    type="button"
                    className="header-profile-menu-item header-profile-logout"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut size={17} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/contact" className="enroll-btn">
                {headerContent.ctaText || 'Enroll now'}
              </Link>

              <Link
                to="/login"
                className={`login-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
