import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, Link2 } from 'lucide-react';
import { getContentByRoute, getItemGallery } from '../utils/content';
import MediaGallery from '../components/gallery/MediaGallery';

const routeTypes = {
  projects: 'project',
  experiences: 'experience',
  education: 'education',
  teaching: 'teaching',
  activities: 'activity',
  awards: 'award',
  events: 'event',
};

function ContentList({ title, items, icon = <CheckCircle2 size={16} /> }) {
  if (!items?.length) return null;
  return (
    <div className="detail-info-block">
      <h3>{icon}{title}</h3>
      <ul className="detail-bullet-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}

export default function DetailPage() {
  const { collection, slug } = useParams();
  const type = routeTypes[collection];
  const item = type ? getContentByRoute(type, slug) : null;

  useEffect(() => {
    if (item) document.title = `${item.title} — Dahoun Manel`;
    return () => { document.title = 'Dahoun Manel — Portfolio'; };
  }, [item]);

  if (!item) {
    return <main className="not-found container"><span className="eyebrow">CONTENT NOT FOUND</span><h1>This page is not available.</h1><p>The entry may have been moved or its URL may be incorrect.</p><Link to="/" className="button button-primary"><ArrowLeft size={15} /> Back to portfolio</Link></main>;
  }

  const details = item.details || {};
  const gallery = getItemGallery(item);

  return (
    <main className="detail-page">
      <div className="container detail-container">
        <div className="detail-back-row"><Link to="/#projects"><ArrowLeft size={15} /> Back </Link><span>{item.type?.toUpperCase()} </span></div>
        <header className="detail-hero">
          <div className="detail-hero-copy">
            <div className="eyebrow">{item.type?.toUpperCase()} / {item.period || 'PORTFOLIO ENTRY'}</div>
            <h1>{item.title}</h1>
            {item.subtitle && <h2>{item.subtitle}</h2>}
            <p>{item.summary}</p>
            <div className="detail-meta">
              {item.period && <span><CalendarDays size={14} /> {item.period}</span>}
              {item.result && <span className="detail-result">{item.result}</span>}
            </div>
          </div>
          <div className="detail-cover-wrap"><img src={item.cover} alt={item.title} /></div>
        </header>

        <div className="detail-content-grid">
          <article className="detail-main-content">
            {details.overview && <section className="detail-section"><h2>OVERVIEW</h2><p className="detail-lead">{details.overview}</p></section>}
            <ContentList title="My contribution" items={details.contributions} />
            <ContentList title="Process & approach" items={details.process} />
            <ContentList title="Research title formulations" items={details.researchTitles} />
            <ContentList title="Challenges" items={details.challenges} />
            <ContentList title="Key learnings" items={details.lessons} />
            <section className="detail-section"><h2>Gallery & documentation</h2><MediaGallery images={gallery} title={item.title} /></section>
            {item.links?.length > 0 && <section className="detail-section"><div className="eyebrow">EXTERNAL LINKS</div><h2>Explore further</h2><div className="detail-external-links">{item.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer"><Link2 size={15} />{link.label}<ArrowUpRight size={14} /></a>)}</div></section>}
          </article>
          <aside className="detail-sidebar">
            <div className="sidebar-card"><div className="eyebrow">AT A GLANCE</div><h3>{item.title}</h3><div className="sidebar-facts"><div><span>Type</span><strong>{item.type}</strong></div>{item.period && <div><span>Period</span><strong>{item.period}</strong></div>}</div></div>
            {details.technologies?.length > 0 && <div className="sidebar-card"><div className="eyebrow">TOOLS & TECHNOLOGIES</div><div className="sidebar-tech-list">{details.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div></div>}
          </aside>
        </div>
      </div>
    </main>
  );
}
