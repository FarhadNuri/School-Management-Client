import React, { useState, useMemo } from 'react';
import { usePortalRole } from '../hooks/usePortalRole';
import { useStudentMaterials, useDebounce } from '../hooks/usePortalQueries';
import SearchBar from '../components/SearchBar';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorRetry from '../components/ErrorRetry';
import {
  BookOpen,
  Calendar,
  User,
  Paperclip,
  ExternalLink,
  FileText,
  FileCheck,
  FolderOpen
} from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

// Helper to extract a friendly file name from a URL
const getFileName = (url) => {
  if (!url) return 'Attachment';
  try {
    const parts = url.split('/');
    const last = decodeURIComponent(parts[parts.length - 1] || 'Attachment');
    return last.split('?')[0];
  } catch {
    return 'Attachment';
  }
};

export default function Materials() {
  const { user, flags } = usePortalRole();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const {
    data: materialsData,
    isLoading,
    isError,
    error,
    refetch
  } = useStudentMaterials({ search: debouncedSearch });

  const rawMaterials = materialsData?.materials || materialsData?.lessons || [];

  const filteredMaterials = useMemo(() => {
    if (!debouncedSearch.trim()) return rawMaterials;
    const q = debouncedSearch.toLowerCase().trim();
    return rawMaterials.filter(
      (m) =>
        m.title?.toLowerCase().includes(q) ||
        m.subject?.toLowerCase().includes(q) ||
        m.courseName?.toLowerCase().includes(q) ||
        m.teacherName?.toLowerCase().includes(q)
    );
  }, [rawMaterials, debouncedSearch]);

  return (
    <>
      <div className="pt" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px', color: 'var(--ink)' }}>
          Materials
        </h2>
        <p style={{ margin: 0, color: 'var(--mute)', fontSize: '14px' }}>
          Browse learning materials, lecture notes, and study files uploaded for your class
        </p>
      </div>

      <SearchBar
        placeholder="Search materials by title, subject, or teacher..."
        value={searchTerm}
        onChange={setSearchTerm}
      />

      <div style={{ margin: '14px 0', color: 'var(--mute)', fontSize: '13.5px' }}>
        Showing <b style={{ color: 'var(--ink)' }}>{filteredMaterials.length}</b> learning material
        {filteredMaterials.length === 1 ? '' : 's'}
        {user?.className && (
          <span> for <b style={{ color: 'var(--p1)' }}>{user.className}</b></span>
        )}
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
              <Skeleton width="180px" height="20px" />
              <Skeleton width="120px" height="14px" />
              <Skeleton width="100%" height="48px" borderRadius="10px" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <ErrorRetry
          message={error?.message || 'Unable to load class materials.'}
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && filteredMaterials.length === 0 && (
        <EmptyState
          title="No materials uploaded yet"
          message={
            searchTerm
              ? 'No materials matched your search query.'
              : 'Your teachers have not uploaded any learning materials for your class yet.'
          }
        />
      )}

      {!isLoading && !isError && filteredMaterials.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '18px'
          }}
        >
          {filteredMaterials.map((mat) => {
            const fileList = Array.isArray(mat.materials) ? mat.materials : [];

            return (
              <div
                key={mat.id || mat._id}
                className="cd"
                style={{
                  padding: '22px',
                  borderRadius: '20px',
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
                  {/* Top Badges */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
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
                      {mat.className || user?.className || 'CLASS'}
                    </span>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: 'var(--mute)'
                      }}
                    >
                      <Calendar size={12} />
                      <span>{formatDate(mat.createdAt || mat.scheduledAt || new Date())}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      margin: '0 0 6px',
                      fontSize: '18px',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      lineHeight: 1.3
                    }}
                  >
                    {mat.title}
                  </h3>

                  {/* Subject & Teacher Metadata */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                      color: 'var(--mute)',
                      fontSize: '13px',
                      marginBottom: '10px'
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontWeight: 600,
                        color: 'var(--ink)'
                      }}
                    >
                      <BookOpen size={14} style={{ color: 'var(--p1)' }} />
                      <span>{mat.subject || mat.courseName || 'General'}</span>
                    </span>

                    {mat.teacherName && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--mute)',
                          fontSize: '12.5px'
                        }}
                      >
                        <User size={13} />
                        <span>{mat.teacherName}</span>
                      </span>
                    )}
                  </div>

                  {/* Notes / Description */}
                  {(mat.notes || mat.description) && (
                    <p
                      style={{
                        margin: '0 0 12px',
                        fontSize: '13px',
                        color: 'var(--ink)',
                        opacity: 0.85,
                        lineHeight: 1.5,
                        background: 'rgba(255,255,255,0.03)',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid var(--line)'
                      }}
                    >
                      {mat.notes || mat.description}
                    </p>
                  )}
                </div>

                {/* Attachments Section */}
                <div>
                  <div
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--mute)',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Paperclip size={12} />
                    <span>Attached Resources ({fileList.length})</span>
                  </div>

                  {fileList.length === 0 ? (
                    <span style={{ fontSize: '12.5px', color: 'var(--mute)', fontStyle: 'italic' }}>
                      No downloadable files attached
                    </span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {fileList.map((fileUrl, idx) => {
                        const name = getFileName(fileUrl);
                        return (
                          <a
                            key={idx}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              background: 'rgba(30,111,120,0.08)',
                              border: '1px solid rgba(30,111,120,0.2)',
                              color: 'var(--ink)',
                              textDecoration: 'none',
                              fontSize: '12.5px',
                              fontWeight: 600,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <FileText size={15} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                            </span>
                            <ExternalLink size={14} style={{ color: 'var(--p1)', flexShrink: 0, marginLeft: '8px' }} />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
