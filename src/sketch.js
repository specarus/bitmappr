import p5 from "p5";
import { TERRAIN, findPath, getIndex } from "./pathfinding.js";

export function createTerrainSketch(containerEl, { onReady } = {}) {
  const targetEl = containerEl || document.getElementById("map-frame");

  const sketch = (p) => {
    class TerrainType {
      constructor(
        minHeight,
        maxHeight,
        minColor,
        maxColor,
        lerpAdjustment = 0
      ) {
        this.minHeight = minHeight;
        this.maxHeight = maxHeight;
        this.minColor = minColor;
        this.maxColor = maxColor;
        this.lerpAdjustment = lerpAdjustment;
      }
    }

    let waterTerrain;
    let sandTerrain;
    let grassTerrain;
    let treesTerrain;
    let mountainTerrain;
    let snowTerrain;
    let mapCanvas;
    let mapReadyEmitted = false;
    let regenerateTimeout = null;

    let terrainImage;
    let terrainTypeMap = [];
    let startCell = null;
    let endCell = null;
    let currentPath = [];

    const START_COLOR = { r: 34, g: 211, b: 238 };
    const MID_PATH_COLOR = { r: 167, g: 139, b: 250 };
    const END_COLOR = { r: 251, g: 113, b: 133 };
    const MAX_PATH_POINTS = 900;
    const PATH_SMOOTH_ITERATIONS = 2;
    const MOVEMENT_COSTS = {
      [TERRAIN.SAND]: 2,
      [TERRAIN.GRASS]: 1,
      [TERRAIN.TREES]: 3,
      [TERRAIN.MOUNTAIN]: 4,
      [TERRAIN.SNOW]: 5,
    };
    let controlListenersAttached = false;
    let noiseSeedValue = Math.floor(Math.random() * 1_000_000_000);
    const BIOME_META = [
      { key: "water", id: TERRAIN.WATER, from: "#1eb0fb", to: "#28ffff" },
      { key: "sand", id: TERRAIN.SAND, from: "#d7c08c", to: "#f5e9bb" },
      { key: "grass", id: TERRAIN.GRASS, from: "#41b45a", to: "#88e277" },
      { key: "trees", id: TERRAIN.TREES, from: "#0f6e44", to: "#1f8c50" },
      { key: "mountain", id: TERRAIN.MOUNTAIN, from: "#64605c", to: "#a3988e" },
      { key: "snow", id: TERRAIN.SNOW, from: "#dce8f0", to: "#ffffff" },
    ];

    const zoomFactor = 100;

    p.setup = () => {
      mapCanvas = p.createCanvas(10, 10);
      p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
      if (targetEl) {
        mapCanvas.parent(targetEl);
      } else {
        mapCanvas.parent("map-frame");
      }
      resizeMapCanvas();
      mapCanvas.addClass(
        "w-full h-full block saturate-[1.04] contrast-[1.02] relative left-0 top-0"
      );
      if (mapCanvas.drawingContext) {
        mapCanvas.drawingContext.imageSmoothingEnabled = true;
      }

      waterTerrain = new TerrainType(
        0.2,
        0.36,
        p.color(30, 176, 251),
        p.color(40, 255, 255)
      );
      sandTerrain = new TerrainType(
        0.36,
        0.44,
        p.color(215, 192, 140),
        p.color(245, 233, 187),
        0.2
      );
      grassTerrain = new TerrainType(
        0.44,
        0.58,
        p.color(65, 180, 90),
        p.color(136, 226, 119),
        -0.1
      );
      treesTerrain = new TerrainType(
        0.58,
        0.72,
        p.color(31, 140, 80),
        p.color(16, 110, 68),
        -0.3
      );
      mountainTerrain = new TerrainType(
        0.72,
        0.84,
        p.color(100, 96, 92),
        p.color(163, 152, 142),
        0.1
      );
      snowTerrain = new TerrainType(
        0.84,
        0.92,
        p.color(220, 232, 240),
        p.color(255, 255, 255),
        0.2
      );

      p.noLoop();

      attachControlListeners();
      emitPathState(false);
      emitPathSummary({ hasPath: false });
    };

    p.windowResized = () => {
      resizeMapCanvas();
      terrainImage = null;
      resetSelections(false);
      randomizeNoiseSeed();
      p.redraw();
    };

    p.draw = () => {
      if (!terrainImage) {
        generateTerrainLayer();
      }

      p.image(terrainImage, 0, 0);
      drawSelectionsAndPath();

      if (!mapReadyEmitted) {
        mapReadyEmitted = true;
        window.dispatchEvent(new Event("map-ready"));
        if (typeof onReady === "function") {
          onReady();
        }
      }
    };

    p.mousePressed = (evt) => {
      if (mapCanvas && evt && evt.target !== mapCanvas.elt) {
        return;
      }

      if (!terrainTypeMap.length) {
        return;
      }

      if (
        p.mouseX < 0 ||
        p.mouseY < 0 ||
        p.mouseX >= p.width ||
        p.mouseY >= p.height
      ) {
        emitTerrainPopup("Click inside the map to drop a marker.");
        return;
      }

      const x = Math.floor(p.mouseX);
      const y = Math.floor(p.mouseY);
      const index = getIndex(x, y, p.width);

      const clickedCell = { x, y };

      if (endCell) {
        return;
      }

      if (terrainTypeMap[index] === TERRAIN.WATER) {
        emitTerrainPopup("Cannot select water as origin or destination.");
        return;
      }

      if (!startCell) {
        startCell = clickedCell;
        endCell = null;
        currentPath = [];
        emitPathState(false);
      } else {
        const nextPath = findPath(
          startCell,
          clickedCell,
          terrainTypeMap,
          p.width,
          p.height
        );
        if (!nextPath.length) {
          endCell = null;
          currentPath = [];
          emitTerrainPopup(
            "Destination unreachable without leaving the map. Try a closer point."
          );
          emitPathState(false);
          emitPathSummary({ hasPath: false });
        } else {
          endCell = clickedCell;
          currentPath = nextPath;
          emitPathState(true);
          emitPathSummary(computePathSummary(currentPath));
        }
      }

      p.redraw();
    };

    function sampleTerrainNoise(x, y) {
      const baseFrequency = 0.7;
      const nx = (x / zoomFactor) * baseFrequency;
      const ny = (y / zoomFactor) * baseFrequency;

      let amplitude = 1;
      let frequency = 1;
      let sum = 0;
      let amplitudeSum = 0;

      for (let i = 0; i < 4; i++) {
        sum += p.noise(nx * frequency, ny * frequency) * amplitude;
        amplitudeSum += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
      }

      const fbm = sum / amplitudeSum;
      return p.constrain(0.5 + (fbm - 0.5) * 1.35, 0, 1);
    }

    function getTerrainColor(noiseValue, mapType) {
      const normalized = normalize(
        noiseValue,
        mapType.maxHeight,
        mapType.minHeight
      );
      return p.lerpColor(
        mapType.minColor,
        mapType.maxColor,
        normalized + mapType.lerpAdjustment
      );
    }

    function normalize(value, max, min) {
      if (value > max) {
        return 1;
      }
      if (value < min) {
        return 0;
      }
      return (value - min) / (max - min);
    }

    function classifyTerrain(noiseValue) {
      if (noiseValue < waterTerrain.maxHeight) {
        return {
          terrainType: TERRAIN.WATER,
          terrainColor: getTerrainColor(noiseValue, waterTerrain),
        };
      } else if (noiseValue < sandTerrain.maxHeight) {
        return {
          terrainType: TERRAIN.SAND,
          terrainColor: getTerrainColor(noiseValue, sandTerrain),
        };
      } else if (noiseValue < grassTerrain.maxHeight) {
        return {
          terrainType: TERRAIN.GRASS,
          terrainColor: getTerrainColor(noiseValue, grassTerrain),
        };
      } else if (noiseValue < treesTerrain.maxHeight) {
        return {
          terrainType: TERRAIN.TREES,
          terrainColor: getTerrainColor(noiseValue, treesTerrain),
        };
      } else if (noiseValue < mountainTerrain.maxHeight) {
        return {
          terrainType: TERRAIN.MOUNTAIN,
          terrainColor: getTerrainColor(noiseValue, mountainTerrain),
        };
      }
      return {
        terrainType: TERRAIN.SNOW,
        terrainColor: getTerrainColor(noiseValue, snowTerrain),
      };
    }

    function generateTerrainLayer() {
      p.noiseSeed(noiseSeedValue);
      terrainImage = p.createImage(p.width, p.height);
      terrainTypeMap = new Uint8Array(p.width * p.height);
      const counts = {
        water: 0,
        sand: 0,
        grass: 0,
        trees: 0,
        mountain: 0,
        snow: 0,
      };

      terrainImage.loadPixels();
      for (let y = 0; y < p.height; y++) {
        for (let x = 0; x < p.width; x++) {
          const noiseValue = sampleTerrainNoise(x, y);
          const index = getIndex(x, y, p.width);
          const { terrainType, terrainColor } = classifyTerrain(noiseValue);
          terrainTypeMap[index] = terrainType;
          incrementBiomeCount(counts, terrainType);

          const pixelIndex = index * 4;
          terrainImage.pixels[pixelIndex] = p.red(terrainColor);
          terrainImage.pixels[pixelIndex + 1] = p.green(terrainColor);
          terrainImage.pixels[pixelIndex + 2] = p.blue(terrainColor);
          terrainImage.pixels[pixelIndex + 3] = 255;
        }
      }
      terrainImage.updatePixels();
      emitBiomeStats(counts, p.width * p.height);
    }

    function drawSelectionsAndPath() {
      if (startCell) {
        drawMarker(
          startCell,
          p.color(START_COLOR.r, START_COLOR.g, START_COLOR.b)
        );
      }
      if (endCell) {
        drawPinIcon(endCell, p.color(END_COLOR.r, END_COLOR.g, END_COLOR.b));
      }
      if (currentPath.length) {
        drawSmoothPath(currentPath);
      }
    }

    function drawMarker(cell, markerColor) {
      p.push();
      const cx = cell.x + 0.5;
      const cy = cell.y + 0.5;

      p.noStroke();
      p.fill(p.red(markerColor), p.green(markerColor), p.blue(markerColor), 70);
      p.ellipse(cx, cy, 14, 14);

      p.fill(markerColor);
      p.ellipse(cx, cy, 9, 9);

      p.stroke(255);
      p.strokeWeight(0.7);
      p.noFill();
      p.ellipse(cx, cy, 11.5, 11.5);
      p.pop();
    }

    function drawPinIcon(cell, strokeCol) {
      // Approximate lucide-react "MapPin" icon drawn in p5 for the destination.
      p.push();
      // Place the pin tip at the center of the destination cell so the icon sits atop the cell.
      p.translate(cell.x + 0.5, cell.y + 0.5);
      const scaleFactor = 0.8;
      p.scale(scaleFactor);
      // Shift drawing so the icon's tip (originally at 12,21) aligns with the origin.
      p.translate(-12, -21);
      p.stroke(strokeCol);
      p.fill(p.red(strokeCol), p.green(strokeCol), p.blue(strokeCol), 60);
      p.strokeWeight(1.4 / scaleFactor);
      p.strokeJoin(p.ROUND);
      p.strokeCap(p.ROUND);

      p.beginShape();
      p.vertex(12, 21);
      p.bezierVertex(12, 21, 6, 15.6, 6, 11);
      p.bezierVertex(6, 7.686, 8.686, 5, 12, 5);
      p.bezierVertex(15.314, 5, 18, 7.686, 18, 11);
      p.bezierVertex(18, 15.6, 12, 21, 12, 21);
      p.endShape();

      p.ellipse(12, 11, 6, 6);
      p.pop();
    }

    function drawSmoothPath(path) {
      const basePts = downsamplePoints(
        path.map((pt) => ({ x: pt.x + 0.5, y: pt.y + 0.5 })),
        MAX_PATH_POINTS
      );
      const pts = smoothPathPoints(basePts, PATH_SMOOTH_ITERATIONS);

      if (pts.length < 2) {
        return;
      }

      const startCol = p.color(START_COLOR.r, START_COLOR.g, START_COLOR.b);
      const midCol = p.color(
        MID_PATH_COLOR.r,
        MID_PATH_COLOR.g,
        MID_PATH_COLOR.b
      );
      const endCol = p.color(END_COLOR.r, END_COLOR.g, END_COLOR.b);

      const lerpGradient = (t) => {
        if (t <= 0.5) {
          return p.lerpColor(startCol, midCol, t * 2);
        }
        return p.lerpColor(midCol, endCol, (t - 0.5) * 2);
      };

      p.push();
      p.noFill();
      p.strokeCap(p.ROUND);
      p.strokeJoin(p.ROUND);

      // Subtle halo for visibility
      p.stroke(255, 255, 255, 30);
      p.strokeWeight(6);
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        p.line(a.x, a.y, b.x, b.y);
      }

      // Gradient stroke along the path
      p.strokeWeight(3);
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const t = i / (pts.length - 2);
        p.stroke(lerpGradient(t));
        p.line(a.x, a.y, b.x, b.y);
      }

      p.pop();
    }

    function emitPathState(hasDestination) {
      window.dispatchEvent(
        new CustomEvent("path-state", {
          detail: { hasDestination },
        })
      );
    }

    function emitPathSummary(summary) {
      const safeSummary =
        summary && summary.hasPath ? summary : { hasPath: false };
      window.dispatchEvent(
        new CustomEvent("path-summary", {
          detail: safeSummary,
        })
      );
    }

    function emitBiomeStats(counts, total) {
      const stats = BIOME_META.map((meta) => ({
        key: meta.key,
        percent: total ? (counts[meta.key] / total) * 100 : 0,
        from: meta.from,
        to: meta.to,
      }));
      window.dispatchEvent(
        new CustomEvent("biome-stats", {
          detail: { stats },
        })
      );
    }

    function emitTerrainPopup(message, duration = 2600) {
      window.dispatchEvent(
        new CustomEvent("terrain-popup", {
          detail: { message, duration },
        })
      );
    }

    function incrementBiomeCount(counts, terrainType) {
      switch (terrainType) {
        case TERRAIN.WATER:
          counts.water += 1;
          break;
        case TERRAIN.SAND:
          counts.sand += 1;
          break;
        case TERRAIN.GRASS:
          counts.grass += 1;
          break;
        case TERRAIN.TREES:
          counts.trees += 1;
          break;
        case TERRAIN.MOUNTAIN:
          counts.mountain += 1;
          break;
        case TERRAIN.SNOW:
          counts.snow += 1;
          break;
        default:
          break;
      }
    }

    function resetSelections(shouldRedraw = true) {
      startCell = null;
      endCell = null;
      currentPath = [];
      emitPathState(false);
      emitPathSummary({ hasPath: false });
      if (shouldRedraw) {
        p.redraw();
      }
    }

    function handleResetEvent() {
      resetSelections(true);
    }

    function handleRegenerateMap() {
      if (regenerateTimeout) {
        window.clearTimeout(regenerateTimeout);
      }
      regenerateTimeout = window.setTimeout(() => {
        regenerateTimeout = null;
        terrainImage = null;
        terrainTypeMap = [];
        resetSelections(false);
        randomizeNoiseSeed();
        mapReadyEmitted = false;
        p.redraw();
      }, 0);
    }

    function attachControlListeners() {
      if (controlListenersAttached) {
        return;
      }
      window.addEventListener("reset-path", handleResetEvent);
      window.addEventListener("regenerate-map", handleRegenerateMap);
      controlListenersAttached = true;
      const originalRemove = p.remove.bind(p);
      p.remove = () => {
        window.removeEventListener("reset-path", handleResetEvent);
        window.removeEventListener("regenerate-map", handleRegenerateMap);
        controlListenersAttached = false;
        originalRemove();
      };
    }

    function computePathSummary(path) {
      if (!path || !path.length || !terrainTypeMap.length) {
        return { hasPath: false };
      }
      const counts = {
        water: 0,
        sand: 0,
        grass: 0,
        trees: 0,
        mountain: 0,
        snow: 0,
      };
      let cost = 0;

      for (const pt of path) {
        const terrain = terrainTypeMap[getIndex(pt.x, pt.y, p.width)];
        incrementBiomeCount(counts, terrain);
        cost += MOVEMENT_COSTS[terrain] || 1;
      }

      return {
        hasPath: true,
        length: path.length,
        cost,
        terrains: counts,
      };
    }

    function randomizeNoiseSeed() {
      noiseSeedValue = Math.floor(Math.random() * 1_000_000_000);
    }

    function downsamplePoints(points, maxPoints) {
      if (points.length <= maxPoints) {
        return points;
      }
      const step = Math.ceil(points.length / maxPoints);
      const result = [];
      for (let i = 0; i < points.length; i += step) {
        result.push(points[i]);
      }
      const last = points[points.length - 1];
      if (result[result.length - 1] !== last) {
        result.push(last);
      }
      return result;
    }

    function smoothPathPoints(points, iterations = 2) {
      let pts = points.slice();
      for (let iter = 0; iter < iterations; iter++) {
        const next = [pts[0]];
        for (let i = 0; i < pts.length - 1; i++) {
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const q1 = {
            x: p1.x * 0.75 + p2.x * 0.25,
            y: p1.y * 0.75 + p2.y * 0.25,
          };
          const q2 = {
            x: p1.x * 0.25 + p2.x * 0.75,
            y: p1.y * 0.25 + p2.y * 0.75,
          };
          next.push(q1, q2);
        }
        next.push(pts[pts.length - 1]);
        pts = next;
      }
      return pts;
    }

    function resizeMapCanvas() {
      const frame = targetEl || document.getElementById("map-frame");
      if (!frame) {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
        return;
      }

      const styles = getComputedStyle(frame);
      const padX =
        parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const padY =
        parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);

      const nextWidth = Math.max(120, frame.clientWidth - padX);
      const nextHeight = Math.max(120, frame.clientHeight - padY);

      p.resizeCanvas(nextWidth, nextHeight);
      if (mapCanvas && mapCanvas.drawingContext) {
        mapCanvas.drawingContext.imageSmoothingEnabled = true;
      }
    }
  };

  return new p5(sketch);
}
