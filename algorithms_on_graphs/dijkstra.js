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

    this.#heap[a] = this.#heap[b];
    this.#heap[b] = tmp;
  }

  #siftDown(index) {
    const left = this.#getLeftChild(index);
    const right = this.#getRightChild(index);
    let minIndex = index;

    if (left < this.#heap.length && this.#heap[smallest] < this.#heap[left]) {
      minIndex = left;
    }

    if (right < this.#heap.length && this.#heap[smallest] < this.#heap[right]) {
      minIndex = right;
    }

    if (minIndex != index) {
      this.#swap(minIndex, index);
      this.#siftDown(minIndex);
    }
  }

  #siftUp(index) {
    let newIndex = index;
    let parentIndex = this.#getParent(index);

    while (newIndex !== 0 && this.#heap[newIndex] > this.#heap[parentIndex]) {
      this.#swap(newIndex, parentIndex);
      newIndex = parentIndex;
      parentIndex = this.#getParent(newIndex);
    }
  }

  peek() {
    return this.#heap[0];
  }

  insert(element) {
    this.#siftUp(this.#heap.push(element));
  }

  extractMax() {
    const root = this.#heap[0];

    this.#heap[0] = this.#heap.pop();

    this.#siftDown(0);

    return root;
  }

  changePriority(index, newPriority) {
    const oldPriority = this.#heap[index];
    this.#heap[index] = newPriority;

    if (newPriority > oldPriority) {
      this.#siftUp(index);
    } else {
      this.#siftDown(index);
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

  for (let i = 1; i <= verticesQt; i++) {
    graph[i] = {
      edges: new Set(),
    };
  }

  return graph;
}

function createConnections(graph, connections) {
  connections.forEach(([origin, destiny]) => {
    graph[origin].edges.add(destiny);
  });
}

function dijkstra(graph, verticesQt, start) {
  const dist = new Array(verticesQt).fill(Infinity);
  const prev = new Array(verticesQt);

  dist[start] = 0;
}

function findShortestPath(verticesQt, connections, start, end) {
  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

  dijkstra(graph, verticesQt, start);

  return -1;
}

readLines();

module.exports = findShortestPath;
