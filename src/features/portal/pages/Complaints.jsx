import { useState, useMemo } from 'react';
import { usePortalRole } from '../hooks/usePortalRole';
import SearchBar from '../components/SearchBar';
import Chips from '../components/Chips';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import ErrorRetry from '../components/ErrorRetry';
import {
  Eye,
  Plus,
  Calendar,
  User,
  Users,
  Image,
  FileText,
  AlertTriangle,
  Tag,
  X,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ExternalLink,
  UploadCloud
} from 'lucide-react';
import { useComplaints, useCreateComplaint } from '../hooks/usePortalQueries';

const COMPLAINT_CHIPS = ['All', 'Open', 'Under Review', 'Urgent', 'Resolved'];

export default function Complaints() {
  const { flags } = usePortalRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isMakeOpen, setIsMakeOpen] = useState(false);
  const [activeCase, setActiveCase] = useState(null);

  const { data, isLoading, isError, error, refetch } = useComplaints();
  const createMutation = useCreateComplaint();

  const allComplaints = useMemo(() => data?.complaints || [], [data?.complaints]);

  // Client-side filtering by search term and status/urgency chips
  const filteredComplaints = useMemo(() => {
    return allComplaints.filter((c) => {
      // Filter chip
      if (selectedFilter === 'Open' && c.status !== 'Open') return false;
      if (selectedFilter === 'Under Review' && c.status !== 'Under Review') return false;
      if (selectedFilter === 'Urgent' && (c.rawSeverity !== 'high' || c.status === 'Resolved')) return false;
      if (selectedFilter === 'Resolved' && c.status !== 'Resolved') return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        const matchesParty = c.reportedParty.toLowerCase().includes(q);
        const matchesCat = c.category.toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesParty || matchesCat;
      }

      return true;
    });
  }, [allComplaints, selectedFilter, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Action */}
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
            Complaints
          </h2>
          <p style={{ margin: 0, color: 'var(--mute)', fontSize: '13.5px' }}>
            Search and review incidents between students, teachers, and guardians
          </p>
        </div>

        {flags.canMakeComplaint && (
          <button
            type="button"
            onClick={() => setIsMakeOpen(true)}
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
            <span>Make complaint</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <SearchBar
        placeholder="Search by title, ID, person, or category..."
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {/* Filter Chips */}
      <Chips
        items={COMPLAINT_CHIPS}
        defaultIndex={0}
        onChange={(chip) => setSelectedFilter(chip)}
      />

            {/* Results Count */}
      <div style={{ margin: '-6px 0 0', color: 'var(--mute)', fontSize: '13px' }}>
        Showing <b style={{ color: 'var(--ink)' }}>{filteredComplaints.length}</b> complaint{filteredComplaints.length === 1 ? '' : 's'}
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
              <Skeleton width="180px" height="22px" />
              <Skeleton width="130px" height="15px" />
              <Skeleton width="100%" height="40px" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <Skeleton width="80px" height="14px" />
                <Skeleton width="90px" height="36px" borderRadius="10px" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <ErrorRetry
          message={error?.message || 'Unable to load complaints.'}
          onRetry={refetch}
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredComplaints.length === 0 && (
        <EmptyState
          title="No complaints found"
          message={
            allComplaints.length === 0
              ? 'You have not filed any incident complaints yet.'
              : 'No complaints match your current search and filter criteria.'
          }
        />
      )}

      {/* Cards Grid: Styled Identically to Attendance & Homeworks Section Cards */}
      {!isLoading && !isError && filteredComplaints.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '18px'
          }}
        >
          {filteredComplaints.map((c) => (
            <div
              key={c.id}
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
                {/* Badges Row: Category, Severity, Status */}
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
                      <span>{c.category}</span>
                    </span>

                    {/* Severity */}
                    {getSeverityBadge(c.rawSeverity, c.severity)}
                  </div>

                  {/* Status Badge */}
                  {getStatusBadge(c.rawStatus, c.status)}
                </div>

                {/* Complaint Title */}
                <h3
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    lineHeight: 1.3,
                    wordBreak: 'break-word'
                  }}
                >
                  {c.title}
                </h3>

                {/* Reported Party */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    color: 'var(--mute)'
                  }}
                >
                  <User size={13} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                  <span>Reported Party:</span>
                  <b style={{ color: 'var(--ink)' }}>{c.reportedParty}</b>
                </div>

                {/* Description Snippet */}
                {c.description && (
                  <p
                    style={{
                      margin: 0,
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
                    {c.description}
                  </p>
                )}

                {/* Photo evidence tag indicator if exists */}
                {c.photoEvidence && c.photoEvidence.length > 0 && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11.5px',
                      color: '#2DD4BF',
                      fontWeight: 600
                    }}
                  >
                    <Image size={13} />
                    <span>
                      {c.photoEvidence.length} photo evidence attached
                    </span>
                  </div>
                )}
              </div>

              {/* Action row with Date and View Case button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
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
                  <span>{c.dateFiled}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setActiveCase(c)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    height: '38px',
                    padding: '0 16px',
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
                >
                  <Eye size={14} />
                  <span>View Case</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Make Complaint Modal */}
      {isMakeOpen && (
        <MakeComplaintModal
          isOpen={isMakeOpen}
          onClose={() => setIsMakeOpen(false)}
          mutation={createMutation}
        />
      )}

      {/* View Case Modal (Read-Only) */}
      {activeCase && (
        <ViewCaseModal
          complaint={activeCase}
          onClose={() => setActiveCase(null)}
        />
      )}
    </div>
  );
}

