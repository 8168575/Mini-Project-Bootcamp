# Home Interior Planner

**Home Interior Layout Planner** is a React application that lets you design a room floor plan and place furniture using an interactive, centimeter-accurate canvas.

You can:
- Choose a room type (Bedroom, Living Room, Office, Kitchen, Dining Room, Custom)
- Drag furniture from a catalog onto the room
- Move, resize, and rotate placed items (with grid snapping options)
- Save multiple designs and switch between them
- Refresh safely: drafts and saved designs persist in `localStorage`

---

## Demo / Screenshots

> Add screenshots or a short GIF here once you have them.

---

## Tech Stack

- **React** (Create React App)
- **DnD Kit** (`@dnd-kit/core`, `@dnd-kit/modifiers`) for drag & drop
- **Zustand** for state management
- **Tailwind CSS** for styling

---

## Key Features

### 1) Scale-correct canvas (centimeters)
- Room dimensions and furniture dimensions are handled in **cm**.
- The app computes `pixelsPerCm` to render everything accurately.

### 2) Direct manipulation on the canvas
- **Drag** catalog items into the room
- **Select** placed items to edit them
- **Resize** using corner handles (with live dimension readout)
- **Rotate** with pointer math + angle snapping

### 3) Grid + snapping controls
- Toggle grid visibility
- Toggle snap-to-grid
- Configure grid size

### 4) Draft + saved designs persistence
- Draft (active room design + UI state) is saved to `localStorage`
- Saved designs are stored separately and remain after refresh

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm

### Install dependencies

```bash
cd home-interior-planner
npm install
```

### Run locally

```bash
npm start
```

- Opens the app at: http://localhost:3000

### Run tests

```bash
npm test
```

### Build for production

```bash
npm run build
```

---

## Project Structure (high level)

- `src/components/canvas/RoomCanvas.jsx`
  - The main scale-correct floor plan canvas
  - Renders furniture items and interaction overlays
- `src/components/catalog/`
  - Furniture catalog UI (search/filter + cards)
- `src/components/designs/`
  - Saved designs gallery
- `src/store/`
  - Zustand store + persistence adapters
- `src/utils/`
  - Geometry + coordinate helpers (grid snapping, rotation, resize)

---

## Furniture Catalog

Furniture is defined in `src/data/furnitureCatalog.js` as a static catalog of flat, top-down SVG icons.

---

## Persistence Keys

- Draft: `home-interior-planner:draft-v1`
- Saved designs: `home-interior-planner:saved-designs-v1`

---

## License

MIT

---

## Notes for GitHub

- Commit this project from `home-interior-planner/`.
- Don’t commit `node_modules/` or the `build/` output (already covered by `.gitignore`).

