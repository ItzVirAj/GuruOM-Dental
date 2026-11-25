import { Counter } from "@/components/animations/Counter";
import { statsContent } from "@/data/home";

export interface StatsProps {
  content?: typeof statsContent;
}

export function Stats({ content = statsContent }: StatsProps) {
  return (
    <section className="impact-report" aria-labelledby="stats-heading">
      <div className="impact-report-layout">
        <header className="impact-report-intro">
          <p>{content.eyebrow}</p>
          <h2 id="stats-heading">{content.title}</h2>
          <p>{content.intro}</p>
        </header>
        <dl className="impact-report-figures">
          {content.stats.map(stat => (
            <div key={stat.id} className="impact-report-row">
              <dt>{stat.label}</dt>
              <dd className="impact-report-value">
                <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix}
                  duration={1.15} start="top 95%" suffixClassName="impact-report-unit" />
              </dd>
              <dd className="impact-report-description">{stat.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default Stats;
