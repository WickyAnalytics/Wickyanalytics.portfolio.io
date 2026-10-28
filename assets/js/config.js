// ─────────────────────────────────────────────────────────────
//  Site configuration. Fill in the two Supabase values (see SETUP.md).
//  The anon key is SAFE to publish: it can only do what the database
//  security rules allow (public read; write only for your admin login).
// ─────────────────────────────────────────────────────────────
window.PORTFOLIO_CONFIG = {
  supabaseUrl: "",      // e.g. "https://abcdxyz.supabase.co"
  supabaseAnonKey: "",  // Project Settings → API → "anon public" key
  bucket: "portfolio",  // storage bucket created by supabase/setup.sql
  formspreeId: "xannkjav" // contact form endpoint (formspree.io/f/<id>)
};
