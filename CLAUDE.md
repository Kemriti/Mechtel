# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

El Mechtel (مشتل) — a static marketplace/showcase site connecting CRDA-approved Tunisian plant nurseries with buyers. Plain HTML/CSS/JS, no build step, no package manager, no test suite. Two entry points:

- `index.html` — public site: a landing page that morphs into an in-page SPA (`#app-shell` with sidebar + views: home, products, nurseries, nursery profile, "espace pépinière" dashboard).
- `admin.html` — separate back-office app (auth-gated via Supabase) for CRUD on nurseries/products and photo uploads. Shares `style.css`, `produits.js`, `pepinieres.js`, `assets/supabase.js` with the public site but has its own inline `<script>` and does not fall back to demo mode (shows a config warning instead if Supabase isn't set up).

All UI copy and code comments are in French — keep new code consistent with that.

## Running it

No server or build required: open `index.html` or `admin.html` directly in a browser, or serve the folder with any static file server (e.g. `npx serve` / VS Code "Open with Live Server") if testing fetch-from-Supabase behavior under `file://` restrictions.

## Data layer & script load order

Script order is load-bearing — each file assumes globals from the previous one exist:

```
supabase-js (CDN) → assets/supabase.js → produits.js → pepinieres.js → features.js → app.js
```

- `produits.js` defines `CATS`, `SVG` (inline SVG icons per category), `LISTINGS` (product array), `STOCK`/`STOCK_CYCLE`/`stockOf()`.
- `pepinieres.js` defines `NURSERIES` (object keyed by id `n1`, `n2`, …), each with `specialties`, `certs`, `history`, `revs` arrays plus a `home_rank` used to manually pin nurseries to the homepage.
- These two files are the **demo/local data source**. They're also reused as seed data — `admin.html`'s "⇪ Importer la démo" button pushes them straight into Supabase.
- `assets/supabase.js` wraps the Supabase client: `sbReady()` gates all Supabase usage, `sbFetch*`/`sbSave*`/`sbDelete*` are the CRUD calls, `sbUploadPhoto()` handles the `photos` storage bucket, and `rowToNursery`/`nurseryToRow`/`rowToProduct`/`productToRow` convert between DB rows and the in-app object shapes (so `LISTINGS`/`NURSERIES` stay the single shape used everywhere else).
- On `index.html` load, `bootstrapData()` calls `sbFetchNurseries()`/`sbFetchProducts()` and, if Supabase is configured, **mutates `NURSERIES`/`LISTINGS` in place** to replace the demo data — every other module just reads those two globals and doesn't know whether the data came from Supabase or the local files.
- If Supabase isn't configured (`SUPABASE_URL`/`SUPABASE_ANON` still placeholders, or `sbReady()` false), the public site silently keeps running on the local demo data; `admin.html` instead shows the `#cfg` warning and refuses to load.

## App architecture (`app.js` + `features.js`)

- `app.js` owns global `STATE` (current view, filters, leads, the in-progress quote) and the router: `navigateTo(view, param)` → `renderView()` → one `render*()` + `bind*()` pair per view (`renderHome`/`renderProducts`/`renderNurseries`/`renderNurseryProfile`/`renderEspaceHTML`). Views are re-rendered wholesale into `#app-view` on navigation rather than diffed.
- `features.js` holds reusable render fragments (`productCard`, `nurseryCard`, `seal`, `stars`, …), the lead/quote modal flow, and small DOM helpers (`$`, `$$`, `toast`, `countUp`, `attachTilt`).
- Lead capture: `openModal(productId)` → `submitLead()` calls `addLead()` (defined in `app.js`), which pushes into `STATE.leads`, persists to `localStorage` (`mechtel_state`), and feeds the "espace pépinière" dashboard. There's a hard `QUOTA = 12` (matches the "12 contacts inclus" pricing in the landing copy) used purely for the demo's inclus/CPL display split.
- Grouped quotes (`STATE.quote`): a single quote can only contain products from **one** nursery — `addToQuote()` enforces this and prompts to clear the quote if you try to mix nurseries.
- Stock has 3 states (`ok`/`low`/`out`) cycled by `cycleStock()` in admin; `out` listings can't be added to a quote or contacted ("Demander un devis" is disabled).
- Homepage featured nurseries (`featuredNurseryIds()` in `app.js`): if any nursery has `home_rank` set, that manual ordering wins; otherwise it falls back to the top-4 `agree:true` nurseries sorted by rating. The admin "Page d'accueil" tab (`admin.html`) edits `home_rank` via `toggleFeatured()`/`moveFeatured()`.

## Supabase backend (optional)

See `GUIDE-SUPABASE.md` for full setup (schema, RLS policies, storage bucket, admin user). Key points if touching this integration:

- Schema: `nurseries` (text `id` PK) and `products` (int `id` PK, `nursery_id` FK → `nurseries.id`). JSON columns (`specialties`, `certs`, `history`, `revs`) are stored as `jsonb` and round-tripped as-is.
- RLS: public `select` for everyone, `insert`/`update`/`delete` restricted to `authenticated` — i.e. the admin login *is* the write permission, there's no separate roles table.
- `assets/supabase.js` only ever holds the **anon/publishable** key — this is intentional and safe to commit. Never put a `service_role` key in any front-end file.
- Photo uploads go to the public `photos` storage bucket under `photos/products/<id>/…` and `photos/nurseries/<id>/…`.
