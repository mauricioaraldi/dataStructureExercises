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
      reverseEdges: new Set(),
      visited: false,
    };
  }

  return graph;
}

function createConnections(graph, connections) {
  connections.forEach(([origin, destiny]) => {
    graph[origin].edges.add(destiny);
    graph[destiny].reverseEdges.add(origin);
  });
}

function dfs(graph, vertexId, order) {
  const vertex = graph[vertexId];

  if (vertex.visited) {
    return order;
  }

  vertex.visited = true;

  if (vertex.edges.size) {
    vertex.edges.forEach(edge => {
      if (!graph[edge].visited) {
        dfs(graph, edge, order);
      }
    });
  }

  order.push(vertexId);

  return order;
}

function getStartingPoint(graph) {
  let vertex = Object.keys(graph).find(key => !graph[key].visited);

  if (!vertex) {
    return undefined;
  }

  while (true) {
    if (!graph[vertex].reverseEdges.size) {
      return vertex;
    }

    const nextVertex = Array.from(graph[vertex].reverseEdges).find(
      edge => !graph[edge].visited
    );

    if (!nextVertex) {
      return vertex;
    }

    vertex = nextVertex;
  }
}

function toposort(verticesQt, connections) {
  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

  let startingPoint = getStartingPoint(graph);
  let dfsOrder = [];

  while (startingPoint) {
    dfsOrder = dfs(graph, startingPoint, dfsOrder);
    startingPoint = getStartingPoint(graph);
  }

  return dfsOrder.reverse();
}

function test(outputType, onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => toposort(
        6,
        [
          [1, 2],
          [2, 6],
          [3, 1],
          [3, 5],
          [4, 6],
          [5, 4],
        ],
      ),
      expected: '3 5 4 1 2 6'
    },
  ];

  if (onlyTest !== undefined) {
    testCases = [testCases.find(testCase => testCase.id == onlyTest)].filter(test => test);
  }

  if (!testCases.length) {
    console.log('No tests found!');
    process.exit();
  }

  testCases.forEach(testCase => {
    const result = testCase.run().join(' ');

    if (outputType === 'RESULT') {
      console.log(result);
    } else if (outputType === 'TEST') {
      if (result === testCase.expected) {
        console.log(`[V] Passed test ${testCase.id}`);
      } else {
        console.log(`[X] Failed test ${testCase.id}`);
        console.log(`Expected: ${testCase.expected}`);
        console.log(`Got: ${result}`);
      }
    }
  });

  process.exit();
}

if (process && process.argv && process.argv.includes('-t')) {
  const onlyOutput = process.argv.includes('-o');
  const silent = process.argv.includes('-s');
  const indexOfT = process.argv.indexOf('-t');
  const testToRun = process.argv[indexOfT + 1];
  let outputType = 'TEST';

  if (onlyOutput) {
    outputType = 'RESULT';
  }

  if (silent) {
    outputType = 'SILENT';
  }

  VERBOSE = process.argv.includes('-v');

  return test(outputType, testToRun);
}

readLines();

module.exports = toposort;
