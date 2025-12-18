import { TERRAIN, MOVEMENT_COSTS } from "./pathfinding.js";

export const BIOME_META = [
  {
    key: "water",
    id: TERRAIN.WATER,
    label: "Water",
    from: "#1eb0fb",
    to: "#28ffff",
    timePerKm: 0,
  },
  {
    key: "sand",
    id: TERRAIN.SAND,
    label: "Sand",
    from: "#d7c08c",
    to: "#f5e9bb",
    timePerKm: MOVEMENT_COSTS[TERRAIN.SAND],
  },
  {
    key: "grass",
    id: TERRAIN.GRASS,
    label: "Grass",
    from: "#41b45a",
    to: "#88e277",
    timePerKm: MOVEMENT_COSTS[TERRAIN.GRASS],
  },
  {
    key: "trees",
    id: TERRAIN.TREES,
    label: "Trees",
    from: "#0f6e44",
    to: "#1f8c50",
    timePerKm: MOVEMENT_COSTS[TERRAIN.TREES],
  },
  {
    key: "mountain",
    id: TERRAIN.MOUNTAIN,
    label: "Mountain",
    from: "#64605c",
    to: "#a3988e",
    timePerKm: MOVEMENT_COSTS[TERRAIN.MOUNTAIN],
  },
  {
    key: "snow",
    id: TERRAIN.SNOW,
    label: "Snow",
    from: "#dce8f0",
    to: "#ffffff",
    timePerKm: MOVEMENT_COSTS[TERRAIN.SNOW],
  },
];
