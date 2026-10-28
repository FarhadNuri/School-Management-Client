import { useState } from 'react';
import SearchBar from '../../components/SearchBar';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ErrorRetry from '../../components/ErrorRetry';
import DataTable from '../../components/DataTable';
import {
  Users,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Phone,
  Mail,
  ShieldCheck,
  Hash
} from 'lucide-react';
import {
  useTeacherClasses,
  useTeacherClassDetail,
  useDebounce
} from '../../hooks/usePortalQueries';

export default function TeacherClasses() {
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [rosterSearch, setRosterSearch] = useState('');

  const debouncedSearch = useDebounce(searchInput, 400);
  const effectiveSearch = activeSearch !== '' ? activeSearch : debouncedSearch;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useTeacherClasses({
    search: effectiveSearch
  });

  const {
    data: classDetail,
    isLoading: isLoadingDetail,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail
  } = useTeacherClassDetail(selectedClassId);

  const classes = data?.classes || [];
  const count = data?.count ?? classes.length;

  // ROSTER VIEW
  if (selectedClassId) {
    const cls = classDetail;
    const rawRoster = cls?.students || [];

    // Filter students inside roster
    const roster = rawRoster.filter((s) => {
      if (!rosterSearch.trim()) return true;
      const q = rosterSearch.toLowerCase();
      const sName = (s.name || '').toLowerCase();
      const sEmail = (s.email || '').toLowerCase();
      const gName = (s.guardianName || '').toLowerCase();
      const sPhone = (s.phone || '').toLowerCase();
      return (
        sName.includes(q) ||
        sEmail.includes(q) ||
        gName.includes(q) ||
        sPhone.includes(q)
      );
    });

    const columns = [
      {
        header: 'Student',
        key: 'name',
        render: (row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {row.photo ? (
              <img
                src={row.photo}
                alt={row.name}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                  flexShrink: 0
                }}
              />
            ) : (
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(30,111,120,0.3), rgba(20,184,166,0.18))',
                  color: '#14B8A6',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: '15px',
                  border: '1px solid rgba(20, 184, 166, 0.25)',
                  flexShrink: 0
                }}
              >
                {row.name ? row.name.charAt(0).toUpperCase() : 'S'}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'var(--ink)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {row.name}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: 'var(--mute)',
                  fontSize: '12px',
                  marginTop: '2px'
                }}
              >
                <Mail size={12} style={{ opacity: 0.7 }} />
                <span>{row.email || 'No email provided'}</span>
              </div>
            </div>
          </div>
        )
      },
      {
        header: 'Guardian',
        key: 'guardianName',
        render: (row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(20, 184, 166, 0.1)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={14} color="#14B8A6" />
            </div>
            <span
              style={{
                fontWeight: 600,
                fontSize: '13.5px',
                color: row.guardianName && row.guardianName !== '—' ? 'var(--ink)' : 'var(--mute)'
              }}
            >
              {row.guardianName || 'No guardian assigned'}
            </span>
          </div>
        )
      },
      {
        header: 'Phone / Contact',
        key: 'phone',
        render: (row) =>
          row.phone && row.phone !== '—' ? (
            <a
              href={`tel:${row.phone}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 12px',
                borderRadius: '9px',
                background: 'rgba(20, 184, 166, 0.1)',
                border: '1px solid rgba(20, 184, 166, 0.22)',
                color: '#14B8A6',
                fontWeight: 700,
                fontSize: '12.5px',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Phone size={13} />
              <span>{row.phone}</span>
            </a>
          ) : (
            <span style={{ color: 'var(--mute)', fontSize: '13px' }}>—</span>
          )
      },
      {
        header: 'Status',
        key: 'status',
        render: () => (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(34, 197, 94, 0.12)',
              color: '#22C55E',
              fontSize: '11.5px',
              fontWeight: 700
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#22C55E'
              }}
            />
            Enrolled
          </span>
        )
      }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Top Header Row matching Image 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setSelectedClassId(null);
              setRosterSearch('');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '12px',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              color: 'var(--ink)',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--sh)',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>
            {cls?.className || 'Class Roster'}
          </h2>

          <span
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(20, 184, 166, 0.15)',
              color: '#14B8A6',
              fontSize: '13px',
              fontWeight: 700
            }}
          >
            {rawRoster.length} Students
          </span>
        </div>

        {/* Search within Roster - Full Width */}
        {rawRoster.length > 0 && (
          <div style={{ width: '100%' }}>
            <SearchBar
              placeholder="Search students by name, email, guardian..."
              value={rosterSearch}
              onChange={(val) => setRosterSearch(val)}
              onSearch={(val) => setRosterSearch(val)}
            />
          </div>
        )}

        {/* Skeleton State */}
        {isLoadingDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Skeleton key={n} width="100%" height="60px" borderRadius="14px" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isDetailError && (
          <ErrorRetry
            message={detailError?.message || 'Unable to load class roster.'}
            onRetry={refetchDetail}
          />
        )}

        {/* DataTable Roster View */}
        {!isLoadingDetail && !isDetailError && rawRoster.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ color: 'var(--mute)', fontSize: '13px' }}>
              Showing <b style={{ color: 'var(--ink)' }}>{roster.length}</b> of {rawRoster.length} students
            </div>
            <DataTable
              columns={columns}
              data={roster}
              keyField="studentId"
              emptyMessage={
                rosterSearch
                  ? `No students matched "${rosterSearch}".`
                  : 'No students currently enrolled in this class.'
              }
            />
          </div>
        )}

        {/* Empty Class Roster */}
        {!isLoadingDetail && !isDetailError && rawRoster.length === 0 && (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: 'var(--card)',
              borderRadius: '24px',
              border: '1px solid var(--line)',
              boxShadow: 'var(--sh)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'rgba(20, 184, 166, 0.1)',
                display: 'grid',
                placeItems: 'center',
                color: '#14B8A6'
              }}
            >
              <Users size={32} />
            </div>
            <h3 style={{ margin: '6px 0 0', fontSize: '18px', fontWeight: 800, color: 'var(--ink)' }}>
              No Students Enrolled Yet
            </h3>
            <p style={{ margin: 0, color: 'var(--mute)', fontSize: '13.5px', maxWidth: '420px', lineHeight: 1.5 }}>
              This class section currently has zero enrolled students. As soon as students are assigned by the administration, their profiles and contact details will appear here.
            </p>
          </div>
        )}
      </div>
    );
  }

  // CLASSES LIST VIEW
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header */}
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>
          Assigned Classes
        </h2>
        <p style={{ margin: 0, color: 'var(--mute)', fontSize: '13.5px' }}>
          Manage classroom sections, inspect curriculum courses, and access student rosters
        </p>
      </div>

      {/* Full Screen Search Bar */}
      <div style={{ width: '100%' }}>
        <SearchBar
          placeholder="Search classes by name, grade, or code..."
          value={searchInput}
          onChange={(val) => {
            setSearchInput(val);
            if (activeSearch !== '') setActiveSearch('');
          }}
          onSearch={(val) => setActiveSearch(val)}
        />
      </div>

      {/* Showing Count - Aligned to Left */}
      <div style={{ color: 'var(--mute)', fontSize: '13px', textAlign: 'left' }}>
        Showing <b style={{ color: 'var(--ink)' }}>{count}</b> assigned class{count === 1 ? '' : 'es'}
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '18px'
          }}
        >
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              style={{
                padding: '22px',
                borderRadius: '20px',
                background: 'var(--card)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton width="140px" height="22px" />
                <Skeleton width="60px" height="22px" borderRadius="8px" />
              </div>
              <Skeleton width="180px" height="14px" />
              <Skeleton width="100%" height="42px" borderRadius="12px" />
            </div>
          ))}
        </div>
      )}

      {/* Error Retry */}
      {isError && (
        <ErrorRetry
          message={error?.message || 'Unable to load assigned classes.'}
          onRetry={refetch}
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && classes.length === 0 && (
        <EmptyState
          title="No assigned classes found"
          message={
            effectiveSearch
              ? 'No classes match your current search criteria.'
              : 'You have no assigned classes yet. Ask the school administrator to assign you to classroom sections.'
          }
        />
      )}

      {/* Classes Grid */}
      {!isLoading && !isError && classes.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '18px'
          }}
        >
          {classes.map((cls) => (
            <div
              key={cls.id}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: '20px',
                padding: '22px',
                boxShadow: 'var(--sh)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '18px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--line)';
              }}
            >
              {/* Card Header & Content */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '10px'
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 9px',
                      borderRadius: '8px',
                      background: 'rgba(20, 184, 166, 0.12)',
                      color: '#14B8A6',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.04em'
                    }}
                  >
                    <Hash size={11} />
                    {cls.classCode}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {cls.grade && cls.grade !== '—' && (
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '8px',
                          background: 'rgba(56, 189, 248, 0.12)',
                          color: '#38BDF8',
                          fontSize: '11px',
                          fontWeight: 800
                        }}
                      >
                        Grade {cls.grade}
                      </span>
                    )}

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: '8px',
                        background: cls.isActive ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: cls.isActive ? '#22C55E' : '#EF4444',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      <span
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: cls.isActive ? '#22C55E' : '#EF4444'
                        }}
                      />
                      {cls.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <h3
                  style={{
                    margin: '0 0 12px',
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--ink)'
                  }}
                >
                  {cls.className}
                </h3>

                {/* Key Metrics Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '10px',
                      background: 'rgba(20, 184, 166, 0.1)',
                      color: '#14B8A6',
                      fontSize: '12.5px',
                      fontWeight: 700
                    }}
                  >
                    <Users size={13} />
                    <span>
                      {cls.studentCount} student{cls.studentCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '10px',
                      background: 'var(--soft)',
                      color: 'var(--mute)',
                      fontSize: '12.5px',
                      fontWeight: 600
                    }}
                  >
                    <Calendar size={13} />
                    <span>{cls.academicYear}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px 16px',
                  borderRadius: '13px',
                  background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(20, 184, 166, 0.28)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.08)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(20, 184, 166, 0.38)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(20, 184, 166, 0.28)';
                }}
              >
                <Users size={15} />
                <span>View Class Roster</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
