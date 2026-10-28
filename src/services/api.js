import { showToast } from '../components/ui/Toast';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal API Request helper.
 *
 * @param {string} endpoint - API path (e.g. '/user/students' or 'user/login')
 * @param {object} options - { method, body, params, headers }
 */
export async function apiRequest(endpoint, { method = 'GET', body, params, headers = {} } = {}) {
  const token = localStorage.getItem('auth_token');

  let urlPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${BASE_URL.replace(/\/$/, '')}${urlPath}`;

  if (params && typeof params === 'object') {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `${url.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  const reqHeaders = { ...headers };
  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  let reqBody = body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isFormData) {
    reqHeaders['Content-Type'] = 'application/json';
    reqBody = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: reqHeaders,
      body: reqBody
    });
  } catch (err) {
    const error = new Error('Cannot reach the server. Please try again.');
    error.status = 0;
    error.originalError = err;
    throw error;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || response.statusText || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.data = data;

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('portal_session');
      localStorage.removeItem('guardian_session');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (response.status === 403) {
      showToast(message, 'error');
      const lower = message.toLowerCase();
      if (lower.includes('banned') || lower.includes('inactive') || lower.includes('disabled')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('portal_session');
        localStorage.removeItem('guardian_session');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    throw error;
  }

  return data;
}

export default apiRequest;
