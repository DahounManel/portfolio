export async function adminRequest(path, options = {}) {
  const response = await fetch(`/__admin/${path}`, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}

export async function loadDataFile(file) {
  const result = await adminRequest(`data/${encodeURIComponent(file)}`);
  return result.data;
}

export async function saveDataFile(file, data) {
  return adminRequest(`data/${encodeURIComponent(file)}`, { method: 'PUT', body: JSON.stringify({ data }) });
}

export async function uploadMedia(file, folder = 'general') {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  const base64 = btoa(binary);
  return adminRequest('upload', {
    method: 'POST',
    body: JSON.stringify({ filename: file.name, mime: file.type, base64, folder }),
  });
}

export async function fetchMedia() {
  const result = await adminRequest('media');
  return result.files || [];
}

export async function deleteMedia(path) {
  return adminRequest('delete-media', { method: 'POST', body: JSON.stringify({ path }) });
}

export async function exportAllData() {
  return adminRequest('export');
}

export async function importAllData(bundle) {
  return adminRequest('import', { method: 'POST', body: JSON.stringify(bundle) });
}
