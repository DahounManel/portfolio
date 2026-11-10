# Dahoun Manel — Portfolio + Local Admin Studio

A responsive React + Vite portfolio with a premium midnight-indigo visual style, a restrained animated space background (no astronaut), JSON-driven public content, reusable detail pages, evidence galleries and a multi-domain CV library.

This version also includes a **local admin content management system**. It has a sidebar and dedicated pages for profile, education, skills, experience, projects, research, teaching, leadership/activities, awards, events, CVs, navigation and media. The admin performs CRUD directly against the existing JSON files and copies uploaded assets into `public/`. No database is used.

## Requirements

- Node.js 20+ recommended
- npm

## Run the website and admin locally

Open a terminal in this project folder (named `portfolio`) and run:

```bash
npm install
npm run admin
```

Open the local address printed by Vite (normally `http://127.0.0.1:5173/`).

- Public portfolio: `http://127.0.0.1:5173/`
- Admin studio: `http://127.0.0.1:5173/admin`

Keep the terminal running while using the website or the admin studio. The `npm run dev` command starts the same local development server and supports the admin API too.

The admin file API is intentionally restricted to localhost. It is not exposed to other machines on your LAN.

## How the admin works

- No database, account service or cloud backend.
- Records are saved directly to `src/data/*.json`.
- Before each JSON write, the previous version is copied into `.admin-backups/`.
- Uploaded images are copied into `public/images/<section>/`.
- Uploaded supporting documents are copied into `public/evidence/`.
- Uploaded CV PDFs are copied into `public/cv/`.
- The Media Library lets you preview, copy the public path and delete media files.
- Use **Export backup** to download all managed JSON files as one backup bundle. **Import backup** restores the JSON data from that bundle. Existing files are backed up before replacement.
- The visible form editor supports nested objects, arrays, strings, long descriptions, booleans and file uploads. An optional advanced JSON editor is available on collection pages.

### Research, awards and events

Research has its own sidebar page, but research-tagged entries are stored in `projects.json` and remain normal portfolio case studies. This avoids duplicate copies of the same EEG research entry.

Awards and Events have separate management pages but share `awards.json`. The admin keeps their `type` values (`award` or `event`) when creating records.

### CV library

Use the CV Library page to create or edit CV metadata even before a PDF exists. Upload a PDF in the `File` field when ready. Set `published` to `true` only when the PDF is real and approved for public download. CV metadata includes domain, language, description, target roles and update date.

### Replacing placeholder images safely

1. Open the relevant admin section and edit the record.
2. Upload the real file into **Cover** or add images under **Gallery**.
3. Save the record. This writes the new path into JSON.
4. Open Media Library and delete the old placeholder only after it is no longer referenced by any record.

Deleting a media file does not automatically rewrite JSON references. The admin warns before deletion for this reason.

## Important deployment limitation

Cloudflare Pages (and other static hosting) serves the built files but cannot write changes back into your local JSON files or upload to your computer's `public/` folder. The admin editor is therefore a **local content-management tool**, not a public cloud CMS.

Recommended workflow:

1. Manage content locally at `/admin`.
2. Confirm uploaded files and save the JSON records.
3. Run `npm run build`.
4. Commit/push the updated `portfolio` folder to GitHub.
5. Let Cloudflare Pages deploy the latest static build.

The public website remains static and does not need a database.

## Build for deployment

```bash
npm run build
npm run preview
```

Vite outputs the static public website into `dist/`. Cloudflare Pages build command: `npm run build`. Output directory: `dist`.

## Main data files

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

## Existing accuracy and privacy notes

- CV entries are planned profiles until a real PDF has been uploaded and marked as published.
- Current gallery images are placeholders; replace them with authentic screenshots, approved photos, certificates or diagrams before public launch.
- Private client applications should remain sanitized. Add only details and screenshots approved for public use.
- EEG participant data and sensitive experimental records must not be published. Use anonymized, approved visuals only.
- Some dates, degree details, tools and award wording were flagged for verification in the source material. Confirm them before publication.
- Skill levels are not invented; no percentage ratings are displayed.

## Project structure

```text
portfolio/
  src/
    admin/            Local admin UI, nested form editor and client API
    components/       Reusable cards, gallery, navigation and background
    data/             Editable JSON content
    pages/            Public homepage, collections, details and CV library
    styles/           Public visual system
    utils/            Content registry and route helpers
  public/
    images/           Portfolio images grouped by content area
    evidence/         Uploaded supporting documents
    cv/               Uploaded CV PDFs
  .admin-backups/     Automatic JSON backups (ignored by Git)
```
