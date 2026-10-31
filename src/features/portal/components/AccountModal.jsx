import { useState, useRef, useEffect } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useChangePassword, useUpdateProfilePhoto } from '../hooks/usePortalQueries';
import { useTheme } from '../hooks/useTheme';

export default function AccountModal({ isOpen, onClose, user, roleLabel }) {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const changePasswordMutation = useChangePassword();
  const updatePhotoMutation = useUpdateProfilePhoto();

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPreviewPhoto(null);
    }
  }, [isOpen]);

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

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 5MB.');
      return;
    }

    setErrorMsg('');
    const objectUrl = URL.createObjectURL(file);
    setPreviewPhoto(objectUrl);

    updatePhotoMutation.mutate(file, {
      onSuccess: (data) => {
        if (data?.photo || data?.user?.photo) {
          setPreviewPhoto(data.photo || data.user.photo);
        }
      },
      onError: (err) => {
        setPreviewPhoto(null);
        setErrorMsg(err.message || 'Failed to update profile photo.');
      }
    });

    // Reset input so same file can be re-selected if desired
    e.target.value = '';
  };

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'User';
  const displayPhoto = previewPhoto || user?.photo;

  return (
    <div className="md on" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="mc no-scrollbar account-modal-card"
        style={{
          maxWidth: '460px',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {/* Hidden input for profile photo file upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          style={{ display: 'none' }}
          onChange={handlePhotoSelect}
        />

        <div className="mh" style={{ padding: '16px 20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', margin: 0 }}>My Account</h3>
            <p style={{ margin: 0, fontSize: '12px' }}>Account details and security settings</p>
          </div>
          <span
            onClick={onClose}
            style={{ cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}
          >
            ×
          </span>
        </div>

        <div className="mb" style={{ padding: '18px 20px', gap: '14px' }}>
          {/* Profile overview with interactive profile image change */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--g-line, #E3ECEA)'
            }}
          >
            {/* Clickable Avatar Container */}
            <div
              style={{
                position: 'relative',
                width: '56px',
                height: '56px',
                cursor: updatePhotoMutation.isPending ? 'wait' : 'pointer',
                flexShrink: 0,
                borderRadius: '16px',
                overflow: 'hidden'
              }}
              onClick={() => {
                if (!updatePhotoMutation.isPending) {
                  fileInputRef.current?.click();
                }
              }}
              title="Click to change profile image"
            >
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '16px',
                    objectFit: 'cover',
                    border: '1.5px solid var(--g-line, #E3ECEA)',
                    display: 'block'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
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

              {/* Hover / Uploading Camera Overlay */}
              <div
                className="avatar-hover-overlay"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '16px',
                  background: 'rgba(0, 0, 0, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  opacity: updatePhotoMutation.isPending ? 1 : 0,
                  transition: 'opacity 0.18s ease'
                }}
              >
                {updatePhotoMutation.isPending ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <Camera size={18} strokeWidth={2} />
                )}
              </div>

              {/* Floating Camera Icon Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '3px',
                  right: '3px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'var(--p1, #1E6F78)',
                  border: '1.5px solid var(--card, #FFFFFF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  pointerEvents: 'none'
                }}
              >
                <Camera size={10} strokeWidth={2.4} />
              </div>
            </div>

            {/* User details & Change Photo button */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <b style={{ fontSize: '16px', color: 'var(--g-ink, #0A1C24)', lineHeight: 1.2 }}>
                  {name}
                </b>
                <span
                  className="tg"
                  style={{ fontSize: '9.5px', letterSpacing: '0.08em', padding: '2px 8px' }}
                >
                  {roleLabel || user?.role?.toUpperCase()}
                </span>
              </div>
              <small style={{ color: 'var(--g-mute, #60797F)', display: 'block', fontSize: '12.5px', marginTop: '2px' }}>
                {user?.email || '—'}
              </small>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={updatePhotoMutation.isPending}
                style={{
                  marginTop: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(30, 111, 120, 0.08)',
                  border: '1px solid rgba(30, 111, 120, 0.22)',
                  borderRadius: '7px',
                  padding: '3px 9px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--p1, #1E6F78)',
                  cursor: updatePhotoMutation.isPending ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Camera size={12} strokeWidth={2} />
                {updatePhotoMutation.isPending ? 'Uploading...' : 'Change profile image'}
              </button>
            </div>
          </div>

          {/* Appearance / Theme Option */}
          <div style={{ paddingBottom: '14px', borderBottom: '1px solid var(--line)' }}>
            <label style={{ fontSize: '10.5px', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--mute)' }}>
              APPEARANCE
            </label>
            <div className="opt" style={{ marginTop: '6px' }}>
              <span
                className={theme === 'dark' ? 'on' : ''}
                onClick={() => setTheme('dark')}
              >
                Dark
              </span>
              <span
                className={theme === 'light' ? 'on' : ''}
                onClick={() => setTheme('light')}
              >
                Light
              </span>
              <span
                className={theme === 'system' ? 'on' : ''}
                onClick={() => setTheme('system')}
              >
                System
              </span>
            </div>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '11px' }}>
            <h4
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                color: 'var(--g-ink, #0A1C24)',
                margin: '2px 0 0'
              }}
            >
              Change Password
            </h4>

            <div>
              <label style={{ fontSize: '10.5px' }}>CURRENT PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={{ height: '38px', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10.5px' }}>NEW PASSWORD (MIN. 8 CHARS)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ height: '38px', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10.5px' }}>CONFIRM NEW PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ height: '38px', fontSize: '13px' }}
              />
            </div>

            {errorMsg && (
              <div
                style={{
                  color: '#C23A52',
                  fontSize: '11.5px',
                  background: 'rgba(214, 69, 90, 0.12)',
                  padding: '7px 10px',
                  borderRadius: '8px'
                }}
              >
                {errorMsg}
              </div>
            )}

            <div className="row" style={{ marginTop: '4px' }}>
              <button
                type="button"
                className="ghost"
                onClick={onClose}
                style={{ margin: 0, height: '36px', fontSize: '13px' }}
              >
                Close
              </button>
              <button
                type="submit"
                className="pb"
                disabled={changePasswordMutation.isPending}
                style={{
                  opacity: changePasswordMutation.isPending ? 0.7 : 1,
                  cursor: changePasswordMutation.isPending ? 'not-allowed' : 'pointer',
                  height: '36px',
                  fontSize: '13px'
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
