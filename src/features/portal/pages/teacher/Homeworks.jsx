import { useState, useMemo } from 'react';
import SearchBar from '../../components/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import FormModal from '../../components/FormModal';
import FileUpload from '../../components/FileUpload';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ErrorRetry from '../../components/ErrorRetry';
import {
  Calendar,
  BookOpen,
  Users,
  Paperclip,
  Eye,
  Edit3,
  X,
  FileText,
  ExternalLink,
  Clock,
  Plus
} from 'lucide-react';
import {
  useTeacherHomeworks,
  useTeacherClasses,
  useTeacherCourses,
  useCreateHomework,
  useUpdateHomework,
  useDebounce
} from '../../hooks/usePortalQueries';
import { getTodayDateString, formatDate } from '../../utils/dateUtils';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function TeacherHomeworks() {
  const [searchInput, setSearchInput] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('all');

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [viewingHomework, setViewingHomework] = useState(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [formCustomSubject, setFormCustomSubject] = useState('');
  const [formDueDate, setFormDueDate] = useState(getTodayDateString());
  const [formInstructions, setFormInstructions] = useState('');
  const [formUploadedFiles, setFormUploadedFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const debouncedSearch = useDebounce(searchInput, 300);

  // Fetch teacher's assigned classes
  const {
    data: classesData,
    isLoading: isLoadingClasses
  } = useTeacherClasses();

  // Fetch teacher's assigned subjects/courses (matching Materials modal)
  const {
    data: coursesData,
    isLoading: isLoadingCourses
  } = useTeacherCourses();

  const assignedCourses = coursesData?.courses || [];

  // Fetch homeworks
  const {
    data: homeworksData,
    isLoading,
    isError,
    error,
    refetch
  } = useTeacherHomeworks();

  const createMutation = useCreateHomework();
  const updateMutation = useUpdateHomework();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const myClasses = classesData?.classes || [];
  const rawHomeworks = homeworksData?.homeworks || [];

  // Filter and sort by due date ascending
  const filteredHomeworks = useMemo(() => {
    let list = [...rawHomeworks];

    if (selectedClassId !== 'all') {
      list = list.filter((h) => String(h.classId) === String(selectedClassId));
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter(
        (h) => h.title?.toLowerCase().includes(q) || h.subject?.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => {
      const timeA = new Date(a.dueDate || 0).getTime();
      const timeB = new Date(b.dueDate || 0).getTime();
      return timeA - timeB;
    });
  }, [rawHomeworks, selectedClassId, debouncedSearch]);

  const handleOpenNew = () => {
    const defaultClassId = selectedClassId !== 'all' ? selectedClassId : (myClasses[0]?.id || myClasses[0]?._id || '');
    const defaultCourse = assignedCourses[0];
    setEditingHomework(null);
    setFormTitle('');
    setFormClassId(defaultClassId);
    setFormCourseId(defaultCourse ? (defaultCourse.id || defaultCourse._id) : '');
    setFormCustomSubject(
      defaultCourse
        ? (defaultCourse.courseCode ? `${defaultCourse.courseCode} - ${defaultCourse.courseName}` : defaultCourse.courseName)
        : ''
    );
    setFormDueDate(getTodayDateString());
    setFormInstructions('');
    setFormUploadedFiles([]);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (hw) => {
    setEditingHomework(hw);
    setFormTitle(hw.title || '');
    setFormClassId(hw.classId || myClasses[0]?.id || myClasses[0]?._id || '');

    const matched = assignedCourses.find(
      (c) =>
        String(c.id || c._id) === String(hw.courseId) ||
        c.courseName === hw.subject ||
        `${c.courseCode} - ${c.courseName}` === hw.subject
    );
    setFormCourseId(matched ? (matched.id || matched._id) : (hw.courseId || ''));
    setFormCustomSubject(hw.subject || '');

    if (hw.dueDate) {
      const d = new Date(hw.dueDate);
      if (!isNaN(d.getTime())) {
        setFormDueDate(getTodayDateString(d));
      }
    }
    setFormInstructions(hw.instructions || '');
    setFormUploadedFiles([]);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formTitle.trim()) errors.title = 'Title is required';
    if (!formClassId) errors.classId = 'Section is required';

    const chosenCourse = assignedCourses.find((c) => String(c.id || c._id) === String(formCourseId));
    const finalSubject = chosenCourse
      ? (chosenCourse.courseCode ? `${chosenCourse.courseCode} - ${chosenCourse.courseName}` : chosenCourse.courseName)
      : formCustomSubject.trim();

    if (!finalSubject) {
      errors.subject = 'Assigned subject is required';
    }

    if (!formDueDate) errors.dueDate = 'Due date is required';

    const fileObjects = formUploadedFiles
      .filter((f) => f.type === 'file' && f.file instanceof File)
      .map((f) => f.file);

    for (const file of fileObjects) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.files = `File "${file.name}" exceeds 10 MB limit`;
        break;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const formData = new FormData();
    formData.append('title', formTitle.trim());
    formData.append('classId', formClassId);
    formData.append('subject', finalSubject);
    if (formCourseId) formData.append('courseId', formCourseId);
    formData.append('dueDate', formDueDate);
    if (formInstructions.trim()) formData.append('instructions', formInstructions.trim());

    fileObjects.forEach((file) => {
      formData.append('materials', file);
    });

    try {
      if (editingHomework) {
        await updateMutation.mutateAsync({ id: editingHomework.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsFormOpen(false);
    } catch {
      // Handled by toast
    }
  };

  const classFilterOptions = useMemo(() => {
    return [
      { id: 'all', label: 'All classes' },
      ...myClasses.map((c) => ({ id: c.id || c._id, label: c.className }))
    ];
  }, [myClasses]);

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
            Homeworks
          </h2>
          <p style={{ margin: 0, color: 'var(--mute)', fontSize: '13.5px' }}>
            Assign homework assignments, set due dates, and attach materials
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
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
          <span>Create homework</span>
        </button>
      </div>

      {myClasses.length === 0 && !isLoadingClasses ? (
        <EmptyState
          title="No assigned classes"
          message="You have no assigned classes yet. Ask the administrator to assign you."
        />
      ) : (
        <>
          {/* Section Selection Cards - Same as Materials */}
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

          {/* Prominent Full-Width Search Bar */}
          <div>
            <SearchBar
              placeholder="Search homework by title or subject..."
              value={searchInput}
              onChange={(val) => setSearchInput(val)}
            />
          </div>

          <div style={{ margin: '-4px 0 0', color: 'var(--mute)', fontSize: '13px' }}>
            Showing <b style={{ color: 'var(--ink)' }}>{filteredHomeworks.length}</b> homework assignment
            {filteredHomeworks.length === 1 ? '' : 's'}
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
                  <Skeleton width="100px" height="20px" borderRadius="8px" />
                  <Skeleton width="100%" height="38px" borderRadius="10px" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <ErrorRetry
              message={error?.message || 'Unable to load homeworks.'}
              onRetry={refetch}
            />
          )}

          {!isLoading && !isError && filteredHomeworks.length === 0 && (
            <EmptyState
              title="No homework assignments"
              message={
                searchInput
                  ? 'No homework assignments match your search.'
                  : 'You have not created any homework assignments yet.'
              }
            />
          )}

          {/* Cards Grid: Styled Identically to Attendance Section Cards */}
          {!isLoading && !isError && filteredHomeworks.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
                gap: '18px'
              }}
            >
              {filteredHomeworks.map((hw) => (
                <div
                  key={hw.id}
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
                        marginBottom: '8px',
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
                        {hw.className || 'SECTION'}
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
                          background: 'rgba(251, 191, 36, 0.14)',
                          color: '#FBBF24',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Calendar size={12} />
                        <span>{hw.dueDateText || formatDate(hw.dueDate)}</span>
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
                      {hw.title}
                    </h3>

                    {/* Subject & Materials Metadata */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                        color: 'var(--mute)',
                        fontSize: '13px'
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: 600,
                          color: '#F8FAFC'
                        }}
                      >
                        <BookOpen size={14} style={{ color: 'var(--p1)' }} />
                        <span>{hw.subject}</span>
                      </span>

                      {hw.materialsCount > 0 && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            color: 'var(--mute)'
                          }}
                        >
                          • <Paperclip size={13} /> {hw.materialsCount} file{hw.materialsCount === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>

                    {/* Instructions snippet */}
                    {hw.instructions && (
                      <p
                        style={{
                          margin: '8px 0 0',
                          fontSize: '12.5px',
                          color: 'var(--mute)',
                          lineHeight: 1.45,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {hw.instructions}
                      </p>
                    )}
                  </div>

                  {/* Responsive Action Buttons (Same as Attendance cards) */}
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
                      onClick={() => setViewingHomework(hw)}
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
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>View Details</span>
                    </button>

                    <button
                      type="button"
                      className="att-card-btn-view"
                      onClick={() => handleOpenEdit(hw)}
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
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#F8FAFC',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box'
                      }}
                    >
                      <Edit3 size={14} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* VIEW DETAILS MODAL - EXECUTIVE PROFESSIONAL REDESIGN */}
      {viewingHomework && (
        <div
          className="md on"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingHomework(null);
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
                padding: '20px 24px',
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
                    {viewingHomework.className || 'ASSIGNMENT'}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 9px',
                      borderRadius: '8px',
                      background: 'rgba(251, 191, 36, 0.25)',
                      color: '#FEF08A',
                      fontSize: '11.5px',
                      fontWeight: 700
                    }}
                  >
                    <Calendar size={12} />
                    Due: {viewingHomework.dueDateText || formatDate(viewingHomework.dueDate)}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                  {viewingHomework.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>
                  <BookOpen size={14} />
                  <span style={{ fontWeight: 600 }}>{viewingHomework.subject}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingHomework(null)}
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

            {/* Body content */}
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Quick Meta Grid */}
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
                    Section / Class
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 700, color: '#F8FAFC' }}>
                    <Users size={15} style={{ color: 'var(--p1)' }} />
                    <span>{viewingHomework.className || 'General'}</span>
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
                    Subject
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 700, color: '#F8FAFC' }}>
                    <BookOpen size={15} style={{ color: 'var(--p1)' }} />
                    <span>{viewingHomework.subject || 'All Subjects'}</span>
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
                    Submission Deadline
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 700, color: '#FBBF24' }}>
                    <Clock size={15} />
                    <span>{viewingHomework.dueDateText || formatDate(viewingHomework.dueDate)}</span>
                  </div>
                </div>
              </div>

              {/* Instructions Block */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <FileText size={14} style={{ color: 'var(--p1)' }} />
                  Instructions & Guidelines
                </label>
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid var(--line)',
                    fontSize: '13.5px',
                    color: viewingHomework.instructions ? '#F8FAFC' : 'var(--mute)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {viewingHomework.instructions || 'No specific instructions provided for this assignment.'}
                </div>
              </div>

              {/* Attached Study Materials */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Paperclip size={14} style={{ color: 'var(--p1)' }} />
                  Attached Materials ({viewingHomework.materials?.length || 0})
                </label>

                {viewingHomework.materials && viewingHomework.materials.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    {viewingHomework.materials.map((mat, i) => {
                      const url = typeof mat === 'string' ? mat : mat.url;
                      let name = typeof mat === 'string' ? (mat.split('/').pop() || 'Attachment') : (mat.name || mat.url?.split('/').pop() || 'Attachment');
                try { name = decodeURIComponent(name); } catch {}
                      return (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--line)',
                            color: '#F8FAFC',
                            textDecoration: 'none',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(20,184,166,0.12)';
                            e.currentTarget.style.borderColor = 'rgba(20,184,166,0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            e.currentTarget.style.borderColor = 'var(--line)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, paddingRight: '8px' }}>
                            <FileText size={18} style={{ color: '#2DD4BF', flexShrink: 0 }} />
                            <span style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {name}
                            </span>
                          </div>
                          <ExternalLink size={14} style={{ color: 'var(--mute)', flexShrink: 0 }} />
                        </a>
                      );
                    })}
                  </div>
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
                    No documents attached to this homework.
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
                padding: '14px 24px',
                background: 'rgba(255,255,255,0.02)',
                borderTop: '1px solid var(--line)'
              }}
            >
              <button
                type="button"
                onClick={() => setViewingHomework(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#F8FAFC',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const hw = viewingHomework;
                  setViewingHomework(null);
                  handleOpenEdit(hw);
                }}
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
                <span>Edit Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FORM MODAL - SIMILAR TO UPLOAD MATERIALS MODAL */}
      {isFormOpen && (
        <FormModal
          isOpen={isFormOpen}
          onClose={() => !isSubmitting && setIsFormOpen(false)}
          title={editingHomework ? 'Edit Homework' : 'Create Homework'}
          subtitle={
            editingHomework
              ? 'Update homework title, assigned subject, deadline, or attachments.'
              : 'Assign homework for your class, set a due date, and attach reference files.'
          }
          submitLabel={editingHomework ? 'Update Homework' : 'Create Homework'}
          isSubmitting={isSubmitting}
          maxWidth="780px"
          onSubmit={handleSubmit}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '18px',
              alignItems: 'start'
            }}
          >
            {/* Left Column: Form Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Section & Subject in 2 columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Section *
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    disabled={Boolean(editingHomework) || isSubmitting}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '10px',
                      padding: '0 10px',
                      border: formErrors.classId ? '1px solid #DC2626' : '1px solid var(--line)',
                      background: 'var(--soft)',
                      color: 'var(--ink)',
                      fontSize: '12.5px',
                      outline: 'none'
                    }}
                  >
                    <option value="">Choose section...</option>
                    {myClasses.map((cls) => (
                      <option key={cls.id || cls._id} value={cls.id || cls._id}>
                        {cls.className} ({cls.classCode || 'Section'})
                      </option>
                    ))}
                  </select>
                  {formErrors.classId && (
                    <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
                      {formErrors.classId}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Assigned Subject Code *
                  </label>
                  <select
                    value={formCourseId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setFormCourseId(selectedId);
                      const crs = assignedCourses.find((c) => String(c.id || c._id) === String(selectedId));
                      if (crs) {
                        setFormCustomSubject(crs.courseCode ? `${crs.courseCode} - ${crs.courseName}` : crs.courseName);
                      }
                    }}
                    disabled={isLoadingCourses || isSubmitting}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '10px',
                      padding: '0 10px',
                      border: formErrors.subject ? '1px solid #DC2626' : '1px solid var(--line)',
                      background: 'var(--soft)',
                      color: 'var(--ink)',
                      fontSize: '12.5px',
                      outline: 'none',
                      fontWeight: 600
                    }}
                  >
                    {isLoadingCourses ? (
                      <option value="">Loading assigned subjects...</option>
                    ) : assignedCourses.length === 0 ? (
                      <option value="">No subjects assigned to your account</option>
                    ) : (
                      <>
                        <option value="">Select subject code...</option>
                        {assignedCourses.map((crs) => (
                          <option key={crs.id || crs._id} value={crs.id || crs._id}>
                            {crs.courseCode ? `${crs.courseCode} - ${crs.courseName}` : crs.courseName}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {formErrors.subject && (
                    <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
                      {formErrors.subject}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Due Date in 2 columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Homework Title *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Exercise 5.2 Questions 1-10"
                    maxLength={100}
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '10px',
                      padding: '0 12px',
                      border: formErrors.title ? '1px solid #DC2626' : '1px solid var(--line)',
                      background: 'var(--soft)',
                      color: 'var(--ink)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  {formErrors.title && (
                    <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
                      {formErrors.title}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '10px',
                      padding: '0 10px',
                      border: formErrors.dueDate ? '1px solid #DC2626' : '1px solid var(--line)',
                      background: 'var(--soft)',
                      color: 'var(--ink)',
                      fontSize: '12.5px',
                      outline: 'none'
                    }}
                  />
                  {formErrors.dueDate && (
                    <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
                      {formErrors.dueDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Instructions / Guidelines
                </label>
                <textarea
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="Detailed assignment guidelines, problem numbers, or reference notes for students..."
                  rows={3}
                  maxLength={2000}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--line)',
                    background: 'var(--soft)',
                    color: 'var(--ink)',
                    fontSize: '12.5px',
                    outline: 'none',
                    resize: 'none',
                    lineHeight: 1.4
                  }}
                />
              </div>
            </div>

            {/* Right Column: Existing materials & Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {editingHomework && editingHomework.materials && editingHomework.materials.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Existing Attachments ({editingHomework.materials.length})
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {editingHomework.materials.map((m, i) => {
                      const url = typeof m === 'string' ? m : m.url;
                      let name = typeof m === 'string' ? (m.split('/').pop() || 'Attachment') : (m.name || 'Attachment');
                      try { name = decodeURIComponent(name); } catch {}
                      return (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--line)',
                            fontSize: '12px',
                            color: '#2DD4BF',
                            textDecoration: 'none'
                          }}
                        >
                          <Paperclip size={13} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              <FileUpload
                label={editingHomework ? 'Add New Attachments' : 'Attach Documents / Files'}
                placeholder="Upload files (PDF, Word, Excel, PPT, images up to 10MB)"
                files={formUploadedFiles}
                onChange={setFormUploadedFiles}
                onFilesChange={setFormUploadedFiles}
                maxSize={MAX_FILE_SIZE_BYTES}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp"
              />
              {formErrors.files && (
                <span style={{ color: '#DC2626', fontSize: '11px', marginTop: '3px', display: 'block' }}>
                  {formErrors.files}
                </span>
              )}
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
