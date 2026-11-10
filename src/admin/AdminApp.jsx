import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowDownToLine, ArrowLeft, ArrowUpRight, Braces, BrainCircuit,
  BriefcaseBusiness, CalendarDays, Check, ChevronDown, CloudUpload, Code2, Copy, FileImage,
  FileText, Files, FolderOpen, GraduationCap, ImagePlus, Images, LayoutDashboard, Menu,
  PanelLeftClose, PanelLeftOpen, PanelsTopLeft, Plus, Presentation, RefreshCw, Save, Search,
  ShieldCheck, Sparkles, Trash2, Trophy, Upload, UserRound, Users, X,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_SECTIONS, DATA_FILES, findAdminSection, newRecordFor, titleForRecord } from './adminConfig';
import { deleteMedia, exportAllData, fetchMedia, importAllData, loadDataFile, saveDataFile, uploadMedia } from './adminApi';
import ValueEditor from './ValueEditor';
import './admin.css';

const ICONS = { LayoutDashboard, Images, UserRound, GraduationCap, Braces, BriefcaseBusiness, PanelsTopLeft, BrainCircuit, Presentation, Users, Trophy, CalendarDays, Files, Menu };
const fmtBytes = (bytes = 0) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
const keyOf = (item) => String(item?.id || item?.category || item?.label || item?.slug || item?.title || '');
const slugify = (value = '') => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function useLocalApi() {
  const [state, setState] = useState({ checked: false, online: false, error: '' });
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    let active = true;
    fetch('/__admin/status').then((response) => response.json()).then((result) => {
      if (active) setState({ checked: true, online: Boolean(result.localAdmin), error: '' });
    }).catch((error) => { if (active) setState({ checked: true, online: false, error: error.message }); });
    return () => { active = false; };
  }, [refreshKey]);
  return { ...state, retry: () => { setState({ checked: false, online: false, error: '' }); setRefreshKey((value) => value + 1); } };
}

function AdminShell({ children, title, subtitle, onExport, onImport, saving = false }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const importRef = useRef(null);
  const navigate = useNavigate();
  const activePath = location.pathname.replace(/^\/admin\/?/, '').split('/')[0] || 'dashboard';
  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const bundle = JSON.parse(await file.text());
      const confirmed = window.confirm('Import this portfolio JSON backup? Existing files will be backed up and replaced by the imported versions.');
      if (confirmed) await onImport(bundle);
    } catch (error) { window.alert(`Import failed: ${error.message}`); }
    finally { event.target.value = ''; }
  }
  return <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    {mobileOpen && <button className="admin-mobile-scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
    <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="admin-brand-row">
        <div className="admin-brand-mark">DM</div>
        <div className="admin-brand-copy"><strong>MANEL / ADMIN</strong><span>PORTFOLIO CONTENT STUDIO</span></div>
        <button className="admin-sidebar-toggle" onClick={() => setCollapsed((value) => !value)} aria-label="Collapse sidebar">{collapsed ? <PanelLeftOpen size={17}/> : <PanelLeftClose size={17}/>}</button>
      </div>
      <div className="admin-sidebar-context"><span className="admin-context-dot"/> LOCAL WORKSPACE <span className="admin-context-line"/></div>
      <nav className="admin-side-nav">
        {ADMIN_SECTIONS.map((group) => <div className="admin-nav-group" key={group.group}>
          <div className="admin-nav-group-title">{group.group}</div>
          {group.items.map((item) => {
            const Icon = ICONS[item.icon] || Boxes;
            return <button key={item.id} className={`admin-nav-link ${activePath === item.id ? 'active' : ''}`} onClick={() => { navigate(item.id === 'dashboard' ? '/admin' : `/admin/${item.id}`); setMobileOpen(false); }} title={item.label}>
              <Icon size={17}/><span>{item.label}</span>
            </button>;
          })}
        </div>)}
      </nav>
      <div className="admin-sidebar-bottom">
        <div className="admin-storage-note"><ShieldCheck size={16}/><div><strong>Local JSON storage</strong><span>No database · Files stay in this project</span></div></div>
        <button className="admin-nav-link" onClick={() => { window.open('/', '_blank', 'noopener,noreferrer'); }}><ArrowUpRight size={16}/><span>View public portfolio</span></button>
      </div>
    </aside>

    <main className="admin-main">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button className="admin-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={19}/></button>
          <div className="admin-breadcrumb"><span>CONTENT STUDIO</span><b>/</b><strong>{title || 'Overview'}</strong></div>
        </div>
        <div className="admin-topbar-actions">
          {saving && <span className="admin-saving-indicator"><Activity size={13}/> Saving…</span>}
          <button className="admin-top-action" onClick={onExport}><ArrowDownToLine size={15}/> <span>Export backup</span></button>
          <button className="admin-top-action" onClick={() => importRef.current?.click()}><Upload size={15}/> <span>Import backup</span></button>
          <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={handleImport}/>
        </div>
      </header>
      <div className="admin-page-wrap">
        {subtitle && <div className="admin-page-intro"><div><h1>{title}</h1><p>{subtitle}</p></div></div>}
        {children}
      </div>
      <footer className="admin-footer"><span>DAHOUN MANEL · PORTFOLIO CONTENT STUDIO</span><span>LOCAL JSON MODE</span></footer>
    </main>
  </div>;
}

