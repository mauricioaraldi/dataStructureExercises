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

function buildGraph(verticesQt) {
  const graph = {
    time: 0,
  };

  for (let i = 1; i <= verticesQt; i++) {
    graph[i] = {
      discovery: -1,
      low: -1,
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

function tarjan(graph, verticesQt) {
  const result = [];
  const tarjanStack = [];
  const executionStack = [];

  for (let i in graph) {
    let component = [];

    if (graph[i].discovery === -1) {
      executionStack.push({vertex: i, state: 0});

      while (executionStack.length > 0) {
        let { vertex, state } = executionStack.pop();

        if (state === 0) {
          graph[vertex].discovery = graph[vertex].low = ++graph.time;
          tarjanStack.push(vertex);
          graph[vertex].visited = true;

          executionStack.push({vertex: vertex, state: 1});

          Array.from(graph[vertex].edges).forEach(neighbor => {
            if (graph[neighbor].discovery === -1) {
              executionStack.push({vertex: neighbor, state: 0});
            }
          });
        } else {
          Array.from(graph[vertex].edges).forEach(neighbor => {
            if (graph[neighbor].visited) {
              graph[vertex].low = Math.min(graph[neighbor].low, graph[vertex].low);
            }
          });

          if (graph[vertex].low === graph[vertex].discovery) {
            let componentMember = -1;

            while (tarjanStack[tarjanStack.length - 1] !== vertex) {
              componentMember = tarjanStack.pop();
              graph[componentMember].visited = false;
              component.push(`${componentMember}`);
            }

            componentMember = tarjanStack.pop();
            graph[componentMember].visited = false;
            component.push(`${componentMember}`);

            if (component.length) {
              result.push(component);
              component = [];
            }
          }
        }
      }
    }
  }

  return result;
}

function checkConnectedComponents(verticesQt, connections) {
  if (!connections || !connections.length) {
    return verticesQt;
  }

  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

  const connectedComponents = tarjan(graph, verticesQt);

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
    {
      id: 6,
      run: () => checkConnectedComponents(
        6,
        [
          [1, 2],
          [2, 6],
          [3, 1],
          [3, 5],
          [4, 3],
          [5, 4],
        ]
      ),
      expected: 4
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
