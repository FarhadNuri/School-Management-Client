import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import Chips from '../components/Chips';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorRetry from '../components/ErrorRetry';
import FileUpload from '../components/FileUpload';
import { usePortalRole } from '../hooks/usePortalRole';
import {
  Eye,
  Plus,
  Calendar,
  Users,
  Megaphone,
  Tag,
  X,
  ShieldAlert,
  AlertTriangle,
  Info,
  Edit3,
  Trash2,
  Paperclip,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Loader2
} from 'lucide-react';
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  useDebounce
} from '../hooks/usePortalQueries';
import { useUnreadAnnouncements } from '../hooks/useUnreadAnnouncements';

const CATEGORY_CHIPS = ['All categories', 'General', 'Academic', 'Disciplinary', 'Other'];

export default function Announcements() {
  const { flags, role, user } = usePortalRole();
  const { isRead, markAsRead, markAllAsRead, unreadCount } = useUnreadAnnouncements();
  const canCreate = flags.canCreateAnnouncement || role === 'teacher';

  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  
  // Modals
  const [activeNotice, setActiveNotice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [noticeToDelete, setNoticeToDelete] = useState(null);

  const debouncedSearch = useDebounce(searchInput, 400);
  const effectiveSearch = activeSearch !== '' ? activeSearch : debouncedSearch;

  const queryParams = {
    search: effectiveSearch,
    category: selectedCategory === 'All categories' ? '' : selectedCategory.toLowerCase()
  };

  const { data, isLoading, isError, error, refetch } = useAnnouncements(queryParams);
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const handleSearchSubmit = (val) => {
    setActiveSearch(val);
  };

  const handleInputChange = (val) => {
    setSearchInput(val);
    if (activeSearch !== '') {
      setActiveSearch('');
    }
  };

  const announcements = data?.announcements || [];
  const count = data?.count ?? announcements.length;

  // Determine current user ID for author verification
  let currentSessionTeacherId = '';
  try {
    const raw = localStorage.getItem('portal_session');
    if (raw) {
      const s = JSON.parse(raw);
      currentSessionTeacherId = String(s.teacherId || s.user?._id || s.user?.id || s._id || s.id || '');
    }
  } catch {}

  const currentUserId = String(user?._id || user?.id || user?.userId || currentSessionTeacherId || '');

  const checkIsAuthor = (a) => {
    if (role !== 'teacher' || !a.createdBy) return false;
    const authorId = String(a.createdBy);
    return (
      authorId === currentUserId ||
      authorId === String(user?._id) ||
      authorId === String(user?.id) ||
      authorId === currentSessionTeacherId
    );
  };

  const handleOpenCreate = () => {
    setEditingNotice(null);
    setIsFormOpen(true);
  };

  const handleViewNotice = (notice) => {
    if (notice) {
      markAsRead(notice.id || notice._id);
      setActiveNotice(notice);
    }
  };

  const handleOpenEdit = (notice) => {
    setEditingNotice(notice);
    setIsFormOpen(true);
    if (activeNotice?.id === notice.id) {
      setActiveNotice(null);
    }
  };

  const handleDelete = async () => {
    if (!noticeToDelete) return;
    try {
      await deleteMutation.mutateAsync(noticeToDelete.id);
      setNoticeToDelete(null);
      if (activeNotice?.id === noticeToDelete.id) {
        setActiveNotice(null);
      }
    } catch {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>
            Announcements
          </h2>
          <p style={{ margin: 0, color: 'var(--mute)', fontSize: '13.5px' }}>
            Official school notices and broadcast updates for your account
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={handleOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(20, 184, 166, 0.28)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Create announcement</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <SearchBar
        placeholder="Search by title or details..."
        value={searchInput}
        onChange={handleInputChange}
        onSearch={handleSearchSubmit}
      />

      {/* Category Filter Chips */}
      <Chips
        items={CATEGORY_CHIPS}
        defaultIndex={0}
        onChange={(item) => setSelectedCategory(item)}
      />

      {/* Showing count */}
      <div
        style={{
          margin: '-6px 0 0',
          color: 'var(--mute)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div>
          Showing <b style={{ color: 'var(--ink)' }}>{count}</b> announcement{count === 1 ? '' : 's'}
          {unreadCount > 0 && (
            <span style={{ marginLeft: '6px', color: 'var(--acc, #F59E6C)', fontWeight: 700 }}>
              ({unreadCount} unread)
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--p1, #1E6F78)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Skeleton Loading State */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton width="90px" height="22px" borderRadius="8px" />
                <Skeleton width="70px" height="22px" borderRadius="8px" />
              </div>
              <Skeleton width="200px" height="22px" />
              <Skeleton width="100%" height="40px" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <Skeleton width="90px" height="14px" />
                <Skeleton width="90px" height="36px" borderRadius="10px" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Retry */}
      {isError && (
        <ErrorRetry
          message={error?.message || 'Unable to load announcements.'}
          onRetry={refetch}
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && announcements.length === 0 && (
        <EmptyState
          title="No notices found"
          message="There are currently no announcements matching your filters."
        />
      )}

      {/* Cards Grid: Styled Identically to Attendance, Homeworks & Complaints Cards */}
      {!isLoading && !isError && announcements.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '18px'
          }}
        >
          {announcements.map((a) => {
            const isAuthor = checkIsAuthor(a);

            return (
              <div
                key={a.id}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Header Row: Category, Priority, Audience */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {/* Category */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 9px',
                          borderRadius: '8px',
                          background: 'rgba(30,111,120,.12)',
                          color: 'var(--p1)',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}
                      >
                        <Tag size={11} />
                        <span>{a.category}</span>
                      </span>

                      {/* Priority */}
                      {getPriorityBadge(a.severity)}

                      {/* Unread badge */}
                      {!isRead(a.id || a._id) && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 7px',
                            borderRadius: '6px',
                            background: 'var(--acc, #F59E6C)',
                            color: '#0A1C24',
                            fontSize: '10px',
                            fontWeight: 800,
                            letterSpacing: '0.04em'
                          }}
                        >
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0A1C24' }} />
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Audience */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 9px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--line)',
                        color: 'var(--mute)',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      <Users size={11} />
                      <span>{a.targetAudience}</span>
                    </span>
                  </div>

                  {/* Announcement Title */}
                  <h3
                    onClick={() => handleViewNotice(a)}
                    style={{
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      lineHeight: 1.3,
                      wordBreak: 'break-word',
                      cursor: 'pointer'
                    }}
                  >
                    {a.title}
                  </h3>

                  {/* Description Snippet */}
                  {a.description && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        color: 'var(--mute)',
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}
                    >
                      {a.description}
                    </p>
                  )}

                  {/* Attachments Indicator */}
                  {a.attachments && a.attachments.length > 0 && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '12px',
                        color: '#2DD4BF',
                        fontWeight: 600
                      }}
                    >
                      <Paperclip size={13} />
                      <span>
                        {a.attachments.length} attachment{a.attachments.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action row with Date and View/Edit/Delete buttons */}
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
                      fontWeight: 600,
                      color: 'var(--mute)'
                    }}
                  >
                    <Calendar size={13} />
                    <span>{a.dateFormatted}</span>
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isAuthor && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(a)}
                          title="Edit announcement"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '9px',
                            background: 'var(--soft)',
                            color: 'var(--ink)',
                            border: '1px solid var(--line)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setNoticeToDelete(a)}
                          title="Delete announcement"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '9px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#F87171',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => handleViewNotice(a)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        height: '36px',
                        padding: '0 14px',
                        borderRadius: '9px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(20, 184, 166, 0.25)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Read-Only Notice Modal (Executive Tier) */}
      {activeNotice && (
        <div
          className="md on"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveNotice(null);
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
                {/* Header Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
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
                    <Tag size={11} />
                    {activeNotice.category}
                  </span>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    {activeNotice.severity} Priority
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
                      fontWeight: 800
                    }}
                  >
                    Audience: {activeNotice.targetAudience}
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
                  {activeNotice.title}
                </h3>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.85)'
                  }}
                >
                  <Calendar size={13} />
                  <span>{activeNotice.dateFormatted}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveNotice(null)}
                aria-label="Close"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.15s ease'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Metadata Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Users size={13} style={{ color: 'var(--p1)' }} />
                    Audience
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', wordBreak: 'break-word' }}>
                    {activeNotice.targetAudience}
                  </span>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: 'var(--soft)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <ShieldAlert size={13} style={{ color: 'var(--p1)' }} />
                    Priority
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                    {activeNotice.severity}
                  </span>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: 'var(--soft)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Tag size={13} style={{ color: 'var(--p1)' }} />
                    Category
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                    {activeNotice.category}
                  </span>
                </div>
              </div>

              {/* Notice Content Section */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  <Megaphone size={14} style={{ color: 'var(--p1)' }} />
                  Notice Content
                </label>
                <div
                  style={{
                    padding: '18px',
                    borderRadius: '14px',
                    background: 'var(--soft)',
                    border: '1px solid var(--line)',
                    fontSize: '14px',
                    lineHeight: '1.65',
                    color: 'var(--ink)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {activeNotice.description || 'No content provided in this announcement.'}
                </div>
              </div>

              {/* Attachments Section */}
              {activeNotice.attachments && activeNotice.attachments.length > 0 && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    <Paperclip size={14} style={{ color: 'var(--p1)' }} />
                    Attachments ({activeNotice.attachments.length})
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeNotice.attachments.map((url, i) => {
                      const isImg = url.match(/\.(jpeg|jpg|png|webp|gif)($|\?)/i) || url.includes('/image/upload/');
                      let name = url.split('/').pop() || 'Attachment';
                      try { name = decodeURIComponent(name); } catch {}

                      return (
                        <div
                          key={i}
                          style={{
                            borderRadius: '14px',
                            border: '1px solid var(--line)',
                            background: 'rgba(255, 255, 255, 0.025)',
                            overflow: 'hidden'
                          }}
                        >
                          {isImg && (
                            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center' }}>
                              <img
                                src={url}
                                alt="Attachment preview"
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '260px',
                                  borderRadius: '8px',
                                  objectFit: 'contain'
                                }}
                              />
                            </div>
                          )}

                          <div
                            style={{
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                              {isImg ? <ImageIcon size={16} style={{ color: 'var(--p1)', flexShrink: 0 }} /> : <FileText size={16} style={{ color: 'var(--p1)', flexShrink: 0 }} />}
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {name}
                              </span>
                            </div>

                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#2DD4BF',
                                textDecoration: 'none',
                                flexShrink: 0
                              }}
                            >
                              <ExternalLink size={13} />
                              <span>Open</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '16px 24px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderTop: '1px solid var(--line)',
                marginTop: 'auto'
              }}
            >
              <div>
                {checkIsAuthor(activeNotice) && (
                  <button
                    type="button"
                    onClick={() => setNoticeToDelete(activeNotice)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#F87171',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete Notice</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveNotice(null)}
                  style={{
                    padding: '9px 20px',
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

                {checkIsAuthor(activeNotice) && (
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(activeNotice)}
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
                      boxShadow: '0 4px 12px rgba(20, 184, 166, 0.25)'
                    }}
                  >
                    <Edit3 size={14} />
                    <span>Edit Notice</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Announcement Modal */}
      {isFormOpen && (
        <AnnouncementFormModal
          isOpen={isFormOpen}
          notice={editingNotice}
          onClose={() => {
            setIsFormOpen(false);
            setEditingNotice(null);
          }}
          createMutation={createMutation}
          updateMutation={updateMutation}
        />
      )}

      {/* Delete Confirmation Modal */}
      {noticeToDelete && (
        <div
          className="md on"
          onClick={(e) => {
            if (e.target === e.currentTarget) setNoticeToDelete(null);
          }}
          style={{ zIndex: 110, padding: '16px' }}
        >
          <div
            className="mc"
            style={{
              width: '460px',
              maxWidth: '94vw',
              borderRadius: '20px',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#F87171',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--ink)' }}>
                  Delete Announcement
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--mute)' }}>
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--ink)', lineHeight: 1.5 }}>
              Are you sure you want to delete <b>"{noticeToDelete.title}"</b>? This notice and its attachments will be permanently removed.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setNoticeToDelete(null)}
                disabled={deleteMutation.isPending}
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
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 20px',
                  borderRadius: '10px',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 size={15} className="spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   Create / Edit Announcement Modal (With Attachments Support)
   ========================================================================= */
function AnnouncementFormModal({ isOpen, notice, onClose, createMutation, updateMutation }) {
  const isEditing = Boolean(notice);

  const [title, setTitle] = useState(notice?.title !== 'Notice' ? (notice?.title || '') : '');
  const [category, setCategory] = useState(notice?.rawCategory || 'general');
  const [severity, setSeverity] = useState(notice?.rawSeverity || 'medium');
  const [targetAudience, setTargetAudience] = useState(
    Array.isArray(notice?.rawAudience) && notice.rawAudience.length ? notice.rawAudience[0] : 'all'
  );
  const [description, setDescription] = useState(notice?.description || '');
  const [existingAttachments, setExistingAttachments] = useState(notice?.attachments || []);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    else if (title.trim().length > 50) errs.title = 'Title must be 50 characters or less';

    if (!category) errs.category = 'Category is required';
    if (!severity) errs.severity = 'Priority is required';
    if (!targetAudience) errs.targetAudience = 'Target audience is required';

    if (!description.trim()) errs.description = 'Notice content is required';
    else if (description.trim().length > 1000) errs.description = 'Description cannot exceed 1000 characters';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRemoveExisting = (url) => {
    setExistingAttachments((prev) => prev.filter((u) => u !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category);
    formData.append('severity', severity);
    formData.append('targetAudience', targetAudience);

    if (isEditing) {
      formData.append('existingAttachments', JSON.stringify(existingAttachments));
    }

    const fileObjects = uploadedFiles
      .filter((f) => f.type === 'file' && f.file instanceof File)
      .map((f) => f.file);

    fileObjects.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: notice.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onClose();
    } catch {}
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div
      className="md on"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ zIndex: 100, padding: '16px' }}
    >
      <div
        className="mc no-scrollbar"
        style={{
          width: '580px',
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
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            flexShrink: 0
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800, color: '#fff' }}>
              {isEditing ? 'Edit Announcement' : 'Create Announcement'}
            </h3>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>
              {isEditing
                ? 'Update notice information and attached materials'
                : 'Broadcast an official notice to students, guardians, or teachers'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#FFFFFF',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Notice Title *
            </label>
            <input
              placeholder="e.g. Science Fair Submission Deadline"
              value={title}
              maxLength={50}
              disabled={isPending}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((prev) => ({ ...prev, title: '' }));
              }}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '10px',
                padding: '0 12px',
                border: errors.title ? '1px solid #DC2626' : '1px solid var(--line)',
                background: 'var(--soft)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            {errors.title && (
              <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>{errors.title}</span>
            )}
          </div>

          {/* Target Audience */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Target Audience *
            </label>
            <select
              value={targetAudience}
              disabled={isPending}
              onChange={(e) => {
                setTargetAudience(e.target.value);
                setErrors((prev) => ({ ...prev, targetAudience: '' }));
              }}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '10px',
                padding: '0 10px',
                border: errors.targetAudience ? '1px solid #DC2626' : '1px solid var(--line)',
                background: 'var(--soft)',
                color: 'var(--ink)',
                fontSize: '12.5px',
                outline: 'none',
                fontWeight: 600
              }}
            >
              <option value="all">All (Everyone)</option>
              <option value="students">Students Only</option>
              <option value="guardians">Guardians / Parents Only</option>
              <option value="teachers">Teachers Only</option>
            </select>
            {errors.targetAudience && (
              <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>{errors.targetAudience}</span>
            )}
          </div>

          {/* Category & Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Category *
              </label>
              <select
                value={category}
                disabled={isPending}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setErrors((prev) => ({ ...prev, category: '' }));
                }}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '10px',
                  padding: '0 10px',
                  border: errors.category ? '1px solid #DC2626' : '1px solid var(--line)',
                  background: 'var(--soft)',
                  color: 'var(--ink)',
                  fontSize: '12.5px',
                  outline: 'none',
                  fontWeight: 600
                }}
              >
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="disciplinary">Disciplinary</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>{errors.category}</span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Priority Level *
              </label>
              <select
                value={severity}
                disabled={isPending}
                onChange={(e) => {
                  setSeverity(e.target.value);
                  setErrors((prev) => ({ ...prev, severity: '' }));
                }}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '10px',
                  padding: '0 10px',
                  border: errors.severity ? '1px solid #DC2626' : '1px solid var(--line)',
                  background: 'var(--soft)',
                  color: 'var(--ink)',
                  fontSize: '12.5px',
                  outline: 'none',
                  fontWeight: 600
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {errors.severity && (
                <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>{errors.severity}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase' }}>
                Notice Content / Details *
              </label>
              <span style={{ fontSize: '11px', color: 'var(--mute)' }}>
                {description.length} / 1000
              </span>
            </div>
            <textarea
              rows="4"
              placeholder="Write the full announcement announcement details here..."
              value={description}
              maxLength={1000}
              disabled={isPending}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((prev) => ({ ...prev, description: '' }));
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: errors.description ? '1px solid #DC2626' : '1px solid var(--line)',
                background: 'var(--soft)',
                color: 'var(--ink)',
                fontSize: '12.5px',
                outline: 'none',
                resize: 'none',
                lineHeight: 1.45
              }}
            />
            {errors.description && (
              <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>{errors.description}</span>
            )}
          </div>

          {/* Attachments Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Existing Attachments in Edit Mode */}
            {isEditing && existingAttachments.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Current Attachments ({existingAttachments.length})
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {existingAttachments.map((url, i) => {
                    let name = url.split('/').pop() || 'Attachment';
                    try { name = decodeURIComponent(name); } catch {}
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--line)',
                          fontSize: '12px'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px', color: 'var(--ink)' }}>
                          {name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExisting(url)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#F87171', padding: '2px' }}
                          title="Remove attachment"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <FileUpload
              label={isEditing ? 'Add New Attachments (Images, PDF, Documents)' : 'Attach Materials / Documents (Optional)'}
              placeholder="Upload files (PDF, image, Word, PPT up to 10MB)"
              files={uploadedFiles}
              onChange={setUploadedFiles}
              onFilesChange={setUploadedFiles}
              maxSize={10 * 1024 * 1024}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp"
            />
          </div>

          {/* Footer Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '10px',
              borderTop: '1px solid var(--line)'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 22px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(20, 184, 166, 0.25)'
              }}
            >
              {isPending ? (
                <>
                  <Loader2 size={15} className="spin" />
                  <span>{isEditing ? 'Saving...' : 'Publishing...'}</span>
                </>
              ) : (
                <span>{isEditing ? 'Save changes' : 'Publish announcement'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helpers for Priority badge
function getPriorityBadge(severity) {
  const s = String(severity || '').toLowerCase();
  if (s === 'high' || s === 'urgent') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 9px',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.14)',
          color: '#F87171',
          fontSize: '11px',
          fontWeight: 700
        }}
      >
        <ShieldAlert size={11} />
        High Priority
      </span>
    );
  }
  if (s === 'low') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 9px',
          borderRadius: '8px',
          background: 'rgba(20, 184, 166, 0.14)',
          color: '#2DD4BF',
          fontSize: '11px',
          fontWeight: 700
        }}
      >
        <Info size={11} />
        Low Priority
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 9px',
        borderRadius: '8px',
        background: 'rgba(245, 158, 11, 0.14)',
        color: '#FBBF24',
        fontSize: '11px',
        fontWeight: 700
      }}
    >
      <AlertTriangle size={11} />
      Medium Priority
    </span>
  );
}
