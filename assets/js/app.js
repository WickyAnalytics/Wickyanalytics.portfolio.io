import * as D from "./data.js";
import * as R from "./render.js";
import { openLogin, openEditor, openInbox, toast } from "./admin.js";

const CFG = window.PORTFOLIO_CONFIG || {};
const $ = (s, r = document) => r.querySelector(s);
let state = { profile: null, items: [], source: "seed" };
const filt = { tag: "", cat: "", q: "", limit: 6 };
let requests = [];
const ctx = () => ({ admin: D.backendEnabled && D.isSignedIn() && state.source === "db", canReorder: true });

function ingest(rows, source) {
  const sorted = [...rows].sort((a, b) => a.sort_order - b.sort_order);
  state = { source, profile: sorted.find(r => r.kind === "profile") || null, items: sorted.filter(r => r.kind !== "profile") };
}
async function load() {
  if (D.backendEnabled) {
    try { const rows = await D.loadAll(); if (rows.length) return ingest(rows, "db"); state.source = "empty"; }
    catch (e) { console.warn("Backend unavailable, showing starter content.", e); }
  }
  const seed = await D.loadSeed(); let n = 0;
  ingest([{ id: "seed-p", kind: "profile", data: seed.profile, sort_order: -1, visible: true },
    ...seed.items.map(i => ({ ...i, id: "seed-" + n++, visible: true }))], D.backendEnabled ? "empty" : "seed");
}

function paint() {
  const c = ctx();
  document.body.classList.toggle("is-admin", c.admin);
  const set = (id, html) => { $(id).innerHTML = html; };
  const p = state.profile?.data || {};
  document.title = [p.name, p.title].filter(Boolean).join(" · ") || "Portfolio";
  set("#hero", R.renderHero(state, c)); set("#about", R.renderAbout(state, c)); set("#experience", R.renderExperience(state, c));
  set("#projects", R.renderProjectsShell(state, c)); set("#skills", R.renderSkills(state, c)); set("#services", R.renderServices(state, c));
  set("#contact", R.renderContact(state, c, CFG.formspreeId)); set("#footer", R.renderFooter(state));
  $(".brand").textContent = p.name || "Portfolio";
  const rs = $("#nav-cv"); if (rs) { rs.hidden = !p.resume_url; rs.href = R.safeUrl(p.resume_url) || "#"; }
  $("#proj-q").value = filt.q; paintTags(); paintGrid(); paintBar();
  if (c.admin) refreshRequests();
}
function paintTags() {
  const chips = (list, cur, attr) => ["", ...list].map(t => `<button class="${cur.toLowerCase() === t.toLowerCase() ? "on" : ""}" data-${attr}="${R.esc(t)}">${t ? R.esc(t) : "All"}</button>`).join("");
  $("#proj-cats").innerHTML = chips(R.projectCats(state), filt.cat, "cat");
  $("#proj-tags").innerHTML = chips(R.projectTags(state), filt.tag, "tag");
}
function paintGrid() {
  const g = R.renderProjectGrid(state, ctx(), { ...filt, limit: ctx().admin ? 9999 : filt.limit });
  $("#proj-grid").innerHTML = g.html; $("#proj-more").hidden = g.shown >= g.total;
}
function paintBar() {
  const bar = $("#admin-bar"), c = ctx();
  const needImport = D.backendEnabled && D.isSignedIn() && state.source === "empty";
  bar.hidden = !(c.admin || needImport);
  if (bar.hidden) { bar.innerHTML = ""; return; }
  bar.innerHTML = needImport
    ? `<span>Signed in as <b>${R.esc(D.getUser()?.email)}</b>. Your database is empty.</span><button class="btn primary sm" data-act="import">Import starter content</button><button class="btn ghost sm" data-act="logout">Sign out</button>`
    : `<span>✎ Editing mode · <b>${R.esc(D.getUser()?.email || "")}</b></span><button class="btn primary sm" data-act="inbox">Requests${newCount() ? ` <i class="count">${newCount()}</i>` : ""}</button><button class="btn ghost sm" data-act="logout">Sign out</button>`;
}
async function reload() { await load(); paint(); }
const newCount = () => requests.filter(r => r.status === "new").length;
async function refreshRequests() { try { requests = await D.loadRequests(); paintBar(); } catch (e) { console.warn("requests unavailable", e); } }

