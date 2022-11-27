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

function findSinkList(graph, v, order = []) {
  console.log('Find sink list', v);

  if (!graph[v]) {
    return order;
  }

  order.push(v);

  if (!graph[v].edges.size) {
    return order;
  }

  let sinkNode = v;

  while (sinkNode) {
    let nextNode = null;

    while(graph[sinkNode].edges.size && !nextNode) {
      nextNode = graph[sinkNode].edges.keys().next().value;

      if (!graph[nextNode]) {
        graph[sinkNode].edges.delete(nextNode);
        nextNode = null;
      }
    }

    if (nextNode) {
      order.push(nextNode);
    }

    sinkNode = nextNode;
  }

  return order;
}

function cleanSinkList(sinkList, graph, order) {
  console.log('Clean sink list', sinkList);

  while (sinkList.length) {
    const sink = sinkList.pop();

    while (graph[sink].edges.size) {
      cleanSinkList(findSinkList(graph, sink), graph, order);
    }

    order.unshift(sink);
    delete graph[sink];

    if (sinkList.length > 1) {
      const previousSink = sinkList[sinkList.length - 1];

      graph[previousSink].edges.delete(sink);
    }
  }
}

function toposort(verticesQt, connections) {
  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

  const order = [];

  while (order.length < verticesQt) {
    const nextNode = parseInt(Object.keys(graph)[0], 10);
    const sinkOrder = findSinkList(graph, nextNode);

    cleanSinkList(sinkOrder, graph, order);
  }

  return order.join(' ');
}

// readLines();
test();

function test() {
  const verticesQt = 10;
  const connections = [];

  for (let i = 1; i < verticesQt; i++) {
    connections.push([i, i + 1]);
  }

  process.stdout.write(toposort(verticesQt, connections).toString());
  process.exit();
}

module.exports = toposort;
