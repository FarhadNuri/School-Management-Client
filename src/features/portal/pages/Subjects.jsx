import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, GraduationCap, Search, Users, RotateCcw } from 'lucide-react';
import { usePortalRole } from '../hooks/usePortalRole';
import { useMyCourses, useDebounce } from '../hooks/usePortalQueries';
import { getEbookUrl } from '../data/ebooks';
import Skeleton from '../components/Skeleton';

function getCourseGrade(course) {
  if (course.grade != null && String(course.grade).trim() !== '' && course.grade !== '—') {
    const g = String(course.grade).trim().toLowerCase();
    if (/\b8\b/.test(g) || g.includes('eight')) return 'Class 8';
    if (/\b7\b/.test(g) || g.includes('seven')) return 'Class 7';
    if (/\b6\b/.test(g) || g.includes('six')) return 'Class 6';
    if (g.includes('8')) return 'Class 8';
    if (g.includes('7')) return 'Class 7';
    if (g.includes('6')) return 'Class 6';
  }

  const clsText = `${course.class || ''} ${course.className || ''}`.trim().toLowerCase();
  if (clsText && clsText !== '—') {
    if (/\b8\b/.test(clsText) || clsText.includes('eight')) return 'Class 8';
    if (/\b7\b/.test(clsText) || clsText.includes('seven')) return 'Class 7';
    if (/\b6\b/.test(clsText) || clsText.includes('six')) return 'Class 6';
    if (clsText.includes('8')) return 'Class 8';
    if (clsText.includes('7')) return 'Class 7';
    if (clsText.includes('6')) return 'Class 6';
  }

  const nameText = `${course.name || course.courseName || ''}`.trim().toLowerCase();
  if (nameText && nameText !== '—') {
    if (/\b8\b/.test(nameText) || nameText.includes('eight')) return 'Class 8';
    if (/\b7\b/.test(nameText) || nameText.includes('seven')) return 'Class 7';
    if (/\b6\b/.test(nameText) || nameText.includes('six')) return 'Class 6';
  }

  return 'Class 6';
}