function StatusNote({ children, tone = 'info' }) { return <div className={`admin-status-note ${tone}`}><AlertTriangle size={16}/><span>{children}</span></div>; }

function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all(DATA_FILES.map((file) => loadDataFile(file).then((data) => [file, data])))
      .then((entries) => { if (active) setStats(Object.fromEntries(entries)); })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, []);
  const count = (file) => Array.isArray(stats?.[file]) ? stats[file].length : 0;
  const projectCount = count('projects.json');
  const researchCount = stats?.['projects.json']?.filter((item) => (item.category || []).some((tag) => String(tag).toLowerCase().includes('research')) || (item.tags || []).some((tag) => String(tag).toLowerCase() === 'research')).length || 0;
  const tiles = [
    { label: 'Projects', value: projectCount, icon: PanelsTopLeft, accent: 'violet', target: 'projects' },
    { label: 'Experiences', value: count('experiences.json'), icon: BriefcaseBusiness, accent: 'blue', target: 'experiences' },
    { label: 'Skills', value: stats?.['skills.json']?.reduce((total, item) => total + (item.items?.length || 0), 0) || 0, icon: Braces, accent: 'mint', target: 'skills' },
    { label: 'Awards & events', value: count('awards.json'), icon: Trophy, accent: 'amber', target: 'awards' },
  ];
  return <div className="admin-dashboard">
    <div className="admin-welcome-panel"><div><div className="admin-eyebrow"><Sparkles size={13}/> YOUR CONTENT WORKSPACE</div><h2>Good to see you, Manel.</h2><p>Manage your portfolio content, replace evidence and maintain your CV library from one place. Your edits are saved directly into JSON files.</p><div className="admin-welcome-actions"><button className="admin-primary-button" onClick={() => onNavigate('projects')}><PanelsTopLeft size={15}/> Manage projects</button><button className="admin-quiet-button" onClick={() => onNavigate('media')}><Images size={15}/> Open media library</button></div></div><div className="admin-welcome-art"><div className="admin-art-orbit orbit-one"/><div className="admin-art-orbit orbit-two"/><div className="admin-art-core">DM</div><span className="admin-art-star star-one">✦</span><span className="admin-art-star star-two">✧</span></div></div>
    {error && <StatusNote tone="error">Could not load the JSON files: {error}</StatusNote>}
    <div className="admin-stat-grid">{tiles.map((tile) => <button className="admin-stat-card" key={tile.label} onClick={() => onNavigate(tile.target)}><div className={`admin-stat-icon ${tile.accent}`}><tile.icon size={19}/></div><div><span>{tile.label}</span><strong>{stats ? tile.value : '—'}</strong></div><ArrowUpRight size={15} className="admin-stat-arrow"/></button>)}</div>
    <div className="admin-dashboard-grid">
      <section className="admin-panel"><div className="admin-panel-heading"><div><div className="admin-eyebrow">CONTENT INVENTORY</div><h3>All your portfolio areas</h3></div><span className="admin-panel-count">{stats ? Object.keys(stats).length : '—'} JSON files</span></div>
        <div className="admin-inventory-list">
          {[
            ['Profile & contact', 'profile.json', UserRound, 'profile'], ['Education', 'education.json', GraduationCap, 'education'], ['Skills & expertise', 'skills.json', Braces, 'skills'], ['Projects', 'projects.json', PanelsTopLeft, 'projects'], ['Research', `${researchCount} research-tagged records`, BrainCircuit, 'research'], ['Teaching & workshops', 'teaching.json', Presentation, 'teaching'], ['Leadership & clubs', 'activities.json', Users, 'activities'], ['CV library', 'cvs.json', Files, 'cvs'],
          ].map(([label, meta, Icon, target]) => <button key={target} className="admin-inventory-row" onClick={() => onNavigate(target)}><span className="admin-inventory-icon"><Icon size={16}/></span><strong>{label}</strong><small>{meta}</small><ArrowUpRight size={14}/></button>)}
        </div>
      </section>
      <section className="admin-panel admin-quick-panel"><div className="admin-eyebrow">QUICK TASKS</div><h3>Keep the portfolio current</h3><p>Use the dedicated editor for each section. Upload evidence directly into the right media folder and connect it to a record.</p>
        <button className="admin-quick-action" onClick={() => onNavigate('cvs')}><span><FileText size={17}/></span><div><strong>Add or update a CV</strong><small>Upload a PDF or create a CV entry</small></div><ArrowUpRight size={15}/></button>
        <button className="admin-quick-action" onClick={() => onNavigate('media')}><span><ImagePlus size={17}/></span><div><strong>Upload project evidence</strong><small>Images, PDF documents and videos</small></div><ArrowUpRight size={15}/></button>
        <button className="admin-quick-action" onClick={() => onNavigate('profile')}><span><UserRound size={17}/></span><div><strong>Update your profile</strong><small>Headline, biography and contact links</small></div><ArrowUpRight size={15}/></button>
        <div className="admin-backup-reminder"><ShieldCheck size={16}/><span>Export a JSON backup before making major content changes.</span></div>
      </section>
    </div>
  </div>;
}

