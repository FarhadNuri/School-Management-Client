import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  FileText,
  Plus,
  Search,
  School,
  Download,
  Trash2,
  Edit3,
  Calendar,
  Paperclip,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  FolderOpen,
  X
} from 'lucide-react';
import SearchBar from '../../components/SearchBar';
import FormModal from '../../components/FormModal';
import FileUpload from '../../components/FileUpload';
import Tag from '../../components/Tag';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ErrorRetry from '../../components/ErrorRetry';
import ConfirmModal from '../../components/ConfirmModal';
import {
  useTeacherLessons,
  useTeacherClasses,
  useTeacherCourses,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useDebounce
} from '../../hooks/usePortalQueries';
import { formatDate } from '../../utils/dateUtils';
import { showToast } from '../../../../components/ui/Toast';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function TeacherMaterials() {
  const [searchInput, setSearchInput] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [deletingMaterialId, setDeletingMaterialId] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [formCustomSubject, setFormCustomSubject] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formUploadedFiles, setFormUploadedFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const debouncedSearch = useDebounce(searchInput, 300);

  // Fetch teacher's assigned classes
  const {
    data: classesData,
    isLoading: isLoadingClasses
  } = useTeacherClasses();

  const myClasses = classesData?.classes || [];

  // Fetch teacher's assigned courses/subjects
  const {
    data: coursesData,
    isLoading: isLoadingCourses
  } = useTeacherCourses();

  const assignedCourses = coursesData?.courses || [];

  // Fetch materials (backed by teacher lessons endpoint)
  const {
    data: materialsData,
    isLoading,
    isError,
    error,
    refetch
  } = useTeacherLessons({
    classId: selectedClassId !== 'all' ? selectedClassId : undefined,
    search: debouncedSearch || undefined
  });

  const createMutation = useCreateLesson();
  const updateMutation = useUpdateLesson();
  const deleteMutation = useDeleteLesson();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const rawMaterials = materialsData?.lessons || [];

  // Filter materials by search input
  const filteredMaterials = useMemo(() => {
    if (!searchInput.trim()) return rawMaterials;
    const term = searchInput.toLowerCase().trim();
    return rawMaterials.filter((m) => {
      const matchTitle = m.title?.toLowerCase().includes(term);
      const matchSubject = m.subject?.toLowerCase().includes(term);
      const matchNotes = (m.notes || m.description)?.toLowerCase().includes(term);
      const matchClass = m.className?.toLowerCase().includes(term);
      return matchTitle || matchSubject || matchNotes || matchClass;
    });
  }, [rawMaterials, searchInput]);

  // Find courses for currently chosen class in form
  const selectedClassObj = useMemo(() => {
    return myClasses.find((c) => String(c.id || c._id) === String(formClassId));
  }, [myClasses, formClassId]);

  const classCourses = selectedClassObj?.courseObjects || [];

  // Open Upload New Material Modal
  const handleOpenNew = (preselectedClassId = null) => {
    const targetClassId = preselectedClassId || (selectedClassId !== 'all' ? selectedClassId : myClasses[0]?.id) || '';
    const firstCrs = assignedCourses[0];
    const firstCourseId = firstCrs ? (firstCrs.id || firstCrs._id) : '';
    const initialSubject = firstCrs
      ? (firstCrs.courseCode ? `${firstCrs.courseCode} - ${firstCrs.courseName}` : firstCrs.courseName)
      : '';

    setEditingMaterial(null);
    setFormTitle('');
    setFormClassId(targetClassId);
    setFormCourseId(firstCourseId);
    setFormCustomSubject(initialSubject);
    setFormNotes('');
    setFormUploadedFiles([]);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Edit Material Modal
  const handleOpenEdit = (material) => {
    setEditingMaterial(material);
    setFormTitle(material.title || '');
    setFormClassId(material.classId || material.class?.id || material.class?._id || '');

    // Match assigned course by ID or code/name
    const existingCourseId = material.courseId || material.course?._id || material.course?.id || '';
    let matchedCourse = assignedCourses.find((c) => String(c.id || c._id) === String(existingCourseId));
    if (!matchedCourse && material.subject) {
      const lower = material.subject.toLowerCase();
      matchedCourse = assignedCourses.find(
        (c) =>
          (c.courseCode && lower.includes(c.courseCode.toLowerCase())) ||
          lower === (c.courseName || '').toLowerCase() ||
          lower.includes((c.courseName || '').toLowerCase())
      );
    }

    const courseIdToSet = matchedCourse
      ? (matchedCourse.id || matchedCourse._id)
      : (existingCourseId || (assignedCourses[0]?.id || ''));

    setFormCourseId(courseIdToSet);
    setFormCustomSubject(
      matchedCourse
        ? (matchedCourse.courseCode ? `${matchedCourse.courseCode} - ${matchedCourse.courseName}` : matchedCourse.courseName)
        : (material.subject || '')
    );
    setFormNotes(material.notes || material.description || '');

    // Map existing URLs into display items, strictly filtering out any [object Object] artifacts
    const existingFileItems = (material.materials || [])
      .filter((url) => typeof url === 'string' && url.trim().length > 0 && !url.includes('[object'))
      .map((url) => ({
        name: url.split('/').pop().split('?')[0] || 'Cloud Document',
        size: 'Cloud File',
        type: 'existing',
        url
      }));

    setFormUploadedFiles(existingFileItems);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errs = {};
    if (!formTitle.trim()) {
      errs.title = 'Title is required';
    }
    if (!formClassId) {
      errs.classId = 'Please select a class section';
    }
    if (!formCourseId && assignedCourses.length > 0) {
      errs.subject = 'Please select an assigned subject';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Material
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const chosenCourse = assignedCourses.find((c) => String(c.id || c._id) === String(formCourseId));
    const finalSubject = chosenCourse
      ? (chosenCourse.courseCode ? `${chosenCourse.courseCode} - ${chosenCourse.courseName}` : chosenCourse.courseName)
      : (formCustomSubject.trim() || 'General');

    try {
      const fd = new FormData();
      fd.append('title', formTitle.trim());
      fd.append('classId', formClassId);
      if (formCourseId) fd.append('courseId', formCourseId);
      fd.append('subject', finalSubject);
      fd.append('notes', formNotes.trim());
      fd.append('durationMinutes', '45');
      fd.append('scheduledAt', new Date().toISOString());

      // Append files and links
      formUploadedFiles.forEach((item) => {
        const fileObj = item?.file || (item instanceof File ? item : null);
        if (fileObj instanceof File) {
          fd.append('materials', fileObj);
        } else if (item?.type === 'link' && item?.url) {
          fd.append('materials', item.url);
        } else if (item?.type === 'existing' && item?.url && !item.url.includes('[object')) {
          fd.append('materials', item.url);
        }
      });

      if (editingMaterial) {
        await updateMutation.mutateAsync({ id: editingMaterial.id || editingMaterial._id, data: fd });
        showToast('Material updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(fd);
        showToast('Material uploaded successfully', 'success');
      }

      setIsFormOpen(false);
      refetch();
    } catch (err) {
      showToast(err?.message || 'Failed to save material', 'error');
    }
  };

  // Delete Material
  const handleDeleteConfirm = async () => {
    if (!deletingMaterialId) return;
    try {
      await deleteMutation.mutateAsync(deletingMaterialId);
      setDeletingMaterialId(null);
      refetch();
    } catch (err) {
      showToast(err?.message || 'Failed to delete material', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header & Upload Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>
            Class Study Materials
          </h2>
          <p style={{ margin: 0, color: 'var(--mute)', fontSize: '13.5px' }}>
            Upload lecture notes, slides, worksheets, and study documents for your sections.
          </p>
        </div>

        <button
          onClick={() => handleOpenNew()}
          className="btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--p1), var(--p2))',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(15,59,68,.25)'
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Upload Material</span>
        </button>
      </div>

      {/* Section Selection Cards */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
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

      {/* Big Prominent Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          height: '52px',
          borderRadius: '16px',
          padding: '0 20px',
          background: 'var(--card)',
          border: '1.5px solid var(--line)',
          width: '100%',
          boxShadow: 'var(--sh)',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
        }}
      >
        <Search size={20} style={{ color: 'var(--p1)', flexShrink: 0 }} />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search study materials by title, subject code, or description..."
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--ink)'
          }}
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput('')}
            title="Clear search"
            style={{
              background: 'rgba(0,0,0,0.06)',
              border: 'none',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              color: 'var(--mute)',
              flexShrink: 0
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Materials List / Grid */}
      {isLoading ? (
        <div
          className="cd"
          style={{
            padding: '60px',
            textAlign: 'center',
            borderRadius: '20px',
            background: 'var(--card)'
          }}
        >
          <Loader2 size={32} className="spin" style={{ color: 'var(--p1)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--mute)' }}>Loading study materials...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div
          className="cd"
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            borderRadius: '20px',
            background: 'var(--card)',
            border: '1px solid var(--line)'
          }}
        >
          <FolderOpen size={48} style={{ color: 'var(--mute)', margin: '0 auto 14px' }} />
          <h3 style={{ margin: '0 0 6px', fontWeight: 800 }}>No Materials Found</h3>
          <p style={{ color: 'var(--mute)', margin: 0, fontSize: '13.5px' }}>
            {searchInput
              ? 'No materials match your search query.'
              : 'No materials have been uploaded for this section yet.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '18px'
          }}
        >
          {filteredMaterials.map((material) => {
            const files = (material.materials || []).filter(
              (url) => typeof url === 'string' && url.trim().length > 0 && !url.includes('[object')
            );

            return (
              <div
                key={material.id || material._id}
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
                  {/* Badges & Section */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px'
                    }}
                  >
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '8px',
                        background: 'rgba(30,111,120,.12)',
                        color: 'var(--p1)',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {material.className || 'SECTION'}
                    </span>

                    <span
                      style={{
                        fontSize: '11.5px',
                        color: 'var(--mute)',
                        fontWeight: 600
                      }}
                    >
                      {formatDate(material.createdAt || material.scheduledAt)}
                    </span>
                  </div>

                  {/* Subject Badge */}
                  <div style={{ marginBottom: '6px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--p1)',
                        fontWeight: 700
                      }}
                    >
                      {material.subject || 'General'}
                    </span>
                  </div>

                  {/* Material Title */}
                  <h3
                    style={{
                      margin: '0 0 8px',
                      fontSize: '17px',
                      fontWeight: 800,
                      color: 'var(--ink)'
                    }}
                  >
                    {material.title}
                  </h3>

                  {/* Description / Instructions */}
                  {material.notes && (
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--mute)',
                        fontSize: '13px',
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {material.notes}
                    </p>
                  )}

                  {/* Attached Files Section */}
                  {files.length > 0 && (
                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase' }}>
                        Attached Files ({files.length})
                      </span>
                      {files.map((fileUrl, fIdx) => {
                        const fileName = fileUrl.split('/').pop().split('?')[0] || `Document ${fIdx + 1}`;
                        const isPdf = fileName.toLowerCase().endsWith('.pdf');
                        const isImg = fileName.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/);

                        return (
                          <a
                            key={fIdx}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: '10px',
                              background: isPdf ? 'rgba(220,38,38,.06)' : 'var(--soft)',
                              border: isPdf ? '1px solid rgba(220,38,38,.2)' : '1px solid var(--line)',
                              textDecoration: 'none',
                              color: 'var(--ink)',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {isPdf ? (
                                <FileText size={15} style={{ color: '#DC2626', flexShrink: 0 }} />
                              ) : (
                                <Paperclip size={14} style={{ color: 'var(--p1)', flexShrink: 0 }} />
                              )}
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileName}</span>
                            </span>
                            <Download size={14} style={{ color: 'var(--mute)', flexShrink: 0, marginLeft: '8px' }} />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--line)'
                  }}
                >
                  <button
                    onClick={() => handleOpenEdit(material)}
                    className="btn"
                    title="Edit Material"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'var(--soft)',
                      border: '1px solid var(--line)',
                      color: 'var(--ink)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeletingMaterialId(material.id || material._id)}
                    className="btn"
                    title="Delete Material"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'rgba(220,38,38,.08)',
                      border: '1px solid rgba(220,38,38,.2)',
                      color: '#DC2626',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload / Edit Material Modal (Custom 760px wide 2-column layout to fit on-screen without scroll) */}
      {isFormOpen && (
        <FormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingMaterial ? 'Edit Study Material' : 'Upload Study Material'}
          subtitle={
            editingMaterial
              ? 'Update title, subject, instructions, or attach new documents.'
              : 'Select section, choose subject, and upload study documents for students.'
          }
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          submitLabel={editingMaterial ? 'Save Changes' : 'Upload Material'}
          maxWidth="760px"
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
                    onChange={(e) => {
                      setFormClassId(e.target.value);
                    }}
                    disabled={Boolean(editingMaterial)}
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
                    disabled={isLoadingCourses}
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

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Material Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Lecture Slides"
                  maxLength={100}
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

              {/* Description / Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Instructions / Description
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Add study guidelines or reading notes for students..."
                  rows={3}
                  maxLength={2000}
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

            {/* Right Column: Files & Attachments */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <FileUpload
                label="ATTACH DOCUMENTS / MATERIALS"
                files={formUploadedFiles}
                onChange={setFormUploadedFiles}
                onFilesChange={setFormUploadedFiles}
                maxSize={MAX_FILE_SIZE_BYTES}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp"
              />
            </div>
          </div>
        </FormModal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMaterialId && (
        <ConfirmModal
          isOpen={Boolean(deletingMaterialId)}
          onClose={() => setDeletingMaterialId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Study Material"
          message="Are you sure you want to remove this material? Attached files will be permanently deleted and students will no longer have access."
          confirmText="Delete Material"
          confirmVariant="danger"
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