const rowsOf = (kind) => state.items.filter(r => r.kind === kind);
const findRow = (id) => state.items.find(r => r.id === id) || (state.profile?.id === id ? state.profile : null);
async function guard(fn) { try { await fn(); } catch (e) { toast(e.message || String(e), true); } }

async function act(a, el) {
  const id = el.closest("[data-id]")?.dataset.id;
  if (a === "inbox") return openInbox(requests, { onStatus: async (rid, s) => { await D.updateRequest(rid, { status: s }); paintBar(); }, onDelete: async (rid) => { await D.deleteRequest(rid); requests = requests.filter(r => r.id !== rid); paintBar(); } });
  if (a === "logout") { await D.signOut(); await reload(); return toast("Signed out"); }
  if (a === "import") return guard(async () => {
    const seed = await D.loadSeed();
    await D.bulkInsert([{ kind: "profile", data: seed.profile, sort_order: -1 }, ...seed.items.map(i => ({ kind: i.kind, data: i.data, sort_order: i.sort_order }))]);
    await reload(); toast("Starter content imported");
  });
  if (a === "edit-profile") { const r = state.profile; if (!r) return; const d = await openEditor("profile", r.data); if (d) await guard(async () => { await D.updateItem(r.id, { data: d }); await reload(); toast("Saved"); }); return; }
  if (a === "add") {
    const kind = el.dataset.kind, d = await openEditor(kind, kind === "project" ? { tech: [], images: [], links: [] } : {}, true); if (!d) return;
    return guard(async () => { const max = Math.max(-1, ...rowsOf(kind).map(r => r.sort_order)); await D.createItem(kind, d, max + 1); await reload(); toast("Added"); });
  }
  const row = findRow(id); if (!row) return;
  if (a === "edit") { const d = await openEditor(row.kind, row.data); if (d) await guard(async () => { await D.updateItem(row.id, { data: d }); await reload(); toast("Saved"); }); }
  if (a === "hide") await guard(async () => { await D.updateItem(row.id, { visible: !row.visible }); await reload(); toast(row.visible ? "Hidden from public" : "Now public"); });
  if (a === "del") { if (confirm(`Delete “${row.data.title || row.data.role || row.data.degree || row.data.name || "this item"}”? This cannot be undone.`)) await guard(async () => { await D.deleteItem(row.id); await reload(); toast("Deleted"); }); }
  if (a === "up" || a === "down") await guard(async () => {
    const list = rowsOf(row.kind), i = list.indexOf(row), j = a === "up" ? i - 1 : i + 1; if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    await Promise.all(list.map((r, n) => r.sort_order !== n ? D.updateItem(r.id, { sort_order: n }) : null)); await reload();
  });
}

function openProject(id) {
  const r = findRow(id); if (!r) return; const d = $("#proj-dialog");
  d.innerHTML = R.renderProjectModal(r); d.showModal();
}

