// Input: First line "n m", where n is number of vertices and m number of edges. After this,
// m lines with "u v", where both are connected vertices of the graph. Last line is the 
// "start end" nodes of the graph.
// Example input: 4 4
//                1 2
//                4 1
//                2 3
//                3 1
//                2 4
// Output: Minimum number of edges from "start" to "end". Otherwise −1
// Example output: 2

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
      process.stdout.write('0');
      process.exit();
    }

    const readConnection = line => {
      const link = line.toString().split(' ').map(v => parseInt(v, 10));

      connections.push(link);

      if (!--n) {
        rl.off('line', readConnection);

        rl.once('line', line => {
          let [start, end] = line.toString().split(' ').map(v => parseInt(v, 10));

          process.stdout.write(bfs(vertices, connections, start, end).toString());

          process.exit();
        });
      }
    };

    rl.on('line', readConnection);
  });
};

class Queue {
  constructor() {
    this.elements = {};
    this.head = 0;
    this.tail = 0;
  }

  enqueue(element) {
    this.elements[this.tail++] = element;
  }

  dequeue() {
    const item = this.elements[this.head];

    delete this.elements[this.head++];

    return item;
  }

  peek() {
    return this.elements[this.head];
  }

  get length() {
    return this.tail - this.head;
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
      visited: false,
      distance: null,
    };
  }

  return graph;
}

function createConnections(graph, connections) {
  connections.forEach(([origin, destiny]) => {
    graph[origin].edges.add(destiny);
    graph[destiny].edges.add(origin);
  });
}

function bfs(verticesQt, connections, start, end) {
  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

  if (!graph[start] || !graph[end]) {
    return -1;
  }

  graph[start].distance = 0;

  const shortestPathTree = [];
  const queue = new Queue();

  queue.enqueue(start);

  while (queue.length) {
    const nodeKey = queue.dequeue();
    const node = graph[nodeKey];

    node.visited = true;

    if (!shortestPathTree[node.distance]) {
      shortestPathTree[node.distance] = [];
    }

    shortestPathTree[node.distance].push(nodeKey);

    node.edges.forEach(e => {
      if (graph[e].distance) {
        return;
      }

      graph[e].distance = node.distance + 1;
      queue.enqueue(e);
    });

    if (graph[end].distance) {
      return graph[end].distance;
    }
  }

  return -1;
}

readLines();

module.exports = bfs;
