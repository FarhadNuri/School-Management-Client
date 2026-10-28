import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../features/portal/hooks/usePortalQueries';
import { logout } from '../services/portal/account';
import { showToast } from '../components/ui/Toast';

export default function AuthGuard() {
  const token = localStorage.getItem('auth_token');
  const sessionStr = localStorage.getItem('portal_session');

  const { data: user, isError, error } = useCurrentUser({
    enabled: Boolean(token)
  });

  useEffect(() => {
    if (isError && token) {
      const msg = error?.message || 'Session expired. Please sign in again.';
      showToast(msg, 'error');
      logout();
    }
  }, [isError, error, token]);

  useEffect(() => {
    if (user && user.isActive === false) {
      showToast('Account is banned or inactive. Contact administration.', 'error');
      logout();
    }
  }, [user]);

  // If no auth token, redirect directly to /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If we have a token and an existing stored session, render Outlet while validating in background
  if (sessionStr || user) {
    return <Outlet />;
  }

  // Initial load validating token
  return (
    <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: 'var(--ink, #0A1C24)', color: 'var(--text, #F6F1E7)' }}>
      <div className="portal-skeleton" style={{ width: 180, height: 28, borderRadius: 12 }}></div>
    </div>
  );
}
