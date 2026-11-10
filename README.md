# Dahoun Manel — Professional Portfolio

A responsive React + Vite portfolio with a premium midnight-indigo visual style, subtle animated space background (moving starfield, slowly drifting nebula and occasional shooting stars), JSON-driven content, reusable detail pages, image galleries and a multi-domain CV library.

**No astronaut or character is used.** The space atmosphere is created with a lightweight Canvas starfield and CSS gradients/orbits.

## Requirements

- Node.js 20+ recommended
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

## Build for deployment

```bash
npm run build
npm run preview
```

Vite outputs the static site into `dist/`.

## Deploy for free with Cloudflare Pages

1. Push this folder to a GitHub repository.
2. In Cloudflare Pages, create a project connected to that repository.
3. Use `npm run build` as the build command.
4. Use `dist` as the build output directory.
5. Deploy.

The Vite config includes SPA-friendly development settings. For Cloudflare Pages, the generated static site is served from `dist`; React Router routes are handled by Pages' standard single-page-app fallback when no top-level `404.html` is present.

## Edit portfolio content

Most portfolio content lives in `src/data/`:

- `profile.json` — name, headline, introduction and contact links
- `education.json` — education cards
- `skills.json` — skill categories and technologies
- `experiences.json` — internships and professional experience
- `projects.json` — development, UI/UX, research and branding case studies
- `teaching.json` — tutoring and workshops
- `activities.json` — clubs, leadership and community activities
- `awards.json` — awards and events
- `cvs.json` — domain-specific CV entries and PDF paths
- `navigation.json` — top navigation labels and section anchors

Each content item can include:

- `cover`: the card cover image
- `gallery`: array of image paths; the cover is automatically shown first
- `details`: overview, contributions, process, technologies, results, challenges and lessons
- `evidence`: supporting documents or evidence descriptions; add a `url` to make an evidence link visible
- `links`: external links

### Add images

Place image files in `public/images/` (for example `public/images/projects/`). Reference them with a root-relative path such as `/images/projects/my-project-cover.webp` in the relevant JSON item.

All files currently under `public/images/placeholders/` are clearly marked placeholder visuals. Replace them with authentic screenshots, approved photos, certificates or diagrams before public launch. Do not present placeholder images as actual evidence.

### Add a new project or other content item

1. Add a new JSON object to the relevant file.
2. Give it a unique `id` and URL-safe `slug`.
3. Set its `type` correctly (`project`, `experience`, `education`, `teaching`, `activity`, `award` or `event`).
4. Add a cover path and gallery paths.
5. Add only verified contributions and outcomes.

The correct detail route is generated from the item type and slug:

- Projects: `/projects/<slug>`
- Experiences: `/experiences/<slug>`
- Education: `/education/<slug>`
- Teaching: `/teaching/<slug>`
- Activities: `/activities/<slug>`
- Awards: `/awards/<slug>`
- Events: `/events/<slug>`

Collection archive routes are available under `/collections/` (for example `/collections/projects`, `/collections/teaching` and `/collections/events`).

## Add multiple CVs

1. Put each PDF in `public/cv/`.
2. Add or edit an entry in `src/data/cvs.json`.
3. Set its `file` value to the public path, e.g. `/cv/software-developer-en.pdf`.
4. Set `published` to `true` when the actual PDF is present and ready to share.
5. Choose domain, language and target roles.

The CV library filters by domain and language. Entries without an attached PDF remain clearly marked **In preparation** and do not expose a broken download link.

## Accuracy and privacy notes

- Current CV entries are planned categories only; no PDF files were supplied with the portfolio source document.
- The current gallery uses placeholders because the original evidence has not yet been structured.
- Private client applications remain sanitized; add only screenshots and details approved for public use.
- EEG participant data and sensitive experimental records must not be published. Use anonymized, approved visuals only.
- Some dates, degree details, tools and award wording were marked for verification in the source portfolio document. Confirm them before publication.
- Skill levels are not invented; no percentage ratings are displayed.

## Project structure

```text
src/
  components/       Reusable cards, gallery, navigation and background
  data/             Editable JSON content
  pages/            Home, collection, item detail and CV library pages
  styles/           Responsive visual system
  utils/            Content registry and route helpers
public/
  images/placeholders/
  cv/
```
