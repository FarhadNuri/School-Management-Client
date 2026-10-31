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

export const updateProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append('photo', file);

  const data = await apiRequest('/user/me/photo', {
    method: 'PATCH',
    body: formData,
  });

  if (data?.user) {
    localStorage.setItem('portal_session', JSON.stringify(data.user));
    localStorage.setItem('guardian_session', JSON.stringify(data.user));
  } else if (data?.photo) {
    try {
      const existing = JSON.parse(localStorage.getItem('portal_session') || '{}');
      existing.photo = data.photo;
      localStorage.setItem('portal_session', JSON.stringify(existing));
      localStorage.setItem('guardian_session', JSON.stringify(existing));
    } catch (e) {}
  }

  // Trigger storage event so TopBar, Sidebar, and other listeners refresh photo
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('user-updated', { detail: data?.user || { photo: data?.photo } }));

  return data;
};

export const clearAuthSession = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('portal_session');
  localStorage.removeItem('guardian_session');
  sessionStorage.setItem('portal_logged_out', 'true');
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('auth-changed', { detail: { loggedIn: false } }));
};

export const logout = (redirectTo = '/login') => {
  clearAuthSession();
  if (redirectTo && typeof window !== 'undefined') {
    window.location.href = redirectTo;
  }
};
