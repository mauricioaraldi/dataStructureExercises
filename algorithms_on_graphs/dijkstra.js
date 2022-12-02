// Input: First line "n m w", where n is number of vertices, m number of edges and w is weight.
// After this, m lines with "u v", where both are connected vertices of the graph. Last line is
// the "start end" nodes of the graph.
// Example input: 4 4
//                1 2 1
//                4 1 2
//                2 3 2
//                1 3 5
//                1 3
// Output: Minimum weight of a path from "start" to "end". Otherwise −1.
// Example output: 3

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const connections = [];

  rl.once('line', line => {
    const [vertices, edges] = line.toString().split(' ').map(v => parseInt(v, 10));
    let n = edges;

    if (edges === 0) {
      process.stdout.write('-1');
      process.exit();
    }

    const readConnection = line => {
      const link = line.toString().split(' ').map(v => parseInt(v, 10));

      connections.push(link);

      if (!--n) {
        rl.off('line', readConnection);

        rl.once('line', line => {
          let [start, end] = line.toString().split(' ').map(v => parseInt(v, 10));

          process.stdout.write(findShortestPath(vertices, connections, start, end).toString());

          process.exit();
        });
      }
    };

    rl.on('line', readConnection);
  });
};

class PriorityQueue {
  #heap = [];
  #positionKey = {};
  #keyPosition = {};

  #getLeftChild(index) {
     return index * 2 + 1;
  }

  #getRightChild(index) {
    return index * 2 + 2;
  }

  #getParent(index) {
    return Math.floor((index - 1) / 2);
  }

  #swap(a, b) {
    const tmp = this.#heap[a];
    const aKey = this.#positionKey[a];
    const bKey = this.#positionKey[b];

    this.#heap[a] = this.#heap[b];
    this.#heap[b] = tmp;

    this.#positionKey[a] = bKey;
    this.#positionKey[b] = aKey;

    this.#keyPosition[aKey] = b;
    this.#keyPosition[bKey] = a;
  }

  #siftDown(index) {
    const leftChild = this.#getLeftChild(index);
    const rightChild = this.#getRightChild(index);
    let maxIndex = index;

    if (leftChild < this.#heap.length && this.#heap[leftChild] < this.#heap[maxIndex]) {
      maxIndex = leftChild;
    }

    if (rightChild < this.#heap.length && this.#heap[rightChild] < this.#heap[maxIndex]) {
      maxIndex = rightChild;
    }

    if (maxIndex != index) {
      this.#swap(maxIndex, index);
      this.#siftDown(maxIndex);
    }
  }

  #siftUp(index) {
    let newIndex = index;
    let parentIndex = this.#getParent(index);

    while (newIndex !== 0 && this.#heap[newIndex] < this.#heap[parentIndex]) {
      this.#swap(newIndex, parentIndex);
      newIndex = parentIndex;
      parentIndex = this.#getParent(newIndex);
    }
  }

  peek() {
    return this.#heap[0];
  }

  insert(priority, key) {
    const newIndex = this.#heap.push(priority) - 1;

    this.#keyPosition[key] = newIndex;
    this.#positionKey[newIndex] = key;

    this.#siftUp(newIndex);
  }

  extractMin() {
    const root = this.#heap[0];
    const rootKey = this.#positionKey[0];
    const lastElementIndex = this.#heap.length - 1;
    const lastElementKey = this.#positionKey[lastElementIndex];
    const lastElement = this.#heap.pop();

    delete this.#keyPosition[rootKey];

    if (this.#heap.length) {
      this.#heap[0] = lastElement;

      this.#positionKey[0] = lastElementKey;
      this.#keyPosition[lastElementKey] = 0;

      this.#siftDown(0);
    }

    return { value: root, key: rootKey };
  }

  changePriority(key, newPriority) {
    const elementPosition = this.#keyPosition[key];
    const oldPriority = this.#heap[elementPosition];
    this.#heap[elementPosition] = newPriority;

    if (newPriority < oldPriority) {
      this.#siftUp(elementPosition);
    } else {
      this.#siftDown(elementPosition);
    }
  }

  get length() {
    return this.#heap.length;
  }

  get isEmpty() {
    return this.length === 0;
  }
}

function buildGraph(verticesQt) {
  const graph = {};

  for (let i = 0; i < verticesQt; i++) {
    graph[i] = {
      edges: {},
    };
  }

  return graph;
}

function createConnections(graph, connections) {
  connections.forEach(([origin, destiny, weight]) => {
    graph[origin - 1].edges[destiny - 1] = weight;
  });
}

function dijkstra(graph, verticesQt, start) {
  const dist = new Array(verticesQt).fill(Infinity);

  dist[start] = 0;

  const queue = new PriorityQueue();

  dist.forEach((v, i) => queue.insert(v, i));

  while (!queue.isEmpty) {
    const { value: node, key } = queue.extractMin();

    Object.entries(graph[key].edges).forEach(([edge, weight]) => {
      const edgeDistance = dist[key] + weight;

      if (dist[edge] > edgeDistance) {
        dist[edge] = edgeDistance;

        queue.changePriority(edge, dist[edge]);
      }
    });
  }

  return dist;
}

function findShortestPath(verticesQt, connections, start, end) {
  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

  const distances = dijkstra(graph, verticesQt, start - 1);

  return distances[end - 1] === Infinity ? -1 : distances[end - 1];
}

readLines();

module.exports = findShortestPath;
