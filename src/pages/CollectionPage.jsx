import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ContentCard from '../components/cards/ContentCard';
import { contentCollections } from '../utils/content';

const config = {
  projects: { title: 'Selected projects', eyebrow: 'WORK / CASE STUDIES', description: 'Development, UI/UX, research and visual identity projects.' },
  experiences: { title: 'Professional experience', eyebrow: 'CAREER / EXPERIENCE', description: 'Internships, technical responsibilities and professional contributions.' },
  education: { title: 'Education', eyebrow: 'ACADEMIC BACKGROUND', description: 'Academic history, diplomas and certificates.' },
  teaching: { title: 'Teaching & workshops', eyebrow: 'KNOWLEDGE / TEACHING', description: 'Tutoring, practical workshops and knowledge sharing.' },
  activities: { title: 'Leadership & community', eyebrow: 'COMMUNITY / LEADERSHIP', description: 'Student organizations, technical communities and extracurricular activities.' },
  awards: { title: 'Awards & recognition', eyebrow: 'ACHIEVEMENTS / AWARDS', description: 'Competition results and recognition, with supporting evidence where available.' },
  events: { title: 'Events & competitions', eyebrow: 'EVENTS / PARTICIPATION', description: 'Competitions, conferences, demonstrations and representation.' },
};

export default function CollectionPage() {
  const { collection } = useParams();
  const details = config[collection];
  const key = collection === 'projects' ? 'project'
    : collection === 'experiences' ? 'experience'
    : collection === 'activities' ? 'activity'
    : collection === 'awards' ? 'award'
    : collection === 'events' ? 'event'
    : collection;
  const items = details ? contentCollections[key] || [] : [];

  if (!details) return <main className="not-found container"><span className="eyebrow">COLLECTION NOT FOUND</span><h1>This collection is not available.</h1><Link to="/" className="button button-primary"><ArrowLeft size={15} /> Back to portfolio</Link></main>;

  return (
    <main className="collection-page">
      <div className="container">
        <div className="collection-back"><Link to="/"><ArrowLeft size={15} /> Back to portfolio</Link></div>
        <div className="collection-heading"><div className="eyebrow">{details.eyebrow}</div><h1>{details.title}</h1><p>{details.description}</p><span>{items.length} {items.length === 1 ? 'entry' : 'entries'}</span></div>
        <div className="content-grid content-grid-three collection-grid">{items.map((item) => <ContentCard key={item.id} item={item} />)}</div>
      </div>
    </main>
  );
}
