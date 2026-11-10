import { useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, FileText, Languages, Search, BriefcaseBusiness } from 'lucide-react';
import cvs from '../data/cvs.json';
import profile from '../data/profile.json';

export default function CVLibrary() {
  const [domain, setDomain] = useState('All domains');
  const [language, setLanguage] = useState('All languages');
  const [query, setQuery] = useState('');
  const domains = ['All domains', ...new Set(cvs.map((cv) => cv.domain))];
  const languages = ['All languages', ...new Set(cvs.map((cv) => cv.language))];

  const visibleCVs = useMemo(() => cvs.filter((cv) => {
    const matchesDomain = domain === 'All domains' || cv.domain === domain;
    const matchesLanguage = language === 'All languages' || cv.language === language;
    const text = `${cv.title} ${cv.domain} ${cv.description} ${cv.targetRoles.join(' ')}`.toLowerCase();
    return matchesDomain && matchesLanguage && text.includes(query.toLowerCase());
  }), [domain, language, query]);

  return (
    <main className="cv-page">
      <div className="container cv-container">
        <div className="cv-page-heading">
          <div className="eyebrow">PROFESSIONAL DOCUMENTS / CV LIBRARY</div>
          <h1>One profile. <span>Different perspectives.</span></h1>
          <p>Choose the CV that best matches the domain and opportunity you are exploring. Each version can be maintained independently in the portfolio data.</p>
          <div className="cv-page-meta"><span><BriefcaseBusiness size={14} /> {cvs.length} professional profiles planned</span><span><Languages size={14} /> Multiple languages supported</span></div>
        </div>

        <div className="cv-filters">
          <label className="cv-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search CVs or target roles" /></label>
          <select value={domain} onChange={(event) => setDomain(event.target.value)} aria-label="Filter by domain">{domains.map((value) => <option key={value}>{value}</option>)}</select>
          <select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Filter by language">{languages.map((value) => <option key={value}>{value}</option>)}</select>
        </div>

        <div className="cv-grid">
          {visibleCVs.map((cv) => (
            <article className="cv-card" key={cv.id}>
              <div className="cv-card-top"><div className="cv-file-icon"><FileText size={23} /></div><span className={`cv-status ${cv.published && cv.file ? 'available' : ''}`}>{cv.published && cv.file ? 'Available' : 'In preparation'}</span></div>
              <div className="eyebrow">{cv.domain}</div>
              <h2>{cv.title}</h2>
              <p>{cv.description}</p>
              <div className="cv-language"><Languages size={14} /> {cv.language}</div>
              <div className="cv-roles">{cv.targetRoles.map((role) => <span key={role}>{role}</span>)}</div>
              {cv.published && cv.file ? <a className="button button-primary cv-download" href={cv.file} download><ArrowDownToLine size={15} /> Download PDF</a> : <div className="cv-pending-note">PDF not added yet</div>}
            </article>
          ))}
        </div>

        {visibleCVs.length === 0 && <div className="empty-state">No CV matches those filters.</div>}

        <div className="cv-instructions"><div className="cv-instructions-icon"><FileText size={19} /></div><div><strong>Adding a new CV is straightforward.</strong><p>Place the PDF in <code>public/cv/</code>, then add its path and metadata to <code>src/data/cvs.json</code>. Set <code>published</code> to <code>true</code> once the document is ready. No React component changes are needed.</p></div></div>
        <div className="cv-contact-line">Need a specific version? <a href={`mailto:${profile.email}`}>Contact me <ArrowUpRight size={13} /></a></div>
      </div>
    </main>
  );
}
