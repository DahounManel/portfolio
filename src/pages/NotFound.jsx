import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
export default function NotFound() {
  return <main className="not-found container"><span className="eyebrow">404 / NOT FOUND</span><h1>That page drifted out of orbit.</h1><p>The page you are looking for does not exist.</p><Link to="/" className="button button-primary"><ArrowLeft size={15} /> Return home</Link></main>;
}
