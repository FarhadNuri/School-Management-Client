import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Icon from '../../../components/ui/Icon';
import { usePortalRole } from '../hooks/usePortalRole';
import { useTheme } from '../hooks/useTheme';
import { useUnreadAnnouncements } from '../hooks/useUnreadAnnouncements';
import AccountModal from '../components/AccountModal';

export default function TopBar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { tabs, user, label, basePath } = usePortalRole();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { unreadCount } = useUnreadAnnouncements();

  const currentTab =
    tabs.find((tab) => {
      if (tab.end) return location.pathname === tab.path;
      return location.pathname.startsWith(tab.path);
    }) || tabs[0] || { label: 'Dashboard', subtitle: '' };

  const name = user.name || 'User';

  return (
    <>
      <div className="tb">
        <button
          type="button"
          className="sq"
          id="tg"
          aria-label="Menu"
          onClick={onToggleSidebar}
        >
          <Icon name="menu" />
        </button>
        <div>
          <h1 id="tt">{currentTab.label}</h1>
          <small id="ts">{currentTab.subtitle}</small>
        </div>
        <div className="us">
          <button
            type="button"
            className="sq"
            id="th"
            aria-label="Theme"
            title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
          >
            {resolvedTheme === 'dark' ? (
              <Sun size={17} strokeWidth={1.8} className="i" />
            ) : (
              <Moon size={17} strokeWidth={1.8} className="i" />
            )}
          </button>

          <button
            type="button"
            className="sq"
            aria-label="Announcements"
            title={unreadCount > 0 ? `${unreadCount} unread announcement${unreadCount === 1 ? '' : 's'}` : 'Announcements'}
            onClick={() => navigate(`${basePath}/announcements`)}
          >
            <Icon name="mega" />
            {unreadCount > 0 && (
              <span className="bd">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>

          {/* User profile block - opens Account modal on click */}
          <div
            onClick={() => setIsAccountOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '14px',
              transition: 'background 0.15s ease'
            }}
            role="button"
            tabIndex={0}
            title="Click to view account and change password"
          >
            {user.photo ? (
              <img
                src={user.photo}
                alt={name}
                className="av"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <span
                className="av"
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: '14px',
                  color: '#0A1C24'
                }}
              >
                {name.charAt(0)}
              </span>
            )}
            <div>
              <b>{name}</b>
              <small style={{ color: 'var(--g-mute)' }}>{label}</small>
            </div>
          </div>
        </div>
      </div>

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={user}
        roleLabel={label}
      />
    </>
  );
}
