import projects from '../data/projects.json';
import experiences from '../data/experiences.json';
import education from '../data/education.json';
import teaching from '../data/teaching.json';
import activities from '../data/activities.json';
import awards from '../data/awards.json';

const staticCollections = {
  project: projects,
  experience: experiences,
  education,
  teaching,
  activity: activities,
  award: awards.filter((item) => item.type === 'award'),
  event: awards.filter((item) => item.type === 'event'),
};

export function getContentCollections(data) {
  const source = data || {};
  const awardsList = Array.isArray(source.awards) ? source.awards : awards;
  return {
    project: Array.isArray(source.projects) ? source.projects : projects,
    experience: Array.isArray(source.experiences) ? source.experiences : experiences,
    education: Array.isArray(source.education) ? source.education : education,
    teaching: Array.isArray(source.teaching) ? source.teaching : teaching,
    activity: Array.isArray(source.activities) ? source.activities : activities,
    award: awardsList.filter((item) => item.type === 'award'),
    event: awardsList.filter((item) => item.type === 'event'),
  };
}

export const contentCollections = getContentCollections();

export const allContent = Object.values(contentCollections).flat();

export function getContentByRoute(type, slug, data) {
  const collection = getContentCollections(data)[type];
  return collection?.find((item) => item.slug === slug) ?? null;
}

export function routeForItem(item) {
  const routes = { project: 'projects', experience: 'experiences', education: 'education', teaching: 'teaching', activity: 'activities', award: 'awards', event: 'events' };
  return `/${routes[item.type] || 'projects'}/${item.slug}`;
}

export function getCover(item) {
  return item?.cover || '/images/placeholders/web.svg';
}

export function getItemGallery(item) {
  const gallery = Array.isArray(item?.gallery) ? item.gallery : [];
  const cover = getCover(item);
  return [cover, ...gallery.filter((src) => src !== cover)];
}