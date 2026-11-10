import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDown, ArrowRight, ArrowUpRight, BrainCircuit, Code2, Cpu, Database,
  Download, Layers3, Mail, Palette, ShieldCheck, Sparkles, Terminal,
  GraduationCap, Trophy, Users, BookOpen
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/icons/BrandIcons';
import profile from '../data/profile.json';
import skills from '../data/skills.json';
import projects from '../data/projects.json';
import experiences from '../data/experiences.json';
import education from '../data/education.json';
import teaching from '../data/teaching.json';
import activities from '../data/activities.json';
import awards from '../data/awards.json';
import ContentCard from '../components/cards/ContentCard';
import { Link } from 'react-router-dom';
import { allContent, routeForItem } from '../utils/content';

const reveal = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

function SectionHeading({ eyebrow, title, description, link, linkLabel = 'View all' }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {link && <Link className="text-link" to={link}>{linkLabel} <ArrowUpRight size={15} /></Link>}
    </div>
  );
}

function SkillIcon({ category }) {
  const value = category.toLowerCase();
  if (value.includes('programming') || value.includes('web')) return <Code2 />;
  if (value.includes('ai') || value.includes('eeg')) return <BrainCircuit />;
  if (value.includes('robot') || value.includes('embedded')) return <Cpu />;
  if (value.includes('database')) return <Database />;
  if (value.includes('security')) return <ShieldCheck />;
  if (value.includes('design')) return <Palette />;
  if (value.includes('system') || value.includes('backend')) return <Terminal />;
  return <Layers3 />;
}

