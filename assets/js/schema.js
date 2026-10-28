// Describes every editable section. The admin forms are generated from this,
// so adding a field (or a whole new section) is a few lines here.
// Field types: text | textarea | tags | lines | image | images | links | bool
export const SCHEMA = {
  profile: { label: "Profile", single: true, fields: [
    { k: "name", label: "Full name", type: "text" },
    { k: "title", label: "Job title", type: "text" },
    { k: "status", label: "Status badge (e.g. Open to opportunities)", type: "text" },
    { k: "tagline", label: "Hero tagline", type: "textarea" },
    { k: "about", label: "About me", type: "textarea", rows: 7 },
    { k: "hero_image", label: "Hero illustration (top of page)", type: "image" },
    { k: "about_image", label: "Your photo (About section)", type: "image" },
    { k: "email", label: "Email", type: "text" },
    { k: "phone", label: "Phone / WhatsApp", type: "text" },
    { k: "location", label: "Location", type: "text" },
    { k: "linkedin", label: "LinkedIn URL", type: "text" },
    { k: "github", label: "GitHub URL", type: "text" },
    { k: "resume_url", label: "Résumé (upload PDF or paste link)", type: "file" } ] },
  project: { label: "Project", fields: [
    { k: "title", label: "Title", type: "text", req: true },
    { k: "category", label: "Categories, e.g. Finance, HR (comma separated)", type: "tags" },
    { k: "tech", label: "Technologies, e.g. Power BI, Excel (comma separated)", type: "tags" },
    { k: "summary", label: "Description", type: "textarea", rows: 5 },
    { k: "impact", label: "Impact / result (optional)", type: "text" },
    { k: "images", label: "Screenshots (first one is the cover)", type: "images" },
    { k: "links", label: "Links (GitHub, dashboard, …)", type: "links" },
    { k: "featured", label: "Featured (shown first, with a badge)", type: "bool" } ] },
  experience: { label: "Experience", fields: [
    { k: "role", label: "Role", type: "text", req: true },
    { k: "company", label: "Company", type: "text", req: true },
    { k: "location", label: "Location", type: "text" },
    { k: "start", label: "Start (e.g. Nov 2025)", type: "text" },
    { k: "end", label: "End (or Present)", type: "text" },
    { k: "bullets", label: "Achievements (one per line)", type: "lines", rows: 7 } ] },
  education: { label: "Education", fields: [
    { k: "degree", label: "Degree", type: "text", req: true },
    { k: "school", label: "School", type: "text" },
    { k: "period", label: "Period", type: "text" },
    { k: "details", label: "Details (one per line)", type: "lines", rows: 4 } ] },
  certification: { label: "Certification", fields: [
    { k: "title", label: "Title", type: "text", req: true },
    { k: "issuer", label: "Issuer", type: "text" },
    { k: "year", label: "Year", type: "text" },
    { k: "url", label: "Credential link (optional)", type: "text" } ] },
  skill: { label: "Skill", fields: [
    { k: "category", label: "Category (skills are grouped by this)", type: "text", req: true },
    { k: "name", label: "Skill", type: "text", req: true },
    { k: "icon", label: "Icon (optional)", type: "image" } ] },
  service: { label: "Service", fields: [
    { k: "title", label: "Title", type: "text", req: true },
    { k: "description", label: "Description", type: "textarea", rows: 4 } ] },
};
