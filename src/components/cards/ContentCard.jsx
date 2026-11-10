import { CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCover, routeForItem } from '../../utils/content';

export default function ContentCard({ item, compact = false }) {
  return (
    <article className={`content-card ${compact ? 'content-card-compact' : ''}`}>
      <Link to={routeForItem(item)} className="content-card-link" aria-label={`Open ${item.title}`}>
        <div className="card-cover-wrap">
          <img className="card-cover" src={getCover(item)} alt={item.title} loading="lazy" />
        </div>
        <div className="card-body">
          {(item.period || item.result) && (
            <div className="card-meta-row">
              {item.period && <span className="card-date"><CalendarDays size={12} /> {item.period}</span>}
              {item.result && <span className="card-result">{item.result}</span>}
            </div>
          )}
          <h3>{item.title}</h3>
          {item.subtitle && <div className="card-subtitle">{item.subtitle}</div>}
          <p>{item.summary}</p>
        </div>
      </Link>
    </article>
  );
}
