import apiRequest from '../api';
import { LIVE } from './sources';
import { adaptAnnouncementsList, adaptAnnouncement } from './adapters/announcementAdapter';
import { announcementsData as mockAnnouncements } from '../../features/portal/data/announcements';

export const getAnnouncements = async ({ search = '', category = '', severity = '' } = {}) => {
  if (!LIVE.announcements) {
    let list = [...mockAnnouncements];
    if (category && category !== 'all') {
      list = list.filter((a) => a.category?.toLowerCase() === category.toLowerCase());
    }
    if (severity && severity !== 'all') {
      list = list.filter((a) => a.severity?.toLowerCase() === severity.toLowerCase());
    }
    if (search?.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
      );
    }
    return adaptAnnouncementsList({ count: list.length, announcements: list });
  }

  const raw = await apiRequest('/user/announcements', {
    params: {
      search: search?.trim() || undefined,
      category: category && category !== 'all' ? category.toLowerCase().trim() : undefined,
      severity: severity && severity !== 'all' ? severity.toLowerCase().trim() : undefined
    }
  });

  return adaptAnnouncementsList(raw);
};

export const createAnnouncement = async (data) => {
  const isForm = typeof FormData !== 'undefined' && data instanceof FormData;
  let body = data;

  if (!isForm) {
    body = {
      title: data.title?.trim(),
      description: data.description?.trim() || '',
      category: data.category ? [data.category.toLowerCase()] : ['general'],
      severity: data.severity ? [data.severity.toLowerCase()] : ['medium'],
      targetAudience: Array.isArray(data.targetAudience)
        ? data.targetAudience.map((a) => a.toLowerCase())
        : [String(data.targetAudience || 'all').toLowerCase()]
    };
  }

  try {
    const res = await apiRequest('/teacher/announcements', {
      method: 'POST',
      body
    });
    return res;
  } catch (err) {
    if (err.status === 404) {
      const fallback = await apiRequest('/admin/announcements', {
        method: 'POST',
        body
      });
      return fallback;
    }
    throw err;
  }
};

export const updateAnnouncement = async (id, data) => {
  const isForm = typeof FormData !== 'undefined' && data instanceof FormData;
  let body = data;

  if (!isForm) {
    body = {
      title: data.title?.trim(),
      description: data.description?.trim(),
      category: data.category ? [data.category.toLowerCase()] : undefined,
      severity: data.severity ? [data.severity.toLowerCase()] : undefined,
      targetAudience: Array.isArray(data.targetAudience)
        ? data.targetAudience.map((a) => a.toLowerCase())
        : data.targetAudience ? [String(data.targetAudience).toLowerCase()] : undefined,
      existingAttachments: data.existingAttachments
    };
  }

  try {
    const res = await apiRequest(`/teacher/announcements/${id}`, {
      method: 'PATCH',
      body
    });
    return res;
  } catch (err) {
    if (err.status === 404) {
      const fallback = await apiRequest(`/admin/announcements/${id}`, {
        method: 'PATCH',
        body
      });
      return fallback;
    }
    throw err;
  }
};

export const deleteAnnouncement = async (id) => {
  try {
    const res = await apiRequest(`/teacher/announcements/${id}`, {
      method: 'DELETE'
    });
    return res;
  } catch (err) {
    if (err.status === 404) {
      const fallback = await apiRequest(`/admin/announcements/${id}`, {
        method: 'DELETE'
      });
      return fallback;
    }
    throw err;
  }
};
