import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, BookOpen, RotateCcw, Tag as TagIcon, Sparkles } from 'lucide-react';
import BackLink from '../components/BackLink';
import Skeleton from '../components/Skeleton';
import { usePortalRole } from '../hooks/usePortalRole';
import { useMyCourse } from '../hooks/usePortalQueries';
import { getEbookUrl } from '../data/ebooks';

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, basePath } = usePortalRole();

  const { data: course, isLoading, isError, error, refetch } = useMyCourse(id);

  if (isLoading) {
    return (
      <div>
        <BackLink to={`${basePath}/subjects`} label="← Back to subjects" />
        <div className="cd" style={{ padding: '24px', gap: '16px', marginTop: '14px' }}>
          <div className="row" style={{ gap: '18px' }}>
            <Skeleton width="64px" height="64px" borderRadius="18px" />
            <div style={{ flex: 1, display: 'grid', gap: '10px' }}>
              <Skeleton width="40%" height="28px" />
              <Skeleton width="60%" height="16px" />
              <Skeleton width="50%" height="36px" borderRadius="12px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div>
        <BackLink to={`${basePath}/subjects`} label="← Back to subjects" />
        <div className="cd" style={{ textAlign: 'center', padding: '40px 20px', gap: '14px', marginTop: '14px' }}>
          <b style={{ color: '#C23A52' }}>Subject record not found</b>
          <p style={{ color: 'var(--mute)' }}>{error?.message || 'Could not load subject details'}</p>
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
      </div>
    );
  }

  const ebookUrl = getEbookUrl(course.name || course.courseName, course.grade || course.class);

  const handleOpenEbook = () => {
    if (ebookUrl) {
      window.open(ebookUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('E-book is not yet configured for this subject.');
    }
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <BackLink to={`${basePath}/subjects`} label="← Back to subjects" />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          {ebookUrl && (
            <button
              type="button"
              className="pb"
              style={{ height: '38px', padding: '0 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onClick={handleOpenEbook}
            >
              <BookOpen size={16} strokeWidth={1.8} /> Open E-Book
            </button>
          )}
        </div>
      </div>

      {/* Main Subject Overview Card */}
      <div className="cd" style={{ marginBottom: '14px', padding: '22px' }}>
        <div className="row" style={{ alignItems: 'flex-start', gap: '18px', flexWrap: 'wrap' }}>
          {course.coverImage ? (
            <img
              src={course.coverImage}
              alt={course.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
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
              display: course.coverImage ? 'none' : 'flex',
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              flexDirection: 'column',
              fontSize: '18px',
              lineHeight: '1.1',
              background: 'rgba(70,140,190,.12)',
              color: '#2A6E9C',
              placeItems: 'center',
              justifyContent: 'center',
              flex: 'none',
            }}
          >
            <small style={{ fontSize: '9px' }}>{course.code}</small>
            {course.shortCode}
          </span>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <h2 style={{ fontSize: '26px', margin: '0 0 6px', fontWeight: 800 }}>{course.name}</h2>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px', color: 'var(--mute)', fontSize: '13.5px' }}>
              <User size={14} strokeWidth={1.8} /> {course.teacher} · <BookOpen size={14} strokeWidth={1.8} />{' '}
              {course.class}
            </p>
            <p style={{ margin: 0, color: 'var(--ink)', opacity: 0.85, fontSize: '13.5px', lineHeight: 1.5 }}>
              {course.description || 'Standard academic curriculum subject.'}
            </p>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignSelf: 'flex-start' }}>
            <span className={`tg ${course.isActive ? 'g' : 'a'}`}>{course.status || 'Active'}</span>
            <span className="tg b">{course.type || 'Core'}</span>
          </div>
        </div>
      </div>

      {/* 3 Stats Overview Grid */}
      <div className="k3">
        <div className="cd">
          <small style={{ color: 'var(--mute)', letterSpacing: '.08em', fontWeight: 700 }}>STATUS</small>
          <b style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)' }}>
            {course.status || 'Active'}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)', letterSpacing: '.08em', fontWeight: 700 }}>SUBJECT TYPE</small>
          <b style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)' }}>
            {course.type || 'Core'}
          </b>
        </div>
        <div className="cd">
          <small style={{ color: 'var(--mute)', letterSpacing: '.08em', fontWeight: 700 }}>ENROLLED</small>
          <b style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)' }}>
            {course.enrolled || 0}
          </b>
        </div>
      </div>

      {/* 2 Column Details Specification Grid */}
      <div className="k2">
        <div className="cd">
          <small style={{ letterSpacing: '.1em', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase' }}>
            SUBJECT SPECIFICATION
          </small>
          <div style={{ display: 'grid', gap: '2px', marginTop: '6px' }}>
            {[
              ['Subject Title', course.name],
              ['Catalog Code', course.code],
              ['Assigned Section', course.class],
              ['Instructor', course.teacher],
            ].map(([label, val], idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: idx < 3 ? '1px solid var(--line)' : 'none',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: 'var(--mute)' }}>{label}</span>
                <b style={{ color: 'var(--ink)' }}>{val || '—'}</b>
              </div>
            ))}
          </div>
        </div>

        <div className="cd">
          <small style={{ letterSpacing: '.1em', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase' }}>
            CURRICULUM & SYLLABUS
          </small>
          <div style={{ display: 'grid', gap: '2px', marginTop: '6px' }}>
            {[
              ['Subject Type', course.type || 'Core'],
              ['Academic Status', course.status || 'Active'],
              ['Grade / Class', course.grade || course.class || 'Standard'],
              ['Description', course.description || 'Standard academic curriculum subject.'],
            ].map(([label, val], idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: idx < 3 ? '1px solid var(--line)' : 'none',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: 'var(--mute)' }}>{label}</span>
                <b style={{ color: 'var(--ink)', maxWidth: '65%', textAlign: 'right' }}>{val || '—'}</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      </div>
  );
}
