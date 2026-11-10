import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCover, routeForItem } from '../../utils/content';

export default function ContentCard({ item, compact = false }) {
  const categories = Array.isArray(item.category) ? item.category : item.tags?.slice(0, 1) || [];
  const tagLabels = [...new Set([...categories, ...(item.tags || []).slice(0, compact ? 2 : 3)])].slice(0, compact ? 3 : 4);
  return (
    <motion.article className={`content-card ${compact ? 'content-card-compact' : ''}`} whileHover={{ y: -5 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
      <Link to={routeForItem(item)} className="content-card-link" aria-label={`Open ${item.title}`}>
        <div className="card-cover-wrap">
          <img className="card-cover" src={getCover(item)} alt={`${item.title} cover — replaceable placeholder`} loading="lazy" />
          <span className="cover-index">{item.type?.toUpperCase() || 'WORK'}</span>
          <span className="card-open-icon"><ArrowUpRight size={17} /></span>
        </div>
        <div className="card-body">
          <div className="card-meta-row">
            <span className="card-date"><CalendarDays size={12} /> {item.period || 'Period to add'}</span>
            {item.result && <span className="card-result">{item.result}</span>}
          </div>
          <h3>{item.title}</h3>
          {item.subtitle && <div className="card-subtitle">{item.subtitle}</div>}
          <p>{item.summary}</p>
          <div className="tag-row">
            {tagLabels.map((tag, index) => <span className={`tag ${index >= categories.length ? 'tag-muted' : ''}`} key={tag}>{tag}</span>)}
          </div>
          <div className="card-footer-link"><span>Explore details & gallery</span><ArrowUpRight size={15} /></div>
        </div>
      </Link>
    </motion.article>
  );
}
