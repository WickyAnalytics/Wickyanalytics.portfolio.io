// Data layer: talks to Supabase over plain fetch (no SDK, no build step).
const C = window.PORTFOLIO_CONFIG || {};
export const backendEnabled = !!(C.supabaseUrl && C.supabaseAnonKey);
const BASE = (C.supabaseUrl || "").replace(/\/$/, "");
const SKEY = "pf_session";

let session = null;
try { session = JSON.parse(localStorage.getItem(SKEY) || "null"); } catch {}
const save = (s) => { session = s; try { s ? localStorage.setItem(SKEY, JSON.stringify(s)) : localStorage.removeItem(SKEY); } catch {} };

export const getUser = () => session?.user || null;
export const isSignedIn = () => !!session;

async function refreshIfNeeded() {
  if (!session) return;
  if (session.expires_at - 60 > Date.now() / 1000) return;
  const r = await fetch(`${BASE}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST", headers: { apikey: C.supabaseAnonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: session.refresh_token }) });
  if (!r.ok) { save(null); return; }
  save(toSession(await r.json()));
}
const toSession = (j) => ({ access_token: j.access_token, refresh_token: j.refresh_token,
  expires_at: j.expires_at || Math.floor(Date.now() / 1000) + (j.expires_in || 3600), user: j.user });

// New-style "sb_publishable_…" keys are not JWTs, so they must not be sent as a Bearer token.
const bearer = () => { const t = session?.access_token || (C.supabaseAnonKey.startsWith("sb_") ? "" : C.supabaseAnonKey); return t ? { Authorization: `Bearer ${t}` } : {}; };

async function api(path, { method = "GET", body, headers = {}, raw } = {}) {
  await refreshIfNeeded();
  const r = await fetch(BASE + path, { method, body: raw ? body : body ? JSON.stringify(body) : undefined,
    headers: { apikey: C.supabaseAnonKey, ...bearer(),
      ...(raw ? {} : { "Content-Type": "application/json" }), ...headers } });
  if (!r.ok) {
    let msg = r.statusText; try { const j = await r.json(); msg = j.message || j.msg || j.error_description || msg; } catch {}
    throw new Error(msg);
  }
  return r.status === 204 ? null : r.json().catch(() => null);
}

export async function signIn(email, password) {
  const r = await fetch(`${BASE}/auth/v1/token?grant_type=password`, { method: "POST",
    headers: { apikey: C.supabaseAnonKey, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error_description || j.msg || "Sign-in failed");
  save(toSession(j)); return session.user;
}
export async function signOut() {
  try { if (session) await api("/auth/v1/logout", { method: "POST" }); } catch {}
  save(null);
}

export async function loadAll() {
  const rows = await api("/rest/v1/items?select=*&order=sort_order.asc,created_at.asc");
  return rows || [];
}
export const createItem = (kind, data, sort_order = 0, visible = true) =>
  api("/rest/v1/items", { method: "POST", headers: { Prefer: "return=representation" }, body: { kind, data, sort_order, visible } }).then(r => r[0]);
export const updateItem = (id, patch) =>
  api(`/rest/v1/items?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: patch }).then(r => r[0]);
export const deleteItem = (id) => api(`/rest/v1/items?id=eq.${id}`, { method: "DELETE" });
export const bulkInsert = (rows) => api("/rest/v1/items", { method: "POST", body: rows });

// Service requests from the contact form. Anyone may INSERT; only the admin can read/change them.
export const submitRequest = (row) => api("/rest/v1/requests", { method: "POST", headers: { Prefer: "return=minimal" }, body: row });
export const loadRequests = () => api("/rest/v1/requests?select=*&order=created_at.desc");
export const updateRequest = (id, patch) => api(`/rest/v1/requests?id=eq.${id}`, { method: "PATCH", body: patch });
export const deleteRequest = (id) => api(`/rest/v1/requests?id=eq.${id}`, { method: "DELETE" });

// Resize big images in the browser before upload, so pages stay fast.
async function shrink(file, max = 1600) {
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return file;
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  if (k === 1 && file.size < 400_000) return file;
  const cv = document.createElement("canvas"); cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
  cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
  const type = file.type === "image/png" ? "image/png" : "image/webp";
  const blob = await new Promise(res => cv.toBlob(res, type, 0.88));
  return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, type === "image/png" ? ".png" : ".webp"), { type }) : file;
}
export async function uploadFile(file) {
  const f = file.type.startsWith("image/") ? await shrink(file) : file;
  const clean = f.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const path = `uploads/${Date.now()}-${clean}`;
  await api(`/storage/v1/object/${C.bucket || "portfolio"}/${path}`, { method: "POST", raw: true, body: f,
    headers: { "Content-Type": f.type || "application/octet-stream", "x-upsert": "false" } });
  return `${BASE}/storage/v1/object/public/${C.bucket || "portfolio"}/${path}`;
}

export async function loadSeed() {
  const r = await fetch("assets/data/seed.json"); return r.json();
}