export default function Home() {
  const [projectFilter, setProjectFilter] = useState('All');
  const filters = ['All', 'Development', 'UI/UX', 'Branding', 'Research'];
  const filteredProjects = useMemo(() => {
    if (projectFilter === 'All') return projects;
    return projects.filter((item) => (item.category || []).includes(projectFilter));
  }, [projectFilter]);

  const featuredExperiences = experiences.slice(0, 4);
  const featuredAwards = awards.slice(0, 3);
  const galleryItems = allContent.filter((item) => item.cover).slice(0, 8);

  return (
    <main id="top">
      <section className="hero-section">
        <div className="container hero-grid">
          <motion.div className="hero-copy" initial="hidden" animate="visible" variants={reveal}>
            <div className="hero-kicker"><span className="status-dot" /> SOFTWARE · DESIGN · INTELLIGENT SYSTEMS</div>
            <div className="hero-name-label">HELLO, I'M</div>
            <h1>Dahoun <span>Manel.</span></h1>
            <div className="hero-role">{profile.title}</div>
            <p className="hero-description">{profile.headline}</p>
            <p className="hero-intro">{profile.intro}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projects">Explore my work <ArrowUpRight size={16} /></a>
              <Link className="button button-secondary" to="/cvs">View CV library <ArrowUpRight size={16} /></Link>
            </div>
            <div className="hero-socials">
              <a href={profile.linkedin} target="_blank" rel="noreferrer"><LinkedinIcon size={15} /> LinkedIn</a>
              <a href={profile.github} target="_blank" rel="noreferrer"><GithubIcon size={15} /> GitHub</a>
              <a href={`mailto:${profile.email}`}><Mail size={15} /> Email</a>
            </div>
          </motion.div>

          <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.12 }}>
            <div className="orbit orbit-a" />
            <div className="orbit orbit-b" />
            <div className="orbit orbit-c" />
            <div className="hero-core">
              <span className="core-overline">MULTIDISCIPLINARY ENGINEER</span>
              <div className="core-initials">DM<span>.</span></div>
              <div className="core-divider" />
              <p>Software<br />Design<br />Research</p>
              <span className="core-bottom">ALGERIA · 2026</span>
            </div>
            <div className="orbit-label orbit-label-one"><span className="orbit-label-dot" /> DEVELOPMENT</div>
            <div className="orbit-label orbit-label-two"><span className="orbit-label-dot" /> USER EXPERIENCE</div>
            <div className="orbit-label orbit-label-three"><span className="orbit-label-dot" /> AI & ROBOTICS</div>
            <div className="visual-coordinate">35°11' N<br />00°38' W</div>
          </motion.div>
        </div>
        <a className="scroll-indicator" href="#about"><span>SCROLL TO EXPLORE</span><ArrowDown size={15} /></a>
      </section>

      <section className="section section-about" id="about">
        <div className="container about-grid">
          <div className="about-intro">
            <div className="eyebrow">01 / ABOUT ME</div>
            <h2>Curiosity across disciplines. <span>Focus in execution.</span></h2>
          </div>
          <div className="about-copy">
            <p>{profile.intro}</p>
            <p>My journey has moved from student-community work and visual communication into application development, technical events, robotics, research and individual teaching. I value clear thinking, collaborative work and learning through practice.</p>
            <div className="about-facts">
              <div><span>01</span><strong>Software development</strong></div>
              <div><span>02</span><strong>UI/UX & visual design</strong></div>
              <div><span>03</span><strong>AI, robotics & research</strong></div>
            </div>
            <div className="about-focus-block">
              <span>CAREER INTERESTS</span>
              <div className="about-focus-tags">{profile.focus.map((focus) => <span key={focus}>{focus}</span>)}</div>
            </div>
            <div className="about-language-row"><span>LANGUAGES</span><strong>{profile.languages.join(' · ')}</strong></div>
            <div className="about-language-row"><span>PROFESSIONAL VALUES</span><strong>{profile.values.join(' · ')}</strong></div>
            <div className="about-inline-links">
              <Link to="/education/esi-sba"><GraduationCap size={15} /> Academic background <ArrowUpRight size={13} /></Link>
              <Link to="/cvs"><Download size={15} /> Explore CVs <ArrowUpRight size={13} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-education">
        <div className="container">
          <SectionHeading eyebrow="02 / EDUCATION" title="Academic background" description="Engineering studies and academic development at ESI-SBA." />
          <div className="education-strip">
            {education.map((item) => <ContentCard key={item.id} item={item} compact />)}
            <div className="education-note"><GraduationCap size={21} /><div><strong>Intelligent Computer Systems</strong><span>Specialization · Exact diploma title and academic dates to be confirmed.</span></div></div>
          </div>
        </div>
      </section>

      <section className="section section-skills" id="skills">
        <div className="container">
          <SectionHeading eyebrow="03 / TECHNICAL EXPERTISE" title="Tools for turning ideas into systems." description="A broad technical toolkit shaped by development, design, research and hands-on experimentation." />
          <div className="skills-grid">
            {skills.map((group, index) => (
              <motion.article className="skill-card" key={group.category} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }} variants={reveal} transition={{ delay: (index % 4) * 0.04 }}>
                <div className="skill-icon"><SkillIcon category={group.category} /></div>
                <h3>{group.category}</h3>
                <div className="skill-tags">{group.items.map((item) => <span key={item} className={item.includes('to be added') ? 'skill-pending' : ''}>{item}</span>)}</div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-experience" id="experience">
        <div className="container">
          <SectionHeading eyebrow="04 / EXPERIENCE" title="Where I've learned by doing." description="Internships, technical responsibilities and professional experiences. Open an entry for its full story and visual evidence." />
          <div className="content-grid content-grid-three">
            {featuredExperiences.map((item) => <ContentCard key={item.id} item={item} />)}
          </div>
          <div className="section-bottom-link"><Link to="/collections/experiences" className="text-link">View all experience entries <ArrowRight size={15} /></Link></div>
        </div>
      </section>

      <section className="section section-projects" id="projects">
        <div className="container">
          <SectionHeading eyebrow="05 / SELECTED PROJECTS" title="Selected work, with the process behind it." description="Development, product design and visual identity. Every card opens a dedicated case study with its gallery, contribution and supporting evidence." link={null} />
          <div className="filter-row" role="group" aria-label="Filter projects">
            {filters.map((filter) => <button className={`filter-chip ${projectFilter === filter ? 'active' : ''}`} key={filter} onClick={() => setProjectFilter(filter)}>{filter}</button>)}
          </div>
          <motion.div layout className="content-grid content-grid-three">
            {filteredProjects.map((item) => <ContentCard key={item.id} item={item} />)}
          </motion.div>
          <div className="project-note"><Sparkles size={15} /><span>Project covers and gallery images currently use clearly marked placeholders. Replace them with verified screenshots and evidence before publishing.</span></div>
        </div>
      </section>

      <section className="section section-research" id="research">
        <div className="container research-panel">
          <div className="research-graphic"><div className="research-ring ring-one" /><div className="research-ring ring-two" /><div className="research-cross">EEG</div><span className="research-caption">SIGNAL / IDENTITY / VERIFICATION</span></div>
          <div className="research-copy">
            <div className="eyebrow">06 / RESEARCH</div>
            <h2>Understanding identity through <span>neural signals.</span></h2>
            <p>EEG-based biometric authentication using low-channel wearable EEG, stimulus-evoked responses and Riemannian representations.</p>
            <div className="research-tags"><span>Python</span><span>MNE</span><span>PsychoPy</span><span>pyRiemann</span><span>Emotiv Insight 2</span></div>
            <Link className="button button-secondary" to={routeForItem(projects[0])}>Explore research case study <ArrowUpRight size={15} /></Link>
            <small>Research results, participant information and experimental evidence will be published only after verification and privacy review.</small>
          </div>
        </div>
      </section>

      <section className="section section-more" id="more">
        <div className="container">
          <SectionHeading eyebrow="07–09 / COMMUNITY & KNOWLEDGE" title="Sharing knowledge. Building with people." description="Teaching, leadership and extracurricular work are part of the professional journey too." />
          <div className="more-columns">
            <div className="more-column">
              <div className="mini-section-heading"><BookOpen size={17} /><h3>Teaching & workshops</h3></div>
              {teaching.slice(0, 3).map((item) => <Link to={routeForItem(item)} className="list-entry" key={item.id}><div><strong>{item.title}</strong><span>{item.period}</span></div><ArrowUpRight size={15} /></Link>)}
              <Link to="/collections/teaching" className="list-view-all">View all teaching <ArrowRight size={13} /></Link>
            </div>
            <div className="more-column">
              <div className="mini-section-heading"><Users size={17} /><h3>Leadership & community</h3></div>
              {activities.slice(0, 3).map((item) => <Link to={routeForItem(item)} className="list-entry" key={item.id}><div><strong>{item.title}</strong><span>{item.period}</span></div><ArrowUpRight size={15} /></Link>)}
              <Link to="/collections/activities" className="list-view-all">View all activities <ArrowRight size={13} /></Link>
            </div>
            <div className="more-column">
              <div className="mini-section-heading"><Trophy size={17} /><h3>Awards & events</h3></div>
              {featuredAwards.map((item) => <Link to={routeForItem(item)} className="list-entry" key={item.id}><div><strong>{item.title}</strong><span>{item.result || item.period}</span></div><ArrowUpRight size={15} /></Link>)}
              <Link to="/collections/awards" className="list-view-all">View all recognition <ArrowRight size={13} /></Link>
              <Link to="/collections/events" className="list-view-all">Browse all events <ArrowRight size={13} /></Link>
            </div>
          </div>
          <div className="more-action"><Link to="/cvs" className="button button-primary">Explore professional CVs <ArrowUpRight size={15} /></Link></div>
        </div>
      </section>

      <section className="section section-gallery" id="gallery">
        <div className="container">
          <SectionHeading eyebrow="10 / VISUAL GALLERY" title="A visual index of the work." description="Browse selected project, experience and event covers. Open any item to explore its complete gallery and evidence." />
          <div className="visual-index-grid">
            {galleryItems.map((item, index) => (
              <Link to={routeForItem(item)} className={`visual-index-item visual-index-${index + 1}`} key={item.id}>
                <img src={item.cover} alt={`${item.title} — placeholder cover`} loading="lazy" />
                <span className="visual-index-overlay"><span>{item.type}</span><strong>{item.title}</strong><ArrowUpRight size={18} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section contact-section" id="contact">
        <div className="container contact-inner">
          <div><div className="eyebrow">12 / CONTACT</div><h2>Let's make something <span>meaningful.</span></h2><p>{profile.availabilityNote}</p></div>
          <div className="contact-card">
            <a href={`mailto:${profile.email}`}><Mail size={17} /><span><small>EMAIL</small>{profile.email}</span><ArrowUpRight size={15} /></a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer"><LinkedinIcon size={17} /><span><small>LINKEDIN</small>Professional profile</span><ArrowUpRight size={15} /></a>
            <a href={profile.github} target="_blank" rel="noreferrer"><GithubIcon size={17} /><span><small>GITHUB</small>Code and repositories</span><ArrowUpRight size={15} /></a>
            <Link to="/cvs"><Download size={17} /><span><small>CURRICULUM VITAE</small>Browse domain-specific CVs</span><ArrowUpRight size={15} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
