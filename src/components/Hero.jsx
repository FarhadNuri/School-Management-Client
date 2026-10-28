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
          <Button>{heroContent.primaryCta}</Button>
          <a className="lnk">{heroContent.secondaryCta}</a>
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
          <i className="a1"></i>
          <i className="a2"></i>
          <i className="a3"></i>
          <div className="chip">
            <b>{heroContent.chip.title}</b>
            {heroContent.chip.subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}
