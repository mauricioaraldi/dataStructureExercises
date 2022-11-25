// Input: First line "n m", where n is number of vertices and m number of edges. After this,
// m lines with "u v", where both are connected vertices of the graph. Last line is the 
// "start end" nodes of the graph.
// Example input: 4 4
//                1 2
//                3 2
//                4 3
//                1 4
//                1 4
// Output: 1 if there is a path between "start" and "end". 0 otherwise
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

          process.stdout.write(checkReachability(vertices, connections, start, end).toString());

          process.exit();
        });
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

function checkReachability(verticesQt, connections, start, end) {
  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

  if (!graph[start] || !graph[end]) {
    return 0;
  }

  explore(graph, start);

  if (graph[start].visited && graph[end].visited) {
    return 1;
  }

  return 0;
}

readLines();

module.exports = checkReachability;
