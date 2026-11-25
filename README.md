# Event Check-in / Check-out

A browser-based guest-list app with a local Node.js API and MySQL storage.
Guests can be added or imported, issued QR tickets, checked in and out, and
exported as an attendance CSV.

## Run locally with MySQL

Requirements: Node.js 18+ and MySQL 8+.

1. Copy `.env.example` to `.env` and set your MySQL connection values. In
   PowerShell, run `Copy-Item .env.example .env`, then edit `.env`. Put the
   database password only there; `.gitignore` excludes it from Git.
2. Create the database tables by running `mysql-setup.sql` in MySQL Workbench,
   or from a terminal with `mysql -u root -p < mysql-setup.sql`.
3. Install dependencies and start the app:

   ```sh
   npm install
   npm start
   ```

4. Open <http://127.0.0.1:3000>.

The server binds to `127.0.0.1` so the database API is only available on the
local computer. Do not expose it to other devices or the internet without
adding authentication and deployment-specific secret management first.

## Browser-only mode

Opening `index.html` directly still works, but stores guests only in that
browser. It does not use `.env` or connect to MySQL.

## Supabase alternative

For a shared guest list with invited staff, follow
[SUPABASE_SETUP.md](./SUPABASE_SETUP.md). A static GitHub Pages site cannot
read `.env`; never put a MySQL password or Supabase `service_role` key in
frontend files.

## Project files

- `index.html`, `styles.css`, `app.js` — browser interface and behavior
- `server.js` — local Node.js API; reads database credentials from `.env`
- `.env.example` — safe configuration template; no real password
- `mysql-setup.sql` — MySQL database and table creation
- `supabase-setup.sql` — optional Supabase schema and access policies
- `SUPABASE_SETUP.md` — optional Supabase setup instructions
