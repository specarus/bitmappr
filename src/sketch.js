import p5 from "p5";
import { TERRAIN, findPath, getIndex } from "./pathfinding.js";

export function createTerrainSketch(containerEl, { onReady } = {}) {
  const targetEl = containerEl || document.getElementById("map-frame");

  const sketch = (p) => {
    class TerrainType {
      constructor(minHeight, maxHeight, minColor, maxColor, lerpAdjustment = 0) {
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

    let terrainImage;
    let terrainTypeMap = [];
    let startCell = null;
    let endCell = null;
    let currentPath = [];

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
        "w-full h-full block rounded-2xl saturate-[1.04] contrast-[1.02] relative left-0 top-0"
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
    };

    p.windowResized = () => {
      resizeMapCanvas();
      terrainImage = null;
      terrainTypeMap = [];
      startCell = null;
      endCell = null;
      currentPath = [];
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

      if (p.mouseX < 0 || p.mouseY < 0 || p.mouseX >= p.width || p.mouseY >= p.height) {
        return;
      }

      const x = Math.floor(p.mouseX);
      const y = Math.floor(p.mouseY);
      const index = getIndex(x, y, p.width);

      if (terrainTypeMap[index] === TERRAIN.WATER) {
        return;
      }

      const clickedCell = { x, y };

      if (!startCell) {
        startCell = clickedCell;
        endCell = null;
        currentPath = [];
      } else if (!endCell) {
        endCell = clickedCell;
        currentPath = findPath(startCell, endCell, terrainTypeMap, p.width, p.height);
      } else {
        startCell = clickedCell;
        endCell = null;
        currentPath = [];
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
      const normalized = normalize(noiseValue, mapType.maxHeight, mapType.minHeight);
      return p.lerpColor(mapType.minColor, mapType.maxColor, normalized + mapType.lerpAdjustment);
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
      terrainImage = p.createImage(p.width, p.height);
      terrainTypeMap = new Uint8Array(p.width * p.height);

      terrainImage.loadPixels();
      for (let y = 0; y < p.height; y++) {
        for (let x = 0; x < p.width; x++) {
          const noiseValue = sampleTerrainNoise(x, y);
          const index = getIndex(x, y, p.width);
          const { terrainType, terrainColor } = classifyTerrain(noiseValue);
          terrainTypeMap[index] = terrainType;

          const pixelIndex = index * 4;
          terrainImage.pixels[pixelIndex] = p.red(terrainColor);
          terrainImage.pixels[pixelIndex + 1] = p.green(terrainColor);
          terrainImage.pixels[pixelIndex + 2] = p.blue(terrainColor);
          terrainImage.pixels[pixelIndex + 3] = 255;
        }
      }
      terrainImage.updatePixels();
    }

    function drawSelectionsAndPath() {
      if (startCell) {
        drawMarker(startCell, p.color(255, 215, 0));
      }
      if (endCell) {
        drawPinIcon(endCell, p.color(255, 69, 0));
      }
      if (currentPath.length) {
        drawSmoothPath(currentPath);
      }
    }

    function drawMarker(cell, markerColor) {
      p.push();
      p.noStroke();
      p.fill(markerColor);
      p.ellipse(cell.x + 0.5, cell.y + 0.5, 5, 5);
      p.pop();
    }

    function drawPinIcon(cell, strokeCol) {
      // Approximate lucide-react "MapPin" icon drawn in p5 for the destination.
      p.push();
      // Place the pin tip at the center of the destination cell so the icon sits atop the cell.
      p.translate(cell.x + 0.5, cell.y + 0.5);
      const scaleFactor = 0.5;
      p.scale(scaleFactor);
      // Shift drawing so the icon's tip (originally at 12,21) aligns with the origin.
      p.translate(-12, -21);
      p.stroke(strokeCol);
      p.strokeWeight(1.4 / scaleFactor);
      p.strokeJoin(p.ROUND);
      p.strokeCap(p.ROUND);
      p.noFill();

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
      p.push();
      p.stroke(255, 0, 140);
      p.strokeWeight(2);
      p.noFill();
      p.curveTightness(0.6);
      p.beginShape();

      const pts = smoothPathPoints(
        path.map((pt) => ({ x: pt.x + 0.5, y: pt.y + 0.5 })),
        6
      );

      if (pts.length === 1) {
        p.vertex(pts[0].x, pts[0].y);
      } else {
        const first = pts[0];
        const last = pts[pts.length - 1];
        p.curveVertex(first.x, first.y);
        for (const pt of pts) {
          p.curveVertex(pt.x, pt.y);
        }
        p.curveVertex(last.x, last.y);
      }

      p.endShape();
      p.pop();
    }

    function smoothPathPoints(points, iterations = 2) {
      let pts = points.slice();
      for (let iter = 0; iter < iterations; iter++) {
        const next = [pts[0]];
        for (let i = 0; i < pts.length - 1; i++) {
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const q1 = { x: p1.x * 0.75 + p2.x * 0.25, y: p1.y * 0.75 + p2.y * 0.25 };
          const q2 = { x: p1.x * 0.25 + p2.x * 0.75, y: p1.y * 0.25 + p2.y * 0.75 };
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
      const padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);

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
