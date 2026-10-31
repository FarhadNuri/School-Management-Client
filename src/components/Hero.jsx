import { heroContent } from '../data/content';
import Button from './Button';

export default function Hero() {
  return (
    <div className="hero">
      <div className="w">
        <div>
          <span className="eb">{heroContent.eyebrow}</span>
          <h1>
            {heroContent.headingLead}
            <em>{heroContent.headingAccent}</em>
          </h1>
          <p>{heroContent.description}</p>
          <Button href="/contact">{heroContent.primaryCta}</Button>
          <a className="lnk" href="/contact">{heroContent.secondaryCta}</a>
          <div className="stats">
            {heroContent.stats.map((stat) => (
              <div key={stat.label}>
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="art">
          <div className="a1">
            <img
              src="/classof2025.jpg"
              alt="Sunrise Model School graduating students"
              className="hero-main-photo"
            />
          </div>
          <div className="a2">
            <b>{heroContent.chip.title}</b>
            <span>{heroContent.chip.subtitle}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
