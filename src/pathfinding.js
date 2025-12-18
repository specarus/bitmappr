export const TERRAIN = {
  WATER: 0,
  SAND: 1,
  GRASS: 2,
  TREES: 3,
  MOUNTAIN: 4,
  SNOW: 5,
};

const movementCosts = {
  [TERRAIN.SAND]: 2,
  [TERRAIN.GRASS]: 1,
  [TERRAIN.TREES]: 3,
  [TERRAIN.MOUNTAIN]: 4,
  [TERRAIN.SNOW]: 5,
};

const directions = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
];

export function getIndex(x, y, mapWidth) {
  return y * mapWidth + x;
}

export function indexToPoint(index, mapWidth) {
  return {
    x: index % mapWidth,
    y: Math.floor(index / mapWidth),
  };
}

function heuristic(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function reconstructPath(cameFrom, currentIndex, mapWidth) {
  const path = [];
  let current = currentIndex;

  while (current !== -1) {
    path.push(indexToPoint(current, mapWidth));
    current = cameFrom[current];
  }

  return path.reverse();
}

export function findPath(start, goal, terrainTypeMap, mapWidth, mapHeight) {
  const startIndex = getIndex(start.x, start.y, mapWidth);
  const goalIndex = getIndex(goal.x, goal.y, mapWidth);

  if (
    terrainTypeMap[startIndex] === TERRAIN.WATER ||
    terrainTypeMap[goalIndex] === TERRAIN.WATER
  ) {
    return [];
  }

  const totalCells = mapWidth * mapHeight;
  const gScore = new Float32Array(totalCells);
  const fScore = new Float32Array(totalCells);
  const cameFrom = new Int32Array(totalCells);
  gScore.fill(Infinity);
  fScore.fill(Infinity);
  cameFrom.fill(-1);

  gScore[startIndex] = 0;
  fScore[startIndex] = heuristic(start.x, start.y, goal.x, goal.y);

  const openSet = new MinHeap();
  openSet.push(startIndex, fScore[startIndex]);

  while (!openSet.isEmpty()) {
    const { node: currentIndex, priority } = openSet.pop();

    if (priority > fScore[currentIndex]) {
      continue;
    }

    if (currentIndex === goalIndex) {
      return reconstructPath(cameFrom, goalIndex, mapWidth);
    }

    const { x: cx, y: cy } = indexToPoint(currentIndex, mapWidth);
    for (const { dx, dy } of directions) {
      const nx = cx + dx;
      const ny = cy + dy;

      if (nx < 0 || ny < 0 || nx >= mapWidth || ny >= mapHeight) {
        continue;
      }

      const neighborIndex = getIndex(nx, ny, mapWidth);
      const neighborTerrain = terrainTypeMap[neighborIndex];

      if (neighborTerrain === TERRAIN.WATER) {
        continue;
      }

      const moveCost = movementCosts[neighborTerrain] || 1;
      const tentativeG = gScore[currentIndex] + moveCost;

      if (tentativeG < gScore[neighborIndex]) {
        cameFrom[neighborIndex] = currentIndex;
        gScore[neighborIndex] = tentativeG;
        fScore[neighborIndex] = tentativeG + heuristic(nx, ny, goal.x, goal.y);
        openSet.push(neighborIndex, fScore[neighborIndex]);
      }
    }
  }

  return [];
}

class MinHeap {
  constructor() {
    this.items = [];
  }

  push(node, priority) {
    this.items.push({ node, priority });
    this.bubbleUp(this.items.length - 1);
  }

  pop() {
    if (this.items.length === 0) {
      return null;
    }
    if (this.items.length === 1) {
      return this.items.pop();
    }

    const root = this.items[0];
    this.items[0] = this.items.pop();
    this.bubbleDown(0);
    return root;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  bubbleUp(index) {
    let currentIndex = index;
    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      if (this.items[currentIndex].priority >= this.items[parentIndex].priority) {
        break;
      }
      this.swap(currentIndex, parentIndex);
      currentIndex = parentIndex;
    }
  }

  bubbleDown(index) {
    let currentIndex = index;
    const lastIndex = this.items.length - 1;

    while (true) {
      const left = currentIndex * 2 + 1;
      const right = currentIndex * 2 + 2;
      let smallest = currentIndex;

      if (left <= lastIndex && this.items[left].priority < this.items[smallest].priority) {
        smallest = left;
      }
      if (right <= lastIndex && this.items[right].priority < this.items[smallest].priority) {
        smallest = right;
      }

      if (smallest === currentIndex) {
        break;
      }

      this.swap(currentIndex, smallest);
      currentIndex = smallest;
    }
  }

  swap(a, b) {
    const temp = this.items[a];
    this.items[a] = this.items[b];
    this.items[b] = temp;
  }
}
