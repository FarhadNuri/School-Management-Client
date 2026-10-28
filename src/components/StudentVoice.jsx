import { studentVoiceContent } from '../data/content';
import Button from './Button';

export default function StudentVoice() {
  return (
    <section className="cm">
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
          <i className="p1"></i>
          <i className="p2"></i>
        </div>
      </div>
    </section>
  );
}
