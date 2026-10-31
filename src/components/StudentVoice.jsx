import { studentVoiceContent } from '../data/content';
import Button from './Button';

export default function StudentVoice() {
  return (
    <section className="cm dark">
      <div className="w">
        <div>
          <span className="eb">{studentVoiceContent.eyebrow}</span>
          <blockquote>{studentVoiceContent.quote}</blockquote>
          <p style={{ fontWeight: 700, color: '#F6F1E7' }}>
            {studentVoiceContent.name}
          </p>
          <p style={{ marginBottom: '22px' }}>{studentVoiceContent.role}</p>
          <Button>{studentVoiceContent.ctaText}</Button>
        </div>
        <div className="pp">
          <div className="p1">
            <img
              src="/first.jpg"
              alt="Adesua graduate alumna"
              className="pp-img pp-img1"
              loading="lazy"
            />
          </div>
          <div className="p2">
            <img
              src="/second.jpg"
              alt="Adesua graduate student"
              className="pp-img pp-img2"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
