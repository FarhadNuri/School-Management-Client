import { footerContent } from '../data/content';

export default function Footer() {
  return (
    <footer>
      <div className="w">
        <div className="fg">
          <div>
            <b style={{ font: "800 24px 'Bricolage Grotesque', serif" }}>
              {footerContent.brand}
            </b>
            <p>{footerContent.description}</p>
          </div>
          {footerContent.columns.map((column) => (
            <ul key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          ))}
        </div>
        <div className="cp">{footerContent.copyright}</div>
      </div>
    </footer>
  );
}
