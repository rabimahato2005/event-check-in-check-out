# Event Check-in / Check-out

A lightweight guest-list app for event door staff. It runs in a browser and
does not need a build step.

## Features

- Add guests individually or import a CSV guest list.
- Create QR tickets and check guests in by code or QR scan.
- Check guests out, check them in again, and see who is currently on site.
- Search and filter the guest list, then export attendance as CSV.
- Use browser-only storage by default, or configure Supabase to share a list
  with invited staff across devices.

## Run locally

Open `index.html` in a browser. In browser-only mode, guest data is stored in
that browser and is not shared with other devices.

## Share the guest list

Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to create and secure the
Supabase database. Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` in
`app.js`, then deploy all app files together on an HTTPS static host. Never
put a Supabase `service_role` key in client-side code.

On a staff member's first sign-in, that browser's saved guests are copied to
the shared list.

## Deploy with GitHub Pages

1. In the repository, open **Settings → Pages**.
2. Select **Deploy from a branch**, choose `main` and `/(root)`, then save.
3. Add the published GitHub Pages URL to the Supabase Authentication
   **Site URL** and **Redirect URLs** settings described in
   [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

## Project files

- `index.html` — app layout and library references
- `styles.css` — app styles
- `app.js` — app behavior and optional Supabase connection settings
- `supabase-setup.sql` — database schema and row-level security policies
- `SUPABASE_SETUP.md` — Supabase and deployment instructions
