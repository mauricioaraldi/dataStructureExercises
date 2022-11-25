// Input: First line "n m", where n is number of vertices and m number of edges. After this,
// m lines with "u v", where both are connected vertices of the graph.
// Example input: 4 2
//                1 2
//                3 2
// Output: Number of connected components of the graph
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
      process.stdout.write(checkConnectedComponents(vertices, connections).toString());
      process.exit();
    }

    const readConnection = line => {
      const link = line.toString().split(' ').map(v => parseInt(v, 10));

      connections.push(link);

      if (!--n) {
        process.stdout.write(checkConnectedComponents(vertices, connections).toString());
        process.exit();
      }
    };

    rl.on('line', readConnection);
  });
};

function explore(graph, v) {
  graph[v].visited = true;

  graph[v].edges.forEach(neighbor => {
    if (graph[neighbor].visited) {
      return;
    }

    graph[neighbor].visited = true;

    explore(graph, neighbor);
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
    graph[destiny].edges.add(origin);
  });
}

function checkConnectedComponents(verticesQt, connections) {
  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

  if (!connections || !connections.length) {
    return verticesQt;
  }

  let connectedComponents = 0;

  Object.keys(graph).forEach(node => {
    if (graph[node].visited) {
      return;
    }

    explore(graph, node);
    connectedComponents++;
  });

  return connectedComponents;
}

readLines();

module.exports = checkConnectedComponents;