function ProfileEditor({ section }) {
  const [data, setData] = useState(null);
  const [original, setOriginal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { loadDataFile(section.file).then((value) => { setData(value); setOriginal(value); }).catch((err) => setError(err.message)); }, [section.file]);
  const dirty = JSON.stringify(data) !== JSON.stringify(original);
  async function save() { setSaving(true); setMessage(''); setError(''); try { await saveDataFile(section.file, data); setOriginal(data); setMessage('Profile saved successfully.'); } catch (err) { setError(err.message); } finally { setSaving(false); } }
  if (!data) return <LoadingPanel error={error}/>;
  return <div className="admin-editor-page"><div className="admin-editor-toolbar"><div><span className="admin-record-pill">SINGLE PROFILE RECORD</span><p>These fields power the homepage introduction and contact information.</p></div><button className="admin-primary-button" onClick={save} disabled={!dirty || saving}><Save size={15}/>{saving ? 'Saving…' : 'Save profile'}</button></div>
    {message && <div className="admin-success-message"><Check size={15}/>{message}</div>}{error && <StatusNote tone="error">{error}</StatusNote>}
    <div className="admin-panel admin-form-panel"><ValueEditor label="Profile information" value={data} folder="profile" onChange={setData}/></div>
  </div>;
}

function ManagerPage({ section, itemId, navigate }) {
  const location = useLocation();
  const [fileData, setFileData] = useState(null);
  const [draft, setDraft] = useState(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [rawOpen, setRawOpen] = useState(false);
  const [rawValue, setRawValue] = useState('');
  const isObject = section.mode === 'object';

  useEffect(() => { let active = true; setFileData(null); setDraft(null); setMessage(''); setError(''); loadDataFile(section.file).then((value) => { if (active) { setFileData(value); setRawValue(JSON.stringify(value, null, 2)); } }).catch((err) => { if (active) setError(err.message); }); return () => { active = false; }; }, [section.file]);

  const visibleItems = useMemo(() => {
    if (!Array.isArray(fileData)) return [];
    const items = section.kind === 'filtered-list' ? fileData.filter(section.filter) : fileData;
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
  }, [fileData, section, query]);

  useEffect(() => {
    if (!itemId || !fileData || isObject) { setDraft(null); return; }
    if (itemId === 'new') setDraft(location.state?.draft || newRecordFor(section));
    else {
      const item = visibleItems.find((entry) => keyOf(entry) === decodeURIComponent(itemId));
      if (item) setDraft(structuredClone(item));
      else setDraft(null);
    }
  // A route change selects a different record; filtering does not reset an active draft.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, section.id, Boolean(fileData), location.key]);

  if (!fileData) return <LoadingPanel error={error}/>;
  if (isObject) return <ProfileEditor section={section}/>;

  const itemIsNew = itemId === 'new';
  const listMode = !itemId;
  async function saveRecord() {
    if (!draft) return;
    setSaving(true); setMessage(''); setError('');
    try {
      let nextData = [...fileData];
      const normalized = { ...draft };
      if (section.id !== 'skills' && section.id !== 'navigation') {
        normalized.id = normalized.id || `${section.id}-${Date.now().toString(36)}`;
        if ('title' in normalized && !normalized.slug) normalized.slug = slugify(normalized.title);
        if (section.id === 'research') { normalized.type = 'project'; normalized.category = [...new Set([...(normalized.category || []), 'Research'])]; }
        if (section.id === 'awards') normalized.type = 'award';
        if (section.id === 'events') normalized.type = 'event';
      }
      if (itemIsNew) nextData.push(normalized);
      else {
        const wanted = decodeURIComponent(itemId);
        const at = nextData.findIndex((entry) => keyOf(entry) === wanted);
        if (at < 0) throw new Error('This record no longer exists in the JSON file. Reload the page and try again.');
        nextData[at] = normalized;
      }
      await saveDataFile(section.file, nextData);
      setFileData(nextData); setDraft(normalized); setRawValue(JSON.stringify(nextData, null, 2)); setMessage('Changes saved to the JSON file.');
      navigate(`/admin/${section.id}`);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function deleteRecord() {
    if (!window.confirm(`Delete “${titleForRecord(draft)}”? This removes the record from ${section.file}.`)) return;
    const wanted = decodeURIComponent(itemId);
    const nextData = fileData.filter((entry) => keyOf(entry) !== wanted);
    setSaving(true); setError('');
    try { await saveDataFile(section.file, nextData); setFileData(nextData); setDraft(null); navigate(`/admin/${section.id}`); }
    catch (err) { setError(err.message); } finally { setSaving(false); }
  }
  function duplicateRecord() {
    const next = structuredClone(draft);
    next.id = `${section.id}-copy-${Date.now().toString(36)}`;
    if (next.slug) next.slug = `${next.slug}-copy`;
    next.title = `${next.title || 'Untitled'} (copy)`;
    setDraft(next); navigate(`/admin/${section.id}/new`, { state: { draft: next } });
  }
  async function applyRaw() {
    try {
      const parsed = JSON.parse(rawValue);
      if (!Array.isArray(parsed)) throw new Error('This section must contain a JSON array.');
      await saveDataFile(section.file, parsed); setFileData(parsed); setRawOpen(false); setMessage('Raw JSON imported and saved.');
    } catch (err) { setError(`JSON not saved: ${err.message}`); }
  }
  if (listMode) {
    return <div className="admin-list-page">
      <div className="admin-list-toolbar"><div><span className="admin-record-pill">{visibleItems.length} RECORDS</span><p>{section.id === 'research' ? 'Research entries are research-tagged records in projects.json, so they stay connected to the public case-study pages.' : `Manage records stored in ${section.file}.`}</p></div><div className="admin-list-actions"><button className="admin-secondary-button" onClick={() => { setRawValue(JSON.stringify(fileData, null, 2)); setRawOpen((value) => !value); }}><Code2 size={15}/> JSON view</button><button className="admin-primary-button" onClick={() => navigate(`/admin/${section.id}/new`)}><Plus size={16}/> Add {section.id === 'cvs' ? 'CV' : 'entry'}</button></div></div>
      {message && <div className="admin-success-message"><Check size={15}/>{message}</div>}{error && <StatusNote tone="error">{error}</StatusNote>}
      <div className="admin-search-row"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${section.label.toLowerCase()}…`}/><span>{visibleItems.length} shown</span></div>
      {rawOpen && <div className="admin-panel admin-raw-panel"><div className="admin-panel-heading"><div><h3>Advanced JSON editor</h3><p>Use only if you are comfortable editing JSON directly.</p></div><button className="admin-icon-button" onClick={() => setRawOpen(false)}><X size={16}/></button></div><textarea className="admin-raw-editor" spellCheck="false" value={rawValue} onChange={(event) => setRawValue(event.target.value)}/><button className="admin-primary-button" onClick={applyRaw}><Save size={14}/> Validate & save JSON</button></div>}
      <div className="admin-record-grid">{visibleItems.map((item) => <button className="admin-record-card" key={keyOf(item)} onClick={() => navigate(`/admin/${section.id}/${encodeURIComponent(keyOf(item))}`)}>
        <div className="admin-record-cover">{item.cover ? <img src={item.cover} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }}/> : <div className="admin-no-cover"><FileImage size={22}/></div>}<span>{item.type || section.id}</span></div>
        <div className="admin-record-copy"><strong>{titleForRecord(item)}</strong><p>{item.summary || item.subtitle || item.description || item.domain || item.category || 'No description added yet.'}</p><div className="admin-record-meta"><span>{item.period || item.language || item.domain || 'Details to add'}</span><ArrowUpRight size={14}/></div></div>
      </button>)}</div>
      {visibleItems.length === 0 && <EmptyState title="No entries found" text="Add your first entry or adjust your search." onAdd={() => navigate(`/admin/${section.id}/new`)}/>}
    </div>;
  }
  if (!draft) return <LoadingPanel error={error || 'This record could not be found.'}/>;
  const dirty = true;
  return <div className="admin-editor-page">
    <div className="admin-editor-toolbar"><div><button className="admin-back-link" onClick={() => navigate(`/admin/${section.id}`)}><ArrowLeft size={14}/> Back to {section.label}</button><div className="admin-editor-title-row"><h2>{itemIsNew ? 'Create new entry' : titleForRecord(draft)}</h2><span className="admin-record-pill">{itemIsNew ? 'NEW RECORD' : 'EDITING RECORD'}</span></div><p>Fields are saved directly into <code>{section.file}</code>. Leave optional fields empty when they do not apply.</p></div><div className="admin-editor-actions">{!itemIsNew && <button className="admin-secondary-button" onClick={duplicateRecord}><Copy size={14}/> Duplicate</button>}{!itemIsNew && <button className="admin-danger-button" onClick={deleteRecord}><Trash2 size={14}/> Delete</button>}<button className="admin-primary-button" onClick={saveRecord} disabled={saving || !dirty}><Save size={15}/>{saving ? 'Saving…' : 'Save changes'}</button></div></div>
    {message && <div className="admin-success-message"><Check size={15}/>{message}</div>}{error && <StatusNote tone="error">{error}</StatusNote>}
    <div className="admin-panel admin-form-panel"><ValueEditor label="Entry information" value={draft} folder={section.uploadFolder || section.id} onChange={setDraft}/></div>
    <div className="admin-editor-bottom-hint"><ShieldCheck size={15}/> Images and PDFs uploaded here are copied into this portfolio's <code>public/</code> folder. Save the entry after uploading to retain its file path in JSON.</div>
  </div>;
}

function CVManager({ section, itemId, navigate }) {
  return <ManagerPage section={section} itemId={itemId} navigate={navigate}/>;
}

function MediaManager() {
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [folder, setFolder] = useState('projects');
  const inputRef = useRef(null);
  async function refresh() { setBusy(true); setError(''); try { setFiles(await fetchMedia()); } catch (err) { setError(err.message); } finally { setBusy(false); } }
  useEffect(() => { refresh(); }, []);
  const filtered = useMemo(() => files.filter((file) => filter === 'all' || (filter === 'images' ? file.mime?.startsWith('image/') : filter === 'documents' ? file.mime === 'application/pdf' : file.mime?.startsWith('video/'))), [files, filter]);
  async function upload(event) {
    const selected = [...(event.target.files || [])]; if (!selected.length) return;
    setBusy(true); setError(''); setNotice('');
    try { for (const file of selected) await uploadMedia(file, folder); setNotice(`${selected.length} file${selected.length > 1 ? 's' : ''} uploaded.`); await refresh(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); event.target.value = ''; }
  }
  async function remove(file) {
    if (!window.confirm(`Delete ${file.path}? If it is used in a portfolio entry, replace or remove that reference first.`)) return;
    try { await deleteMedia(file.path); setFiles((current) => current.filter((item) => item.path !== file.path)); setNotice('File deleted.'); }
    catch (err) { setError(err.message); }
  }
  async function copyPath(path) { try { await navigator.clipboard.writeText(path); setNotice(`Copied ${path}`); } catch { setNotice(path); } }
  return <div className="admin-media-page">
    <div className="admin-media-upload-panel"><div className="admin-media-upload-icon"><CloudUpload size={25}/></div><div className="admin-media-upload-copy"><h3>Upload portfolio evidence</h3><p>Upload images, PDFs and videos. Files are placed directly inside <code>public/</code> and become available to the portfolio.</p><div className="admin-media-upload-controls"><select value={folder} onChange={(event) => setFolder(event.target.value)}><option value="projects">Projects</option><option value="experiences">Experiences</option><option value="research">Research</option><option value="teaching">Teaching</option><option value="activities">Activities & clubs</option><option value="events">Events</option><option value="awards">Certificates & awards</option><option value="profile">Profile</option><option value="general">General media</option><option value="cv">CV PDFs</option><option value="evidence">Other evidence</option></select><input ref={inputRef} hidden type="file" multiple accept={folder === 'cv' ? '.pdf,application/pdf' : 'image/png,image/jpeg,image/webp,image/gif,image/avif,application/pdf,video/mp4,video/webm'} onChange={upload}/><button className="admin-primary-button" disabled={busy} onClick={() => inputRef.current?.click()}><Upload size={15}/>{busy ? 'Uploading…' : 'Choose files'}</button></div></div></div>
    {notice && <div className="admin-success-message"><Check size={15}/>{notice}</div>}{error && <StatusNote tone="error">{error}</StatusNote>}
    <div className="admin-media-toolbar"><div><h2>Media library</h2><p>{files.length} files stored in your portfolio</p></div><button className="admin-secondary-button" onClick={refresh} disabled={busy}><RefreshCw size={14}/> Refresh</button></div>
    <div className="admin-media-filters">{[['all','All files'],['images','Images'],['documents','PDF documents'],['videos','Videos']].map(([id,label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div>
    <div className="admin-media-grid">{filtered.map((file) => <article className="admin-media-card" key={file.path}><div className="admin-media-preview">{file.mime?.startsWith('image/') ? <img src={file.path} alt={file.name}/> : file.mime === 'application/pdf' ? <div className="admin-file-preview pdf"><FileText size={30}/><span>PDF</span></div> : <div className="admin-file-preview"><FileImage size={30}/><span>VIDEO</span></div>}</div><div className="admin-media-card-info"><strong title={file.name}>{file.name}</strong><small>{file.path}</small><span>{fmtBytes(file.size)}</span></div><div className="admin-media-card-actions"><button className="admin-icon-button" title="Copy public path" onClick={() => copyPath(file.path)}><Copy size={14}/></button><a className="admin-icon-button" title="Open file" href={file.path} target="_blank" rel="noreferrer"><ArrowUpRight size={14}/></a><button className="admin-icon-button danger" title="Delete file" onClick={() => remove(file)}><Trash2 size={14}/></button></div></article>)}</div>
    {filtered.length === 0 && <EmptyState title="No files in this view" text="Upload your first authentic screenshot, project photo, certificate or CV."/>}
    <div className="admin-media-warning"><AlertTriangle size={16}/><span>Deleting a file does not automatically remove its path from JSON records. Replace the cover/gallery/evidence reference first to avoid broken images.</span></div>
  </div>;
}

function LoadingPanel({ error }) { return <div className="admin-panel admin-loading-panel">{error ? <><AlertTriangle size={22}/><h3>Could not load this section</h3><p>{error}</p><p>Check that you opened the site using <code>npm run admin</code> or <code>npm run dev</code> on this computer.</p></> : <><RefreshCw size={20} className="admin-spin"/><p>Loading portfolio data…</p></>}</div>; }
function EmptyState({ title, text, onAdd }) { return <div className="admin-empty-state"><div><FolderOpen size={25}/></div><h3>{title}</h3><p>{text}</p>{onAdd && <button className="admin-primary-button" onClick={onAdd}><Plus size={14}/> Add entry</button>}</div>; }

export default function AdminApp() {
  const localApi = useLocalApi();
  const location = useLocation();
  const navigate = useNavigate();
  const parts = location.pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  const sectionId = parts[0] || 'dashboard';
  const itemId = parts[1];
  const section = findAdminSection(sectionId);
  const title = section?.label || 'Overview';
  const subtitle = sectionId === 'dashboard' ? 'Your portfolio, organized and ready to grow.' : section?.kind === 'media' ? 'Upload, inspect and organize real project evidence and CV documents.' : section?.kind === 'profile' ? 'Maintain the professional profile, headline and contact details shown on your public website.' : sectionId === 'research' ? 'Manage research case studies without duplicating them in your project data.' : `Create, update, organize and remove ${section?.label?.toLowerCase() || 'portfolio content'} with a visual JSON editor.`;
  const [bannerError, setBannerError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    try {
      setBusy(true);
      const bundle = await exportAllData();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `dahoun-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
    } catch (error) { setBannerError(error.message); }
    finally { setBusy(false); }
  }
  async function handleImport(bundle) {
    try { setBusy(true); await importAllData(bundle); setBannerError('Backup imported. Reload the admin page to refresh displayed records.'); window.location.reload(); }
    catch (error) { setBannerError(error.message); }
    finally { setBusy(false); }
  }

  if (!localApi.checked) return <div className="admin-boot-screen"><div className="admin-boot-card"><div className="admin-brand-mark">DM</div><RefreshCw size={19} className="admin-spin"/><h2>Opening content studio</h2><p>Checking the local JSON file service…</p></div></div>;
  if (!localApi.online) return <div className="admin-boot-screen"><div className="admin-boot-card admin-offline-card"><div className="admin-brand-mark">DM</div><div className="admin-eyebrow">LOCAL CONTENT STUDIO</div><h1>Admin needs the local file service.</h1><p>This admin writes directly to JSON files and uploads assets into your <code>portfolio/public/</code> folder. It cannot write to a static Cloudflare deployment.</p><div className="admin-command-box"><code>cd ~/Desktop/portfolio</code><code>npm run admin</code></div><button className="admin-primary-button" onClick={localApi.retry}><RefreshCw size={15}/> Check again</button><a href="/" className="admin-back-link">Return to public portfolio <ArrowUpRight size={14}/></a></div></div>;

  return <AdminShell title={title} subtitle={sectionId === 'dashboard' ? 'Your portfolio, organized and ready to grow.' : subtitle} onExport={handleExport} onImport={handleImport} saving={busy}>
    {bannerError && <div className="admin-success-message"><Check size={15}/>{bannerError}<button onClick={() => setBannerError('')}><X size={14}/></button></div>}
    {sectionId === 'dashboard' || !section ? <Dashboard onNavigate={(id) => navigate(id === 'dashboard' ? '/admin' : `/admin/${id}`)}/> : section.kind === 'media' ? <MediaManager/> : section.kind === 'profile' ? <ProfileEditor section={section}/> : section.id === 'cvs' ? <CVManager section={section} itemId={itemId} navigate={navigate}/> : <ManagerPage section={section} itemId={itemId} navigate={navigate}/>}
  </AdminShell>;
}
