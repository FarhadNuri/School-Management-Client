function resolvePhoto(photo) {
  if (!photo) return '';
  if (typeof photo === 'string') return photo;
  if (typeof photo === 'object' && photo.url) return photo.url;
  return '';
}

export function adaptTeacherGuardian(g) {
  if (!g) return null;
  const id = g._id || g.id || '';
  const user = g.user || {};
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const name = `${firstName} ${lastName}`.trim() || '—';

  const contactInfo = user.contactInfo || {};
  const phone = contactInfo.phone || '—';
  const altPhone = contactInfo.altPhone || '—';
  const whatsapp = contactInfo.whatsapp || '—';

  const addr = user.address || {};
  const addressParts = [addr.street, addr.city, addr.state, addr.country].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(', ') : '—';

  const students = (g.students || []).map((s) => {
    const sId = s._id || s.id || '';
    const sUser = s.user || {};
    const sName = `${sUser.firstName || ''} ${sUser.lastName || ''}`.trim() || '—';
    const sClass = s.class?.className || s.class?.name || '—';
    const sGrade = s.class?.grade != null ? `Grade ${s.class.grade}` : '';

    return {
      id: sId,
      _id: sId,
      name: sName,
      photo: resolvePhoto(sUser.photo) || '/Student.jpg',
      className: sClass,
      grade: sGrade,
      displayClass: [sClass, sGrade].filter(Boolean).join(' · ')
    };
  });

  return {
    id,
    _id: id,
    name,
    firstName,
    lastName,
    email: user.email || '—',
    phone,
    altPhone,
    whatsapp,
    photo: resolvePhoto(user.photo) || '/Guardians.jpg',
    address,
    students,
    isActive: user.isActive ?? true
  };
}
