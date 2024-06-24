// Input: 2-CNF Formula. First line v and c (number of variables and number of clauses). Next c lines i and j (representing
// clauses in CNF form).
// Example input: 3 3
//                1 -3
//                -1 2
//                -2 -3
// Output: First line "SATISFIABLE" or "UNSATISFIABLE" according to the satisfiability of the input formula. Second line
// variables in order(e.g. x1 = 0, x2 = 1, x3 = 0 === -1 2 -3).
// Example output: SATISFIABLE
//                 1 2 -3

let VERBOSE = false;

const fs = require('fs');
const childProcess = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const clauses = [];

  rl.once('line', line => {
    const [variablesQt, clausesQt] = line.split(' ').map(v => parseInt(v, 10));
    let n = clausesQt;

    if (!n) {
      solver(variablesQt, []).forEach(line => process.stdout.write(`${line}\n`));
      process.exit();
    }

    const readClause = line => {
      const clause = line.toString().split(' ').map(v => parseInt(v, 10));

      clauses.push(clause);

      if (!--n) {
        rl.removeListener('line', readClause);

        solver(variablesQt, clauses).forEach(line => process.stdout.write(`${line}\n`));

        process.exit();
      }
    };

    rl.on('line', readClause);
  });
};

function createConnections(graph, connections) {
  connections.forEach(([origin, destiny]) => {
    graph[origin].edges.add(`${destiny}`);
    graph[destiny].reverseEdges.add(`${origin}`);
  });
}

function invertL(l) {
  const stringL = `${l}`;
  return stringL.indexOf('-') > -1 ? stringL.replace('-', '') : `-${stringL}`;
}

function buildImplicationGraph(clauses) {
  const graph = {};
  const connections = [];

  clauses.forEach(clause => {
    const invertedL1 = invertL(clause[0]);
    const invertedL2 = invertL(clause[1]);

    if (clause.length === 2) {
      //First directed edge -l1 -> l2
      connections.push([invertedL1, clause[1]]);

      //Second directed edge -l2 -> l1
      connections.push([invertedL2, clause[0]]);
    } else {
      //Only one directed edge -l1 -> l1
      connections.push([invertedL1, clause[0]]);
    }
  });

  return buildGraph(connections);
}

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

function sortWithNegativeKeys(keys) {
  return keys.sort((a, b) => {
    const positiveA = Math.abs(parseInt(a, 10));
    const positiveB = Math.abs(parseInt(b, 10));

    if (positiveA < positiveB) {
      return -1;
    } else if (positiveA > positiveB) {
      return 1;
    }

    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    }

    return 0;
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
  const visitedNodes = new Set();
  let vertex = Object.keys(graph).find(key => !graph[key].visited);

  if (!vertex) {
    return undefined;
  }

  while (true) {
    if (!graph[vertex].reverseEdges.size) {
      return vertex;
    }

    const nextVertex = Array.from(graph[vertex].reverseEdges).find(
      edge => !graph[edge].visited && !visitedNodes.has(edge)
    );

    if (!nextVertex) {
      return vertex;
    }

    visitedNodes.add(vertex);

    vertex = nextVertex;
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
    }
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

function toposort(graph) {
  let startingPoint = getStartingPoint(graph);
  let dfsOrder = [];

  while (startingPoint) {
    dfsOrder = dfs(graph, startingPoint, dfsOrder);
    startingPoint = getStartingPoint(graph);
  }

  return dfsOrder.reverse();
}

function resetVisitedNodes(graph) {
  for (let key in graph) {
    graph[key].visited = false;
  }
}

function getLFromToposortedCondensation(graph, order, variablesQt) {
  const result = new Array(variablesQt);

  for (let i = 0; i < order.length; i++) {
    const edge = order[i];
    const variables = Array.from(graph[edge].keys);

    variables.forEach(variable => {
      const intVariable = parseInt(variable, 10);
      const index = Math.abs(intVariable) - 1;

      if (result[index] === undefined) {
        result[index] = intVariable;
      }
    });

    if (!result.includes(undefined)) {
      return result;
    }
  }

  return undefined;
}

function solver(variablesQt, clauses) {
  const graph = buildImplicationGraph(clauses);
  const dfsOrder = [];
  let startingPoint = getStartingPoint(graph);

  while(startingPoint) {
    dfs(graph, startingPoint, dfsOrder);
    startingPoint = getStartingPoint(graph);
  }

  dfsOrder.reverse();

  resetVisitedNodes(graph);

  const connectedComponents = getConnectedComponents(graph, [...dfsOrder]);
  const condensationGraph = buildCondensationGraph(connectedComponents);

  if (VERBOSE) {
    console.log('Graph', '\n ', graph);
    console.log('Condensation graph', '\n ', condensationGraph);
  }

  for (let i = 1; i <= variablesQt; i++) {
    for (let j in condensationGraph) {
      //If x and -x are in the same connectedComponent, UNSAT
      if (condensationGraph[j].keys.has(`${i}`)) {
        if (condensationGraph[j].keys.has(`-${i}`)) {
          return ['UNSATISFIABLE'];
        }
      }
    }
  }

  const condensationGraphToposort = toposort(condensationGraph).reverse();
  const result = getLFromToposortedCondensation(
    condensationGraph,
    condensationGraphToposort,
    variablesQt
  );

  if (!result) {
    return ['UNSATISFIABLE'];
  }

  return [
    'SATISFIABLE',
    result.join(' '),
  ];
}

function test(outputType, onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => solver(
        3,
        [
          [1, -3],
          [-1, 2],
          [-2, -3],
        ]
      ),
      expected: 'SATISFIABLE 1 2 -3'
    },
    {
      id: 2,
      run: () => solver(
        1,
        [
          [1, 1],
          [-1, -1],
        ]
      ),
      expected: 'UNSATISFIABLE'
    },
    {
      id: 3,
      run: () => solver(
        1,
        [
          [1],
        ]
      ),
      expected: 'SATISFIABLE 1'
    },
    {
      id: 4,
      run: () => solver(
        4,
        [
          [1, 2],
          [2, 3],
          [3, 4],
          [-1, -3],
          [-2, -4],
        ]
      ),
      expected: 'SATISFIABLE -1 2 3 -4'
    },
    {
      id: 5,
      run: () => solver(
        2,
        [
          [1, 2],
          [-1, 2],
          [-2, 1],
          [-1, -2],
        ]
      ),
      expected: 'UNSATISFIABLE'
    },
    {
      id: 6,
      run: () => solver(
        2,
        [
          [1, 2],
          [-1, 2],
          [2, -1],
          [-1, -2],
        ]
      ),
      expected: 'SATISFIABLE -1 2'
    },
    {
      id: 7,
      run: () => solver(
        8,
        [
          [1, 4],
          [-2, 5],
          [3, 7],
          [2, -5],
          [-8, -2],
          [3, -1],
          [4, -3],
          [5, -4],
          [-3, -7],
          [6, 7],
          [1, 7],
          [-7, -1],
        ]
      ),
      expected: 'SATISFIABLE 1 2 3 4 5 6 -7 -8'
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
      console.log(result.join('\n'));
    } else if (outputType === 'TEST') {
      if (result.join(' ') === testCase.expected) {
        console.log(`[V] Passed test ${testCase.id}`);
      } else {
        console.log(`[X] Failed test ${testCase.id}`);
        console.log(`Expected: ${testCase.expected}`);
        console.log(`Got: ${result.join(' ')}`);
      }
    }
  });

  process.exit();
}

