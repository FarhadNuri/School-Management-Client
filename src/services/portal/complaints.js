import apiRequest from '../api';
import { LIVE } from './sources';
import { adaptComplaintsList, adaptComplaint } from './adapters/complaintAdapter';
import { complaintsStats as mockStats } from '../../features/portal/data/complaints';

export const getComplaints = async () => {
  if (!LIVE.complaints) {
    return {
      count: 0,
      complaints: [],
      stats: mockStats
    };
  }

  // Backend endpoint is /user/complaints, with fallback to /user/complaint on 404
  try {
    const raw = await apiRequest('/user/complaints');
    return adaptComplaintsList(raw);
  } catch (err) {
    if (err?.status === 404) {
      const fallback = await apiRequest('/user/complaint');
      return adaptComplaintsList(fallback);
    }
    throw err;
  }
};

export const createComplaint = async (complaintData) => {
  if (!LIVE.complaints) {
    return adaptComplaint({
      ...complaintData,
      _id: `mock-${Date.now()}`,
      status: ['pending'],
      dateFiled: new Date()
    });
  }

  const formData = new FormData();
  formData.append('title', String(complaintData.title || '').trim().slice(0, 50));
  formData.append('description', String(complaintData.description || '').trim().slice(0, 500));

  // Map category to backend allowed enum: ['bullying', 'harassment', 'cyberbullying', 'discrimination', 'other']
  let category = String(complaintData.category || '').toLowerCase().trim();
  if (category === 'misconduct') category = 'other';
  formData.append('category', category);

  formData.append('severity', String(complaintData.severity || 'medium').toLowerCase().trim());
  formData.append('reportedParty', String(complaintData.reportedParty || '').trim().slice(0, 50));

  // Witnesses: send as JSON array of trimmed names split from comma-separated input
  let witnessesArray = [];
  if (Array.isArray(complaintData.witnesses)) {
    witnessesArray = complaintData.witnesses;
  } else if (typeof complaintData.witnesses === 'string') {
    witnessesArray = complaintData.witnesses
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);
  }
  formData.append('witnesses', JSON.stringify(witnessesArray));

  if (complaintData.photoEvidence instanceof File) {
    formData.append('photoEvidence', complaintData.photoEvidence);
  }

  const res = await apiRequest('/user/complaint', {
    method: 'POST',
    body: formData
  });

  return adaptComplaint(res?.complaint || res);
};
