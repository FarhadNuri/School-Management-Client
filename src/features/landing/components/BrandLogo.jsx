import { Link, useLocation } from 'react-router-dom';
import SunriseLogo from '../../../components/ui/SunriseLogo';

export default function BrandLogo({ onNavigate }) {
  const location = useLocation();

  const handleClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      if (window.location.hash) {
        window.history.replaceState(null, '', '/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (onNavigate) onNavigate();
  };

  return (
    <Link to="/" className="lp-brand" onClick={handleClick}>
      <SunriseLogo size={32} />
      <span className="lp-brand-text">
        <span className="lp-brand-name title-3">Sunrise</span>
        <span className="lp-brand-name title-3">Model School</span>
      </span>
    </Link>
  );
}
