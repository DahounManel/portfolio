import { staticPortfolioData } from './portfolioData';

const DATA_FILES = {
  'profile.json': 'profile',
  'skills.json': 'skills',
  'projects.json': 'projects',
  'experiences.json': 'experiences',
  'education.json': 'education',
  'teaching.json': 'teaching',
  'activities.json': 'activities',
  'awards.json': 'awards',
  'cvs.json': 'cvs',
  'navigation.json': 'navigation',
};

export async function isAdminApiAvailable() {
  try {
    const response = await fetch('/__admin/status', { cache: 'no-store' });
    if (!response.ok) return false;
    const payload = await response.json();
    return Boolean(payload?.localAdmin);
  } catch {
    return false;
  }
}

export async function fetchPortfolioData() {
  const available = await isAdminApiAvailable();
  if (!available) return { ...staticPortfolioData, __live: false };

  const entries = await Promise.all(
    Object.entries(DATA_FILES).map(async ([file, key]) => {
      const response = await fetch(
        `/__admin/data/${encodeURIComponent(file)}`,
        { cache: 'no-store' }
      );
      if (!response.ok) throw new Error(`Could not load ${file}`);
      const payload = await response.json();
      return [key, payload.data];
    })
  );

  return { ...Object.fromEntries(entries), __live: true };
}

export function portfolioDataEqual(a, b) {
  if (!a || !b) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}
