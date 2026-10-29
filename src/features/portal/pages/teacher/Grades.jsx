import { useState, useMemo, useEffect } from 'react';
import SearchBar from '../../components/SearchBar';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ErrorRetry from '../../components/ErrorRetry';
import {
  Users,
  Lock,
  Plus,
  Save,
  Check,
  Trash2,
  ArrowLeft,
  X,
  School,
  PlusCircle,
  Eye,
  BookOpen
} from 'lucide-react';
import {
  useTeacherClasses,
  useTeacherGradebooks,
  useTeacherGradebook,
  useSaveTeacherGradebook,
  useDebounce
} from '../../hooks/usePortalQueries';
import { showToast } from '../../../../components/ui/Toast';

const ASSESSMENT_TYPES = [
  { id: 'quiz', label: 'Quiz', defaultMarks: 20 },
  { id: 'class_test', label: 'Class Test', defaultMarks: 25 },
  { id: 'assignment', label: 'Assignment', defaultMarks: 20 },
  { id: 'attendance', label: 'Attendance', defaultMarks: 10 },
  { id: 'mid_term', label: 'Mid Term', defaultMarks: 50 },
  { id: 'final_term', label: 'Final Term', defaultMarks: 100 }
];

const calculateLetterGrade = (obtained, max) => {
  if (!max || max <= 0) return { grade: '—', color: '#94A3B8' };
  const pct = (obtained / max) * 100;
  if (pct >= 90) return { grade: 'A+', color: '#22C55E' };
  if (pct >= 80) return { grade: 'A', color: '#14B8A6' };
  if (pct >= 70) return { grade: 'B', color: '#38BDF8' };
  if (pct >= 60) return { grade: 'C', color: '#FBBF24' };
  if (pct >= 50) return { grade: 'D', color: '#FB923C' };
  return { grade: 'F', color: '#EF4444' };
};

