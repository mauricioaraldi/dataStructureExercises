// Input: First line "n m", where n is number of vertices and m number of edges. After this,
// m lines with "u v", where both are connected vertices of the graph.
// Example input: 4 3
//                1 2
//                4 1
//                3 1
// Output: Any topological ordering of the vertices
// Example output: 4 3 1 2

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
        process.stdout.write(toposort(vertices, connections).toString());
        process.exit();
      }
    };

    rl.on('line', readConnection);
  });
};

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

function dfs(graph, stack, used, order) {
  const visited = new Set();

  while(stack.length) {
    const current = stack[stack.length - 1];

    if (used.has(current)) {
      stack.pop();
      continue;
    }

    if (visited.has(current)) {
      order.push(current);

      stack.pop();

      used.add(current);

      continue;
    }

    if (graph[current].edges.size) {
        visited.add(current);

        graph[current].edges.forEach(edge => {
          if (!used.has(edge)) {
            stack.push(edge);
          }
        });
    } else {
      order.push(current);

      stack.pop();

      used.add(current);
    }
  }
}

function toposort(verticesQt, connections) {
  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

  const order = [];
  const used = new Set();

  for(let i = 1; i <= verticesQt; i++) {
    const stack = [];

    stack.push(i);

    dfs(graph, stack, used, order);
  }

  return order.reverse().join(' ');
}

readLines();

module.exports = toposort;
