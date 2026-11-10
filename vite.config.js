import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

const PROJECT_ROOT = process.cwd();
const DATA_DIR = path.join(PROJECT_ROOT, 'src', 'data');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const BACKUP_DIR = path.join(PROJECT_ROOT, '.admin-backups');
const DATA_FILES = new Set([
  'profile.json', 'education.json', 'skills.json', 'experiences.json', 'projects.json',
  'teaching.json', 'activities.json', 'awards.json', 'cvs.json', 'navigation.json',
]);
const IMAGE_FOLDERS = new Set(['projects', 'experiences', 'research', 'teaching', 'activities', 'events', 'awards', 'profile', 'general', 'education']);
const ALLOWED_MEDIA = new Map([
  ['image/jpeg', '.jpg'], ['image/png', '.png'], ['image/webp', '.webp'], ['image/gif', '.gif'], ['image/avif', '.avif'],
  ['application/pdf', '.pdf'], ['video/mp4', '.mp4'], ['video/webm', '.webm'],
]);
const MAX_UPLOAD_BYTES = 35 * 1024 * 1024;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function isLocalRequest(req) {
  const address = req.socket?.remoteAddress || '';
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
}

async function readJsonBody(req, maxBytes = MAX_UPLOAD_BYTES * 1.5) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new Error('Request is too large. Reduce the file size and try again.');
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  try { return JSON.parse(raw || '{}'); }
  catch { throw new Error('The request did not contain valid JSON.'); }
}

function slugifyFilename(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'upload';
}