export default function TeacherGrades() {
  // Currently opened section for grade input (null = show sections overview)
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Section filter for the cards overview ('all' or specific class ID)
  const [sectionFilterId, setSectionFilterId] = useState('all');
  const [sectionSearch, setSectionSearch] = useState('');
  const debouncedSectionSearch = useDebounce(sectionSearch, 300);

  // Gradebook local sheet state
  const [studentSearch, setStudentSearch] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [studentScores, setStudentScores] = useState({}); // { [studentId]: { [assessmentId]: number | '' } }

  // Modal state for adding assessment column
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState('quiz');
  const [modalName, setModalName] = useState('');
  const [modalMaxMarks, setModalMaxMarks] = useState(20);

  const debouncedStudentSearch = useDebounce(studentSearch, 300);

  // Fetch teacher's assigned classes
  const { data: classesData, isLoading: isLoadingClasses } = useTeacherClasses();
  const myClasses = classesData?.classes || [];

  // Fetch all teacher gradebooks to know published/locked status per class
  const { data: gradebooksSummaryData } = useTeacherGradebooks();
  const gradebooksList = gradebooksSummaryData?.gradebooks || [];

  const publishedClassIds = useMemo(() => {
    const set = new Set();
    gradebooksList.forEach((gb) => {
      if (gb.isPublished === true || gb.status === 'published') {
        const cId = String(gb.classId?._id || gb.classId || gb.class || '');
        if (cId) set.add(cId);
      }
    });
    return set;
  }, [gradebooksList]);

  const gradebookMap = useMemo(() => {
    const map = new Map();
    gradebooksList.forEach((gb) => {
      const cId = String(gb.classId?._id || gb.classId || gb.class || '');
      if (cId) {
        const existing = map.get(cId);
        if (!existing || gb.isPublished || gb.status === 'published') {
          map.set(cId, gb);
        }
      }
    });
    return map;
  }, [gradebooksList]);

  // Fetch gradebook data for selected section
  const {
    data: gradebookData,
    isLoading: isLoadingGradebook,
    isError,
    error,
    refetch
  } = useTeacherGradebook(selectedSection?.id, selectedCourseId ? { courseId: selectedCourseId } : {});

  const isPublished = Boolean(gradebookData?.isPublished || gradebookData?.status === 'published');
  const saveMutation = useSaveTeacherGradebook();
  const isSaving = saveMutation.isPending;

  // Initialize local sheet state when gradebookData loads
  useEffect(() => {
    if (gradebookData) {
      setAssessments(gradebookData.assessments || []);
      if (!selectedCourseId && (gradebookData.course?.id || gradebookData.course?._id)) {
        setSelectedCourseId(gradebookData.course?.id || gradebookData.course?._id);
      }

      const initialScores = {};
      (gradebookData.students || []).forEach((s) => {
        initialScores[s.studentId] = s.scores || {};
      });
      setStudentScores(initialScores);
      setHasUnsavedChanges(false);
    }
  }, [gradebookData, selectedCourseId]);

  const students = useMemo(() => gradebookData?.students || [], [gradebookData?.students]);

  // Filter students by search inside gradebook
  const filteredStudents = useMemo(() => {
    if (!debouncedStudentSearch.trim()) return students;
    const q = debouncedStudentSearch.toLowerCase().trim();
    return students.filter(
      (s) => (s.name || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q)
    );
  }, [students, debouncedStudentSearch]);

  // Filter sections in overview
  const filteredSections = useMemo(() => {
    let list = myClasses;
    if (sectionFilterId !== 'all') {
      list = list.filter((c) => String(c.id) === String(sectionFilterId));
    }
    if (debouncedSectionSearch.trim()) {
      const q = debouncedSectionSearch.toLowerCase().trim();
      list = list.filter(
        (c) =>
          (c.className || '').toLowerCase().includes(q) ||
          (c.classCode || '').toLowerCase().includes(q) ||
          (c.grade || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [myClasses, sectionFilterId, debouncedSectionSearch]);

  // Handle Score Input Change - Clean typing without stepper arrows
  const handleScoreChange = (studentId, assessmentId, val, maxMarks) => {
    if (isPublished) return;
    const cleanVal = val.replace(/[^\d]/g, '');
    if (cleanVal === '') {
      setStudentScores((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [assessmentId]: ''
        }
      }));
      setHasUnsavedChanges(true);
      return;
    }

    let num = Number(cleanVal);
    if (!Number.isNaN(num)) {
      if (num < 0) num = 0;
      if (num > maxMarks) {
        num = maxMarks;
        showToast(`Score cannot exceed max marks (${maxMarks})`, 'error');
      }
      setStudentScores((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [assessmentId]: num
        }
      }));
      setHasUnsavedChanges(true);
    }
  };

  // Open Add Assessment Modal with smart default name
  const handleOpenAddModal = (typeId = 'quiz') => {
    if (isPublished) return;
    const typeObj = ASSESSMENT_TYPES.find((t) => t.id === typeId) || ASSESSMENT_TYPES[0];
    const existingCount = assessments.filter((a) => a.type === typeId).length;
    setModalType(typeId);
    setModalName(`${typeObj.label} ${existingCount + 1}`);
    setModalMaxMarks(typeObj.defaultMarks);
    setIsAddModalOpen(true);
  };

  // Handle Type Change in Modal
  const handleModalTypeChange = (typeId) => {
    const typeObj = ASSESSMENT_TYPES.find((t) => t.id === typeId);
    if (!typeObj) return;
    const existingCount = assessments.filter((a) => a.type === typeId).length;
    setModalType(typeId);
    setModalName(`${typeObj.label} ${existingCount + 1}`);
    setModalMaxMarks(typeObj.defaultMarks);
  };

  // Confirm Adding Assessment
  const handleConfirmAddAssessment = (e) => {
    e?.preventDefault();
    if (!modalName.trim()) {
      showToast('Please enter an assessment name', 'error');
      return;
    }
    const maxMarksNum = Number(modalMaxMarks);
    if (Number.isNaN(maxMarksNum) || maxMarksNum < 1) {
      showToast('Maximum marks must be at least 1', 'error');
      return;
    }

    const newAssessment = {
      id: `asmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: modalName.trim(),
      type: modalType,
      maxMarks: maxMarksNum,
      date: new Date().toISOString()
    };

    setAssessments((prev) => [...prev, newAssessment]);
    setHasUnsavedChanges(true);
    setIsAddModalOpen(false);
    showToast(`Added "${newAssessment.name}" column`, 'success');
  };

  // Remove Assessment Column
  const handleRemoveAssessment = (assessmentId) => {
    if (isPublished) return;
    const asmt = assessments.find((a) => a.id === assessmentId);
    if (!asmt) return;
    if (window.confirm(`Are you sure you want to remove "${asmt.name}" and all entered marks for this column?`)) {
      setAssessments((prev) => prev.filter((a) => a.id !== assessmentId));
      setStudentScores((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((sId) => {
          if (next[sId]) {
            const copy = { ...next[sId] };
            delete copy[assessmentId];
            next[sId] = copy;
          }
        });
        return next;
      });
      setHasUnsavedChanges(true);
      showToast(`Removed "${asmt.name}"`, 'success');
    }
  };

  // Save Gradebook Changes
  const handleSave = () => {
    if (!selectedSection) return;

    const payloadGrades = students.map((s) => ({
      studentId: s.studentId,
      scores: studentScores[s.studentId] || {},
      remarks: s.remarks || ''
    }));

    saveMutation.mutate(
      {
        classId: selectedSection.id,
        data: {
          courseId: gradebookData?.course?.id || gradebookData?.course?._id || selectedCourseId,
          subject: gradebookData?.subject || selectedSection.mySubject,
          courseCode: gradebookData?.courseCode || selectedSection.myCourseCode,
          assessments,
          grades: payloadGrades
        }
      },
      {
        onSuccess: () => {
          setHasUnsavedChanges(false);
        }
      }
    );
  };

  // Total Max Marks in current sheet
  const totalMaxMarks = useMemo(() => {
    return assessments.reduce((acc, a) => acc + (Number(a.maxMarks) || 0), 0);
  }, [assessments]);

  // Back Navigation Handler
  const handleBackToSections = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved grading changes. Do you want to discard them and return to sections?')) {
        return;
      }
    }
    setSelectedSection(null);
    setSelectedCourseId(null);
    setStudentSearch('');
    setHasUnsavedChanges(false);
  };

  // ==========================================
  // VIEW 1: SPECIFIC SECTION GRADE INPUT VIEW
  // ==========================================
  if (selectedSection) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Style tag to strictly disable number spin buttons across all browsers */}
        <style>{`
          .grade-input-cell::-webkit-outer-spin-button,
          .grade-input-cell::-webkit-inner-spin-button {
            -webkit-appearance: none !important;
            margin: 0 !important;
          }
          .grade-input-cell {
            -moz-appearance: textfield !important;
          }
        `}</style>

        {/* Top Header Matching User's Design */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          {/* Left: Back Button + Class Name + Student Count Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleBackToSections}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '12px',
                background: 'var(--card)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--sh)',
                transition: 'all 0.15s ease'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>
                {selectedSection.className}
              </h2>
              <span
                style={{
                  padding: '5px 12px',
                  borderRadius: '10px',
                  background: 'rgba(20, 184, 166, 0.12)',
                  border: '1px solid rgba(20, 184, 166, 0.25)',
                  color: '#14B8A6',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <BookOpen size={15} />
                <span>{gradebookData?.subject || selectedSection.mySubject || 'Arts and Culture'}</span>
                {(gradebookData?.courseCode || selectedSection.myCourseCode) ? (
                  <span style={{ opacity: 0.85, fontWeight: 700 }}>
                    ({gradebookData?.courseCode || selectedSection.myCourseCode})
                  </span>
                ) : null}
              </span>
            </div>

            <span
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(20, 184, 166, 0.15)',
                color: '#14B8A6',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              {students.length} Students
            </span>

            {isPublished && (
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#EF4444',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Lock size={12} />
                <span>View Only</span>
              </span>
            )}
          </div>

          {/* Right Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Add Assessment Button */}
            {!isPublished ? (
              <button
                type="button"
                onClick={() => handleOpenAddModal('quiz')}
                disabled={students.length === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '13px',
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: students.length > 0 ? 'pointer' : 'not-allowed',
                  opacity: students.length > 0 ? 1 : 0.6,
                  boxShadow: 'var(--sh)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Plus size={16} color="#14B8A6" strokeWidth={2.5} />
                <span>Add Assessment</span>
              </button>
            ) : null}

            {/* Save Gradebook Button / Locked Indicator */}
            {isPublished ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '13px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#EF4444',
                  fontWeight: 700,
                  fontSize: '13.5px'
                }}
              >
                <Lock size={15} />
                <span>Editing Locked</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '13px',
                  background: hasUnsavedChanges
                    ? 'linear-gradient(135deg, #14B8A6, #0D9488)'
                    : 'var(--card)',
                  color: hasUnsavedChanges ? '#FFFFFF' : 'var(--mute)',
                  border: hasUnsavedChanges ? 'none' : '1px solid var(--line)',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: hasUnsavedChanges && !isSaving ? 'pointer' : 'default',
                  boxShadow: hasUnsavedChanges
                    ? '0 4px 14px rgba(20, 184, 166, 0.35)'
                    : 'none',
                  transition: 'all 0.2s ease',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                {isSaving ? (
                  <span>Saving...</span>
                ) : hasUnsavedChanges ? (
                  <>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        boxShadow: '0 0 8px #FFFFFF'
                      }}
                    />
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Check size={16} color="#14B8A6" />
                    <span>All Saved</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Assigned Courses Tabs (if teacher teaches multiple courses in this class) */}
        {gradebookData?.assignedCourses?.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--mute)' }}>Grading Subject:</span>
            {gradebookData.assignedCourses.map((c) => {
              const cId = String(c.id || c._id);
              const isSelected = cId === String(selectedCourseId || gradebookData.course?.id || gradebookData.course?._id);
              return (
                <button
                  key={cId}
                  type="button"
                  onClick={() => {
                    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Discard and switch subject?')) {
                      return;
                    }
                    setSelectedCourseId(cId);
                    setHasUnsavedChanges(false);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '10px',
                    border: isSelected ? '1px solid #14B8A6' : '1px solid var(--line)',
                    background: isSelected ? 'rgba(20, 184, 166, 0.15)' : 'var(--card)',
                    color: isSelected ? '#14B8A6' : 'var(--ink)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {c.courseName} {c.courseCode ? `(${c.courseCode})` : ''}
                </button>
              );
            })}
          </div>
        )}

        {/* Published & Locked Banner */}
        {isPublished && (
          <div
            style={{
              padding: '14px 20px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#EF4444',
                  flexShrink: 0
                }}
              >
                <Lock size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--ink)' }}>
                  Gradebook Officially Published
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--mute)' }}>
                  This gradebook has been approved and published by Admin. Teacher editing is locked. Only Admin can update scores.
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: '8px',
                background: '#EF4444',
                color: '#FFFFFF',
                letterSpacing: '0.04em'
              }}
            >
              Locked by Admin
            </span>
          </div>
        )}

        {/* Search within Roster - Full Width */}
        {students.length > 0 && (
          <div style={{ width: '100%' }}>
            <SearchBar
              placeholder="Search students by name, email..."
              value={studentSearch}
              onChange={(val) => setStudentSearch(val)}
              onSearch={(val) => setStudentSearch(val)}
            />
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoadingGradebook && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Skeleton key={n} width="100%" height="56px" borderRadius="14px" />
            ))}
          </div>
        )}

        {/* Error Retry */}
        {isError && (
          <ErrorRetry
            message={error?.message || 'Unable to load class gradebook.'}
            onRetry={refetch}
          />
        )}

        {/* Empty Roster */}
        {!isLoadingGradebook && !isError && students.length === 0 && (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: 'var(--card)',
              borderRadius: '24px',
              border: '1px solid var(--line)',
              boxShadow: 'var(--sh)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'rgba(20, 184, 166, 0.1)',
                display: 'grid',
                placeItems: 'center',
                color: '#14B8A6'
              }}
            >
              <Users size={32} />
            </div>
            <h3 style={{ margin: '6px 0 0', fontSize: '18px', fontWeight: 800, color: 'var(--ink)' }}>
              No Students Enrolled
            </h3>
            <p style={{ margin: 0, color: 'var(--mute)', fontSize: '13.5px', maxWidth: '420px', lineHeight: 1.5 }}>
              This class section currently has zero enrolled students. Once students are enrolled by administration, they will appear in this gradebook.
            </p>
          </div>
        )}

        {/* Gradebook Matrix Table */}
        {!isLoadingGradebook && !isError && students.length > 0 && (
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: '20px',
              boxShadow: 'var(--sh)',
              overflow: 'hidden'
            }}
          >
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  minWidth: `${360 + assessments.length * 150 + 180}px`
                }}
              >
                {/* Table Header */}
                <thead>
                  <tr
                    style={{
                      background: 'var(--soft)',
                      borderBottom: '1px solid var(--line)'
                    }}
                  >
                    {/* Left Column: Student */}
                    <th
                      style={{
                        padding: '16px 20px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        color: 'var(--mute)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        width: '280px',
                        position: 'sticky',
                        left: 0,
                        background: 'var(--soft)',
                        zIndex: 2,
                        borderRight: '1px solid var(--line)'
                      }}
                    >
                      Student
                    </th>

                    {/* Middle Columns: Clean Professional Assessment Header (No colored tag/caption) */}
                    {assessments.map((asmt) => (
                      <th
                        key={asmt.id}
                        style={{
                          padding: '14px 16px',
                          textAlign: 'center',
                          minWidth: '150px',
                          borderRight: '1px solid var(--line)'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {/* Clean Assessment Title with Delete Icon Beside */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <span
                              style={{
                                fontSize: '14px',
                                fontWeight: 800,
                                color: 'var(--ink)',
                                letterSpacing: '-0.01em'
                              }}
                            >
                              {asmt.name}
                            </span>
                            {!isPublished && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAssessment(asmt.id)}
                              title={`Delete ${asmt.name}`}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--mute)',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                borderRadius: '4px',
                                transition: 'color 0.15s ease'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--mute)')}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                          </div>

                          {/* Max Marks Subtitle */}
                          <div style={{ fontSize: '12px', color: 'var(--mute)', fontWeight: 600 }}>
                            Max: <b style={{ color: 'var(--ink)' }}>{asmt.maxMarks}</b>
                          </div>
                        </div>
                      </th>
                    ))}

                    {/* Quick message if 0 assessments */}
                    {assessments.length === 0 && (
                      <th
                        style={{
                          padding: '16px 24px',
                          textAlign: 'center',
                          color: 'var(--mute)',
                          fontSize: '12.5px',
                          fontWeight: 600
                        }}
                      >
                        No assessments added yet. Click &quot;Add Assessment&quot; above to add quiz, test, or exam columns.
                      </th>
                    )}

                    {/* Right Column: TOTAL */}
                    <th
                      style={{
                        padding: '16px 20px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        color: 'var(--mute)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        width: '180px',
                        textAlign: 'center',
                        position: 'sticky',
                        right: 0,
                        background: 'var(--soft)',
                        zIndex: 2,
                        borderLeft: '1px solid var(--line)'
                      }}
                    >
                      TOTAL
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {filteredStudents.map((student, idx) => {
                    const sScores = studentScores[student.studentId] || {};

                    // Compute Student's Total Obtained Marks
                    const totalObtained = assessments.reduce((acc, a) => {
                      const score = sScores[a.id];
                      return acc + (score !== '' && score !== undefined ? Number(score) : 0);
                    }, 0);

                    const { grade: letterGrade, color: gradeColor } = calculateLetterGrade(
                      totalObtained,
                      totalMaxMarks
                    );

                    const percentage =
                      totalMaxMarks > 0 ? Math.round((totalObtained / totalMaxMarks) * 100) : 0;

                    return (
                      <tr
                        key={student.studentId || idx}
                        style={{
                          borderBottom:
                            idx === filteredStudents.length - 1 ? 'none' : '1px solid var(--line)',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(20, 184, 166, 0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {/* Left: Student Column */}
                        <td
                          style={{
                            padding: '12px 20px',
                            position: 'sticky',
                            left: 0,
                            background: 'var(--card)',
                            zIndex: 1,
                            borderRight: '1px solid var(--line)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {student.photo ? (
                              <img
                                src={student.photo}
                                alt={student.name}
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '10px',
                                  objectFit: 'cover',
                                  flexShrink: 0
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '10px',
                                  background: 'linear-gradient(135deg, rgba(30,111,120,0.3), rgba(20,184,166,0.18))',
                                  color: '#14B8A6',
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontWeight: 800,
                                  fontSize: '14px',
                                  flexShrink: 0
                                }}
                              >
                                {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: '13.5px',
                                  color: 'var(--ink)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {student.name}
                              </div>
                              
                            </div>
                          </div>
                        </td>

                        {/* Middle: Clean Score Input Cells (No increase/decrease arrows) */}
                        {assessments.map((asmt) => {
                          const scoreVal = sScores[asmt.id];
                          return (
                            <td
                              key={asmt.id}
                              style={{
                                padding: '10px 14px',
                                textAlign: 'center',
                                borderRight: '1px solid var(--line)'
                              }}
                            >
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="grade-input-cell"
                                value={scoreVal !== undefined && scoreVal !== null ? scoreVal : ''}
                                placeholder="—"
                                onChange={(e) =>
                                  handleScoreChange(
                                    student.studentId,
                                    asmt.id,
                                    e.target.value,
                                    asmt.maxMarks
                                  )
                                }
                                style={{
                                  width: '72px',
                                  height: '40px',
                                  textAlign: 'center',
                                  fontSize: '14.5px',
                                  fontWeight: 700,
                                  color: 'var(--ink)',
                                  background: isPublished ? 'rgba(0,0,0,0.03)' : 'var(--soft)',
                                  border: '1px solid var(--line)',
                                  borderRadius: '11px',
                                  outline: 'none',
                                  cursor: isPublished ? 'not-allowed' : 'text',
                                  opacity: isPublished ? 0.75 : 1,
                                  transition: 'all 0.15s ease'
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#14B8A6';
                                  e.target.style.background = 'rgba(20, 184, 166, 0.08)';
                                  e.target.style.boxShadow = '0 0 0 2px rgba(20, 184, 166, 0.25)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = 'var(--line)';
                                  e.target.style.background = 'var(--soft)';
                                  e.target.style.boxShadow = 'none';
                                }}
                              />
                            </td>
                          );
                        })}

                        {/* Empty cell if 0 assessments */}
                        {assessments.length === 0 && (
                          <td style={{ textAlign: 'center', color: 'var(--mute)', fontSize: '13px' }}>
                            —
                          </td>
                        )}

                        {/* Right: TOTAL Column */}
                        <td
                          style={{
                            padding: '12px 20px',
                            textAlign: 'center',
                            position: 'sticky',
                            right: 0,
                            background: 'var(--card)',
                            zIndex: 1,
                            borderLeft: '1px solid var(--line)'
                          }}
                        >
                          {assessments.length > 0 ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                              }}
                            >
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>
                                  {totalObtained}{' '}
                                  <span style={{ color: 'var(--mute)', fontSize: '11px', fontWeight: 600 }}>
                                    / {totalMaxMarks}
                                  </span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#14B8A6', fontWeight: 700 }}>
                                  {percentage}%
                                </div>
                              </div>

                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '26px',
                                  borderRadius: '8px',
                                  background: `${gradeColor}22`,
                                  color: gradeColor,
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  border: `1px solid ${gradeColor}44`
                                }}
                              >
                                {letterGrade}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--mute)', fontSize: '13px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADD ASSESSMENT MODAL */}
        {isAddModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px'
            }}
            onClick={() => setIsAddModalOpen(false)}
          >
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: '24px',
                padding: '28px',
                width: '100%',
                maxWidth: '480px',
                boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'rgba(20, 184, 166, 0.12)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#14B8A6'
                    }}
                  >
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--ink)' }}>
                      Add Assessment
                    </h3>
                    <small style={{ color: 'var(--mute)', fontSize: '12px' }}>
                      Create a new grading column for this class
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--mute)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmAddAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Select Assessment Type */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: 'var(--mute)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '8px'
                    }}
                  >
                    Assessment Type
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px'
                    }}
                  >
                    {ASSESSMENT_TYPES.map((t) => {
                      const isSelected = modalType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleModalTypeChange(t.id)}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '12px',
                            border: isSelected ? '1px solid #14B8A6' : '1px solid var(--line)',
                            background: isSelected ? 'rgba(20, 184, 166, 0.12)' : 'var(--soft)',
                            color: isSelected ? '#14B8A6' : 'var(--ink)',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            textAlign: 'center'
                          }}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Column Title */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: 'var(--mute)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '6px'
                    }}
                  >
                    Column Title
                  </label>
                  <input
                    type="text"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    placeholder="e.g. Quiz 1, Mid Term Exam"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      background: 'var(--soft)',
                      border: '1px solid var(--line)',
                      color: 'var(--ink)',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Maximum Marks */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: 'var(--mute)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '6px'
                    }}
                  >
                    Maximum Marks
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="grade-input-cell"
                    value={modalMaxMarks}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^\d]/g, '');
                      setModalMaxMarks(clean);
                    }}
                    placeholder="e.g. 20, 50, 100"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      background: 'var(--soft)',
                      border: '1px solid var(--line)',
                      color: 'var(--ink)',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Modal Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      background: 'var(--soft)',
                      border: '1px solid var(--line)',
                      color: 'var(--ink)',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 22px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(20, 184, 166, 0.3)'
                    }}
                  >
                    Add to Sheet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: SECTION GRADES CARDS OVERVIEW
  // ==========================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>
          Section Grades
        </h2>
        <p style={{ margin: 0, color: 'var(--mute)', fontSize: '13.5px' }}>
          Pre-scheduled fixed routines: class grade sheets and assessments across all classes. Select your class section to add or view grades.
        </p>
      </div>

      {/* SELECT SECTION Chips */}
      {myClasses.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '11.5px',
              fontWeight: 800,
              color: 'var(--mute)',
              textTransform: 'uppercase',
              marginBottom: '10px',
              letterSpacing: '0.06em'
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
              onClick={() => setSectionFilterId('all')}
              role="button"
              tabIndex={0}
              style={{
                padding: '14px 24px',
                borderRadius: '16px',
                background: sectionFilterId === 'all' ? 'var(--p1)' : 'var(--card)',
                color: sectionFilterId === 'all' ? '#FFFFFF' : 'var(--ink)',
                border: sectionFilterId === 'all' ? '1px solid var(--p1)' : '1px solid var(--line)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: sectionFilterId === 'all' ? '0 6px 18px rgba(30,111,120,0.3)' : 'var(--sh)',
                transition: 'all 0.15s ease',
                fontWeight: 700,
                fontSize: '14px'
              }}
            >
              All Sections
            </div>

            {/* Individual Section Cards */}
            {myClasses.map((cls) => {
              const isSelected = sectionFilterId === cls.id;
              return (
                <div
                  key={cls.id}
                  onClick={() => setSectionFilterId(cls.id)}
                  role="button"
                  tabIndex={0}
                  style={{
                    padding: '14px 22px',
                    borderRadius: '16px',
                    background: isSelected ? 'var(--p1)' : 'var(--card)',
                    color: isSelected ? '#FFFFFF' : 'var(--ink)',
                    border: isSelected ? '1px solid var(--p1)' : '1px solid var(--line)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    flexShrink: 0,
                    boxShadow: isSelected ? '0 6px 18px rgba(30,111,120,0.3)' : 'var(--sh)',
                    transition: 'all 0.15s ease',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  <span>{cls.className}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Width Search Bar */}
      <div style={{ width: '100%' }}>
        <SearchBar
          placeholder="Search assigned sections..."
          value={sectionSearch}
          onChange={(val) => setSectionSearch(val)}
          onSearch={(val) => setSectionSearch(val)}
        />
      </div>

      {/* Showing Count - Aligned to Left */}
      <div style={{ color: 'var(--mute)', fontSize: '13px', textAlign: 'left' }}>
        Showing <b style={{ color: 'var(--ink)' }}>{filteredSections.length}</b> section{filteredSections.length === 1 ? '' : 's'}
      </div>

      {/* Loading Skeletons */}
      {isLoadingClasses && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '18px'
          }}
        >
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              style={{
                padding: '20px',
                borderRadius: '20px',
                background: 'var(--card)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <Skeleton width="120px" height="20px" />
              <Skeleton width="160px" height="14px" />
              <Skeleton width="100%" height="38px" borderRadius="10px" />
            </div>
          ))}
        </div>
      )}

      {/* Empty Sections */}
      {!isLoadingClasses && filteredSections.length === 0 && (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            borderRadius: '20px',
            background: 'var(--card)',
            border: '1px solid var(--line)',
            boxShadow: 'var(--sh)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <School size={40} style={{ color: 'var(--mute)' }} />
          <h3 style={{ margin: '4px 0 0', fontWeight: 800, color: 'var(--ink)' }}>No Sections Found</h3>
          <p style={{ color: 'var(--mute)', margin: 0, fontSize: '13.5px' }}>
            {sectionSearch ? 'No section matches your search.' : 'You have not been assigned to any class sections yet.'}
          </p>
        </div>
      )}

      {/* Sections Cards Grid */}
      {!isLoadingClasses && filteredSections.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: '18px'
          }}
        >
          {filteredSections.map((section) => {
            const sId = String(section.id || section._id || '');
            const sectionGb = gradebookMap.get(sId);
            const isSectionPublished = publishedClassIds.has(sId) || Boolean(sectionGb?.isPublished || sectionGb?.status === 'published');

            return (
              <div
                key={section.id}
              style={{
                padding: '20px',
                borderRadius: '20px',
                background: 'var(--card)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--sh)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'transform 0.15s ease, border-color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(20, 184, 166, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--line)';
              }}
            >
              <div>
                {/* Header Row: Grade Badge + Academic Year */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '8px',
                      background: 'rgba(30,111,120,.12)',
                      color: 'var(--p1)',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.04em'
                    }}
                  >
                    GRADE {section.grade || '—'}
                  </span>
                  {isSectionPublished ? (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Lock size={11} />
                      <span>LOCKED</span>
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--mute)', fontWeight: 600 }}>
                      {section.academicYear || '2025/2026'}
                    </span>
                  )}
                </div>

                {/* Class Name */}
                <h3 style={{ margin: '0 0 4px', fontSize: '19px', fontWeight: 800, color: 'var(--ink)' }}>
                  {section.className}
                </h3>

                {/* Assigned Subject & Course Code */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#14B8A6'
                    }}
                  >
                    <BookOpen size={14} />
                    <span>{section.mySubject || sectionGb?.subject || 'Arts and Culture'}</span>
                  </span>
                  {(section.myCourseCode || sectionGb?.courseCode) && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: 'rgba(20, 184, 166, 0.12)',
                        color: '#14B8A6'
                      }}
                    >
                      {section.myCourseCode || sectionGb?.courseCode}
                    </span>
                  )}
                </div>

                {/* Enrolled Students Count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--mute)', fontSize: '13px' }}>
                  <Users size={15} color="#14B8A6" />
                  <span>{section.studentCount || (section.students?.length) || 0} Students Enrolled</span>
                </div>
              </div>

              {/* Action Buttons: Add Grades / View Grades */}
              <div
                style={{
                  paddingTop: '14px',
                  borderTop: '1px solid var(--line)',
                  width: '100%'
                }}
              >
                {isSectionPublished ? (
                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    {/* Disabled Add Grade Button */}
                    <button
                      type="button"
                      disabled
                      title="Gradesheet is officially published by Administration. Editing is locked."
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        height: '40px',
                        padding: '0 8px',
                        borderRadius: '12px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        background: 'var(--soft)',
                        color: 'var(--mute)',
                        border: '1px solid var(--line)',
                        cursor: 'not-allowed',
                        opacity: 0.6
                      }}
                    >
                      <Lock size={13} />
                      <span>Add Grades</span>
                    </button>

                    {/* View Grades Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSection(section);
                      }}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        height: '40px',
                        padding: '0 12px',
                        borderRadius: '12px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #1E6F78, #0F3B44)',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(30, 111, 120, 0.28)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'brightness(1.08)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(30, 111, 120, 0.38)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(30, 111, 120, 0.28)';
                      }}
                    >
                      <Eye size={14} />
                      <span>View Grades</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSection(section);
                    }}
                    style={{
                      width: '100%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      height: '40px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(20, 184, 166, 0.28)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = 'brightness(1.08)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(20, 184, 166, 0.38)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = 'none';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(20, 184, 166, 0.28)';
                    }}
                  >
                    <PlusCircle size={15} />
                    <span>Add Grades</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
