// ─────────────────────────────────────────────────────────────
//  Site configuration. Fill in the two Supabase values (see SETUP.md).
//  The anon key is SAFE to publish: it can only do what the database
//  security rules allow (public read; write only for your admin login).
// ─────────────────────────────────────────────────────────────
window.PORTFOLIO_CONFIG = {
  supabaseUrl: "https://ygbsxhgkkjshhtdvhzkv.supabase.co",      // e.g. "https://abcdxyz.supabase.co"
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnYnN4aGdra2pzaGh0ZHZoemt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxODgzNzgsImV4cCI6MjEwODc2NDM3OH0.McQlRzeuYIFn3L33Vooqz3iMg5cG-O3U50kkxkRQ9-M",  // Project Settings → API → "anon public" key
  bucket: "portfolio",  // storage bucket created by supabase/setup.sql
  formspreeId: "xannkjav" // contact form endpoint (formspree.io/f/<id>)
};
