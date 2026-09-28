# Tantalize

An editorial, spatial portfolio website for **Farrell Axel Suwandi** (AI Researcher & Software Engineer), crafted with a classical Greek mythology aesthetic and a 2D continuous spatial canvas.

---

## Tech Stack
* **Framework**: React 19
* **Build Tool**: Vite 6
* **Language**: TypeScript
* **Styling**: Tailwind CSS v4
* **Animations**: Motion (Framer Motion v12)
* **Icons**: Lucide React

---

## 2D Spatial Map
```text
[ CERTIFICATES (-100vw, 0) ]     [ HOME (0, 0) ]          [ TIMELINE (+100vw, 0) ]
[ BRIDGE (-100vw, +100vh) ]      [ PROJECTS (0, +100vh) ]  [ STATUE (+100vw, +100vh) ]
```

---

## Key Features
* **2D Spatial Canvas**: Seamless camera gliding across a 6-panel panoramic world with feathered atmospheric edges.
* **Apple-Style Frosted Navbar**: Floating glass capsule navigation with spring layout indicators.
* **Vertical Cylindrical Roller**: 3D wheel carousel with natural mechanical inertia for work experiences.
* **Global Scroll Navigation**: Continuous scroll flow from Home through Timeline experiences, Projects, and Certificates.
* **Deep Linking**: Full URL hash routing support (`#home`, `#timeline`, `#projects`, `#certificate`).

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The dev server listens on loopback only by default; expose it to a trusted LAN only when needed with `npm run dev -- --host 0.0.0.0`.

### 3. Production Build & Checks
```bash
npm run lint
npm run build
npm run test:e2e
```

The build generates static HTML previews for all 16 project routes and `dist/sitemap.xml`. Vercel serves `/projects/:id` through `vercel.json`; the preview server mirrors this rewrite for local E2E checks. The canonical site is `https://www.liemaxels.com`.

The Vercel configuration includes a **report-only** Content Security Policy. It does not block resources and has no centralized violation collector. On a Vercel preview deployment, inspect browser DevTools for CSP violations on Home, project deep links, Archive About, Storybook, and audio playback. Inline project JSON-LD may be reported by `script-src`; resolve any violations before changing the header to an enforcing CSP. Do not treat this header as active XSS protection yet.

For production performance metrics, enable **Speed Insights** on the Vercel project. The client loads it only in production; real-user data appears in the Vercel dashboard after deployment and traffic. CI runs a mobile navigation smoke test with timing data attached to the Playwright result. After release, verify one project URL returns its own OG tags (without JavaScript), check `/sitemap.xml`, and inspect cache headers on HTML, `/assets/*`, and media on `media.liemaxels.com`. Media URLs are stable, so do not make them immutable without versioning.
