# Optional Supabase setup

Use this guide only if you want to host the static app with Supabase instead of
running the local MySQL server. The browser uses email sign-in and the Supabase
publishable (or legacy `anon`) key. Never put a database password or
`service_role` key in frontend code.

1. Create a Supabase project and run `supabase-setup.sql` in its SQL Editor.
   If you already set up Supabase, run the updated SQL again to add the
   check-out timestamp column.
2. In **Authentication → Providers**, enable Email. Disable public sign-ups and
   invite each staff member from **Authentication → Users**.
3. In **Authentication → URL Configuration**, set the deployed app URL as the
   Site URL and add it to the Redirect URLs list.
4. Copy the project URL and publishable key from **Project Settings → API**.
   In `app.js`, set `SUPABASE_URL` and `SUPABASE_ANON_KEY` to those values.
5. Upload `index.html`, `styles.css`, and `app.js` together to the same folder
   on an HTTPS static host. Staff open the deployed `index.html`, enter an
   invited email, and follow the sign-in link.

On the first successful sign-in, any guest records already saved in that
browser are copied to Supabase. If a code already exists in the cloud, the
cloud record takes precedence. The shared list and event name then update
across signed-in browsers. The browser's local copy is retained as a backup.
Staff can check a guest out and check them in again; the count shows only
guests currently on site.

Without both settings, the app continues to work locally and displays the
browser-only storage notice. It does not silently pretend local data is shared.
