import { useParams } from 'react-router-dom';
import BackLink from '../components/BackLink';
import Tag from '../components/Tag';
import StatCard from '../components/StatCard';
import Skeleton from '../components/Skeleton';
import ErrorRetry from '../components/ErrorRetry';
import { useStudent } from '../hooks/usePortalQueries';
import { formatDate } from '../../../services/portal/adapters/studentAdapter';

export default function StudentProfile() {
  const { id } = useParams();
  const { data: student, isLoading, isError, error, refetch } = useStudent(id);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <BackLink to="/guardian/students" label="← Back to students" />
        <div className="cd" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Skeleton width="112px" height="112px" borderRadius="22px" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Skeleton width="220px" height="32px" />
            <Skeleton width="340px" height="18px" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <Skeleton height="86px" borderRadius="20px" />
          <Skeleton height="86px" borderRadius="20px" />
          <Skeleton height="86px" borderRadius="20px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <Skeleton height="220px" borderRadius="20px" />
          <Skeleton height="220px" borderRadius="20px" />
          <Skeleton height="220px" borderRadius="20px" />
          <Skeleton height="220px" borderRadius="20px" />
        </div>
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div>
        <BackLink to="/guardian/students" label="← Back to students" />
        <ErrorRetry
          message={error?.message || 'Could not find student record'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const subLineParts = [
    student.classGrade !== '—' ? student.classGrade : null,
    student.teacher !== '—' ? student.teacher : null,
    student.city,
    student.admittedDate !== '—' ? `Admitted ${student.admittedDate}` : null
  ].filter(Boolean);

  const subLine = subLineParts.join(' · ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <BackLink to="/guardian/students" label="← Back to students" />

      {/* Header Card */}
      <div className="cd" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        {student.photo ? (
          <img
            src={student.photo}
            alt={student.name}
            style={{
              width: '112px',
              height: '112px',
              borderRadius: '22px',
              objectFit: 'cover',
              border: '2px solid var(--g-line, #E3ECEA)'
            }}
          />
        ) : (
          <div
            style={{
              width: '112px',
              height: '112px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, var(--acc, #F59E6C), #E7C9A3)',
              display: 'grid',
              placeItems: 'center',
              font: "800 36px 'Bricolage Grotesque', serif",
              color: '#0A1C24'
            }}
          >
            {student.name.charAt(0)}
          </div>
        )}

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontFamily: "'Bricolage Grotesque', Georgia, serif",
                fontSize: '30px',
                fontWeight: 800,
                margin: 0,
                color: 'var(--g-ink, #0A1C24)'
              }}
            >
              {student.name}
            </h1>
            <Tag color={student.status === 'Active' ? 'g' : 'a'}>{student.status}</Tag>
          </div>
          {subLine && (
            <p style={{ margin: '8px 0 0', color: 'var(--g-mute, #60797F)', fontSize: '14px' }}>
              {subLine}
            </p>
          )}
        </div>
      </div>

      {/* 3 Status / Metric Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <StatCard label="STATUS" value={student.status} note={student.status === 'Active' ? 'In good standing' : 'Account inactive'} />
        <StatCard label="AGE" value={student.age} note={student.dateOfBirth ? formatDate(student.dateOfBirth) : 'Date of birth'} />
        <StatCard label="ID TYPE" value={student.idType} note="Identification document" />
      </div>

      {/* 2x2 Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Personal Information */}
        <div className="cd">
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--g-line, #E3ECEA)', paddingBottom: '10px' }}>
            Personal Information
          </h3>
          <InfoRow label="Full Name" value={student.name} />
          <InfoRow label="Gender" value={student.gender} />
          <InfoRow label="Date of Birth" value={formatDate(student.dateOfBirth)} />
          <InfoRow label="Email Address" value={student.email} />
          <InfoRow label="Phone Number" value={student.phone} />
          <InfoRow label="Emergency Contact" value={student.emergencyContact} />
        </div>

        {/* Academic Information */}
        <div className="cd">
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--g-line, #E3ECEA)', paddingBottom: '10px' }}>
            Academic Information
          </h3>
          <InfoRow label="Class / Grade" value={student.classGrade} />
          <InfoRow label="Class Code" value={student.classObj?.classCode || '—'} />
          <InfoRow label="Academic Year" value={student.classObj?.academicYear || '—'} />
          <InfoRow label="Primary Teacher" value={student.teacher} />
          <InfoRow label="Admission Date" value={student.admittedDate} />
          {student.paymentInfo && (
            <InfoRow
              label="Fee Status"
              value={student.paymentInfo.label}
              valueStyle={{ color: student.paymentInfo.color }}
            />
          )}
        </div>

        {/* Guardian Information */}
        <div className="cd">
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--g-line, #E3ECEA)', paddingBottom: '10px' }}>
            Guardian Information
          </h3>
          <InfoRow label="Name" value={student.guardian} />
          <InfoRow label="Relationship" value="Guardian" />
          <InfoRow
            label="Phone"
            value={student.guardianObj?.phone || student.guardianObj?.contactInfo?.phone || '—'}
          />
          <InfoRow label="Email" value={student.guardianObj?.email || '—'} />
        </div>

        {/* Address */}
        <div className="cd">
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--g-line, #E3ECEA)', paddingBottom: '10px' }}>
            Residential Address
          </h3>
          <InfoRow label="Street" value={student.address?.street || '—'} />
          <InfoRow label="City" value={student.address?.city || '—'} />
          <InfoRow label="State / Province" value={student.address?.state || '—'} />
          <InfoRow label="Zip / Postal Code" value={student.address?.zip || '—'} />
          <InfoRow label="Country" value={student.address?.country || '—'} />
        </div>
      </div>

      {/* Optional Attendance Summary */}
      {student.attendanceSummary && (
        <div className="cd">
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--g-line, #E3ECEA)', paddingBottom: '10px' }}>
            Attendance Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginTop: '6px' }}>
            <div>
              <small style={{ color: 'var(--g-mute, #60797F)' }}>Attendance Rate</small>
              <b style={{ display: 'block', fontSize: '20px', color: '#23895B' }}>
                {student.attendanceSummary.attendanceRate ?? '—'}%
              </b>
            </div>
            <div>
              <small style={{ color: 'var(--g-mute, #60797F)' }}>Present Days</small>
              <b style={{ display: 'block', fontSize: '20px' }}>{student.attendanceSummary.present ?? 0}</b>
            </div>
            <div>
              <small style={{ color: 'var(--g-mute, #60797F)' }}>Absent Days</small>
              <b style={{ display: 'block', fontSize: '20px', color: '#C23A52' }}>{student.attendanceSummary.absent ?? 0}</b>
            </div>
            <div>
              <small style={{ color: 'var(--g-mute, #60797F)' }}>Late Arrivals</small>
              <b style={{ display: 'block', fontSize: '20px', color: '#B7791F' }}>{student.attendanceSummary.late ?? 0}</b>
            </div>
          </div>
        </div>
      )}

      {/* Optional Complaint Reports */}
      {student.reports && student.reports.length > 0 && (
        <div className="cd">
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--g-line, #E3ECEA)', paddingBottom: '10px' }}>
            Related Incident Reports ({student.reports.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            {student.reports.map((report) => (
              <div
                key={report.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'var(--g-soft, #F1F6F5)',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div>
                  <b style={{ fontSize: '14px' }}>{report.title}</b>
                  <small style={{ display: 'block', color: 'var(--g-mute, #60797F)' }}>
                    {formatDate(report.createdAt)} · {report.category}
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Tag color={report.status === 'Resolved' ? 'g' : 'a'}>{report.status}</Tag>
                  <Tag color={report.priority === 'High' ? 'r' : 'b'}>{report.priority}</Tag>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, valueStyle = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        fontSize: '13px',
        borderBottom: '1px dashed var(--g-line, #E3ECEA)'
      }}
    >
      <span style={{ color: 'var(--g-mute, #60797F)' }}>{label}</span>
      <b style={{ color: 'var(--g-ink, #0A1C24)', textAlign: 'right', ...valueStyle }}>{value || '—'}</b>
    </div>
  );
}
