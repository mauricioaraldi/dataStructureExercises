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
  const graph = {
    time: 0,
  };

  connections.forEach(([origin, destiny]) => {
    if (!graph[origin]) {
      graph[origin] = {
        discovery: -1,
        low: -1,
        edges: new Set(),
        reverseEdges: new Set(),
        visited: false,
      };
    }

    if (!graph[destiny]) {
      graph[destiny] = {
        discovery: -1,
        low: -1,
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

function buildCondensationGraph(graph, connectedComponents) {
  const condensatedGraph = {};
  const edgeKeyMap = {};
  const condensedComponents = [];

  connectedComponents.forEach(component => {
    const condensedComponent = {
      keys: new Set(),
      edges: new Set(),
      reverseEdges: new Set(),
      visited: false,
    };

    component.forEach(vertex => {
      condensedComponent.reverseEdges.delete(vertex);
      condensedComponent.edges.delete(vertex);
      condensedComponent.keys.add(vertex);

      graph[vertex].edges.forEach(neighbor => {
        if (!condensedComponent.keys.has(neighbor)) {
          condensedComponent.edges.add(neighbor);
        }
      });

      graph[vertex].reverseEdges.forEach(reverseNeighbor => {
        if (!condensedComponent.keys.has(reverseNeighbor)) {
          condensedComponent.reverseEdges.add(reverseNeighbor);
        }
      });
    });

    condensedComponents.push(condensedComponent);
  });

  condensedComponents.forEach((component, index) => {
    component.keys.forEach(key => {
      edgeKeyMap[key] = `${index + 1}`;
    })
  });

  condensedComponents.forEach((component, index) => {
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

    condensatedGraph[index + 1] = component;
  });

  return condensatedGraph;
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

function getLFromToposortedCondensation(graph, order) {
  const result = {};
  const variables = [];

  for (let key in graph) {
    Array.from(graph[key].keys).forEach(edgeKey => {
      result[edgeKey] = undefined;
      variables.push(edgeKey);
    });
  }

  for (let i = 0; i < order.length; i++) {
    const edge = order[i];

    variables.forEach(variable => {
      const intVariable = parseInt(variable, 10);
      const index = Math.abs(intVariable) - 1;

      if (result[index] === undefined) {
        result[index] = intVariable;
      }
    });

    const resultValues = [];

    for (let resultKey in result) {
      resultValues.push(result[resultKey]);
    }

    if (!resultValues.includes(undefined)) {
      return result;
    }
  }

  const finalResult = [];

  for (let key in result) {
    finalResult.push(result[key]);
  }

  return finalResult;
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

function getUniqueLResults(connectedComponents) {
  const result = new Set();

  connectedComponents.forEach(component => {
    component.forEach(vertex => {
      const normalizedVertex = Math.abs(parseInt(vertex, 10));

      if (!result.has(`${normalizedVertex}`) && !result.has(`-${normalizedVertex}`)) {
        result.add(vertex);
      }
    });
  });

  return Array.from(result);
}

function solver(variablesQt, clauses) {
  const graph = buildImplicationGraph(clauses);
  const connectedComponents = tarjan(graph, variablesQt * 2);
  const condensationGraph = buildCondensationGraph(graph, connectedComponents);

  if (VERBOSE) {
    console.log('Graph', '\n ', graph);
    console.log('Condensation graph', '\n ', condensationGraph);
  }

  for (let i = 1; i <= variablesQt; i++) {
    if (!graph[i]) {
      continue;
    }

    for (let j in condensationGraph) {
      //If x and -x are in the same connectedComponent, UNSAT
      if (condensationGraph[j].keys.has(`${i}`)) {
        if (condensationGraph[j].keys.has(`-${i}`)) {
          if (VERBOSE) {
            console.log(`Component ${condensationGraph[j]} contains both sides of var ${i}`);
          }

          return ['UNSATISFIABLE'];
        }
      }
    }
  }

  const result = getUniqueLResults(connectedComponents);

  sortWithNegativeKeys(result);

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
    {
      id: 8,
      run: () => solver(
        82,
        [
          [8, 51],
          [-46, -82],
          [-68, 7],
          [44, -7],
          [7, 6],
          [-29, -36],
        ]
      ),
      expected: 'SATISFIABLE 8 7 44 -46 -68 -29'
    },
    {
      id: 9,
      run: () => solver(
        18,
        [
          [8, -13],
          [-18, 11],
          [13, 12],
          [-12, -8],
          [14, 17],
          [-17, 12],
          [8, -2],
          [-8, -14],
          [-8, -10],
          [-5, -3],
        ]
      ),
      expected: 'SATISFIABLE 12 14 -8 -13 -2 -18 -5'
    },
    {
      id: 10,
      run: () => solver(
        11,
        [
          [4, -8],
          [-11, 6],
          [8, 7],
          [-7, -4],
          [9, 10],
          [-10, 7],
          [4, -1],
          [-4, -9],
          [-4, -5],
          [-3, -2],
        ]
      ),
      expected: ' SATISFIABLE 7 9 -4 -8 -1 -11 -3'
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
      if (result.join(' ').trim() === testCase.expected) {
        console.log(`[V] Passed test ${testCase.id}`);
      } else {
        console.log(`[X] Failed test ${testCase.id}`);
        console.log(`Expected: ${testCase.expected}`);
        console.log(`Got: ${result.join(' ').trim()}`);
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

function stressTest(untillFail) {
  let NUMBER_OF_TESTS = untillFail ? 1 : 5;
  const MIN_VAR = 1;
  const MAX_VAR = 100;
  const MAX_CLAUSES = 200;

  const generateRandomVar = () => {
    const signal = Math.random() < 0.5 ? '+' : '-';
    const number = Math.random() * (MAX_VAR - MIN_VAR) + MIN_VAR;

    return parseInt(`${signal}${number}`, 10);
  };

  while (NUMBER_OF_TESTS--) {
    const clauses = [];
    const clausesQt = Math.random() * (MAX_CLAUSES - 2) + 2;
    let highestVar = 0;

    for (let c = 0; c < clausesQt; c++) {
      const var1 = generateRandomVar();
      const var2 = generateRandomVar();

      highestVar = Math.max(highestVar, Math.abs(var1), Math.abs(var2));

      clauses.push([var1, var2]);
    }

    const minisatResult = getMinisatResult(NUMBER_OF_TESTS + 1, clauses, highestVar);
    const codeResult = solver(highestVar, clauses)[0];

    if (minisatResult !== codeResult) {
      console.log(`[X] Failed test ${NUMBER_OF_TESTS + 1}`);
      console.log(` -  Minisat: ${minisatResult}`);
      console.log(` -  Code: ${codeResult}`);
    } else if (untillFail) {
      NUMBER_OF_TESTS = 1;
    }
  }

  process.exit();
}

if (process && process.argv && process.argv.includes('-st')) {
  return stressTest(process.argv.includes('-untillFail'));
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
