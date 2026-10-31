import { useState, useMemo } from 'react';
import SearchBar from '../../components/SearchBar';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ErrorRetry from '../../components/ErrorRetry';
import {
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Eye,
  X,
  MessageCircle,
  MessageSquare
} from 'lucide-react';
import {
  useTeacherGuardians,
  useTeacherGuardianDetail,
  useTeacherClasses,
  useDebounce
} from '../../hooks/usePortalQueries';

export default function TeacherGuardians() {
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedGuardianId, setSelectedGuardianId] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);
  const effectiveSearch = activeSearch !== '' ? activeSearch : debouncedSearch;

  // Fetch teacher's assigned classes for section filter
  const { data: classesData } = useTeacherClasses();
  const myClasses = classesData?.classes || [];

  // Fetch guardians directory
  const {
    data: guardiansData,
    isLoading,
    isError,
    error,
    refetch
  } = useTeacherGuardians({ search: effectiveSearch });

  // Fetch single guardian details when modal is open
  const {
    data: guardianDetail,
    isLoading: isLoadingDetail
  } = useTeacherGuardianDetail(selectedGuardianId);

  const rawGuardians = guardiansData?.guardians || [];

  // Filter guardians by selected section
  const filteredGuardians = useMemo(() => {
    let list = rawGuardians;

    if (selectedClassId !== 'all') {
      const targetClass = myClasses.find((c) => String(c.id || c._id) === String(selectedClassId));
      const targetClassName = targetClass?.className?.toLowerCase().trim();

      list = list.filter((g) => {
        return (g.students || []).some((s) => {
          if (s.classId && String(s.classId) === String(selectedClassId)) return true;
          if (
            targetClassName &&
            (s.className?.toLowerCase().includes(targetClassName) ||
              s.displayClass?.toLowerCase().includes(targetClassName))
          ) {
            return true;
          }
          return false;
        });
      });
    }

    return list;
  }, [rawGuardians, selectedClassId, myClasses]);

  const count = filteredGuardians.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div className="pt">
        <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>
          Guardians
        </h2>
        <p style={{ margin: 0, color: 'var(--mute)', fontSize: '13.5px' }}>
          Contact directory of parents and guardians for students in your classes
        </p>
      </div>

      {/* Section Selection Cards - Same as Materials & Homeworks */}
      {myClasses.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--mute)',
              textTransform: 'uppercase',
              marginBottom: '10px',
              letterSpacing: '0.5px'
            }}
          >
            Select Section
          </div>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '6px'
            }}
          >
            {/* All Sections Card */}
            <div
              onClick={() => setSelectedClassId('all')}
              role="button"
              tabIndex={0}
              style={{
                padding: '14px 24px',
                borderRadius: '16px',
                background: selectedClassId === 'all' ? 'var(--p1)' : 'var(--card)',
                color: selectedClassId === 'all' ? '#fff' : 'var(--ink)',
                border: selectedClassId === 'all' ? '1px solid var(--p1)' : '1px solid var(--line)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: selectedClassId === 'all' ? '0 6px 16px rgba(15,59,68,.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <b style={{ fontSize: '15px' }}>All Sections</b>
            </div>

            {/* Individual Section Cards */}
            {myClasses.map((cls) => {
              const isSelected = String(cls.id || cls._id) === String(selectedClassId);

              return (
                <div
                  key={cls.id || cls._id}
                  onClick={() => setSelectedClassId(cls.id || cls._id)}
                  role="button"
                  tabIndex={0}
                  style={{
                    padding: '14px 24px',
                    borderRadius: '16px',
                    background: isSelected ? 'var(--p1)' : 'var(--card)',
                    color: isSelected ? '#fff' : 'var(--ink)',
                    border: isSelected ? '1px solid var(--p1)' : '1px solid var(--line)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: isSelected ? '0 6px 16px rgba(15,59,68,.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <b style={{ fontSize: '15px' }}>{cls.className}</b>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Prominent Full-Width Search Bar */}
      <div>
        <SearchBar
          placeholder="Search guardians by name or email..."
          value={searchInput}
          onChange={(val) => {
            setSearchInput(val);
            if (activeSearch !== '') setActiveSearch('');
          }}
          onSearch={(val) => setActiveSearch(val)}
        />
      </div>

      <div style={{ margin: '-6px 0 0', color: 'var(--mute)', fontSize: '13px' }}>
        Showing <b style={{ color: 'var(--ink)' }}>{count}</b> guardian{count === 1 ? '' : 's'}
      </div>

      {isLoading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '18px'
          }}
        >
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="cd" style={{ padding: '20px', borderRadius: '20px', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Skeleton width="48px" height="48px" borderRadius="14px" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Skeleton width="140px" height="18px" />
                  <Skeleton width="100px" height="13px" />
                </div>
              </div>
              <Skeleton width="160px" height="24px" borderRadius="8px" />
              <Skeleton width="100%" height="38px" borderRadius="10px" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <ErrorRetry
          message={error?.message || 'Unable to load guardians directory.'}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && filteredGuardians.length === 0 && (
        <EmptyState
          title="No guardians found"
          message={
            searchInput
              ? 'No parents or guardians match your search.'
              : selectedClassId !== 'all'
              ? 'No parents or guardians found for the selected section.'
              : 'No parents or guardians linked to students in your assigned classes.'
          }
        />
      )}

      {/* Guardians Cards Grid - Same Structure and Styling as Attendance & Homeworks */}
      {!isLoading && !isError && filteredGuardians.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '18px'
          }}
        >
          {filteredGuardians.map((g) => (
            <div
              key={g.id}
              className="cd"
              style={{
                padding: '20px',
                borderRadius: '20px',
                overflow: 'hidden',
                boxSizing: 'border-box',
                background: 'var(--card)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--sh)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'transform 0.15s ease'
              }}
            >
              <div>
                {/* Header Pill Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    gap: '8px'
                  }}
                >
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '8px',
                      background: 'rgba(30,111,120,.12)',
                      color: 'var(--p1)',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}
                  >
                    Parent / Guardian
                  </span>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: '7px',
                      background: 'rgba(20, 184, 166, 0.12)',
                      color: '#2DD4BF',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <GraduationCap size={13} />
                    <span>
                      {g.students?.length || 0} Ward{g.students?.length === 1 ? '' : 's'}
                    </span>
                  </span>
                </div>

                {/* Profile Avatar & Names */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  {g.photo ? (
                    <img
                      src={g.photo}
                      alt={g.name}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        objectFit: 'cover',
                        border: '1px solid var(--line)',
                        flexShrink: 0
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, rgba(20,184,166,0.18), rgba(15,118,110,0.18))',
                        color: '#2DD4BF',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                        fontSize: '18px',
                        border: '1px solid rgba(20,184,166,0.25)',
                        flexShrink: 0
                      }}
                    >
                      {g.name ? g.name.charAt(0).toUpperCase() : 'G'}
                    </span>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3
                      style={{
                        margin: '0 0 3px',
                        fontSize: '17px',
                        fontWeight: 800,
                        color: 'var(--ink)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {g.name}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        color: 'var(--mute)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {g.email}
                    </p>
                  </div>
                </div>

                {/* Contact Badges Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {g.phone && g.phone !== '—' && (
                    <a
                      href={'tel:' + g.phone}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: 'var(--soft)',
                        border: '1px solid var(--line)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--ink)',
                        textDecoration: 'none'
                      }}
                    >
                      <Phone size={12} style={{ color: 'var(--p1)' }} />
                      <span>{g.phone}</span>
                    </a>
                  )}

                  {g.whatsapp && g.whatsapp !== '—' && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 9px',
                        borderRadius: '8px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.25)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#4ADE80'
                      }}
                    >
                      <MessageCircle size={12} />
                      <span>WhatsApp</span>
                    </span>
                  )}
                </div>

                {/* Linked Wards Section */}
                <div>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--mute)',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                      letterSpacing: '0.4px'
                    }}
                  >
                    Linked Students
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {g.students && g.students.length > 0 ? (
                      g.students.map((stu) => (
                        <div
                          key={stu.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '7px 10px',
                            borderRadius: '10px',
                            background: 'var(--soft)',
                            border: '1px solid var(--line)'
                          }}
                        >
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                            {stu.name}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '6px',
                              background: 'rgba(20, 184, 166, 0.12)',
                              color: '#2DD4BF'
                            }}
                          >
                            {stu.displayClass || 'Enrolled'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '12.5px', color: 'var(--mute)' }}>
                        No active students in your classes
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--line)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <button
                  type="button"
                  className="att-card-btn-give"
                  onClick={() => setSelectedGuardianId(g.id)}
                  style={{
                    flex: '1 1 0',
                    minWidth: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    height: '38px',
                    padding: '0 8px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(20, 184, 166, 0.25)',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box'
                  }}
                >
                  <Eye size={14} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>View Profile</span>
                </button>

                {g.phone && g.phone !== '—' && (
                  <a
                    href={'tel:' + g.phone}
                    className="att-card-btn-view"
                    style={{
                      flex: '1 1 0',
                      minWidth: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      height: '38px',
                      padding: '0 8px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: 'var(--soft)',
                      color: 'var(--ink)',
                      border: '1px solid var(--line)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                      boxSizing: 'border-box',
                      textDecoration: 'none'
                    }}
                  >
                    <Phone size={14} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Call</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* READ-ONLY PROFILE MODAL - EXECUTIVE REDESIGN */}
      {selectedGuardianId && (
        <div
          className="md on"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedGuardianId(null);
          }}
          style={{ zIndex: 100, padding: '16px' }}
        >
          <div
            className="mc no-scrollbar"
            style={{
              position: 'relative',
              width: '640px',
              maxWidth: '96vw',
              maxHeight: '90vh',
              borderRadius: '24px',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header with Gradient */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--p2), var(--p1))',
                color: '#fff',
                padding: '22px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, paddingRight: '12px' }}>
                {guardianDetail?.photo ? (
                  <img
                    src={guardianDetail.photo}
                    alt={guardianDetail.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '18px',
                      objectFit: 'cover',
                      border: '2.5px solid rgba(255, 255, 255, 0.35)',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '18px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: '24px',
                      border: '2.5px solid rgba(255, 255, 255, 0.35)',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                    }}
                  >
                    {guardianDetail?.name ? guardianDetail.name.charAt(0).toUpperCase() : 'G'}
                  </span>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}
                    >
                      Parent / Guardian
                    </span>
                  </div>
                  <h3
                    style={{
                      margin: '0 0 4px',
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#fff',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {guardianDetail?.name || 'Guardian Profile'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>
                    <Mail size={13} />
                    <span>{guardianDetail?.email || '—'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGuardianId(null)}
                title="Close"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'background 0.15s ease'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {isLoadingDetail ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Skeleton width="100%" height="60px" borderRadius="14px" />
                  <Skeleton width="100%" height="80px" borderRadius="14px" />
                  <Skeleton width="100%" height="60px" borderRadius="14px" />
                </div>
              ) : (
                <>
                  {/* Quick Contact Info Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                      gap: '12px'
                    }}
                  >
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--line)'
                      }}
                    >
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Primary Phone
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
                        <Phone size={15} style={{ color: 'var(--p1)' }} />
                        {guardianDetail?.phone && guardianDetail.phone !== '—' ? (
                          <a href={'tel:' + guardianDetail.phone} style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                            {guardianDetail.phone}
                          </a>
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'var(--soft)',
                        border: '1px solid var(--line)'
                      }}
                    >
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Alt Phone / WhatsApp
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)' }}>
                        <MessageSquare size={15} style={{ color: 'var(--p1)' }} />
                        <span>
                          {guardianDetail?.altPhone !== '—'
                            ? guardianDetail?.altPhone
                            : guardianDetail?.whatsapp || '—'}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--line)'
                      }}
                    >
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Location / Country
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--ink)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <MapPin size={15} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                        <span title={guardianDetail?.address}>{guardianDetail?.address || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Enrolled Wards / Students Section */}
                  <div>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--mute)',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                      }}
                    >
                      <GraduationCap size={15} style={{ color: 'var(--p1)' }} />
                      Enrolled Wards in Your Classes ({guardianDetail?.students?.length || 0})
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {guardianDetail?.students && guardianDetail.students.length > 0 ? (
                        guardianDetail.students.map((stu) => (
                          <div
                            key={stu.id}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '14px',
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid var(--line)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {stu.photo ? (
                                <img
                                  src={stu.photo}
                                  alt={stu.name}
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                <span
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    background: 'rgba(20, 184, 166, 0.15)',
                                    color: '#2DD4BF',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontWeight: 800,
                                    fontSize: '14px'
                                  }}
                                >
                                  {stu.name ? stu.name.charAt(0).toUpperCase() : 'S'}
                                </span>
                              )}
                              <div>
                                <b style={{ display: 'block', fontSize: '14px', color: 'var(--ink)' }}>
                                  {stu.name}
                                </b>
                                <span style={{ fontSize: '12px', color: 'var(--mute)' }}>
                                  Student Enrolled
                                </span>
                              </div>
                            </div>

                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '8px',
                                background: 'rgba(20, 184, 166, 0.15)',
                                color: '#2DD4BF',
                                fontSize: '12px',
                                fontWeight: 700
                              }}
                            >
                              {stu.displayClass || 'Enrolled'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            padding: '18px',
                            textAlign: 'center',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px dashed var(--line)',
                            color: 'var(--mute)',
                            fontSize: '13px'
                          }}
                        >
                          No active students linked to this guardian in your classes.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Full Address details if present */}
                  {guardianDetail?.address && guardianDetail.address !== '—' && (
                    <div>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--mute)',
                          textTransform: 'uppercase',
                          marginBottom: '8px'
                        }}
                      >
                        <MapPin size={14} style={{ color: 'var(--p1)' }} />
                        Residential Address
                      </label>
                      <div
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          background: 'rgba(255,255,255,0.025)',
                          border: '1px solid var(--line)',
                          fontSize: '13px',
                          color: 'var(--ink)',
                          lineHeight: 1.5
                        }}
                      >
                        {guardianDetail.address}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: '14px 24px',
                background: 'rgba(255,255,255,0.02)',
                borderTop: '1px solid var(--line)'
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedGuardianId(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: 'var(--soft)',
                  color: 'var(--ink)',
                  border: '1px solid var(--line)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>

              {guardianDetail?.phone && guardianDetail.phone !== '—' && (
                <a
                  href={'tel:' + guardianDetail.phone}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.25)',
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={14} />
                  <span>Call Guardian</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
