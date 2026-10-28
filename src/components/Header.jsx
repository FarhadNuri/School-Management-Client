import { headerContent } from '../data/content';
import Button from './Button';

export default function Header() {
  return (
    <header>
      <div className="w">
        <b>{headerContent.brand}</b>
        {headerContent.links.map((link) => (
          <a key={link} href={link === 'Login' ? '/login' : '#'}>{link}</a>
        ))}
        <Button href="#">{headerContent.ctaText}</Button>
      </div>
    </header>
  );
}
