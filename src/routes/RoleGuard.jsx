import { Navigate, Outlet } from 'react-router-dom';
import { ROLES } from '../features/portal/config/roles';

export default function RoleGuard({ allowedRole }) {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let sessionRole = null;
  try {
    const sessionStr = localStorage.getItem('portal_session');
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      sessionRole = parsed.role;
    }
  } catch {
    sessionRole = null;
  }

  if (!sessionRole) {
    return <Navigate to="/login" replace />;
  }

  // If user role does not match the allowed role for this portal branch, redirect to their proper base path
  if (sessionRole !== allowedRole) {
    const targetPath = ROLES[sessionRole]?.basePath || '/guardian';
    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
}
