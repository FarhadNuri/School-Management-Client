import { formatDate, resolvePhotoUrl } from './studentAdapter';

const STATUS_MAP = {
  pending: { label: 'Open', colorTag: 'a' },
  in_progress: { label: 'Under Review', colorTag: 'b' },
  under_review: { label: 'Under Review', colorTag: 'b' },
  resolved: { label: 'Resolved', colorTag: 'g' }
};

const SEVERITY_MAP = {
  low: { label: 'Low', colorTag: 'g' },
  medium: { label: 'Medium', colorTag: 'a' },
  high: { label: 'High', colorTag: 'r' }
};

const CATEGORY_MAP = {
  bullying: 'Bullying',
  harassment: 'Harassment',
  cyberbullying: 'Cyberbullying',
  discrimination: 'Discrimination',
  misconduct: 'Misconduct',
  other: 'Other'
};

const firstVal = (val) => {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
};

export const adaptComplaint = (raw) => {
  if (!raw) return null;

  const id = String(raw.id || raw._id || '');
  const title = raw.title || 'Untitled Complaint';
  const description = raw.description || '';

  const rawStatus = String(firstVal(raw.status)).toLowerCase();
  const statusMeta = STATUS_MAP[rawStatus] || {
    label: rawStatus ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1) : 'Open',
    colorTag: ''
  };

  const rawSeverity = String(firstVal(raw.severity)).toLowerCase();
  const severityMeta = SEVERITY_MAP[rawSeverity] || {
    label: rawSeverity ? rawSeverity.charAt(0).toUpperCase() + rawSeverity.slice(1) : 'Medium',
    colorTag: ''
  };

  const rawCat = String(firstVal(raw.category)).toLowerCase();
  const category = CATEGORY_MAP[rawCat] || (rawCat ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1) : 'Other');

  const reportedParty = raw.reportedParty || '—';

  // Witnesses can be comma-string or array
  let witnesses = '—';
  if (Array.isArray(raw.witnesses)) {
    witnesses = raw.witnesses.filter(Boolean).join(', ') || '—';
  } else if (raw.witnesses) {
    const trimmed = String(raw.witnesses).trim();
    if (trimmed === '[]' || trimmed === '[""]' || trimmed === "['']") {
      witnesses = '—';
    } else {
      witnesses = trimmed || '—';
    }
  }

  // photoEvidence
  let photos = [];
  if (Array.isArray(raw.photoEvidence)) {
    photos = raw.photoEvidence.map(resolvePhotoUrl).filter(Boolean);
  } else if (raw.photoEvidence) {
    const p = resolvePhotoUrl(raw.photoEvidence);
    if (p) photos = [p];
  }

  const dateFiled = formatDate(raw.dateFiled || raw.createdAt);

  return {
    id,
    _id: id,
    title,
    description,
    rawStatus,
    status: statusMeta.label,
    statusColor: statusMeta.colorTag,
    rawSeverity,
    severity: severityMeta.label,
    severityColor: severityMeta.colorTag,
    category,
    reportedParty,
    witnesses,
    photoEvidence: photos,
    dateFiled,
    createdAt: raw.createdAt || raw.dateFiled
  };
};

export const adaptComplaintsList = (data) => {
  const list = Array.isArray(data) ? data : data?.complaints || [];
  const complaints = list.map(adaptComplaint).filter(Boolean);

  // Compute tiles: Open, Under review, Urgent active (high severity and not resolved), Resolved
  let openCount = 0;
  let underReviewCount = 0;
  let urgentActiveCount = 0;
  let resolvedCount = 0;

  complaints.forEach((c) => {
    if (c.rawStatus === 'resolved') {
      resolvedCount++;
    } else {
      if (c.rawStatus === 'pending') openCount++;
      else if (c.rawStatus === 'in_progress') underReviewCount++;

      if (c.rawSeverity === 'high') urgentActiveCount++;
    }
  });

  return {
    count: complaints.length,
    complaints,
    stats: {
      open: openCount,
      underReview: underReviewCount,
      urgentActive: urgentActiveCount,
      resolved: resolvedCount
    }
  };
};
