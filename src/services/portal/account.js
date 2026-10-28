import apiRequest from '../api';

export const login = async ({ email, password }) => {
  const data = await apiRequest('/user/login', {
    method: 'POST',
    body: { email: email.toLowerCase().trim(), password }
  });

  if (data?.token) {
    localStorage.setItem('auth_token', data.token);
  }
  if (data?.user) {
    localStorage.setItem('portal_session', JSON.stringify(data.user));
    localStorage.setItem('guardian_session', JSON.stringify(data.user));
  }

  return data;
};

export const getCurrentUser = async () => {
  const data = await apiRequest('/user/me');
  if (data?.user) {
    localStorage.setItem('portal_session', JSON.stringify(data.user));
    localStorage.setItem('guardian_session', JSON.stringify(data.user));
  }
  return data?.user || null;
};

export const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
  const data = await apiRequest('/user/change-password', {
    method: 'PATCH',
    body: { currentPassword, newPassword, confirmPassword }
  });
  return data;
};

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('portal_session');
  localStorage.removeItem('guardian_session');
  sessionStorage.setItem('portal_logged_out', 'true');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};
