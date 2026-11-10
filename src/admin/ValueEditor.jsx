import { useRef, useState } from 'react';
import { ChevronDown, ChevronRight, FileUp, Plus, Trash2, Upload } from 'lucide-react';
import { uploadMedia } from './adminApi';

const humanize = (value = '') => String(value).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^./, (c) => c.toUpperCase());
const LONG_FIELDS = new Set(['summary', 'description', 'intro', 'headline', 'overview', 'results', 'availabilityNote', 'purpose', 'objectives', 'notes', 'contribution', 'process', 'challenges', 'lessons', 'titleNote']);
const templates = {
  evidence: { label: '', status: '', url: '' },
  links: { label: '', url: '' },
  targetRoles: '',
  tags: '',
  category: '',
  items: '',
  contributions: '',
  process: '',
  technologies: '',
  challenges: '',
  lessons: '',
  gallery: '',
};

function emptyLike(value) {
  if (Array.isArray(value)) return [];
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, emptyLike(child)]));
  if (typeof value === 'boolean') return false;
  if (typeof value === 'number') return 0;
  return '';
}

function arrayTemplate(key, items) {
  if (items.length) return emptyLike(items[0]);
  return Object.prototype.hasOwnProperty.call(templates, key) ? structuredClone(templates[key]) : '';
}

function UploadField({ value, fieldKey, folder, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isPdf = fieldKey === 'file' || fieldKey.toLowerCase().includes('pdf');
  const accept = isPdf ? '.pdf,application/pdf' : (fieldKey === 'url' ? 'image/png,image/jpeg,image/webp,image/gif,image/avif,application/pdf,video/mp4,video/webm' : 'image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm');
  async function handleFile(file) {
    if (!file) return;
    setBusy(true); setError('');
    try {
      const result = await uploadMedia(file, isPdf ? 'cv' : folder || 'general');
      onChange(result.path);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); if (inputRef.current) inputRef.current.value = ''; }
  }
  return <div className="admin-upload-field">
    <input ref={inputRef} type="file" accept={accept} hidden onChange={(event) => handleFile(event.target.files?.[0])} />
    <button type="button" className="admin-upload-button" onClick={() => inputRef.current?.click()} disabled={busy}>
      {isPdf ? <FileUp size={14} /> : <Upload size={14} />}{busy ? 'Uploading…' : isPdf ? 'Upload PDF' : 'Upload media'}
    </button>
    {value && <span className="admin-path-preview" title={value}>{value}</span>}
    {error && <span className="admin-field-error">{error}</span>}
  </div>;
}

export default function ValueEditor({ label, value, onChange, fieldKey = '', parentKey = '', folder = 'general', depth = 0 }) {
  const displayLabel = label || humanize(fieldKey);

  if (Array.isArray(value)) {
    const simple = value.every((item) => typeof item !== 'object' || item === null);
    return <section className={`admin-array-field ${depth > 0 ? 'nested' : ''}`}>
      <div className="admin-array-heading"><span>{displayLabel}</span><small>{value.length} item{value.length === 1 ? '' : 's'}</small></div>
      <div className="admin-array-items">
        {value.map((item, index) => (
          <div className={`admin-array-item ${simple ? 'simple' : ''}`} key={`${fieldKey}-${index}`}>
            {simple ? <input aria-label={`${displayLabel} ${index + 1}`} value={item ?? ''} onChange={(event) => { const next = [...value]; next[index] = event.target.value; onChange(next); }} placeholder={`${displayLabel} ${index + 1}`} />
              : <details className="admin-nested-card" open={depth < 1}><summary><span>{displayLabel} #{index + 1}</span><ChevronDown size={14} /></summary><div className="admin-nested-body"><ValueEditor label={`${displayLabel} ${index + 1}`} value={item} fieldKey={`${fieldKey}[${index}]`} parentKey={fieldKey} folder={folder} depth={depth + 1} onChange={(nextItem) => { const next = [...value]; next[index] = nextItem; onChange(next); }} /></div></details>}
            {fieldKey === 'gallery' && typeof item === 'string' && <UploadField value={item} fieldKey="gallery" folder={folder} onChange={(nextPath) => { const next = [...value]; next[index] = nextPath; onChange(next); }} />}
            <button type="button" className="admin-icon-button danger" aria-label={`Remove ${displayLabel} ${index + 1}`} onClick={() => onChange(value.filter((_, i) => i !== index))}><Trash2 size={14}/></button>
          </div>
        ))}
      </div>
      <button type="button" className="admin-add-inline" onClick={() => onChange([...value, arrayTemplate(fieldKey, value)])}><Plus size={14}/> Add {displayLabel.toLowerCase()}</button>
    </section>;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value);
    return <section className={`admin-object-field ${depth > 0 ? 'nested' : ''}`}>
      <div className="admin-object-heading">{displayLabel}</div>
      <div className="admin-object-fields">
        {entries.map(([key, child]) => <ValueEditor key={key} label={humanize(key)} fieldKey={key} parentKey={fieldKey} value={child} folder={folder} depth={depth + 1} onChange={(nextChild) => onChange({ ...value, [key]: nextChild })} />)}
        {entries.length === 0 && <p className="admin-muted">This object is empty. Use the raw JSON editor below if you need to define a custom structure.</p>}
      </div>
    </section>;
  }

  if (typeof value === 'boolean') {
    return <label className="admin-switch-field"><span>{displayLabel}</span><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} /><i /></label>;
  }

  const isUpload = ['cover', 'file', 'src', 'pdf', 'portrait', 'avatar', 'photo', 'profileImage'].includes(fieldKey) || (fieldKey === 'url' && parentKey === 'evidence');
  const uploadFolder = fieldKey === 'url' && parentKey === 'evidence' ? 'evidence' : folder;
  const multiline = LONG_FIELDS.has(fieldKey) || String(value || '').length > 100;
  return <div className="admin-field">
    <label>{displayLabel}</label>
    {multiline ? <textarea rows={3} value={value ?? ''} onChange={(event) => onChange(event.target.value)} placeholder={`Enter ${displayLabel.toLowerCase()}…`} />
      : <input type={typeof value === 'number' ? 'number' : 'text'} value={value ?? ''} onChange={(event) => onChange(typeof value === 'number' ? Number(event.target.value) : event.target.value)} placeholder={`Enter ${displayLabel.toLowerCase()}…`} />}
    {isUpload && <UploadField value={value} fieldKey={fieldKey} folder={uploadFolder} onChange={onChange} />}
    {(fieldKey === 'gallery' || parentKey === 'gallery') && typeof value === 'string' && !isUpload && <UploadField value={value} fieldKey="gallery" folder={folder} onChange={onChange} />}
  </div>;
}
