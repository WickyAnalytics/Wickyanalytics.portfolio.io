// Admin UI: sign-in dialog and the schema-driven editor dialog.
import { SCHEMA } from "./schema.js";
import { uploadFile, signIn } from "./data.js";
import { esc } from "./render.js";

export function toast(msg, bad = false) {
  const t = document.createElement("div"); t.className = "toast" + (bad ? " bad" : ""); t.textContent = msg; t.setAttribute("role", "status");
  document.body.appendChild(t); setTimeout(() => t.remove(), bad ? 6000 : 2800);
}

export function openLogin() {
  return new Promise(resolve => {
    const d = document.getElementById("login-dialog");
    d.innerHTML = `<form class="dlg-form" method="dialog"><h3>Admin sign-in</h3>
      <label>Email<input type="email" name="email" required autocomplete="username"></label>
      <label>Password<input type="password" name="password" required autocomplete="current-password"></label>
      <p class="err" id="login-err" role="alert"></p>
      <div class="row"><button type="button" class="btn ghost" data-cancel>Cancel</button><button class="btn primary" type="submit">Sign in</button></div></form>`;
    const f = d.querySelector("form"); let done = false;
    const finish = (v) => { if (done) return; done = true; d.close(); resolve(v); };
    d.querySelector("[data-cancel]").onclick = () => finish(null);
    d.addEventListener("close", () => finish(null), { once: true });
    f.onsubmit = async (e) => { e.preventDefault(); const b = f.querySelector("[type=submit]"); b.disabled = true; b.textContent = "Signing in…";
      try { finish(await signIn(f.email.value.trim(), f.password.value)); }
      catch (err) { d.querySelector("#login-err").textContent = err.message; b.disabled = false; b.textContent = "Sign in"; } };
    d.showModal(); f.email.focus();
  });
}

const fld = (f, v) => {
  const id = "f_" + f.k, L = (inner) => `<div class="field" data-k="${f.k}" data-type="${f.type}"><label for="${id}">${esc(f.label)}</label>${inner}</div>`;
  switch (f.type) {
    case "textarea": return L(`<textarea id="${id}" rows="${f.rows || 3}">${esc(v || "")}</textarea>`);
    case "lines": return L(`<textarea id="${id}" rows="${f.rows || 4}">${esc((v || []).join("\n"))}</textarea>`);
    case "tags": return L(`<input id="${id}" value="${esc((v || []).join(", "))}">`);
    case "bool": return `<div class="field check" data-k="${f.k}" data-type="bool"><label><input type="checkbox" ${v ? "checked" : ""}> ${esc(f.label)}</label></div>`;
    case "image": case "file": return L(`<div class="up"><input id="${id}" value="${esc(v || "")}" placeholder="Paste a link, or upload →">
        <label class="btn ghost sm">Upload<input type="file" hidden accept="${f.type === "file" ? "application/pdf,image/*" : "image/*"}"></label></div>
        ${f.type === "image" ? `<img class="prev" src="${esc(v || "")}" alt="" ${v ? "" : "hidden"}>` : ""}<small class="st"></small>`);
    case "images": return L(`<div class="imgs">${(v || []).map(u => imgRow(u)).join("")}</div>
        <div class="up"><button type="button" class="btn ghost sm" data-addurl>+ Add by link</button>
        <label class="btn ghost sm">Upload images<input type="file" hidden multiple accept="image/*"></label></div><small class="st"></small>`);
    case "links": return L(`<div class="lnks">${(v || []).map(l => linkRow(l)).join("")}</div><button type="button" class="btn ghost sm" data-addlink>+ Add link</button>`);
    default: return L(`<input id="${id}" value="${esc(v || "")}" ${f.req ? "required" : ""}>`);
  }
};
const imgRow = (u = "") => `<div class="irow"><img src="${esc(u)}" alt=""><input value="${esc(u)}" placeholder="Image URL">
  <button type="button" data-l title="Move earlier">←</button><button type="button" data-r title="Move later">→</button><button type="button" data-x title="Remove">×</button></div>`;
const linkRow = (l = {}) => `<div class="lrow"><input placeholder="Label (e.g. GitHub)" value="${esc(l.label || "")}"><input placeholder="https://…" value="${esc(l.url || "")}"><button type="button" data-x title="Remove">×</button></div>`;

