# Twiga Cargo — Freight Consolidation Website

A production-grade marketing + utility website for an international ocean/air freight
consolidation company operating between **North America (US)** and **East Africa
(Kenya / Uganda / Rwanda)** — built exactly to the supplied UI/UX specification &
technical blueprint.

## Pages

| File | Spec page | Highlights |
|---|---|---|
| `index.html` | Landing page | Navy hero with CA→East Africa route map, dual action card (Instant Quick-Quote + Quick Track), animated departure ticker with 78% capacity progress bar, 3-step "How Consolidation Works", transparent flat-fee box rate grid ($85 / $130 / $170 / $150 / $30 per cu. ft.), compliance & trust badges, diaspora testimonial carousel |
| `calculator.html` | `/calculator` | Imperial ⇄ metric toggle (with live conversion), L/W/H/weight inputs, dynamic 3D box visualizer, live formula strip (`L × W × H ÷ 1,728 = ft³`), cargo category selector (personal vs. commercial w/ customs-surcharge notice), ocean vs. air-express mode selector, itemized guaranteed flat-rate breakdown, "Save Quote as PDF" (print stylesheet) + "Book Intake Spot Now" |
| `tracking.html` | `/tracking` | Tracking / House Bill search (deep-linkable via `?hbl=KE-2026-8891`), shipment facts header, 6-milestone status timeline (green = done, amber pulse = current, dashed = pending) with timestamps, container #, vessel & voyage, intake photo references |
| `hubs.html` | `/hubs` | Interactive map embed with hub legend, Modesto facility sidebar (address, Mon–Sat hours), Nairobi ICDN Embakasi hub details, drop-off appointment scheduler with confirmation state, step-by-step mail-in / Amazon address-format guide with one-click copy |

## Design system (per spec §1)

- **Primary Navy** `#0A192F` · **High-Vis Amber** `#F59E0B` / `#D97706` · **Logistics Teal** `#0284C7`
- Light neutral background `#F8FAFC`, card surface `#FFFFFF`, ink `#0F172A`, muted `#64748B`
- Success green `#10B981` (cleared/delivered) · Warning amber `#F59E0B` (pending/in-transit)
- **Headings:** Plus Jakarta Sans 700/800, tight kerning `-0.02em` · **Body:** Inter 400/500, line-height 1.6
- Micro-interactions: `translateY(-2px)` hover lifts, 200 ms ease-in-out transitions, shadow elevations

## Global components (per spec §2 & §5)

- Sticky glassmorphism header: logo, Services dropdown (Ocean Consolidation · Air Express · B2B Commercial · Buy-for-Me), Rates & Calculator, Drop-off Hubs, How It Works, Schedule / Departures, outline **Track Package** pill, solid amber **Get Rate / Book** CTA, portal avatar
- Mobile-first responsive layout (breakpoints 1024 / 860 / 620 px)
- Sticky bottom CTA bar on mobile: **Track Package** + **Get Rate Quote**
- Floating WhatsApp Business widget (bottom-right, wa.me deep link with pre-filled message)
- WCAG-minded accessibility: semantic landmarks, label/input pairing, `aria` states on tabs/menus/progress, focus rings, high-contrast text, `prefers-reduced-motion` support

## Run it

No build step needed — it's a static site:

```bash
cd twiga-cargo
python3 -m http.server 8080
# open http://localhost:8080
```

Or just open `index.html` in a browser.

## Where the tech-stack blueprint maps in

The PDF's technical architecture section targets **Next.js 14 (App Router) + Tailwind CSS +
Shadcn UI + Zustand + React Hook Form/Zod + Supabase/Prisma + Stripe/MPesa on Vercel**.
This deliverable is the complete, working front-end realization of the spec's wireframes,
design system and interactive tools in dependency-free HTML/CSS/JS so it can be opened and
used immediately. Natural migration path:

- Each page maps 1:1 to a Next.js route (`/`, `/calculator`, `/tracking`, `/hubs`)
- `assets/app.js` rate model (`TWIGA_RATES`) → shared constants module / Zustand store
- Forms → React Hook Form + Zod schemas (validation rules already implied per field)
- Quote/tracking/booking submissions → Supabase tables + Prisma; payments via Stripe (USD)
  and MPesa (KES) behind the "Book" actions
- "Save Quote as PDF" → server-side PDF generation (e.g. `@react-pdf/renderer`) on migration

Demo data: tracking number **KE-2026-8891** renders a full live-shipment timeline.
