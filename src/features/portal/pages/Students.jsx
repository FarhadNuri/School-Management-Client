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
  User,
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {[1, 2].map((n) => (
            <div key={n} className="cd" style={{ padding: '22px', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Skeleton width="56px" height="56px" borderRadius="16px" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Skeleton width="160px" height="20px" />
                  <Skeleton width="100px" height="14px" />
                </div>
              </div>
              <Skeleton width="100%" height="60px" borderRadius="14px" />
              <Skeleton width="100%" height="38px" borderRadius="12px" />
              <Skeleton width="100%" height="38px" borderRadius="12px" />
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {students.map((stu) => {
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
                  gap: '16px'
                }}
              >
                {/* Header Row: Avatar, Student Name, Class & Status */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {stu.photo ? (
                      <img
                        src={stu.photo}
                        alt={stu.name}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '16px',
                          objectFit: 'cover',
                          border: '1px solid var(--line)',
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '16px',
                          background: 'rgba(30, 111, 120, 0.15)',
                          border: '1px solid rgba(30, 111, 120, 0.3)',
                          color: 'var(--p1)',
                          fontSize: '20px',
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

                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 800, color: 'var(--ink)' }}>
                        {stu.name}
                      </h3>
                      <span
                        style={{
                          fontSize: '12.5px',
                          color: 'var(--mute)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <GraduationCap size={14} style={{ color: 'var(--p1)' }} />
                        <span>{stu.classGrade && stu.classGrade !== '—' ? stu.classGrade : 'Enrolled Student'}</span>
                      </span>
                    </div>
                  </div>

                  <Tag color={stu.status === 'Active' ? 'g' : 'a'}>
                    {stu.status}
                  </Tag>
                </div>

                {/* Structured Metadata Box */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: 'var(--soft)',
                    border: '1px solid var(--line)',
                    fontSize: '12.5px'
                  }}
                >
                  {stu.admittedDate && stu.admittedDate !== '—' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--mute)' }}>
                      <Calendar size={13} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                      <span>Admitted: <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{stu.admittedDate}</b></span>
                    </div>
                  )}

                  {stu.city && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--mute)' }}>
                      <MapPin size={13} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{stu.city}</b>
                      </span>
                    </div>
                  )}

                  {stu.teacher && stu.teacher !== '—' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--mute)', gridColumn: 'span 2' }}>
                      <User size={13} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                      <span>Teacher: <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{stu.teacher}</b></span>
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
                    height: '38px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: 'auto',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>View Full Profile</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
