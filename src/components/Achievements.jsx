import { achievementsContent } from '../data/content';

export default function Achievements() {
  return (
    <section>
      <div className="w">
        <div className="sh">
          <h2>{achievementsContent.heading}</h2>
          <p>{achievementsContent.description}</p>
        </div>
        <div className="bento">
          {achievementsContent.items.map((item, index) => (
            <div key={index} className={item.className || undefined}>
              {item.tag && <span className="tg">{item.tag}</span>}
              <b>{item.stat}</b>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