export function openEditor(kind, data = {}, isNew = false) {
  const S = SCHEMA[kind];
  return new Promise(resolve => {
    const d = document.getElementById("editor-dialog");
    d.innerHTML = `<form class="dlg-form editor" method="dialog"><div class="ed-head"><h3>${isNew ? "Add" : "Edit"} ${esc(S.label.toLowerCase())}</h3><button type="button" class="x" data-cancel aria-label="Close">×</button></div>
      <div class="ed-body">${S.fields.map(f => fld(f, data[f.k])).join("")}</div>
      <p class="err" id="ed-err" role="alert"></p>
      <div class="row"><button type="button" class="btn ghost" data-cancel>Cancel</button><button class="btn primary" type="submit">Save</button></div></form>`;
    const f = d.querySelector("form"); let done = false;
    const finish = (v) => { if (done) return; done = true; d.close(); resolve(v); };
    d.addEventListener("close", () => finish(null), { once: true });
    const busy = (el, on) => { const s = el.closest(".field").querySelector(".st"); if (s) s.textContent = on ? "Uploading…" : ""; };

    f.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.hasAttribute("data-cancel")) return finish(null);
      const row = b.closest(".irow, .lrow");
      if (b.hasAttribute("data-x") && row) row.remove();
      if (b.hasAttribute("data-l") && row?.previousElementSibling) row.parentNode.insertBefore(row, row.previousElementSibling);
      if (b.hasAttribute("data-r") && row?.nextElementSibling) row.parentNode.insertBefore(row.nextElementSibling, row);
      if (b.hasAttribute("data-addurl")) { b.closest(".field").querySelector(".imgs").insertAdjacentHTML("beforeend", imgRow("")); }
      if (b.hasAttribute("data-addlink")) { b.closest(".field").querySelector(".lnks").insertAdjacentHTML("beforeend", linkRow()); }
    });
    f.addEventListener("input", (e) => { const r = e.target.closest(".irow"); if (r) r.querySelector("img").src = e.target.value;
      const fd = e.target.closest('.field[data-type="image"]'); if (fd) { const p = fd.querySelector(".prev"); p.src = e.target.value; p.hidden = !e.target.value; } });
    f.addEventListener("change", async (e) => {
      const inp = e.target; if (inp.type !== "file" || !inp.files.length) return;
      const field = inp.closest(".field"), type = field.dataset.type; busy(inp, true);
      try {
        const urls = []; for (const file of inp.files) urls.push(await uploadFile(file));
        if (type === "images") urls.forEach(u => field.querySelector(".imgs").insertAdjacentHTML("beforeend", imgRow(u)));
        else { const t = field.querySelector(".up > input"); t.value = urls[0]; t.dispatchEvent(new Event("input", { bubbles: true })); }
      } catch (err) { toast("Upload failed: " + err.message, true); }
      inp.value = ""; busy(inp, false);
    });

    f.onsubmit = (e) => {
      e.preventDefault(); const out = {};
      for (const fd of f.querySelectorAll(".field")) {
        const k = fd.dataset.k, t = fd.dataset.type, first = fd.querySelector("input,textarea");
        if (t === "bool") out[k] = fd.querySelector("input").checked;
        else if (t === "lines") out[k] = first.value.split("\n").map(s => s.trim()).filter(Boolean);
        else if (t === "tags") out[k] = first.value.split(",").map(s => s.trim()).filter(Boolean);
        else if (t === "images") out[k] = [...fd.querySelectorAll(".irow input")].map(i => i.value.trim()).filter(Boolean);
        else if (t === "links") out[k] = [...fd.querySelectorAll(".lrow")].map(r => { const [a, b] = r.querySelectorAll("input"); return { label: a.value.trim(), url: b.value.trim() }; }).filter(l => l.url);
        else out[k] = first.value.trim();
      }
      finish({ ...data, ...out });
    };
    d.showModal();
  });
}

// Inbox: service requests sent through the contact form.
export function openInbox(list, { onStatus, onDelete }) {
  const d = document.getElementById("inbox-dialog");
  const when = (t) => new Date(t).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  const draw = () => {
    d.innerHTML = `<div class="dlg-form editor inbox"><div class="ed-head"><h3>Requests (${list.length})</h3><button class="x" data-cancel aria-label="Close">×</button></div>
      <div class="ed-body">${list.length ? list.map(r => `<article class="req st-${esc(r.status)}" data-id="${r.id}">
        <div class="req-top"><b>${esc(r.name)}</b><span class="muted">${esc(when(r.created_at))}</span>
          <select data-status>${["new", "in progress", "done"].map(s => `<option ${r.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></div>
        <p class="req-meta">${[r.service, r.category, r.budget, r.timeline].filter(Boolean).map(x => `<span>${esc(x)}</span>`).join("")}</p>
        <p class="req-msg">${esc(r.message)}</p>
        ${r.tools ? `<p class="muted">Tools/data: ${esc(r.tools)}</p>` : ""}
        <p class="req-act"><a class="btn primary sm" href="mailto:${esc(r.email)}?subject=${encodeURIComponent("Re: " + (r.service || "your request"))}">Reply by email</a>
          ${r.phone ? `<a class="btn ghost sm" href="tel:${esc(r.phone)}">${esc(r.phone)}</a>` : ""}<button class="btn ghost sm danger-b" data-del>Delete</button></p></article>`).join("") : `<p class="muted">No requests yet. They’ll appear here when someone uses the form.</p>`}</div></div>`;
  };
  draw();
  d.onclick = async (e) => {
    if (e.target.closest("[data-cancel]") || e.target === d) return d.close();
    const del = e.target.closest("[data-del]"); if (!del) return;
    const id = del.closest(".req").dataset.id; if (!confirm("Delete this request?")) return;
    try { await onDelete(id); list.splice(list.findIndex(r => r.id === id), 1); draw(); } catch (err) { toast(err.message, true); }
  };
  d.onchange = async (e) => {
    if (!e.target.matches("[data-status]")) return; const art = e.target.closest(".req"), r = list.find(x => x.id === art.dataset.id);
    try { await onStatus(r.id, e.target.value); r.status = e.target.value; art.className = "req st-" + r.status; } catch (err) { toast(err.message, true); }
  };
  d.showModal();
}