document.addEventListener("click", (e) => {
  const t = e.target;
  const a = t.closest("[data-act]"); if (a) { e.stopPropagation(); return void act(a.dataset.act, a); }
  const tag = t.closest("[data-tag]"); if (tag) { filt.tag = tag.dataset.tag; filt.limit = 6; paintTags(); return paintGrid(); }
  const cat = t.closest("[data-cat]"); if (cat) { filt.cat = cat.dataset.cat; filt.limit = 6; paintTags(); return paintGrid(); }
  const rq = t.closest("[data-request]"); if (rq) { const sel = $("#req-form [name=service]"); [...sel.options].forEach(o => { if (o.value === rq.dataset.request || o.text === rq.dataset.request) sel.value = o.value; }); $("#contact").scrollIntoView({ behavior: "smooth" }); return setTimeout(() => $("#req-form [name=name]").focus({ preventScroll: true }), 600); }
  if (t.closest("#proj-more")) { filt.limit += 6; return paintGrid(); }
  const card = t.closest("[data-open]"); if (card && !t.closest(".adm")) return openProject(card.dataset.open);
  const th = t.closest("[data-thumb]"); if (th) { $("#gal-main").src = th.dataset.thumb; th.parentNode.querySelectorAll("button").forEach(b => b.classList.toggle("on", b === th)); return; }
  if (t.closest("[data-close]") || t === $("#proj-dialog")) return $("#proj-dialog").close();
  if (t.closest("#admin-link")) { e.preventDefault(); return void startLogin(); }
  if (t.closest("#menu-btn")) { document.body.classList.toggle("nav-open"); return; }
  if (t.closest(".nav a")) document.body.classList.remove("nav-open");
});
document.addEventListener("input", (e) => { if (e.target.id === "proj-q") { filt.q = e.target.value; filt.limit = 6; paintGrid(); } });
document.addEventListener("keydown", (e) => { const c = e.target.closest?.("[data-open]"); if (c && (e.key === "Enter" || e.key === " ") && e.target === c) { e.preventDefault(); openProject(c.dataset.open); } });

async function startLogin() {
  if (!D.backendEnabled) return toast("Admin isn’t configured yet — fill in assets/js/config.js (see SETUP.md).", true);
  if (D.isSignedIn()) return toast("Already signed in");
  const u = await openLogin(); if (u) { await reload(); toast("Signed in"); }
}
window.addEventListener("scroll", () => $("header.top").classList.toggle("scrolled", scrollY > 20), { passive: true });
const wantLogin = location.hash === "#admin" || new URLSearchParams(location.search).has("admin");
if (location.hash === "#admin") history.replaceState(null, "", location.pathname);

load().then(() => { paint(); document.body.classList.add("ready"); if (wantLogin) startLogin(); });

// ── service-request form ──
document.addEventListener("submit", async (e) => {
  const f = e.target.closest("#req-form"); if (!f) return; e.preventDefault();
  const msg = $("#req-msg"), btn = f.querySelector("[type=submit]"), say = (t, ok) => { msg.textContent = t; msg.className = "err" + (ok ? " ok" : ""); };
  if (f.website.value) return say("Thanks!", true);                       // honeypot: bots fill this
  if (!f.checkValidity()) { f.reportValidity(); return; }
  let last = 0; try { last = +localStorage.getItem("pf_last_req") || 0; } catch {}
  if (Date.now() - last < 30000) return say("Please wait a few seconds before sending another request.");
  const v = Object.fromEntries(new FormData(f)); delete v.website;
  btn.disabled = true; btn.textContent = "Sending…"; say("");
  const jobs = [];
  if (D.backendEnabled) jobs.push(D.submitRequest({ name: v.name, email: v.email, phone: v.phone || null, service: v.service, category: v.category || null, budget: v.budget || null, timeline: v.timeline || null, tools: v.tools || null, message: v.message }));
  if (f.dataset.fs) jobs.push(fetch("https://formspree.io/f/" + f.dataset.fs, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(v) }).then(r => { if (!r.ok) throw new Error("mail"); }));
  const res = await Promise.allSettled(jobs);
  if (res.some(r => r.status === "fulfilled")) { try { localStorage.setItem("pf_last_req", Date.now()); } catch {} f.reset(); say("Thank you! Your request was sent — I’ll reply by email soon.", true); }
  else say("Sorry, that didn’t go through. Please email me directly" + (state.profile?.data.email ? ` at ${state.profile.data.email}.` : "."));
  btn.disabled = false; btn.textContent = "Send request";
});