function getMinisatResult(id, clauses, highestVar) {
  try {
    const FILENAME = `${id}_sat_input.txt`;
    const parsedClauses = clauses.map(clause => `${clause.join(' ')} 0`);

    const SATInput = [
      `p cnf ${highestVar} ${clauses.length}`,
      ...parsedClauses,
    ];

    fs.writeFileSync(FILENAME, SATInput.join('\n'));

    execOutput = childProcess.execSync(
      `minisat "${FILENAME}"`,
      { encoding: 'utf8' }
    );
  } catch (err) {
    // err.status
    // 10 = SATISFIABLE
    // 20 = UNSATISFIABLE
    if (err.status && [10, 20].indexOf(err.status) > -1 && err.stdout) {
      execOutput = err.stdout;
    } else {
      console.error(err);
    }
  }

  if (!execOutput) {
    console.error(`No exec output for test ${testCase.id}`);
    return;
  }

  const result = execOutput.trim().split('\n').slice(-1)[0];

  return result;
}

function stressTest() {
  const NUMBER_OF_TESTS = 2;
  const MIN_VAR = 1;
  const MAX_VAR = 100;
  const MAX_CLAUSES = 10;

  const generateRandomVar = () => {
    const signal = Math.random() < 0.5 ? '+' : '-';
    const number = Math.random() * (MAX_VAR - MIN_VAR) + MIN_VAR;

    return parseInt(`${signal}${number}`, 10);
  };

  for (let i = 0; i < NUMBER_OF_TESTS; i++) {
    const clauses = [];
    const clausesQt = Math.random() * (MAX_CLAUSES - 2) + 2;
    let highestVar = 0;

    for (let c = 0; c < clausesQt; c++) {
      const var1 = generateRandomVar();
      const var2 = generateRandomVar();

      highestVar = Math.max(highestVar, var1, var2);

      clauses.push([var1, var2]);
    }

    const minisatResult = getMinisatResult(i + 1, clauses, highestVar);
    const codeResult = solver(highestVar, clauses)[0];

    if (minisatResult === codeResult) {
      console.log(`Passed test ${i + 1}`);
    } else {
      console.log(`[X] Failed test ${i + 1}`);
      console.log(` -  Minisat: ${minisatResult}`);
      console.log(` -  Code: ${codeResult}`);
    }
  }

  process.exit();
}

if (process && process.argv && process.argv.includes('-st')) {
  return stressTest();
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

module.exports = solver;
