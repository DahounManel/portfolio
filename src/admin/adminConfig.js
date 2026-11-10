export const ADMIN_SECTIONS = [
  { group: 'Workspace', items: [
    { id: 'dashboard', label: 'Overview', icon: 'LayoutDashboard', kind: 'dashboard' },
    { id: 'media', label: 'Media library', icon: 'Images', kind: 'media' },
  ]},
  { group: 'Portfolio content', items: [
    { id: 'profile', label: 'Profile & contact', icon: 'UserRound', file: 'profile.json', mode: 'object', kind: 'profile' },
    { id: 'education', label: 'Education', icon: 'GraduationCap', file: 'education.json', kind: 'list', uploadFolder: 'education' },
    { id: 'skills', label: 'Skills & expertise', icon: 'Braces', file: 'skills.json', kind: 'list' },
    { id: 'experiences', label: 'Experience & internships', icon: 'BriefcaseBusiness', file: 'experiences.json', kind: 'list', uploadFolder: 'experiences' },
    { id: 'projects', label: 'Projects', icon: 'PanelsTopLeft', file: 'projects.json', kind: 'list', uploadFolder: 'projects' },
    { id: 'research', label: 'Research', icon: 'BrainCircuit', file: 'projects.json', kind: 'filtered-list', uploadFolder: 'research', filter: (item) => item.type === 'research' || (item.category || []).some((tag) => String(tag).toLowerCase().includes('research')) || (item.tags || []).some((tag) => String(tag).toLowerCase() === 'research'), defaultType: 'research' },
    { id: 'teaching', label: 'Teaching & workshops', icon: 'Presentation', file: 'teaching.json', kind: 'list', uploadFolder: 'teaching' },
    { id: 'activities', label: 'Leadership & clubs', icon: 'Users', file: 'activities.json', kind: 'list', uploadFolder: 'activities' },
    { id: 'awards', label: 'Awards & recognition', icon: 'Trophy', file: 'awards.json', kind: 'filtered-list', filter: (item) => item.type === 'award', defaultType: 'award', uploadFolder: 'awards' },
    { id: 'events', label: 'Events & competitions', icon: 'CalendarDays', file: 'awards.json', kind: 'filtered-list', filter: (item) => item.type === 'event', defaultType: 'event', uploadFolder: 'events' },
    { id: 'cvs', label: 'CV library', icon: 'Files', file: 'cvs.json', kind: 'list', uploadFolder: 'cv' },
    { id: 'navigation', label: 'Navigation & links', icon: 'Menu', file: 'navigation.json', kind: 'list' },
  ]},
];

export const ALL_ADMIN_ITEMS = ADMIN_SECTIONS.flatMap((group) => group.items);
export const DATA_FILES = ['profile.json', 'education.json', 'skills.json', 'experiences.json', 'projects.json', 'teaching.json', 'activities.json', 'awards.json', 'cvs.json', 'navigation.json'];

export function findAdminSection(id) {
  return ALL_ADMIN_ITEMS.find((item) => item.id === id);
}

export function newRecordFor(section) {
  const id = `${section.id === 'research' ? 'research' : section.id.replace(/s$/, '')}-${Date.now().toString(36)}`;
  if (section.id === 'skills') return { category: 'New skill category', items: [] };
  if (section.id === 'cvs') return { id, title: 'New CV', domain: 'Software Development', language: 'English', description: '', targetRoles: [], file: '', updatedAt: '', published: false };
  if (section.id === 'navigation') return { label: 'New link', href: '#section' };
  return {
    id,
    slug: id,
    type: section.defaultType || ({ projects: 'project', research: 'project', experiences: 'experience', education: 'education', teaching: 'teaching', activities: 'activity' }[section.id] || section.id),
    title: 'New entry',
    subtitle: '',
    period: '',
    summary: '',
    cover: '',
    tags: [],
    details: { overview: '', contributions: [], process: [], technologies: [], results: '', challenges: [], lessons: [] },
    gallery: [],
    evidence: [],
    links: [],
    ...(section.id === 'research' ? { category: ['Research'] } : {}),
  };
}

export function titleForRecord(item) {
  return item?.title || item?.category || item?.label || item?.name || item?.id || 'Untitled entry';
}
