import { Link } from 'react-router-dom';
import { footerContent } from '../data/content';
import SunriseLogo from './ui/SunriseLogo';

export default function Footer() {
  const getLinkHref = (link) => {
    switch (link) {
      case 'About':
        return '/about';
      case 'Programs':
        return '/programs';
      case 'Activities':
        return '/activities';
      case 'Campus tours':
      case 'How to apply':
      case 'Fees & accounts':
      case 'Contact':
        return '/contact';
      case 'Login':
        return '/login';
      default:
        return null;
    }
  };

  return (
    <footer>
      <div className="w">
        <div className="fg">
          <div>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <SunriseLogo size={36} />
              <b style={{ font: "800 24px 'Bricolage Grotesque', serif" }}>
                {footerContent.brand}
              </b>
            </Link>
            <p>{footerContent.description}</p>
          </div>
          {footerContent.columns.map((column) => (
            <ul key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map((link) => {
                const href = getLinkHref(link);
                return (
                  <li key={link}>
                    {href ? (
                      <Link to={href} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {link}
                      </Link>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
        <div className="cp">{footerContent.copyright}</div>
      </div>
    </footer>
  );
}
