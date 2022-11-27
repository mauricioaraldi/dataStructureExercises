// Input: First line "n m", where n is number of vertices and m number of edges. After this,
// m lines with "u v", where both are connected vertices of the graph.
// Example input: 4 4
//                1 2
//                4 1
//                2 3
//                3 1
// Output: 1 if there is a cycle. 0 otherwise
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
        process.stdout.write(checkAcyclicity(vertices, connections).toString());
        process.exit();
      }
    };

    rl.on('line', readConnection);
  });
};

function exploreCycles(graph, v, cycleVisited) {
  graph[v].visited = true;
  cycleVisited.add(v);

  return Array.from(graph[v].edges).some(neighbor => {
    if (cycleVisited.has(neighbor)) {
      return true;
    }

    return exploreCycles(graph, neighbor, new Set(cycleVisited));
  });
}

function buildGraph(verticesQt) {
  const graph = {};

  for (let i = 1; i <= verticesQt; i++) {
    graph[i] = {
      edges: new Set(),
      visited: false,
    };
  }

  return graph;
}

function createConnections(graph, connections) {
  connections.forEach(([origin, destiny]) => {
    graph[origin].edges.add(destiny);
  });
}

function checkAcyclicity(verticesQt, connections) {
  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

  return Object.keys(graph).some(node => {
    if (graph[node].visited) {
      return false;
    }

    const cycleVisited = new Set();

    return exploreCycles(graph, node, cycleVisited);
  }) ? 1 : 0;
}

readLines();

module.exports = checkAcyclicity;
