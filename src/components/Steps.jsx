import { stepsContent } from '../data/content';

export default function Steps() {
  return (
    <section className="camp">
      <div className="w">
        <div className="sh">
          <h2>{stepsContent.heading}</h2>
          <p>{stepsContent.description}</p>
        </div>
        <div className="st">
          {stepsContent.steps.map((step) => (
            <div key={step.step}>
              <b>{step.step}</b>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
