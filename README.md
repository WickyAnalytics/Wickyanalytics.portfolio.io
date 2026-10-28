# George Ayad — Portfolio

A static portfolio (no build step) whose content is editable from the live site after signing in.
Content lives in Supabase; if it isn't configured the site shows the starter content in `assets/data/seed.json`.
**Setup guide: [SETUP.md](SETUP.md)**

```
index.html              page shell
.nojekyll               tells GitHub Pages to serve files as-is
assets/
  css/main.css          all styles
  js/config.js          Supabase URL + key  ← the only file you must edit
  js/app.js             state + event wiring
  js/data.js            database / login / upload client
  js/render.js          HTML rendering (all content is escaped)
  js/admin.js           login + editor dialogs
  js/schema.js          which fields each section has (edit to add fields)
  data/seed.json        starter content (CV + existing projects)
  img/{profile,projects,skills}/
  docs/George_Ayad_Resume.pdf
supabase/setup.sql      database tables (content + service requests) and security rules
```

Preview locally: `python3 -m http.server 8000` → http://localhost:8000
