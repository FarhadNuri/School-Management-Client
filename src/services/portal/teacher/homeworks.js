import apiRequest from '../../api';
import { LIVE_TEACHER } from '../sources';
import { adaptTeacherHomework } from './adapters/homeworkAdapter';

async function sendFormDataWithFieldFallback(endpoint, method, formData, files = []) {
  const primaryFormData = new FormData();
  for (const [key, value] of formData.entries()) {
    if (key !== 'materials' && key !== 'files') {
      primaryFormData.append(key, value);
    }
  }
  files.forEach((f) => primaryFormData.append('materials', f));

  try {
    return await apiRequest(endpoint, {
      method,
      body: primaryFormData
    });
  } catch (err) {
    const isMulterUnexpectedField =
      err?.message?.includes('Unexpected field') ||
      err?.message?.includes('unexpected field') ||
      err?.message?.toLowerCase().includes('materials');

    if (isMulterUnexpectedField && files.length > 0) {
      console.warn('[Teacher Upload] Retrying with field name "files" instead of "materials"');
      const retryFormData = new FormData();
      for (const [key, value] of formData.entries()) {
        if (key !== 'materials' && key !== 'files') {
          retryFormData.append(key, value);
        }
      }
      files.forEach((f) => retryFormData.append('files', f));

      return await apiRequest(endpoint, {
        method,
        body: retryFormData
      });
    }

    throw err;
  }
}

export async function getTeacherHomeworks() {
  if (!LIVE_TEACHER.homeworks) {
    return { count: 0, homeworks: [] };
  }

  const raw = await apiRequest('/teacher/homeworks');
  const list = Array.isArray(raw?.homeworks) ? raw.homeworks.map(adaptTeacherHomework) : [];
  return {
    count: raw?.count ?? list.length,
    homeworks: list
  };
}

export async function getTeacherHomework(id) {
  if (!LIVE_TEACHER.homeworks) return null;
  const raw = await apiRequest(`/teacher/homeworks/${id}`);
  return adaptTeacherHomework(raw?.homework || raw);
}

export async function createHomework(formDataOrData) {
  if (!LIVE_TEACHER.homeworks) return { success: true };

  if (formDataOrData instanceof FormData) {
    const files = formDataOrData.getAll('materials');
    const raw = await sendFormDataWithFieldFallback('/teacher/homeworks', 'POST', formDataOrData, files);
    return adaptTeacherHomework(raw?.homework || raw);
  }

  const raw = await apiRequest('/teacher/homeworks', {
    method: 'POST',
    body: formDataOrData
  });
  return adaptTeacherHomework(raw?.homework || raw);
}

export async function updateHomework(id, formDataOrData) {
  if (!LIVE_TEACHER.homeworks) return { success: true };

  if (formDataOrData instanceof FormData) {
    const files = formDataOrData.getAll('materials');
    const raw = await sendFormDataWithFieldFallback(`/teacher/homeworks/${id}`, 'PATCH', formDataOrData, files);
    return adaptTeacherHomework(raw?.homework || raw);
  }

  const raw = await apiRequest(`/teacher/homeworks/${id}`, {
    method: 'PATCH',
    body: formDataOrData
  });
  return adaptTeacherHomework(raw?.homework || raw);
}
