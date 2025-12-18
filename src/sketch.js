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

let terrainImage;
let terrainTypeMap = [];
let startCell = null;
let endCell = null;
let currentPath = [];

let zoomFactor = 100;

function setup() {
  createCanvas(700, 700);
  waterTerrain = new TerrainType(
    0.2,
    0.36,
    color(30, 176, 251),
    color(40, 255, 255)
  );
  sandTerrain = new TerrainType(
    0.36,
    0.44,
    color(215, 192, 140),
    color(245, 233, 187),
    0.2
  );
  grassTerrain = new TerrainType(
    0.44,
    0.58,
    color(65, 180, 90),
    color(136, 226, 119),
    -0.1
  );
  treesTerrain = new TerrainType(
    0.58,
    0.72,
    color(31, 140, 80),
    color(16, 110, 68),
    -0.3
  );
  mountainTerrain = new TerrainType(
    0.72,
    0.84,
    color(100, 96, 92),
    color(163, 152, 142),
    0.1
  );
  snowTerrain = new TerrainType(
    0.84,
    0.92,
    color(220, 232, 240),
    color(255, 255, 255),
    0.2
  );

  noLoop();
}

function draw() {
  if (!terrainImage) {
    generateTerrainLayer();
  }

  image(terrainImage, 0, 0);
  drawSelectionsAndPath();
}

function sampleTerrainNoise(x, y) {
  const baseFrequency = 0.7;
  const nx = (x / zoomFactor) * baseFrequency;
  const ny = (y / zoomFactor) * baseFrequency;

  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let amplitudeSum = 0;

  for (let i = 0; i < 4; i++) {
    sum += noise(nx * frequency, ny * frequency) * amplitude;
    amplitudeSum += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  const fbm = sum / amplitudeSum;
  return constrain(0.5 + (fbm - 0.5) * 1.35, 0, 1);
}

function getTerrainColor(noiseValue, mapType) {
  const normalized = normalize(
    noiseValue,
    mapType.maxHeight,
    mapType.minHeight
  );

  return lerpColor(
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
  terrainImage = createImage(width, height);
  terrainTypeMap = new Uint8Array(width * height);

  terrainImage.loadPixels();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noiseValue = sampleTerrainNoise(x, y);
      const index = getIndex(x, y, width);
      const { terrainType, terrainColor } = classifyTerrain(noiseValue);
      terrainTypeMap[index] = terrainType;

      const pixelIndex = index * 4;
      terrainImage.pixels[pixelIndex] = red(terrainColor);
      terrainImage.pixels[pixelIndex + 1] = green(terrainColor);
      terrainImage.pixels[pixelIndex + 2] = blue(terrainColor);
      terrainImage.pixels[pixelIndex + 3] = 255;
    }
  }
  terrainImage.updatePixels();
}

function mousePressed() {
  if (!terrainTypeMap.length) {
    return;
  }

  if (mouseX < 0 || mouseY < 0 || mouseX >= width || mouseY >= height) {
    return;
  }

  const x = floor(mouseX);
  const y = floor(mouseY);
  const index = getIndex(x, y, width);

  // Water is not traversable; ignore clicks there.
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
    currentPath = findPath(startCell, endCell, terrainTypeMap, width, height);
  } else {
    startCell = clickedCell;
    endCell = null;
    currentPath = [];
  }

  redraw();
}

function drawSelectionsAndPath() {
  if (startCell) {
    drawMarker(startCell, color(255, 215, 0));
  }
  if (endCell) {
    drawPinIcon(endCell, color(255, 69, 0));
  }
  if (currentPath.length) {
    drawSmoothPath(currentPath);
  }
}

function drawMarker(cell, markerColor) {
  push();
  noStroke();
  fill(markerColor);
  ellipse(cell.x + 0.5, cell.y + 0.5, 5, 5);
  pop();
}

function drawPinIcon(cell, strokeCol) {
  // Approximate lucide-react "MapPin" icon drawn in p5 for the destination.
  push();
  // Place the pin tip at the center of the destination cell so the icon sits atop the cell.
  translate(cell.x + 0.5, cell.y + 0.5);
  const scaleFactor = 0.5;
  scale(scaleFactor);
  // Shift drawing so the icon's tip (originally at 12,21) aligns with the origin.
  translate(-12, -21);
  stroke(strokeCol);
  strokeWeight(1.4 / scaleFactor);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  noFill();

  beginShape();
  vertex(12, 21);
  bezierVertex(12, 21, 6, 15.6, 6, 11);
  bezierVertex(6, 7.686, 8.686, 5, 12, 5);
  bezierVertex(15.314, 5, 18, 7.686, 18, 11);
  bezierVertex(18, 15.6, 12, 21, 12, 21);
  endShape();

  ellipse(12, 11, 6, 6);
  pop();
}

function drawSmoothPath(path) {
  push();
  stroke(255, 0, 140);
  strokeWeight(2);
  noFill();
  curveTightness(0.6);
  beginShape();

  const pts = smoothPathPoints(
    path.map((p) => ({ x: p.x + 0.5, y: p.y + 0.5 })),
    6
  );

  if (pts.length === 1) {
    vertex(pts[0].x, pts[0].y);
  } else {
    const first = pts[0];
    const last = pts[pts.length - 1];
    curveVertex(first.x, first.y);
    for (const pt of pts) {
      curveVertex(pt.x, pt.y);
    }
    curveVertex(last.x, last.y);
  }

  endShape();
  pop();
}

function smoothPathPoints(points, iterations = 2) {
  let pts = points.slice();
  for (let iter = 0; iter < iterations; iter++) {
    const next = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      const q1 = { x: p.x * 0.75 + q.x * 0.25, y: p.y * 0.75 + q.y * 0.25 };
      const q2 = { x: p.x * 0.25 + q.x * 0.75, y: p.y * 0.25 + q.y * 0.75 };
      next.push(q1, q2);
    }
    next.push(pts[pts.length - 1]);
    pts = next;
  }
  return pts;
}
