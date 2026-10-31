import { useState, useEffect, useMemo } from 'react';
import { ROLES, ALL_TABS } from '../config/roles';

export function usePortalRole() {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem('portal_session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const raw = localStorage.getItem('portal_session');
        setSession(raw ? JSON.parse(raw) : null);
      } catch {
        setSession(null);
      }
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('user-updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('user-updated', handleUpdate);
    };
  }, []);

  const roleKey = session?.role || 'guardian';
  const roleConfig = ROLES[roleKey] || ROLES.guardian;
  const basePath = roleConfig.basePath;

  const tabs = useMemo(() => {
    return (roleConfig.tabIds || [])
      .map((id) => {
        const tab = ALL_TABS[id];
        if (!tab) return null;
        return {
          ...tab,
          path: tab.route ? `${basePath}/${tab.route}` : basePath,
          end: !tab.route
        };
      })
      .filter(Boolean);
  }, [roleConfig, basePath]);

  const user = useMemo(() => {
    if (!session) {
      return { name: 'User', email: '', role: roleKey, photo: '' };
    }
    const name = [session.firstName, session.lastName].filter(Boolean).join(' ') || session.name || 'User';
    const photo = typeof session.photo === 'object' ? session.photo?.url || '' : session.photo || '';
    return {
      ...session,
      name,
      photo
    };
  }, [session, roleKey]);

  return {
    role: roleKey,
    label: roleConfig.label,
    basePath: roleConfig.basePath,
    flags: roleConfig.flags || {},
    stat1: roleConfig.stat1,
    tabs,
    user
  };
}

export default usePortalRole;
