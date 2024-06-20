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
      process.stdout.write(getCondensationGraph(vertices, connections).toString());
      process.exit();
    }

    const readConnection = line => {
      const link = line.toString().split(' ').map(v => parseInt(v, 10));

      connections.push(link);

      if (!--n) {
        process.stdout.write(getCondensationGraph(vertices, connections).toString());
        process.exit();
      }
    };

    rl.on('line', readConnection);
  });
};

function buildGraph(connections) {
  const graph = {};

  connections.forEach(([origin, destiny]) => {
    if (!graph[origin]) {
      graph[origin] = {
        edges: new Set(),
        reverseEdges: new Set(),
        visited: false,
      };
    }

    if (!graph[destiny]) {
      graph[destiny] = {
        edges: new Set(),
        reverseEdges: new Set(),
        visited: false,
      };
    }

    graph[origin].edges.add(`${destiny}`);
    graph[destiny].reverseEdges.add(`${origin}`);
  });

  return graph;
}

function dfs(graph) {
  const dfsOrder = [];
  const dfsUsed = new Set();
  const graphKeys = Object.keys(graph);

  graphKeys.forEach(key => {
    const stack = [];

    stack.push(key);

    dfsExplore(graph, stack, dfsUsed, dfsOrder);
  });

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

function getConnectedCondensedComponent(graph, dfsOrder) {
  let node = dfsOrder.pop();

  while (graph[node].visited) {
    if (!dfsOrder.length) {
      return;
    }

    node = dfsOrder.pop();
  }

  return explore(
    graph,
    node,
    {
      keys: new Set(),
      edges: new Set(),
      reverseEdges: new Set(),
      visited: false,
    },
  );
}

function explore(graph, v, condensationEdge) {
  graph[v].visited = true;

  condensationEdge.reverseEdges.delete(v);
  condensationEdge.edges.delete(v);
  condensationEdge.keys.add(v);

  graph[v].reverseEdges.forEach(reverseNeighbor => {
    if (!condensationEdge.keys.has(reverseNeighbor)) {
      condensationEdge.reverseEdges.add(reverseNeighbor);
    }
  });

  graph[v].edges.forEach(neighbor => {
    if (!condensationEdge.keys.has(neighbor)) {
      condensationEdge.edges.add(neighbor);
    }

    if (graph[neighbor].visited) {
      return;
    }

    explore(graph, neighbor, condensationEdge);
  });

  return condensationEdge;
}

function getConnectedComponents(graph, graphDfs) {
  const connectedComponents = [];

  while (graphDfs.length) {
    const connectedCondensedComponent = getConnectedCondensedComponent(graph, graphDfs);

    if (connectedCondensedComponent) {
      connectedComponents.push(connectedCondensedComponent);
    }
  }

  return connectedComponents;
}

function buildCondensationGraph(connectedComponents) {
  const graph = {};
  const edgeKeyMap = {};

  connectedComponents.forEach((component, index) => {
    component.keys.forEach(key => {
      edgeKeyMap[key] = `${index + 1}`;
    })
  });

  connectedComponents.forEach((component, index) => {
    const edgesToComponents = new Set();
    const reverseEdgesToComponents = new Set();

    component.edges.forEach(edge => {
      edgesToComponents.add(edgeKeyMap[edge]);
    });

    component.reverseEdges.forEach(edge => {
      reverseEdgesToComponents.add(edgeKeyMap[edge]);
    });

    component.edges = edgesToComponents;
    component.reverseEdges = reverseEdgesToComponents;

    graph[index + 1] = component;
  });

  return graph;
}

function getCondensationGraph(verticesQt, connections) {
  if (!connections || !connections.length) {
    return verticesQt;
  }

  const graph = buildGraph(connections);
  const graphDfs = dfs(graph, verticesQt);
  const connectedComponents = getConnectedComponents(graph, [...graphDfs]);
  const condensationGraph = buildCondensationGraph(connectedComponents);

  if (VERBOSE) {
    console.log(graphDfs);
    console.log(condensationGraph);
  }

  return connectedComponents.length;
}

function test(outputType, onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => getCondensationGraph(
        6,
        [
          ['1', '2'],
          ['2', '-3'],
          ['3', '1'],
          ['3', '-2'],
          ['-1', '3'],
          ['-2', '-1'],
        ]
      ),
      expected: 4
    },
    {
      id: 2,
      run: () => getCondensationGraph(
        6,
        [
          ['1', '2'],
          ['2', '-3'],
          ['3', '1'],
          ['3', '-2'],
          ['-1', '-3'],
          ['-2', '-1'],
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

module.exports = getCondensationGraph;
