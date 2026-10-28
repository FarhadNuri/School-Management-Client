/**
 * Helper to extract URL string from photo field (string or { url: string }).
 */
export const resolvePhotoUrl = (photo) => {
  if (!photo) return '';
  if (typeof photo === 'string') return photo;
  if (typeof photo === 'object' && photo.url) return photo.url;
  return '';
};

/**
 * Format date nicely e.g. "7 Aug 2026"
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dob) => {
  if (!dob) return '—';
  try {
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return '—';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? `${age} yrs` : '—';
  } catch {
    return '—';
  }
};

/**
 * Adapts raw student document from backend GET /user/students or GET /user/students/:id
 */
export const adaptStudent = (raw) => {
  if (!raw) return null;

  const id = String(raw.id || raw._id || '');
  const firstName = raw.firstName || raw.user?.firstName || '';
  const lastName = raw.lastName || raw.user?.lastName || '';
  const name = raw.name || [firstName, lastName].filter(Boolean).join(' ') || '—';
  const photo = resolvePhotoUrl(raw.photo || raw.user?.photo);
  const status = raw.status || (raw.isActive !== false ? 'Active' : 'Inactive');

  const guardianName =
    raw.guardian?.name ||
    raw.parentGuardian?.name ||
    (raw.guardian?.firstName ? `${raw.guardian.firstName} ${raw.guardian.lastName || ''}`.trim() : '') ||
    '—';

  const classGrade = raw.classGrade || raw.class?.className || '—';

  // City tag: derived from address city + country when present, otherwise null (remove "Campus")
  const addr = raw.address || raw.user?.address || {};
  const cityParts = [addr.city, addr.country].filter((p) => Boolean(p && String(p).trim()));
  const city = cityParts.length ? cityParts.join(', ') : null;

  const admittedDate = formatDate(raw.dateOfAdmission || raw.createdAt);

  // Payment line
  let paymentInfo = null;
  if (raw.feesBalance !== undefined && raw.feesBalance !== null) {
    const balance = Number(raw.feesBalance) || 0;
    if (balance <= 0) {
      paymentInfo = {
        label: 'Paid in full',
        color: '#23895B',
        isPaid: true
      };
    } else {
      paymentInfo = {
        label: `Balance: USD ${balance.toLocaleString()}`,
        color: '#C23A52',
        isPaid: false
      };
    }
  }

  return {
    id,
    _id: id,
    firstName,
    lastName,
    name,
    photo,
    status,
    guardian: guardianName,
    guardianObj: raw.guardian || raw.parentGuardian || null,
    classGrade,
    classObj: raw.class || null,
    teacher: raw.teacher || raw.teachers?.[0]?.name || '—',
    teachers: raw.teachers || [],
    city,
    admittedDate,
    rawAdmittedDate: raw.dateOfAdmission || raw.createdAt || null,
    paymentInfo,
    feesPaid: raw.feesPaid ?? null,
    feesBalance: raw.feesBalance ?? null,
    // Detailed profile fields
    dateOfBirth: raw.dateOfBirth || raw.user?.dateOfBirth || null,
    age: calculateAge(raw.dateOfBirth || raw.user?.dateOfBirth),
    gender: raw.gender || raw.user?.gender || '—',
    email: raw.email || raw.user?.email || '—',
    phone: raw.phone || raw.contactInfo?.phone || raw.user?.contactInfo?.phone || '—',
    emergencyContact: raw.emergencyContact || '—',
    idType: raw.idType || '—',
    address: {
      street: addr.street || '—',
      city: addr.city || '—',
      state: addr.state || addr.district || '—',
      zip: addr.zip || '—',
      country: addr.country || '—'
    },
    attendanceSummary: raw.attendanceSummary || null,
    reports: Array.isArray(raw.reports) ? raw.reports : []
  };
};

export const adaptStudentsList = (data) => {
  const list = Array.isArray(data) ? data : data?.students || [];
  const count = typeof data?.count === 'number' ? data.count : list.length;
  return {
    count,
    students: list.map(adaptStudent).filter(Boolean)
  };
};