// Helpers for Status & Severity badges
function getStatusBadge(rawStatus, label) {
  const s = String(rawStatus || '').toLowerCase();
  if (s === 'resolved') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 9px',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.14)',
          color: '#34D399',
          fontSize: '11px',
          fontWeight: 700
        }}
      >
        <CheckCircle2 size={11} />
        {label || 'Resolved'}
      </span>
    );
  }
  if (s === 'in_progress' || s === 'under_review') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 9px',
          borderRadius: '8px',
          background: 'rgba(59, 130, 246, 0.14)',
          color: '#60A5FA',
          fontSize: '11px',
          fontWeight: 700
        }}
      >
        <Clock size={11} />
        {label || 'Under Review'}
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
        background: 'rgba(251, 191, 36, 0.14)',
        color: '#FBBF24',
        fontSize: '11px',
        fontWeight: 700
      }}
    >
      <AlertTriangle size={11} />
      {label || 'Open'}
    </span>
  );
}

function getSeverityBadge(rawSev, label) {
  const s = String(rawSev || '').toLowerCase();
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
        {label || 'High'} Severity
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
        {label || 'Low'} Severity
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
      {label || 'Medium'} Severity
    </span>
  );
}

/* =========================================================================
   Make Complaint Modal (Polished)
   ========================================================================= */
