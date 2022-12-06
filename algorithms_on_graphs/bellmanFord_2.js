// Input: First line "n m w", where n is number of vertices, m number of edges and w is weight.
// After this, m lines with "u v", where both are connected vertices of the graph.
// Example input: 4 4
//                1 2 -5
//                4 1 2
//                2 3 2
//                3 1 1
// Output: 1 if there's a negative cycle. 0 otherwise.
// Example output: 1

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
      process.stdout.write(checkConnectedComponents(vertices, connections).toString());
      process.exit();
    }

    const readConnection = line => {
      const link = line.toString().split(' ').map(v => parseInt(v, 10));

      connections.push(link);

      if (!--n) {
        process.stdout.write(checkNegativeCycles(vertices, connections).toString());
        process.exit();
      }
    };

    rl.on('line', readConnection);
  });
};

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

function bellmanFord(graph, verticesQt, start, dist, prev) {
  dist[start] = 0;

  let n = verticesQt;
  let lastRelaxedNode = null;

  while (n--) {
    Object.entries(graph[n].edges).forEach(([edge, weight]) => {
      const edgeDistance = dist[n] + weight;

      if (dist[edge] > edgeDistance) {
        lastRelaxedNode = n;
        dist[edge] = edgeDistance;
        prev[edge] = n;
      }
    });
  }

  return lastRelaxedNode;
}

function checkNegativeCycles(verticesQt, connections) {
  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

  let dist = new Array(verticesQt).fill(1001);
  let prev = new Array(verticesQt).fill(null);
  let lastRelaxedNode = null;
  let n = verticesQt;

  while (n--) {
    lastRelaxedNode = bellmanFord(graph, verticesQt, n, dist, prev);
  }

  lastRelaxedNode = bellmanFord(graph, verticesQt, lastRelaxedNode, dist, prev);

  return lastRelaxedNode === null ? 0 : 1;
}

readLines();

module.exports = checkNegativeCycles;
