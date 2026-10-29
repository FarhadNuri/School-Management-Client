import React from 'react';
import { usePortalRole } from '../hooks/usePortalRole';
import { useStudentGrades } from '../hooks/usePortalQueries';
import StatCard from '../components/StatCard';
import Tag from '../components/Tag';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import ErrorRetry from '../components/ErrorRetry';

export default function StudentGrades() {
  const { user } = usePortalRole();
  const { data, isLoading, isError, error, refetch } = useStudentGrades();

  const isPublished = Boolean(data?.isPublished);
  const subjects = data?.subjects || [];
  const overall = data?.overall || {};

  return (
    <>
      <div className="pt">
        <h2>Grades</h2>
        <p>Official academic results, assessments, and subject performance</p>
      </div>

      {/* Top Stat Tiles (always consistent with Payments, Attendance & Dashboard) */}
      <div className="st4">
        <StatCard
          label="CUMULATIVE SCORE"
          value={isPublished && overall.totalMax ? `${overall.totalObtained || 0} / ${overall.totalMax}` : '—'}
          note={isPublished ? 'Total marks obtained' : 'Awaiting publication'}
        />
        <StatCard
          label="OVERALL AVERAGE"
          value={isPublished && overall.percentage !== undefined ? `${overall.percentage}%` : '—'}
          note={isPublished ? 'Academic performance' : 'Awaiting publication'}
        />
        <StatCard
          label="LETTER GRADE"
          value={isPublished && overall.letterGrade ? `Grade ${overall.letterGrade}` : '—'}
          note={isPublished ? 'Academic standing' : 'Awaiting publication'}
        />
        <StatCard
          label="PUBLISHED SUBJECTS"
          value={isPublished ? String(subjects.length) : '0'}
          note={data?.className || user?.className || 'Enrolled Class'}
        />
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {[1, 2].map((n) => (
            <div key={n} className="cd" style={{ padding: '20px', gap: '14px' }}>
              <Skeleton width="200px" height="22px" />
              <Skeleton width="100%" height="120px" borderRadius="10px" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <ErrorRetry
          message={error?.message || 'Unable to load grades.'}
          onRetry={refetch}
        />
      )}

      {/* UNPUBLISHED STATE (Native portal EmptyState across normal full width) */}
      {!isLoading && !isError && (!isPublished || subjects.length === 0) && (
        <EmptyState
          title="Grades Not Yet Published"
          message="Official subject grades and report cards have not been published by administration yet. Once reviewed and released, your results will appear here."
        />
      )}

      {/* PUBLISHED GRADES VIEW */}
      {!isLoading && !isError && isPublished && subjects.length > 0 && (
        <>
          <div style={{ margin: '8px 0 16px', color: 'var(--mute)', fontSize: '13.5px' }}>
            Showing <b style={{ color: 'var(--ink)' }}>{subjects.length}</b> published subject{subjects.length === 1 ? '' : 's'}
            {(data?.className || user?.className) && (
              <span> for <b style={{ color: 'var(--p1)' }}>{data?.className || user?.className}</b></span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {subjects.map((sub) => {
              const asmts = sub.assessments || [];

              return (
                <div key={sub.id} className="cd" style={{ padding: '20px', gap: '16px' }}>
                  {/* Subject Header Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                      borderBottom: '1px solid var(--line)',
                      paddingBottom: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                        {sub.subject}
                      </h3>
                      {sub.courseCode && <span className="tg">{sub.courseCode}</span>}
                      {sub.teacherName && (
                        <span style={{ fontSize: '13px', color: 'var(--mute)' }}>
                          Teacher: <b style={{ color: 'var(--ink)' }}>{sub.teacherName}</b>
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                        {sub.totalObtained} / {sub.totalMax} pts ({sub.percentage}%)
                      </span>
                      <Tag color={sub.percentage >= 80 ? 'g' : sub.percentage >= 60 ? 'b' : 'a'}>
                        Grade {sub.letterGrade}
                      </Tag>
                    </div>
                  </div>

                  {/* Clean Assessment Rows Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px', minWidth: '500px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--mute)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          <th style={{ padding: '10px 12px', fontWeight: 700 }}>Assessment</th>
                          <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Max Marks</th>
                          <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Score Obtained</th>
                          <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {asmts.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--mute)' }}>
                              No specific assessments recorded for this subject.
                            </td>
                          </tr>
                        ) : (
                          asmts.map((asmt) => {
                            const has = asmt.hasScore;
                            return (
                              <tr key={asmt.id} style={{ borderBottom: '1px solid var(--line)' }}>
                                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--ink)' }}>
                                  {asmt.name}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right', color: 'var(--mute)' }}>
                                  {asmt.maxMarks} pts
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: has ? 'var(--ink)' : 'var(--mute)' }}>
                                  {has ? `${asmt.obtainedMarks} / ${asmt.maxMarks}` : '—'}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: has ? 'var(--p1)' : 'var(--mute)' }}>
                                  {has ? `${asmt.percentage}%` : '—'}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: 'var(--soft)', fontWeight: 800 }}>
                          <td style={{ padding: '12px', color: 'var(--ink)' }}>
                            Subject Total
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: 'var(--mute)' }}>
                            {sub.totalMax} pts
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: 'var(--ink)' }}>
                            {sub.totalObtained} / {sub.totalMax}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: 'var(--p1)' }}>
                            {sub.percentage}%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Teacher Remarks */}
                  {sub.remarks && (
                    <div style={{ fontSize: '13px', color: 'var(--mute)', background: 'var(--soft)', padding: '10px 14px', borderRadius: '10px' }}>
                      <b style={{ color: 'var(--ink)' }}>Teacher Remarks:</b> {sub.remarks}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