function MakeComplaintModal({ isOpen, onClose, mutation }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('bullying');
  const [severity, setSeverity] = useState('medium');
  const [reportedParty, setReportedParty] = useState('');
  const [witnesses, setWitnesses] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    else if (title.trim().length > 50) errors.title = 'Title must be 50 characters or less';

    if (!category) errors.category = 'Category is required';
    if (!severity) errors.severity = 'Severity is required';

    if (!reportedParty.trim()) errors.reportedParty = 'Reported party is required';
    else if (reportedParty.trim().length > 50) errors.reportedParty = 'Reported party must be 50 characters or less';

    if (!description.trim()) errors.description = 'Description is required';
    else if (description.trim().length > 500) errors.description = 'Description must be 500 characters or less';

    if (witnesses.length > 200) errors.witnesses = 'Witnesses cannot exceed 200 characters';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    mutation.mutate(
      {
        title,
        category,
        severity,
        reportedParty,
        witnesses,
        description,
        photoEvidence: file
      },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

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
          width: '560px',
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
              File Incident Complaint
            </h3>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>
              Submit an incident report for administration review
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
              Title *
            </label>
            <input
              placeholder="Brief summary of the incident (max 50 chars)"
              value={title}
              maxLength={50}
              onChange={(e) => {
                setTitle(e.target.value);
                setFieldErrors((prev) => ({ ...prev, title: '' }));
              }}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '10px',
                padding: '0 12px',
                border: fieldErrors.title ? '1px solid #DC2626' : '1px solid var(--line)',
                background: 'var(--soft)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            {fieldErrors.title && (
              <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>{fieldErrors.title}</span>
            )}
          </div>

          {/* Category & Severity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, category: '' }));
                }}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '10px',
                  padding: '0 10px',
                  border: fieldErrors.category ? '1px solid #DC2626' : '1px solid var(--line)',
                  background: 'var(--soft)',
                  color: 'var(--ink)',
                  fontSize: '12.5px',
                  outline: 'none',
                  fontWeight: 600
                }}
              >
                <option value="bullying">Bullying</option>
                <option value="harassment">Harassment</option>
                <option value="cyberbullying">Cyberbullying</option>
                <option value="discrimination">Discrimination</option>
                <option value="misconduct">Misconduct</option>
                <option value="other">Other</option>
              </select>
              {fieldErrors.category && (
                <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>{fieldErrors.category}</span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Severity *
              </label>
              <select
                value={severity}
                onChange={(e) => {
                  setSeverity(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, severity: '' }));
                }}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '10px',
                  padding: '0 10px',
                  border: fieldErrors.severity ? '1px solid #DC2626' : '1px solid var(--line)',
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
              {fieldErrors.severity && (
                <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>{fieldErrors.severity}</span>
              )}
            </div>
          </div>

          {/* Reported Party */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Reported Party *
            </label>
            <input
              placeholder="Who was involved (student, teacher, or other party)"
              value={reportedParty}
              maxLength={50}
              onChange={(e) => {
                setReportedParty(e.target.value);
                setFieldErrors((prev) => ({ ...prev, reportedParty: '' }));
              }}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '10px',
                padding: '0 12px',
                border: fieldErrors.reportedParty ? '1px solid #DC2626' : '1px solid var(--line)',
                background: 'var(--soft)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            {fieldErrors.reportedParty && (
              <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>{fieldErrors.reportedParty}</span>
            )}
          </div>

          {/* Witnesses */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Witnesses (Optional)
            </label>
            <input
              placeholder="Comma-separated names (e.g. Jane Doe, John Smith)"
              value={witnesses}
              maxLength={200}
              onChange={(e) => {
                setWitnesses(e.target.value);
                setFieldErrors((prev) => ({ ...prev, witnesses: '' }));
              }}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '10px',
                padding: '0 12px',
                border: fieldErrors.witnesses ? '1px solid #DC2626' : '1px solid var(--line)',
                background: 'var(--soft)',
                color: 'var(--ink)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            {fieldErrors.witnesses && (
              <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>{fieldErrors.witnesses}</span>
            )}
          </div>

          {/* Incident Description */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase' }}>
                Description *
              </label>
              <span style={{ fontSize: '11px', color: 'var(--mute)' }}>
                {description.length} / 500
              </span>
            </div>
            <textarea
              rows="3"
              placeholder="Describe what happened in detail..."
              value={description}
              maxLength={500}
              onChange={(e) => {
                setDescription(e.target.value);
                setFieldErrors((prev) => ({ ...prev, description: '' }));
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: fieldErrors.description ? '1px solid #DC2626' : '1px solid var(--line)',
                background: 'var(--soft)',
                color: 'var(--ink)',
                fontSize: '12.5px',
                outline: 'none',
                resize: 'none',
                lineHeight: 1.45
              }}
            ></textarea>
            {fieldErrors.description && (
              <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>{fieldErrors.description}</span>
            )}
          </div>

          {/* Photo Evidence Upload */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Photo Evidence (Optional, max 5MB)
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'var(--soft)',
                border: '1px dashed var(--line)'
              }}
            >
              <UploadCloud size={20} style={{ color: 'var(--p1)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file ? file.name : 'Choose image evidence...'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--mute)' }}>
                  PNG, JPG, or WEBP up to 5MB
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
            </div>
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
              disabled={mutation.isPending}
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
              disabled={mutation.isPending}
              style={{
                padding: '9px 22px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                opacity: mutation.isPending ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(20, 184, 166, 0.25)'
              }}
            >
              {mutation.isPending ? 'Submitting...' : 'Submit complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   View Case Modal (Executive Read-Only Details)
   ========================================================================= */
function ViewCaseModal({ complaint, onClose }) {
  if (!complaint) return null;

  const witnessesText = (() => {
    if (!complaint.witnesses || complaint.witnesses === '—' || complaint.witnesses === '[]') {
      return 'None mentioned';
    }
    return complaint.witnesses;
  })();

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
                {complaint.category}
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
                {complaint.severity} Severity
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
                {complaint.status}
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
              {complaint.title}
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
              <span>Filed on {complaint.dateFiled}</span>
            </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {/* Reported Party */}
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
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--mute)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <User size={13} style={{ color: 'var(--p1)' }} />
                Reported Party
              </span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', wordBreak: 'break-word' }}>
                {complaint.reportedParty}
              </span>
            </div>

            {/* Witnesses */}
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
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--mute)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <Users size={13} style={{ color: 'var(--p1)' }} />
                Witnesses
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: witnessesText === 'None mentioned' ? 'var(--mute)' : 'var(--ink)',
                  wordBreak: 'break-word'
                }}
              >
                {witnessesText}
              </span>
            </div>
          </div>

          {/* Description Section */}
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
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}
            >
              <FileText size={14} style={{ color: 'var(--p1)' }} />
              Incident Description
            </label>
            <div
              style={{
                padding: '16px',
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
              {complaint.description || 'No description provided.'}
            </div>
          </div>

          {/* Photo Evidence Section */}
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
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}
            >
              <Image size={14} style={{ color: 'var(--p1)' }} />
              Photo Evidence {complaint.photoEvidence && complaint.photoEvidence.length > 0 ? `(${complaint.photoEvidence.length})` : ''}
            </label>

            {complaint.photoEvidence && complaint.photoEvidence.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {complaint.photoEvidence.map((imgUrl, i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid var(--line)',
                      background: 'rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div
                      style={{
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt="Incident Evidence"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '340px',
                          borderRadius: '12px',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                    <div
                      style={{
                        padding: '10px 16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderTop: '1px solid var(--line)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ fontSize: '12px', color: 'var(--mute)' }}>
                        Evidence Attachment #{i + 1}
                      </span>
                      <a
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#2DD4BF',
                          textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={13} />
                        <span>Open Full Size</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed var(--line)',
                  color: 'var(--mute)',
                  fontSize: '13px'
                }}
              >
                No photo evidence submitted for this complaint.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 24px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid var(--line)',
            marginTop: 'auto'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 24px',
              borderRadius: '10px',
              background: 'var(--soft)',
              color: 'var(--ink)',
              border: '1px solid var(--line)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
