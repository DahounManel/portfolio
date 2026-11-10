import projects from '../data/projects.json';
import experiences from '../data/experiences.json';
import education from '../data/education.json';
import teaching from '../data/teaching.json';
import activities from '../data/activities.json';
import awards from '../data/awards.json';

export const contentCollections = {
  project: projects,
  experience: experiences,
  education,
  teaching,
  activity: activities,
  award: awards.filter((item) => item.type === 'award'),
  event: awards.filter((item) => item.type === 'event'),
};

export const allContent = Object.values(contentCollections).flat();

export function getContentByRoute(type, slug) {
  const collection = contentCollections[type];
  return collection?.find((item) => item.slug === slug) ?? null;
}

export function routeForItem(item) {
  const routes = { project: 'projects', experience: 'experiences', education: 'education', teaching: 'teaching', activity: 'activities', award: 'awards', event: 'events' };
  return `/${routes[item.type] || 'projects'}/${item.slug}`;
}

export function getCover(item) {
  return item.cover || '/images/placeholders/web.svg';
}

export function getItemGallery(item) {
  const gallery = Array.isArray(item.gallery) ? item.gallery : [];
  const cover = getCover(item);
  return [cover, ...gallery.filter((src) => src !== cover)];
}
