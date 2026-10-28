// Pure rendering: state -> HTML. All user content is escaped.
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const safeUrl = (u) => { u = String(u || "").trim(); if (!u) return ""; if (/^(https?:|mailto:|tel:)/i.test(u)) return u; if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return ""; return encodeURI(decodeURI(u)); };
const src = (u) => safeUrl(u);

const IC = {
  linkedin: '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3zM9.5 9.75h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.58V21h-4z"/>',
  github: '<path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z"/>',
  mail: '<path d="M2 5h20v14H2zM2.5 5.5 12 13l9.5-7.5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  pdf: '<path d="M6 2h8l5 5v15H6zM14 2v5h5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  pin: '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  phone: '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
};
export const telHref = (n) => { const d = String(n || "").replace(/[^\d+]/g, ""); return "tel:" + (/^0\d{10}$/.test(d) ? "+20" + d.slice(1) : d); };
export const icon = (n, s = 20) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${IC[n]}</svg>`;

// ── admin helpers ──
const tools = (row, ctx, first, last) => !ctx.admin ? "" : `
  <div class="adm adm-tools" data-id="${row.id}">
    ${ctx.canReorder ? `<button data-act="up" title="Move up" ${first ? "disabled" : ""}>↑</button><button data-act="down" title="Move down" ${last ? "disabled" : ""}>↓</button>` : ""}
    <button data-act="hide" title="${row.visible ? "Hide from public" : "Show publicly"}">${row.visible ? "Hide" : "Show"}</button>
    <button data-act="edit">Edit</button>
    <button data-act="del" class="danger">Delete</button>
  </div>`;
const hiddenBadge = (row) => row.visible ? "" : `<span class="badge-hidden">Hidden</span>`;
const addBtn = (kind, label, ctx) => ctx.admin ? `<button class="adm adm-add" data-act="add" data-kind="${kind}">+ ${label}</button>` : "";
const head = (eyebrow, title, extra = "") => `<div class="sec-head"><div><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2></div>${extra}</div>`;
const by = (st, kind) => st.items.filter(r => r.kind === kind);

export function renderHero(st, ctx) {
  const p = st.profile?.data || {}; const first = (p.name || "").split(" ")[0] || "there";
  return `<div class="wrap hero-grid">
    <div class="hero-copy">
      ${p.status ? `<span class="pill"><i></i>${esc(p.status)}</span>` : ""}
      <h1>Hi, I’m <span class="hl">${esc(first)}.</span></h1>
      <p class="role">${esc(p.title)}</p>
      <p class="lead">${esc(p.tagline)}</p>
      <div class="cta">
        <a class="btn primary" href="#projects">View my projects</a>
        <a class="btn ghost" href="#contact">Request a service</a>
        ${p.resume_url ? `<a class="btn ghost" href="${src(p.resume_url)}" target="_blank" rel="noopener">${icon("pdf", 18)} Download CV</a>` : ""}
      </div>
      <div class="social">
        ${p.linkedin ? `<a href="${src(p.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn">${icon("linkedin", 22)}</a>` : ""}
        ${p.github ? `<a href="${src(p.github)}" target="_blank" rel="noopener" aria-label="GitHub">${icon("github", 22)}</a>` : ""}
        ${p.email ? `<a href="mailto:${esc(p.email)}" aria-label="Email">${icon("mail", 22)}</a>` : ""}
        ${p.phone ? `<a href="${telHref(p.phone)}" aria-label="Phone">${icon("phone", 20)}</a>` : ""}
        ${p.location ? `<span class="loc">${icon("pin", 16)} ${esc(p.location)}</span>` : ""}
      </div>
      ${ctx.admin ? `<button class="adm adm-add" data-act="edit-profile">✎ Edit profile</button>` : ""}
    </div>
    <div class="hero-photo">${p.hero_image ? `<img src="${src(p.hero_image)}" alt="" width="440" height="440">` : ""}</div>
  </div>`;
}

export function renderAbout(st, ctx) {
  const p = st.profile?.data || {}; const edu = by(st, "education"), certs = by(st, "certification");
  return `<div class="wrap">
    ${head("About", "A bit about me")}
    <div class="about-grid">
      <div class="about-main">${p.about_image ? `<img class="about-img" src="${src(p.about_image)}" alt="${esc(p.name)}" loading="lazy">` : ""}<p class="about-text">${esc(p.about)}</p></div>
      <div class="stack">
        <div class="card">
          <div class="card-h"><h3>Education</h3>${addBtn("education", "Add", ctx)}</div>
          ${edu.map((r, i) => `<div class="mini ${r.visible ? "" : "is-hidden"}"><b>${esc(r.data.degree)}</b> ${hiddenBadge(r)}
            <span class="muted">${esc([r.data.school, r.data.period].filter(Boolean).join(" · "))}</span>
            ${(r.data.details || []).map(d => `<span class="sub">${esc(d)}</span>`).join("")}${tools(r, ctx, i === 0, i === edu.length - 1)}</div>`).join("")}
        </div>
        <div class="card">
          <div class="card-h"><h3>Certifications</h3>${addBtn("certification", "Add", ctx)}</div>
          ${certs.map((r, i) => { const u = safeUrl(r.data.url); return `<div class="mini ${r.visible ? "" : "is-hidden"}">
            <b>${u ? `<a href="${u}" target="_blank" rel="noopener">${esc(r.data.title)}</a>` : esc(r.data.title)}</b> ${hiddenBadge(r)}
            <span class="muted">${esc([r.data.issuer, r.data.year].filter(Boolean).join(" · "))}</span>${tools(r, ctx, i === 0, i === certs.length - 1)}</div>`; }).join("")}
        </div>
      </div>
    </div></div>`;
}

export function renderExperience(st, ctx) {
  const xs = by(st, "experience");
  return `<div class="wrap">${head("Experience", "Where I’ve worked", addBtn("experience", "Add experience", ctx))}
    <ol class="timeline">${xs.map((r, i) => { const d = r.data; return `
      <li class="${r.visible ? "" : "is-hidden"}"><span class="dot"></span>
        <div class="t-card"><div class="t-top"><div><h3>${esc(d.role)} <span class="at">@ ${esc(d.company)}</span> ${hiddenBadge(r)}</h3>
          <span class="muted">${esc(d.location)}</span></div><span class="when">${esc([d.start, d.end].filter(Boolean).join(" – "))}</span></div>
          <ul>${(d.bullets || []).map(b => `<li>${esc(b)}</li>`).join("")}</ul>${tools(r, ctx, i === 0, i === xs.length - 1)}</div></li>`; }).join("")}</ol></div>`;
}

export function renderProjectsShell(st, ctx) {
  return `<div class="wrap">${head("Portfolio", "Selected projects", addBtn("project", "Add project", ctx))}
    <div class="filters"><input id="proj-q" type="search" placeholder="Search projects…" aria-label="Search projects">
      <div class="facet"><span>Category</span><div id="proj-cats" class="tags"></div></div>
      <div class="facet"><span>Technology</span><div id="proj-tags" class="tags"></div></div></div>
    <div id="proj-grid" class="proj-grid"></div><div class="more"><button id="proj-more" class="btn ghost" hidden>Show more</button></div></div>`;
}
const facet = (st, key) => { const m = new Map(); by(st, "project").forEach(r => (r.data[key] || []).forEach(t => m.set(t.toLowerCase(), t))); return [...m.values()].sort((a, b) => a.localeCompare(b)); };
export const projectTags = (st) => facet(st, "tech");
export const projectCats = (st) => facet(st, "category");
const has = (arr, v) => (arr || []).some(t => t.toLowerCase() === v.toLowerCase());
export function renderProjectGrid(st, ctx, { tag, cat, q, limit }) {
  const all = by(st, "project"); const ql = (q || "").toLowerCase();
  const list = all.filter(r => (!tag || has(r.data.tech, tag)) && (!cat || has(r.data.category, cat)) &&
    (!ql || JSON.stringify([r.data.title, r.data.summary, r.data.tech, r.data.category, r.data.impact]).toLowerCase().includes(ql)));
  const shown = list.slice(0, limit);
  const html = shown.map(r => { const d = r.data, cover = (d.images || [])[0]; const idx = all.indexOf(r);
    return `<article class="proj ${r.visible ? "" : "is-hidden"}" data-open="${r.id}" tabindex="0" role="button" aria-label="Open ${esc(d.title)}">
      <div class="shot">${cover ? `<img loading="lazy" src="${src(cover)}" alt="${esc(d.title)} screenshot">` : `<div class="noshot">No image</div>`}
        ${d.featured ? `<span class="badge-feat">Featured</span>` : ""}${(d.images || []).length > 1 ? `<span class="badge-n">${d.images.length} images</span>` : ""}</div>
      <div class="body">${(d.category || []).length ? `<span class="cat">${esc(d.category.join(" · "))}</span>` : ""}<h3>${esc(d.title)} ${hiddenBadge(r)}</h3>
        ${d.impact ? `<p class="impact">${esc(d.impact)}</p>` : ""}
        <p class="sum">${esc(d.summary)}</p>
        <div class="chips">${(d.tech || []).map(t => `<span>${esc(t)}</span>`).join("")}</div></div>
      ${tools(r, { ...ctx, canReorder: ctx.canReorder && !tag && !cat && !q }, idx === 0, idx === all.length - 1)}</article>`; }).join("");
  return { html: html || `<p class="muted empty">No projects match.</p>`, total: list.length, shown: shown.length };
}
export function renderProjectModal(r) {
  const d = r.data, imgs = d.images || [];
  return `<div class="modal-body"><button class="x" data-close aria-label="Close">×</button>
    ${imgs.length ? `<div class="gal"><img id="gal-main" src="${src(imgs[0])}" alt="${esc(d.title)}">${imgs.length > 1 ? `<div class="thumbs">${imgs.map((u, i) => `<button data-thumb="${src(u)}" class="${i ? "" : "on"}"><img src="${src(u)}" alt="Screenshot ${i + 1}" loading="lazy"></button>`).join("")}</div>` : ""}</div>` : ""}
    <div class="info">${(d.category || []).length ? `<span class="cat">${esc(d.category.join(" · "))}</span>` : ""}<h3>${esc(d.title)}</h3>${d.impact ? `<p class="impact">${esc(d.impact)}</p>` : ""}
      <p>${esc(d.summary)}</p><div class="chips">${(d.tech || []).map(t => `<span>${esc(t)}</span>`).join("")}</div>
      <div class="links">${(d.links || []).filter(l => safeUrl(l.url)).map(l => `<a class="btn ghost sm" href="${safeUrl(l.url)}" target="_blank" rel="noopener">${esc(l.label || "Link")} ${icon("ext", 14)}</a>`).join("")}</div></div></div>`;
}

export function renderSkills(st, ctx) {
  const sk = by(st, "skill"); const cats = [...new Set(sk.map(r => r.data.category))];
  return `<div class="wrap">${head("Skills & tools", "What I work with", addBtn("skill", "Add skill", ctx))}
    <div class="skill-grid">${cats.map(c => `<div class="card"><h3>${esc(c)}</h3><div class="skill-list">
      ${sk.filter(r => r.data.category === c).map(r => { const i = sk.indexOf(r); return `<div class="skill ${r.visible ? "" : "is-hidden"}">${r.data.icon ? `<img src="${src(r.data.icon)}" alt="" loading="lazy">` : ""}<span>${esc(r.data.name)}</span>${tools(r, ctx, i === 0, i === sk.length - 1)}</div>`; }).join("")}
    </div></div>`).join("")}</div></div>`;
}

export function renderServices(st, ctx) {
  const sv = by(st, "service");
  return `<div class="wrap">${head("Services", "How I can help", addBtn("service", "Add service", ctx))}
    <div class="svc-grid">${sv.map((r, i) => `<div class="card svc ${r.visible ? "" : "is-hidden"}"><h3>${esc(r.data.title)} ${hiddenBadge(r)}</h3><p>${esc(r.data.description)}</p><button class="link-btn" data-request="${esc(r.data.title)}">Request this service →</button>${tools(r, ctx, i === 0, i === sv.length - 1)}</div>`).join("")}</div></div>`;
}

export function renderContact(st, ctx, formspreeId) {
  const p = st.profile?.data || {}, svc = by(st, "service").filter(r => r.visible).map(r => r.data.title), cats = projectCats(st);
  const opt = (arr) => arr.map(o => `<option>${esc(o)}</option>`).join("");
  return `<div class="wrap">${head("Contact", "Request a service or say hello")}
    <div class="contact-grid"><div class="contact-info">
      <p class="lead">Tell me what you need — a dashboard, a report, a data clean-up, a financial analysis, or a role you’d like to discuss. I’ll reply by email.</p>
      <ul class="reach">
        ${p.email ? `<li>${icon("mail", 18)}<a href="mailto:${esc(p.email)}">${esc(p.email)}</a></li>` : ""}
        ${p.phone ? `<li>${icon("phone", 18)}<a href="${telHref(p.phone)}">${esc(p.phone)}</a></li>` : ""}
        ${p.location ? `<li>${icon("pin", 18)}<span>${esc(p.location)}</span></li>` : ""}
        ${p.linkedin ? `<li>${icon("linkedin", 18)}<a href="${src(p.linkedin)}" target="_blank" rel="noopener">LinkedIn</a></li>` : ""}
      </ul>
      <ol class="how"><li><b>Send your request</b> with a few details.</li><li><b>I review it</b> and get back to you by email.</li><li><b>We agree scope</b> and timeline, then I deliver.</li></ol>
    </div>
    <form id="req-form" class="card form" data-fs="${esc(formspreeId)}" novalidate>
      <div class="two"><label>Your name *<input name="name" required maxlength="120" autocomplete="name"></label>
      <label>Email *<input type="email" name="email" required maxlength="160" autocomplete="email"></label></div>
      <div class="two"><label>Phone / WhatsApp (optional)<input name="phone" maxlength="40" autocomplete="tel"></label>
      <label>I’m looking for *<select name="service" required><option value="" disabled selected>Choose…</option>${opt(svc)}<option>Job opportunity</option><option>General inquiry</option></select></label></div>
      <div class="two"><label>Industry / category<select name="category"><option value="">Not sure</option>${opt(cats)}<option>Other</option></select></label>
      <label>Timeline<select name="timeline"><option value="">Flexible</option><option>ASAP</option><option>Within 2 weeks</option><option>Within a month</option></select></label></div>
      <div class="two"><label>Budget<select name="budget"><option value="">Not sure yet</option><option>Under $100</option><option>$100 – $500</option><option>$500 – $1,500</option><option>$1,500+</option></select></label>
      <label>Tools / data you have (optional)<input name="tools" maxlength="200" placeholder="e.g. Excel files, SQL Server"></label></div>
      <label>Tell me about it *<textarea name="message" rows="5" required maxlength="5000" placeholder="What do you need, and what would a good result look like?"></textarea></label>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <p class="err" id="req-msg" role="status"></p>
      <button class="btn primary" type="submit">Send request</button></form></div></div>`;
}

export function renderFooter(st) {
  const p = st.profile?.data || {};
  return `<div class="wrap foot"><span>© ${new Date().getFullYear()} ${esc(p.name)}</span>
    <span class="links">${p.github ? `<a href="${src(p.github)}" target="_blank" rel="noopener">GitHub</a>` : ""}${p.linkedin ? `<a href="${src(p.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ""}
    <a href="#admin" id="admin-link" class="quiet">Admin</a></span></div>`;
}