export default function Subjects() {
  const navigate = useNavigate();
  const { role, basePath } = usePortalRole();
  const isGuardian = role === 'guardian';
  const isTeacher = role === 'teacher';

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Class 6');
  const [viewMode, setViewMode] = useState('grid');
  const [activeStudentId, setActiveStudentId] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);
  const currentSearch = searchQuery !== '' ? searchQuery : debouncedSearch;

  // Fetch courses from user API
  const { data, isLoading, isError, error, refetch } = useMyCourses();

  const rawCourses = data?.courses || [];
  const wards = data?.wards || [];

  // Determine current active ward for guardians
  const currentWard = useMemo(() => {
    if (!isGuardian || !wards.length) return null;
    if (activeStudentId) {
      return wards.find((w) => w.studentId === activeStudentId) || wards[0];
    }
    return wards[0];
  }, [isGuardian, wards, activeStudentId]);

  // Filter courses
  const coursesList = useMemo(() => {
    return rawCourses.filter((c) => {
      // If teacher: filter by selected class tab (Class 6, 7, 8)
      if (isTeacher) {
        if (getCourseGrade(c) !== selectedClass) return false;
      }

      // If guardian and has a selected ward, filter to that ward's class/section
      if (isGuardian && currentWard) {
        if (currentWard.classId && c.classId) {
          if (String(c.classId) !== String(currentWard.classId)) return false;
        } else if (currentWard.className && c.class) {
          if (c.class.toLowerCase() !== currentWard.className.toLowerCase()) return false;
        }
      }

      // Filter by search query
      if (currentSearch) {
        const q = currentSearch.toLowerCase();
        const match =
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.courseName && c.courseName.toLowerCase().includes(q)) ||
          (c.code && c.code.toLowerCase().includes(q)) ||
          (c.class && c.class.toLowerCase().includes(q)) ||
          (c.teacher && c.teacher.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [rawCourses, isTeacher, isGuardian, currentWard, selectedClass, currentSearch]);

  const count = coursesList.length;

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    refetch();
  };

  const handleOpenEbook = (course) => {
    const gradeOrClass = course.grade || course.class || (currentWard ? currentWard.className : selectedClass);
    const url = getEbookUrl(course.name || course.courseName, gradeOrClass);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('E-book link is not yet configured for this subject.');
    }
  };

  // Title for curriculum header
  const curriculumTitle = useMemo(() => {
    if (isTeacher) {
      return `${selectedClass}`;
    }
    if (isGuardian && currentWard) {
      return `${currentWard.studentName}'s (${currentWard.className || 'Class'})`;
    }
    if (rawCourses[0]?.class && rawCourses[0].class !== '—') {
      return rawCourses[0].class;
    }
    if (rawCourses[0]?.grade) {
      return rawCourses[0].grade;
    }
    return 'Enrolled Class';
  }, [isTeacher, selectedClass, isGuardian, currentWard, rawCourses]);

  const renderCourseCard = (c) => (
    <div key={c.id || c._id} className="cd">
      <div className="cd-top">
        {c.coverImage ? (
          <img
            src={c.coverImage}
            alt={c.name}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              objectFit: 'cover',
              flex: 'none',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <span
          className="tl"
          style={{
            display: c.coverImage ? 'none' : 'flex',
            flexDirection: 'column',
            fontSize: '13px',
            lineHeight: '1.1',
            background: 'rgba(70,140,190,.12)',
            color: '#2A6E9C',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            placeItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <small style={{ fontSize: '7px' }}>{c.code}</small>
          {c.shortCode}
        </span>
        <div className="cd-top-info">
          <h3 className="cd-title" title={c.name}>{c.name}</h3>
          <p className="cd-sub" title={c.teacher}>
            <User size={13} strokeWidth={1.8} />
            {c.teacher && c.teacher !== '—' ? c.teacher : 'No teacher assigned'}
          </p>
        </div>
        <span className="tg g" style={{ marginLeft: 'auto', flexShrink: 0 }}>
          {c.status || 'Active'}
        </span>
      </div>

      <div className="cd-tags">
        {c.type && c.type !== '—' && <span className="tg b">{c.type}</span>}
        {c.class && c.class !== '—' && <span className="tg">{c.class}</span>}
        <span className="tg" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Users size={11} strokeWidth={1.8} />
          {c.enrolled || 0} enrolled
        </span>
      </div>

      <div className="cd-body" style={{ minHeight: '38px' }}>
        {c.description && c.description !== '—' ? (
          c.description
        ) : (
          <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Standard academic curriculum subject.</span>
        )}
      </div>

      <div className="cd-footer">
        <span className="cd-meta" title={c.code} style={{ flexShrink: 0 }}>
          <BookOpen size={13} strokeWidth={1.8} />
          <span>{c.code || 'Subject'}</span>
        </span>
        <div className="cd-actions">
          <button
            type="button"
            className="cd-btn-view"
            onClick={() => handleOpenEbook(c)}
            title="Open digital e-book in a new tab"
          >
            <BookOpen size={13} strokeWidth={1.8} />
            Open E-Book
          </button>
          {isTeacher && (
            <button
              type="button"
              className="cd-btn-view"
              onClick={() => navigate(`${basePath}/subjects/${c.id || c._id}`)}
              title="View subject details"
            >
              View Subject
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="pt">
        <h2>Subjects</h2>
        <p>
          {isTeacher
            ? 'Search, view, and explore curriculum subjects for Class 6 to 8'
            : 'Curriculum and subject catalog'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="bar" style={{ marginBottom: '14px' }}>
        <div className="in">
          <Search size={17} strokeWidth={1.8} />
          <input
            placeholder="Search by name, code, class, or teacher..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSearchQuery('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchClick();
            }}
          />
        </div>
        <button type="button" className="pb" onClick={handleSearchClick}>
          <Search size={17} strokeWidth={1.8} />
          Search
        </button>
      </div>

      {/* TEACHER CLASS / GRADE FILTER TABS (Same design as admin) */}
      {isTeacher && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {['Class 6', 'Class 7', 'Class 8'].map((cls) => {
            const isSelected = selectedClass === cls;
            const countForCls = rawCourses.filter((c) => {
              if (getCourseGrade(c) !== cls) return false;
              if (currentSearch) {
                const q = currentSearch.toLowerCase();
                return (
                  (c.name && c.name.toLowerCase().includes(q)) ||
                  (c.code && c.code.toLowerCase().includes(q)) ||
                  (c.class && c.class.toLowerCase().includes(q)) ||
                  (c.teacher && c.teacher.toLowerCase().includes(q))
                );
              }
              return true;
            }).length;

            return (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClass(cls)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '14px',
                  font: isSelected ? '700 13px Manrope, sans-serif' : '600 13px Manrope, sans-serif',
                  background: isSelected ? 'linear-gradient(135deg, var(--p1), var(--p2))' : 'var(--card)',
                  color: isSelected ? '#fff' : 'var(--ink)',
                  border: isSelected ? '1px solid transparent' : '1px solid var(--line)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isSelected ? '0 6px 16px rgba(15, 59, 68, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{cls}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 7px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(255, 255, 255, 0.22)' : 'var(--soft)',
                    color: isSelected ? '#fff' : 'var(--mute)',
                    fontWeight: 700,
                  }}
                >
                  {countForCls}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* GUARDIAN CLASS/SECTION SWITCHER (Only show if guardian has 2+ students enrolled) */}
      {isGuardian && wards.length > 1 && (
        <div
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--mute)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <User size={13} style={{ color: 'var(--p1)' }} /> Switch Class:
          </span>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {wards.map((ward) => {
              const isActive = (activeStudentId ? activeStudentId === ward.studentId : wards[0]?.studentId === ward.studentId);
              return (
                <button
                  key={ward.studentId}
                  type="button"
                  onClick={() => setActiveStudentId(ward.studentId)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: isActive ? '1px solid var(--p1)' : '1px solid var(--line)',
                    background: isActive ? 'linear-gradient(135deg, var(--p1), var(--p2))' : 'var(--card)',
                    color: isActive ? '#fff' : 'var(--ink)',
                    boxShadow: isActive ? '0 4px 12px rgba(15, 59, 68, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {ward.studentName} ({ward.className || 'Class'})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* View Toggle and Counter */}
      <div className="row" style={{ margin: '6px 0 14px', color: 'var(--mute)' }}>
        Showing <b style={{ color: 'var(--ink)' }}>{count}</b>&nbsp;subjects
        <span className="vt" style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            className={viewMode === 'grid' ? 'on' : ''}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            title="Grid view"
          >
            ▦
          </button>
          <button
            type="button"
            className={viewMode === 'list' ? 'on' : ''}
            onClick={() => setViewMode('list')}
            aria-label="List view"
            title="List view"
          >
            ≡
          </button>
        </span>
      </div>

      {isLoading ? (
        <div className={`gr gr-4 ${viewMode === 'list' ? 'ls' : ''}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="cd" style={{ minHeight: '180px', gap: '14px' }}>
              <div className="row" style={{ gap: '12px' }}>
                <Skeleton width="44px" height="44px" borderRadius="12px" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Skeleton width="60%" height="16px" />
                  <Skeleton width="40%" height="12px" />
                </div>
              </div>
              <Skeleton width="80%" height="14px" />
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton width="70px" height="24px" />
                <Skeleton width="90px" height="30px" borderRadius="10px" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px' }}>
          <b style={{ color: '#C23A52' }}>Failed to load subjects</b>
          <p style={{ color: 'var(--mute)' }}>{error?.message || 'Server error'}</p>
          <div>
            <button
              type="button"
              className="pb"
              style={{ width: 'fit-content', margin: '0 auto' }}
              onClick={() => refetch()}
            >
              <RotateCcw size={15} strokeWidth={1.8} /> Retry
            </button>
          </div>
        </div>
      ) : coursesList.length === 0 ? (
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '12px' }}>
          <BookOpen size={36} strokeWidth={1.5} style={{ color: 'var(--mute)', margin: '0 auto', opacity: 0.5 }} />
          <h3 style={{ margin: 0, fontWeight: 700 }}>No subjects found</h3>
          <p style={{ color: 'var(--mute)', margin: 0, fontSize: '13px' }}>
            There are no subjects listed matching your filter.
          </p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <GraduationCap size={18} strokeWidth={2} style={{ color: 'var(--p1)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
              {curriculumTitle} Curriculum
            </h3>
            <span className="tg b" style={{ fontSize: '11px' }}>
              {coursesList.length} {coursesList.length === 1 ? 'Subject' : 'Subjects'}
            </span>
          </div>
          <div className={`gr gr-4 ${viewMode === 'list' ? 'ls' : ''}`}>
            {coursesList.map(renderCourseCard)}
          </div>
        </div>
      )}
    </div>
  );
}
