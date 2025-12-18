# BitMappr (React + Vite)

React refactor of the BitMappr terrain pathfinding playground using p5 in instance mode.

## Run locally
1) Install deps: `npm install`
2) Start dev server: `npm run dev` (Vite defaults to http://localhost:5173)
3) Build for production: `npm run build` then `npm run preview`

Notes:
- Tailwind is loaded via CDN in `index.html` for simplicity (no PostCSS/Tailwind build step required).
- p5, React, and Vite are pulled from npm. The p5 sketch mounts into `#map-frame` via the `TerrainCanvas` component.
