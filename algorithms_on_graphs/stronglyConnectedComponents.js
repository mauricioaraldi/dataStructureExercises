// Input: First line "n m", where n is number of vertices and m number of edges. After this,
// m lines with "u v", where both are connected vertices of the directed graph.
// Example input: 3 2
//                1 2
//                3 2
// Output: Number of connected components of the graph
// Example output: 3

let VERBOSE = false;

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

function explore(graph, v, connectedComponents = []) {
  graph[v].visited = true;

  connectedComponents.push(v);

  graph[v].edges.forEach(neighbor => {
    if (graph[neighbor].visited) {
      return;
    }

    explore(graph, neighbor, connectedComponents);
  });

  return connectedComponents;
}

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

function dfs(graph, verticesQt) {
  const dfsOrder = [];
  const dfsUsed = new Set();
  let i = verticesQt + 1;

  while (--i) {
    const stack = [];

    stack.push(i);

    dfsExplore(graph, stack, dfsUsed, dfsOrder);
  }

  return dfsOrder;
}

function dfsExplore(graph, stack, used, order) {
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

    if (graph[current].reverseEdges.size) {
        visited.add(current);

        graph[current].reverseEdges.forEach(edge => {
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

function getConnectedComponent(graph, verticesQt, dfsOrder) {
  let node = dfsOrder.pop();

  while (graph[node].visited) {
    if (!dfsOrder.length) {
      return;
    }

    node = dfsOrder.pop();
  }

  return explore(graph, node);
}

function checkConnectedComponents(verticesQt, connections) {
  if (!connections || !connections.length) {
    return verticesQt;
  }

  const graph = buildGraph(verticesQt);
  const connectedComponents = [];

  createConnections(graph, connections);

  const graphDfs = dfs(graph, verticesQt);

  while (graphDfs.length) {
    const connectedComponent = getConnectedComponent(graph, verticesQt, graphDfs);

    if (connectedComponent) {
      connectedComponents.push(connectedComponent);
    }
  }

  if (VERBOSE) {
    console.log(connectedComponents);
  }

  return connectedComponents.length;
}

function test(outputType, onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => checkConnectedComponents(
        3,
        [
          [1, 2],
          [3, 2],
        ]
      ),
      expected: 3
    },
    {
      id: 2,
      run: () => checkConnectedComponents(
        7,
        [
          [1, 2],
          [2, 3],
          [2, 4],
          [3, 4],
          [3, 6],
          [4, 1],
          [4, 5],
          [5, 6],
          [6, 7],
          [7, 5],
        ]
      ),
      expected: 2
    },
    {
      id: 3,
      run: () => checkConnectedComponents(
        9,
        [
          [1, 2],
          [2, 5],
          [2, 6],
          [3, 2],
          [4, 1],
          [4, 7],
          [5, 1],
          [5, 3],
          [5, 8],
          [7, 8],
          [8, 9],
          [9, 6],
          [9, 8],
        ]
      ),
      expected: 5
    },
    {
      id: 4,
      run: () => checkConnectedComponents(
        8,
        [
          [1, 2],
          [2, 4],
          [3, 2],
          [4, 3],
          [4, 5],
          [5, 6],
          [6, 8],
          [8, 7],
          [7, 5],
        ]
      ),
      expected: 3
    },
    {
      id: 5,
      run: () => checkConnectedComponents(
        6,
        [
          [1, 2],
          [2, 6],
          [3, 1],
          [3, 5],
          [4, 6],
          [5, 4],
        ]
      ),
      expected: 6
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
    const result = testCase.run();

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

module.exports = checkConnectedComponents;
