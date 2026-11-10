import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, FileText, Link2, ShieldCheck } from 'lucide-react';
import { getContentByRoute, getItemGallery } from '../utils/content';
import MediaGallery from '../components/gallery/MediaGallery';
import ContentCard from '../components/cards/ContentCard';
import { allContent, routeForItem } from '../utils/content';

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
  const related = allContent.filter((candidate) => candidate.id !== item.id && candidate.type !== 'education' && (candidate.tags || []).some((tag) => (item.tags || []).includes(tag))).slice(0, 3);
  const tags = [...new Set([...(item.category || []), ...(item.tags || [])])];

  return (
    <main className="detail-page">
      <div className="container detail-container">
        <div className="detail-back-row"><Link to="/#projects"><ArrowLeft size={15} /> Back to portfolio</Link><span>{item.type?.toUpperCase()} / CASE STUDY</span></div>
        <header className="detail-hero">
          <div className="detail-hero-copy">
            <div className="eyebrow">{item.type?.toUpperCase()} / {item.period || 'PORTFOLIO ENTRY'}</div>
            <h1>{item.title}</h1>
            {item.subtitle && <h2>{item.subtitle}</h2>}
            <p>{item.summary}</p>
            <div className="detail-meta">
              <span><CalendarDays size={14} /> {item.period || 'Date to be added'}</span>
              {item.result && <span className="detail-result">{item.result}</span>}
            </div>
            <div className="tag-row detail-tags">{tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          </div>
          <div className="detail-cover-wrap"><img src={item.cover} alt={`${item.title} cover — replaceable placeholder`} /><span>01 / COVER IMAGE</span></div>
        </header>

        <div className="detail-content-grid">
          <article className="detail-main-content">
            {details.overview && <section className="detail-section"><div className="eyebrow">OVERVIEW</div><h2>Context & objectives</h2><p className="detail-lead">{details.overview}</p></section>}
            <ContentList title="My contribution" items={details.contributions} />
            <ContentList title="Process & approach" items={details.process} />
            <ContentList title="Research title formulations" items={details.researchTitles} />
            {details.titleNote && <p className="detail-source-note">{details.titleNote}</p>}
            <ContentList title="Challenges" items={details.challenges} />
            <ContentList title="Key learnings" items={details.lessons} />
            {details.results && <section className="detail-section detail-results"><div className="eyebrow">OUTCOME</div><h2>Results & status</h2><p>{details.results}</p></section>}
            <section className="detail-section"><div className="eyebrow">VISUAL EVIDENCE</div><h2>Gallery & documentation</h2><p className="section-intro-small">The first image is the cover. Select any image to view it at full size.</p><MediaGallery images={gallery} title={item.title} /></section>
            {item.evidence?.length > 0 && (
              <section className="detail-section evidence-section"><div className="eyebrow">SUPPORTING MATERIAL</div><h2>Evidence checklist</h2><div className="evidence-list">{item.evidence.map((evidence) => <div className="evidence-row" key={evidence.label}><div className="evidence-icon"><FileText size={17} /></div><div><strong>{evidence.label}</strong><span>{evidence.status}</span>{evidence.url && <a className="evidence-file-link" href={evidence.url} target="_blank" rel="noreferrer">Open evidence <ArrowUpRight size={12} /></a>}</div><ShieldCheck size={15} className="evidence-status-icon" /></div>)}</div></section>
            )}
            {item.links?.length > 0 && <section className="detail-section"><div className="eyebrow">EXTERNAL LINKS</div><h2>Explore further</h2><div className="detail-external-links">{item.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer"><Link2 size={15} />{link.label}<ArrowUpRight size={14} /></a>)}</div></section>}
          </article>
          <aside className="detail-sidebar">
            <div className="sidebar-card"><div className="eyebrow">AT A GLANCE</div><h3>{item.title}</h3><div className="sidebar-facts"><div><span>Type</span><strong>{item.type}</strong></div><div><span>Period</span><strong>{item.period || 'Not specified'}</strong></div>{item.result && <div><span>Outcome</span><strong>{item.result}</strong></div>}</div></div>
            {details.technologies?.length > 0 && <div className="sidebar-card"><div className="eyebrow">TOOLS & TECHNOLOGIES</div><div className="sidebar-tech-list">{details.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div></div>}
            <div className="sidebar-note"><ShieldCheck size={17} /><p>Only verified contributions and approved evidence should be added before this page is published publicly.</p></div>
          </aside>
        </div>

        {related.length > 0 && <section className="related-section"><div className="section-heading"><div><div className="eyebrow">CONTINUE EXPLORING</div><h2>Related work</h2></div></div><div className="content-grid content-grid-three">{related.map((relatedItem) => <ContentCard key={relatedItem.id} item={relatedItem} compact />)}</div></section>}
      </div>
    </main>
  );
}
