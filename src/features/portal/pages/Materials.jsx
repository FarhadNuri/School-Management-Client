import React, { useState, useMemo, useEffect } from 'react';
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
  Eye,
  X
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
  const { user } = usePortalRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingMaterial, setViewingMaterial] = useState(null);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setViewingMaterial(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const {
    data: materialsData,
    isLoading,
    isError,
    error,
    refetch
  } = useStudentMaterials({ search: debouncedSearch });

  const rawMaterials = useMemo(
    () => materialsData?.materials || materialsData?.lessons || [],
    [materialsData]
  );

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
                      <span>{formatDate(mat.createdAt || mat.scheduledAt)}</span>
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

                  {/* Notes / Description Snippet */}
                  {(mat.notes || mat.description) && (
                    <p
                      style={{
                        margin: '0 0 12px',
                        fontSize: '13px',
                        color: 'var(--mute)',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}
                    >
                      {mat.notes || mat.description}
                    </p>
                  )}
                </div>

                {/* Bottom Action Bar: Resource count and View Details Button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--line)',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      color: fileList.length > 0 ? '#2DD4BF' : 'var(--mute)',
                      fontWeight: 600
                    }}
                  >
                    <Paperclip size={13} />
                    <span>{fileList.length} resource{fileList.length === 1 ? '' : 's'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setViewingMaterial(mat)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      height: '36px',
                      padding: '0 14px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(20, 184, 166, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(20, 184, 166, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(20, 184, 166, 0.25)';
                    }}
                  >
                    <Eye size={14} />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW DETAILS MODAL - EXECUTIVE PROFESSIONAL DESIGN */}
      {viewingMaterial && (
        <div
          className="md on"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingMaterial(null);
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
            {/* Header with Teal Gradient */}
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
              <div style={{ flex: 1, paddingRight: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {viewingMaterial.className || user?.className || 'CLASS'}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.25)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    <BookOpen size={11} />
                    {viewingMaterial.subject || viewingMaterial.courseName || 'General'}
                  </span>
                </div>

                <h3
                  style={{
                    margin: '0 0 6px',
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: '-0.01em',
                    wordBreak: 'break-word'
                  }}
                >
                  {viewingMaterial.title}
                </h3>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.85)',
                    flexWrap: 'wrap'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    <span>{formatDate(viewingMaterial.createdAt || viewingMaterial.scheduledAt)}</span>
                  </span>
                  {viewingMaterial.teacherName && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} />
                      <span>{viewingMaterial.teacherName}</span>
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingMaterial(null)}
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
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Study Notes & Overview */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '12.5px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--mute)', letterSpacing: '0.5px' }}>
                  Study Notes & Overview
                </h4>
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: 'var(--soft)',
                    border: '1px solid var(--line)',
                    fontSize: '13.5px',
                    lineHeight: 1.6,
                    color: 'var(--ink)',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {viewingMaterial.notes || viewingMaterial.description || 'No additional notes provided for this study material.'}
                </div>
              </div>

              {/* Attachments Section */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '12.5px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--mute)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Paperclip size={14} />
                  <span>Attached Study Resources ({(Array.isArray(viewingMaterial.materials) ? viewingMaterial.materials : []).length})</span>
                </h4>

                {(Array.isArray(viewingMaterial.materials) ? viewingMaterial.materials : []).length === 0 ? (
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--mute)', fontStyle: 'italic' }}>
                    No downloadable files attached to this lesson.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(Array.isArray(viewingMaterial.materials) ? viewingMaterial.materials : []).map((fileUrl, idx) => {
                      const fileName = getFileName(fileUrl);
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: 'var(--soft)',
                            border: '1px solid var(--line)',
                            transition: 'border-color 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                            <FileText size={18} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'var(--ink)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={fileName}
                            >
                              {fileName}
                            </span>
                          </div>

                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              background: 'var(--card)',
                              border: '1px solid var(--line)',
                              color: 'var(--p1)',
                              textDecoration: 'none',
                              flexShrink: 0,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>Open</span>
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'flex-end',
                background: 'var(--card)',
                borderBottomLeftRadius: '24px',
                borderBottomRightRadius: '24px'
              }}
            >
              <button
                type="button"
                onClick={() => setViewingMaterial(null)}
                className="ghost"
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  margin: 0
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
