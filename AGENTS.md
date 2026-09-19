# AGENTS.md

## 1. Project Overview
**Tantalize** is an immersive, editorial 2D spatial canvas portfolio for **Farrell Axel Suwandi** (AI Researcher & Software Engineer). The portfolio breaks away from traditional vertical scrolling web design, placing the visitor inside a continuous multi-directional world of classical Greek Renaissance paintings.

Navigation functions like a cinematic camera gliding across a 2D coordinate plane between distinct chapters (Home, Timeline, Projects, Certificate) with continuous edge feathering and interactive physics.

---

## 2. Tech Stack
* **Framework**: React 19 (`react`, `react-dom`)
* **Build Tool**: Vite 6 (`vite`, `@vitejs/plugin-react`)
* **Language**: TypeScript 5.8+
* **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss`)
* **Motion Engine**: Motion v12 (`motion`)
* **Icons**: Lucide React (`lucide-react`)
* **Dev Server**: Port 3000 (`http://localhost:3000`)

---

## 3. Project Structure
```text
Tantalize/
├── public/
│   ├── home.png           # Center quadrant (0, 0) - Tantalus reaching for fruit
│   ├── timeline.png       # East quadrant (+100vw, 0) - Coastal Greek cliff & temple
│   ├── projects.png       # South quadrant (0, +100vh) - Mountain valley & clouds
│   ├── archives.png       # West quadrant (-100vw, 0) - Classical Greek bridge & gorge
│   ├── connect.png        # South-East quadrant (+100vw, +100vh) - Athena colossus
│   └── certificates.png   # South-West quadrant (-100vw, +100vh) - Athena statue & library
├── src/
│   ├── components/
│   │   ├── Navbar.tsx         # Apple-grade frosted glass floating navigation capsule
│   │   └── TimelineRoller.tsx # Cylindrical 3D vertical roller carousel
│   ├── App.tsx            # 2D Spatial camera, global wheel navigation, URL hash router
│   ├── index.css          # Tailwind v4 theme, warm canvas variables & typography
│   └── main.tsx           # React 19 entry point
├── AGENTS.md              # Architectural & design guidelines for AI agents
├── README.md              # Project quickstart & overview
├── index.html             # HTML template with Google Fonts (Cormorant Garamond, Inter)
├── package.json           # Scripts & dependencies
├── tsconfig.json          # TypeScript bundler configuration
└── vite.config.ts         # Vite configuration with Tailwind v4 & aliases
```

---

## 4. Art Style & Aesthetic Guidelines
* **Theme**: Classical Greek Mythology / Renaissance Oil Painting combined with contemporary Swiss/Apple typography.
* **Base Canvas**: Warm White / Antique Paper (`#FAF8F5`).
* **Color Palette**:
  * Text Primary: `#FFFDF9` / `text-white` with soft optical text shadows
  * Antique Gold Accents: `#E8C582` / `#D8A048`
  * Ambient Backdrop: Warm ivory, golden hour amber, and antique charcoal.
* **Typography**:
  * Headings & Identity: `font-serif italic` (*Cormorant Garamond*), light and fluid.
  * Meta & Numbers: Refined serif italic with gold accents and dot separators.
* **Glassmorphism**: Apple VisionOS / macOS style frosted glass (`backdrop-blur-2xl`, `backdrop-saturate-[180%]`, specular border highlights `border-white/50`, `inset-shadow`).

---

## 5. Spatial Navigation & Coordinate Matrix
The world operates on a 2D continuous coordinate plane:

```text
[ ARCHIVE (-100vw, 0) ]          [ HOME (0, 0) ]          [ TIMELINE (+100vw, 0) ]
  (Greek Bridge & Gorge)              (Tantalus in Lake)        (Cliff Temple & Sea)

[ CERTIFICATES (-100vw, +100vh) ] [ PROJECTS (0, +100vh) ]  [ CONNECT (+100vw, +100vh) ]
   (Athena Statue & Library)        (Mountain Peak Valley)     (Colossal Athena Statue)
```

* **Seamless Edge Blending**: Each artwork applies a radial feather mask (`radial-gradient(ellipse 96% 92% ...)`) so that transitions between quadrants dissolve into a continuous panoramic atmosphere without hard square seams.
* **Camera Easing**: 1.6s cinematic glide (`ease: [0.22, 1, 0.36, 1]`) with zero jitter.
* **URL Hash Router**: Deep links (`#home`, `#timeline`, `#projects`, `#certificate`) sync bidirectionally with browser history and canvas positioning.

---

## 6. Interaction & Motion Rules
1. **Global Scroll Flow**:
   * Home -> Wheel Down -> Timeline (starts at experience 0).
   * Timeline -> Wheel Down rotates cylindrical 3D roller (items 0 to 4).
   * Past last item (item 4) -> Wheel Down -> Projects.
   * Projects -> Wheel Down -> Certificate.
   * Scrolling up reverses the sequence smoothly.
2. **Roller Wheel Physics**:
   * Continuous 3D orbit (cards never abruptly unmount; items outside ±2 are rendered with `opacity: 0`).
   * Subtle 3D tilt (`rotateX: ±9deg`) and natural scaling (`1.0 -> 0.86 -> 0.72`).
   * Weighted mechanical inertia (`mass: 1.25, stiffness: 130, damping: 24`).
3. **Controlled Navbar**:
   * Navbar is fully controlled by the `activeTab` prop from parent `App.tsx`, ensuring instant layout synchronization across clicks, wheel scrolls, and URL hash changes.

---

## 7. Operational Standards
* Never use the em dash "—". Use plain dash "-" instead.
* When writing commit messages, NEVER auto-add agent name as co-author.
* Prefer clean, robust, zero-bloat implementations over unnecessary wrappers.
* Ensure all code compiles cleanly with `npm run lint` and `npm run build`.