async function ensureInside(root, target) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  if (!resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`)) throw new Error('Invalid file path.');
  return resolvedTarget;
}

async function backupDataFile(filename) {
  const source = path.join(DATA_DIR, filename);
  try {
    const current = await fs.readFile(source, 'utf8');
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.writeFile(path.join(BACKUP_DIR, `${stamp}-${filename}`), current, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function writeDataFile(filename, data) {
  if (!DATA_FILES.has(filename)) throw new Error('This JSON file is not managed by the admin.');
  const shouldBeArray = filename !== 'profile.json';
  if (shouldBeArray !== Array.isArray(data) || (filename === 'profile.json' && (!data || typeof data !== 'object' || Array.isArray(data)))) {
    throw new Error(`${filename} has an unexpected JSON structure.`);
  }
  const serialized = `${JSON.stringify(data, null, 2)}\n`;
  JSON.parse(serialized);
  await backupDataFile(filename);
  const destination = path.join(DATA_DIR, filename);
  const temporary = `${destination}.${randomBytes(5).toString('hex')}.tmp`;
  await fs.writeFile(temporary, serialized, 'utf8');
  await fs.rename(temporary, destination);
}

async function walkFiles(directory, root = directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
  const found = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await walkFiles(full, root));
    else if (entry.isFile()) {
      const stat = await fs.stat(full);
      const relative = path.relative(PUBLIC_DIR, full).split(path.sep).join('/');
      const ext = path.extname(entry.name).toLowerCase();
      const mime = ext === '.svg' ? 'image/svg+xml' : Object.entries(Object.fromEntries([...ALLOWED_MEDIA.entries()].map(([type, extension]) => [extension, type]))).find(([extension]) => extension === ext)?.[1] || 'application/octet-stream';
      found.push({ name: entry.name, path: `/${relative}`, size: stat.size, modifiedAt: stat.mtime.toISOString(), mime });
    }
  }
  return found;
}

function localPortfolioAdmin() {
  return {
    name: 'local-portfolio-json-admin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__admin/')) return next();
        if (!isLocalRequest(req)) return sendJson(res, 403, { error: 'The portfolio admin API is available only from this computer (localhost).' });
        const url = new URL(req.url, 'http://127.0.0.1');
        const pathname = url.pathname;

        try {
          if (req.method === 'GET' && pathname === '/__admin/status') {
            return sendJson(res, 200, { localAdmin: true, storage: 'json-files', localOnly: true });
          }

          if (req.method === 'GET' && pathname.startsWith('/__admin/data/')) {
            const filename = decodeURIComponent(pathname.slice('/__admin/data/'.length));
            if (!DATA_FILES.has(filename)) return sendJson(res, 404, { error: 'Unknown data file.' });
            const source = await fs.readFile(path.join(DATA_DIR, filename), 'utf8');
            return sendJson(res, 200, { file: filename, data: JSON.parse(source) });
          }

          if (req.method === 'PUT' && pathname.startsWith('/__admin/data/')) {
            const filename = decodeURIComponent(pathname.slice('/__admin/data/'.length));
            const body = await readJsonBody(req, 8 * 1024 * 1024);
            await writeDataFile(filename, body.data);
            return sendJson(res, 200, { ok: true, file: filename, message: 'JSON file saved.' });
          }

          if (req.method === 'POST' && pathname === '/__admin/upload') {
            const body = await readJsonBody(req);
            const folder = String(body.folder || 'general');
            const mime = String(body.mime || '');
            if (!ALLOWED_MEDIA.has(mime)) return sendJson(res, 415, { error: 'Unsupported file type. Use JPG, PNG, WEBP, GIF, AVIF, PDF, MP4 or WEBM.' });
            if (folder === 'cv' && mime !== 'application/pdf') return sendJson(res, 415, { error: 'The CV folder accepts PDF files only.' });
            if (folder !== 'cv' && folder !== 'evidence' && !IMAGE_FOLDERS.has(folder)) return sendJson(res, 400, { error: 'Unknown upload folder.' });
            const data = String(body.base64 || '').replace(/^data:[^;]+;base64,/, '');
            const buffer = Buffer.from(data, 'base64');
            if (!buffer.length) return sendJson(res, 400, { error: 'The uploaded file is empty or invalid.' });
            if (buffer.length > MAX_UPLOAD_BYTES) return sendJson(res, 413, { error: 'The file exceeds the 35 MB limit.' });
            const expectedExtension = ALLOWED_MEDIA.get(mime);
            const inputName = path.basename(String(body.filename || 'upload'));
            const safeBase = slugifyFilename(path.parse(inputName).name).replace(/\.[^.]+$/, '');
            const filename = `${safeBase || 'upload'}-${Date.now().toString(36)}${expectedExtension}`;
            const relativeDirectory = folder === 'cv' ? 'cv' : folder === 'evidence' ? 'evidence' : path.join('images', folder);
            const destinationDirectory = path.join(PUBLIC_DIR, relativeDirectory);
            await fs.mkdir(destinationDirectory, { recursive: true });
            const destination = await ensureInside(PUBLIC_DIR, path.join(destinationDirectory, filename));
            await fs.writeFile(destination, buffer, { flag: 'wx' });
            const publicPath = `/${path.relative(PUBLIC_DIR, destination).split(path.sep).join('/')}`;
            return sendJson(res, 201, { ok: true, path: publicPath, name: filename, size: buffer.length, mime });
          }

          if (req.method === 'GET' && pathname === '/__admin/media') {
            const roots = ['images', 'cv', 'evidence'].map((directory) => path.join(PUBLIC_DIR, directory));
            const files = (await Promise.all(roots.map((root) => walkFiles(root)))).flat().sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
            return sendJson(res, 200, { files });
          }

          if (req.method === 'POST' && pathname === '/__admin/delete-media') {
            const body = await readJsonBody(req, 1024 * 1024);
            const publicPath = String(body.path || '');
            if (!publicPath.startsWith('/images/') && !publicPath.startsWith('/cv/') && !publicPath.startsWith('/evidence/')) return sendJson(res, 400, { error: 'Only files inside the portfolio media folders can be deleted.' });
            const destination = await ensureInside(PUBLIC_DIR, path.join(PUBLIC_DIR, publicPath.replace(/^\//, '')));
            const stat = await fs.stat(destination).catch(() => null);
            if (!stat?.isFile()) return sendJson(res, 404, { error: 'File not found.' });
            await fs.unlink(destination);
            return sendJson(res, 200, { ok: true, path: publicPath });
          }

          if (req.method === 'GET' && pathname === '/__admin/export') {
            const files = {};
            for (const filename of DATA_FILES) files[filename] = JSON.parse(await fs.readFile(path.join(DATA_DIR, filename), 'utf8'));
            return sendJson(res, 200, { format: 'dahoun-portfolio-json-backup', version: 1, exportedAt: new Date().toISOString(), files });
          }

          if (req.method === 'POST' && pathname === '/__admin/import') {
            const body = await readJsonBody(req, 12 * 1024 * 1024);
            if (!body.files || typeof body.files !== 'object') return sendJson(res, 400, { error: 'Backup format is invalid: files object is missing.' });
            for (const [filename, data] of Object.entries(body.files)) {
              if (!DATA_FILES.has(filename)) continue;
              await writeDataFile(filename, data);
            }
            return sendJson(res, 200, { ok: true, message: 'Backup imported.' });
          }

          return sendJson(res, 404, { error: 'Unknown admin API endpoint.' });
        } catch (error) {
          console.error('[portfolio-admin]', error);
          return sendJson(res, 400, { error: error.message || 'Admin request failed.' });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localPortfolioAdmin()],
  server: { host: '127.0.0.1', strictPort: false },
});
