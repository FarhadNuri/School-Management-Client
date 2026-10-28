import { NavLink } from 'react-router-dom';
import Logo from '../../../components/ui/Logo';
import Icon from '../../../components/ui/Icon';
import { usePortalRole } from '../hooks/usePortalRole';
import { logout } from '../../../services/portal/account';

export default function Sidebar({ isOpen, onClose }) {
  const { tabs } = usePortalRole();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className={`sb ${isOpen ? 'open' : ''}`.trim()} id="sb">
      <Logo />
      <div id="nv">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) => `nv ${isActive ? 'on' : ''}`.trim()}
            onClick={onClose}
          >
            <Icon name={tab.icon} />
            {tab.label}
          </NavLink>
        ))}
      </div>
      <div className="nv lo" onClick={handleLogout} role="button" tabIndex={0}>
        <Icon name="logout" />
        Logout
      </div>
    </aside>
  );
}
