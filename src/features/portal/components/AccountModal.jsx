import { useState } from 'react';
import { useChangePassword } from '../hooks/usePortalQueries';

export default function AccountModal({ isOpen, onClose, user, roleLabel }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const changePasswordMutation = useChangePassword();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg('New password must be different from current password.');
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          onClose();
        },
        onError: (err) => {
          setErrorMsg(err.message || 'Failed to update password.');
        }
      }
    );
  };

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'User';
  const photo = user?.photo;

  return (
    <div className="md on" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="mc" style={{ maxWidth: '480px' }}>
        <div className="mh">
          <div>
            <h3 style={{ fontSize: '20px' }}>My Account</h3>
            <p>Account details and security settings</p>
          </div>
          <span
            onClick={onClose}
            style={{ cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}
          >
            ×
          </span>
        </div>

        <div className="mb" style={{ padding: '24px' }}>
          {/* Read-only profile overview */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--g-line, #E3ECEA)'
            }}
          >
            {photo ? (
              <img
                src={photo}
                alt={name}
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '1px solid var(--g-line, #E3ECEA)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, var(--acc, #F59E6C), #E7C9A3)',
                  display: 'grid',
                  placeItems: 'center',
                  font: "800 22px 'Bricolage Grotesque', serif",
                  color: '#0A1C24'
                }}
              >
                {name.charAt(0)}
              </div>
            )}
            <div>
              <b style={{ fontSize: '17px', display: 'block', color: 'var(--g-ink, #0A1C24)' }}>
                {name}
              </b>
              <small style={{ color: 'var(--g-mute, #60797F)', display: 'block', fontSize: '13px' }}>
                {user?.email || '—'}
              </small>
              <span
                className="tg"
                style={{ marginTop: '4px', fontSize: '10px', letterSpacing: '0.08em' }}
              >
                {roleLabel || user?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--g-ink, #0A1C24)',
                margin: '4px 0 0'
              }}
            >
              Change Password
            </h4>

            <div>
              <label>CURRENT PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label>NEW PASSWORD (MIN. 8 CHARS)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label>CONFIRM NEW PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <div
                style={{
                  color: '#C23A52',
                  fontSize: '12px',
                  background: 'rgba(214, 69, 90, 0.12)',
                  padding: '8px 12px',
                  borderRadius: '10px'
                }}
              >
                {errorMsg}
              </div>
            )}

            <div className="row" style={{ marginTop: '6px' }}>
              <button
                type="button"
                className="ghost"
                onClick={onClose}
                style={{ margin: 0 }}
              >
                Close
              </button>
              <button
                type="submit"
                className="pb"
                disabled={changePasswordMutation.isPending}
                style={{
                  opacity: changePasswordMutation.isPending ? 0.7 : 1,
                  cursor: changePasswordMutation.isPending ? 'not-allowed' : 'pointer'
                }}
              >
                {changePasswordMutation.isPending ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
