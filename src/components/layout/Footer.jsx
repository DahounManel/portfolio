import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GithubIcon, LinkedinIcon } from '../icons/BrandIcons';
import profile from '../../data/profile.json';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div>
          <div className="footer-eyebrow">LET'S CONNECT</div>
          <h2>Have a project or opportunity in mind?</h2>
          <p>For professional, internship and academic inquiries, feel free to get in touch.</p>
        </div>
        <Link className="button button-primary" to="/#contact">Start a conversation</Link>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {profile.name}. Built with care.</span>
        <div className="footer-links">
          <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedinIcon size={16} /></a>
          <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub"><GithubIcon size={16} /></a>
          <a href={`mailto:${profile.email}`} aria-label="Email"><Mail size={16} /></a>
        </div>
        <a href="#top" className="back-top">Back to top ↑</a>
      </div>
    </footer>
  );
}
