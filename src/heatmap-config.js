import { TERRAIN } from "./pathfinding.js";

export const HEATMAP_COLORS = {
  [TERRAIN.GRASS]: "#22c55e",
  [TERRAIN.SAND]: "#facc15",
  [TERRAIN.TREES]: "#fb923c",
  [TERRAIN.MOUNTAIN]: "#f97316",
  [TERRAIN.SNOW]: "#dc2626",
};

export const HEATMAP_FILTERS = [
  {
    id: TERRAIN.GRASS,
    label: "Grass",
    color: HEATMAP_COLORS[TERRAIN.GRASS],
  },
  {
    id: TERRAIN.SAND,
    label: "Sand",
    color: HEATMAP_COLORS[TERRAIN.SAND],
  },
  {
    id: TERRAIN.TREES,
    label: "Trees",
    color: HEATMAP_COLORS[TERRAIN.TREES],
  },
  {
    id: TERRAIN.MOUNTAIN,
    label: "Rock",
    color: HEATMAP_COLORS[TERRAIN.MOUNTAIN],
  },
  {
    id: TERRAIN.SNOW,
    label: "Snow",
    color: HEATMAP_COLORS[TERRAIN.SNOW],
  },
];
