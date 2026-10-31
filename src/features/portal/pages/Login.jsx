import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROLES } from '../config/roles';
import { login } from '../../../services/portal/account';
import SunriseLogo from '../../../components/ui/SunriseLogo';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('guardian');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setErrorMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsPending(true);

    sessionStorage.removeItem('portal_logged_out');
    sessionStorage.removeItem('guardian_logged_out');

    try {
      const data = await login({ email, password });
      const user = data.user;
      const role = user?.role || selectedRole;
      const roleConfig = ROLES[role] || ROLES.guardian;
      navigate(roleConfig.basePath);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <SunriseLogo size={52} />
          </div>
          <b style={{ font: "800 24px 'Bricolage Grotesque', serif", color: 'var(--cream)' }}>
            Sunrise
          </b>
          <small
            style={{
              display: 'block',
              fontSize: '10px',
              letterSpacing: '.14em',
              color: 'var(--mute)'
            }}
          >
            MODEL SCHOOL
          </small>
        </div>

        <h1>Portal Sign In</h1>
        <p>Sign in to access student schedules, lessons, and records.</p>

        {/* Role toggle tabs */}
        <div
          style={{
            display: 'flex',
            background: 'var(--soft)',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '20px',
            border: '1px solid var(--line)'
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleChange('guardian')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              border: 0,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              fontFamily: 'inherit',
              background:
                selectedRole === 'guardian'
                  ? 'var(--acc)'
                  : 'transparent',
              color: selectedRole === 'guardian' ? '#0A1C24' : 'var(--mute)',
              transition: 'all 0.15s ease'
            }}
          >
            Guardian
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              border: 0,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              fontFamily: 'inherit',
              background:
                selectedRole === 'student'
                  ? 'var(--acc)'
                  : 'transparent',
              color: selectedRole === 'student' ? '#0A1C24' : 'var(--mute)',
              transition: 'all 0.15s ease'
            }}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('teacher')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              border: 0,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              fontFamily: 'inherit',
              background:
                selectedRole === 'teacher'
                  ? 'var(--acc)'
                  : 'transparent',
              color: selectedRole === 'teacher' ? '#0A1C24' : 'var(--mute)',
              transition: 'all 0.15s ease'
            }}
          >
            Teacher
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg('');
              }}
              placeholder="user@sunrise.edu"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg('');
              }}
              placeholder="••••••••"
              required
            />
          </div>

          {errorMsg && (
            <div
              style={{
                color: '#C23A52',
                fontSize: '13px',
                marginTop: '10px',
                marginBottom: '10px',
                padding: '8px 12px',
                background: 'rgba(214, 69, 90, 0.12)',
                borderRadius: '10px',
                lineHeight: 1.4
              }}
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={isPending}
            style={{ opacity: isPending ? 0.7 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
          >
            {isPending ? 'Signing In...' : `Sign In →`}
          </button>
        </form>

        <div style={{ marginTop: '22px', textAlign: 'center' }}>
          <Link
            to="/"
            style={{
              color: 'var(--mute)',
              fontSize: '13px',
              textDecoration: 'none'
            }}
          >
            ← Back to Sunrise Model School Home
          </Link>
        </div>
      </div>
    </div>
  );
}
