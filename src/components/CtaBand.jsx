import { ctaBandContent } from '../data/content';
import Button from './Button';

export default function CtaBand() {
  return (
    <div className="cta">
      <div className="w">
        <h2>{ctaBandContent.heading}</h2>
        <Button href="/contact">{ctaBandContent.ctaText}</Button>
      </div>
    </div>
  );
}
