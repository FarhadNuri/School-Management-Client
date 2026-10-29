import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import Tag from '../components/Tag';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorRetry from '../components/ErrorRetry';
import { useMyStudents, useDebounce } from '../hooks/usePortalQueries';
import {
  GraduationCap,
  Calendar,
  MapPin,
  CreditCard,
  ArrowRight
} from 'lucide-react';

export default function Students() {
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchInput, 400);

  // Use immediate search on button click, otherwise debounced
  const effectiveSearch = activeSearch !== '' ? activeSearch : debouncedSearch;

  const { data, isLoading, isError, error, refetch } = useMyStudents(effectiveSearch);

  const handleSearchSubmit = (val) => {
    setActiveSearch(val);
  };

  const handleInputChange = (val) => {
    setSearchInput(val);
    if (activeSearch !== '') {
      setActiveSearch('');
    }
  };

  const students = data?.students || [];
  const count = data?.count ?? students.length;

  return (
    <>
      <div className="pt">
        <h2>Students</h2>
        <p>Search and view students linked to your account</p>
      </div>

      <SearchBar
        placeholder="Search by name, email, or class..."
        value={searchInput}
        onChange={handleInputChange}
        onSearch={handleSearchSubmit}
      />

      <div style={{ margin: '14px 0', color: 'var(--g-mute, #60797F)', fontSize: '13.5px' }}>
        Showing <b style={{ color: 'var(--g-ink, #0A1C24)' }}>{count}</b> student{count === 1 ? '' : 's'}
      </div>

      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
          {[1, 2].map((n) => (
            <div key={n} className="cd" style={{ padding: '22px', gap: '16px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Skeleton width="54px" height="54px" borderRadius="16px" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Skeleton width="160px" height="20px" />
                  <Skeleton width="100px" height="20px" borderRadius="8px" />
                </div>
              </div>
              <Skeleton width="100%" height="130px" borderRadius="16px" />
              <Skeleton width="100%" height="42px" borderRadius="12px" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <ErrorRetry
          message={error?.message || 'Unable to load students.'}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && students.length === 0 && (
        <EmptyState
          title={effectiveSearch ? 'No matching students' : 'No students found'}
          message={
            effectiveSearch
              ? 'No students match your search criteria.'
              : 'No students linked to your account.'
          }
        />
      )}

      {!isLoading && !isError && students.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
          {students.map((stu) => {
            const cleanAdmissionDate = stu.admittedDate && stu.admittedDate !== '—'
              ? stu.admittedDate.replace(/^Admitted\s+/i, '')
              : null;

            return (
              <div
                key={stu.id}
                className="cd"
                style={{
                  padding: '22px',
                  borderRadius: '20px',
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  boxShadow: 'var(--sh)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(30, 111, 120, 0.35)';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(15, 59, 68, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--line)';
                  e.currentTarget.style.boxShadow = 'var(--sh)';
                }}
              >
                {/* Header Row: Avatar, Student Name, Class & Status */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                    {stu.photo ? (
                      <img
                        src={stu.photo}
                        alt={stu.name}
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '16px',
                          objectFit: 'cover',
                          border: '1px solid var(--line)',
                          flexShrink: 0,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, rgba(30, 111, 120, 0.2), rgba(15, 59, 68, 0.25))',
                          border: '1.5px solid rgba(30, 111, 120, 0.35)',
                          color: 'var(--p1)',
                          fontSize: '22px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {stu.name?.charAt(0) || 'S'}
                      </div>
                    )}

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3
                        style={{
                          margin: '0 0 5px',
                          fontSize: '17px',
                          fontWeight: 800,
                          color: 'var(--ink)',
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={stu.name}
                      >
                        {stu.name}
                      </h3>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--p1)',
                          background: 'rgba(30, 111, 120, 0.12)',
                          padding: '2.5px 8.5px',
                          borderRadius: '7px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5.5px',
                          width: 'fit-content'
                        }}
                      >
                        <GraduationCap size={13} style={{ flexShrink: 0 }} />
                        <span>{stu.classGrade && stu.classGrade !== '—' ? stu.classGrade : 'Enrolled Student'}</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ flexShrink: 0, marginTop: '2px' }}>
                    <Tag color={stu.status === 'Active' ? 'g' : 'a'}>
                      {stu.status}
                    </Tag>
                  </div>
                </div>

                {/* Structured Key-Value Metadata Box */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    padding: '13px 15px',
                    borderRadius: '14px',
                    background: 'var(--soft)',
                    border: '1px solid var(--line)',
                    fontSize: '12.5px'
                  }}
                >
                  {cleanAdmissionDate && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7.5px', color: 'var(--mute)', flexShrink: 0 }}>
                        <Calendar size={13.5} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                        <span>Admission Date</span>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                        {cleanAdmissionDate}
                      </span>
                    </div>
                  )}

                  {stu.city && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        ...(cleanAdmissionDate ? { borderTop: '1px solid var(--line)', paddingTop: '9px' } : {})
                      }}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7.5px', color: 'var(--mute)', flexShrink: 0 }}>
                        <MapPin size={13.5} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                        <span>Location</span>
                      </div>
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--ink)',
                          textAlign: 'right',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '58%'
                        }}
                        title={stu.city}
                      >
                        {stu.city}
                      </span>
                    </div>
                  )}

                  {stu.paymentInfo && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        ...((cleanAdmissionDate || stu.city) ? { borderTop: '1px solid var(--line)', paddingTop: '9px' } : {})
                      }}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7.5px', color: 'var(--mute)', flexShrink: 0 }}>
                        <CreditCard size={13.5} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                        <span>Payment</span>
                      </div>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '12px',
                          color: stu.paymentInfo.color,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {stu.paymentInfo.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Profile Action Button */}
                <button
                  type="button"
                  className="ghost"
                  onClick={() => navigate(`/guardian/students/${stu.id}`)}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    marginTop: 'auto',
                    cursor: 'pointer',
                    background: 'var(--soft)',
                    border: '1px solid var(--line)',
                    color: 'var(--ink)',
                    marginLeft: 0,
                    transition: 'all 0.18s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--p1)';
                    e.currentTarget.style.borderColor = 'var(--p1)';
                    e.currentTarget.style.color = '#FFFFFF';
                    const arrow = e.currentTarget.querySelector('svg');
                    if (arrow) arrow.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--soft)';
                    e.currentTarget.style.borderColor = 'var(--line)';
                    e.currentTarget.style.color = 'var(--ink)';
                    const arrow = e.currentTarget.querySelector('svg');
                    if (arrow) arrow.style.transform = 'translateX(0)';
                  }}
                >
                  <span>View Full Profile</span>
                  <ArrowRight size={14} style={{ transition: 'transform 0.18s ease' }} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
