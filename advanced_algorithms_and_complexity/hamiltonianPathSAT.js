// Input: First line n and m (vertices and edges). Next m lines u and v (both vertices which are connected by
//    a vertice). A vertex cannot be connected to itself.
// Example input: 3 3
//                1 2
//                2 3
//                1 3
// Output: Boolean CNF. If possible to color vertices of input graph in 3 colors such that any two connected are of different colors,
//    it is SAT. Number of vars in formula is min 1 and max 3000. Number of clauses is min 1 and max 5000. First line, integers C and V
//    (number of clauses in formula and number of variables). Next C lines, description of a single clause. Each clause has a form
//    (x4 OR x1 OR x8). For k terms (in the example, k = 3 for x4, x1 and x8), output first k terms and then 0 in the end (in the
//    example, “4 − 1 8 0”). Each term as integer number. Variables x1, x2, ... , Xv as numbers 1, 2, ... , V. Output 3 negations
//    of variables x1, x2, ... , xV as numbers −1, −2, ... , −V. Each number other than the last one in each line must be a non-zero
//    integer between −V and V where V is total number of variables specified in the first line of the output. Ensure 1 <= C <= 5000 and
//    1 <= V <= 3000. If there are many different formulas, you can output any one of them.
// Example output: 1 1
//                 1 -1 0

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

  const connections = [];

  rl.once('line', line => {
    const [verticesQt, edges] = line.split(' ').map(v => parseInt(v, 10));
    let n = edges;

    if (edges === 0) {
      process.stdout.write('0');
      process.exit();
    }

    const readConnection = line => {
      const link = line.toString().split(' ').map(v => parseInt(v, 10));

      connections.push(link);

      if (!--n) {
        rl.removeListener('line', readConnection);

        process.stdout.write(hamiltonianPathToSAT(verticesQt, connections).join('\n'));

        process.exit();
      }
    };

    rl.on('line', readConnection);
  });
};

function createConnections(graph, connections) {
  connections.forEach(([origin, destiny]) => {
    graph[origin].edges.add(destiny);
    graph[destiny].edges.add(origin);
  });
}

function buildGraph(verticesQt) {
  const graph = {};

  for (let i = 1; i <= verticesQt; i++) {
    graph[i] = {
      edges: new Set(),
    };
  }

  return graph;
}

function sanitizeConnections(connections) {
  const sanitizedConnections = new Set();

  connections.map(connection => sanitizedConnections.add(connection.sort().join(' ')));

  return Array.from(sanitizedConnections).map(connection => connection.split(' '));
}

function createClauseVertexHasOnePosition(vertex, verticesQt) {
  const usedVariables = [];
  const allClauses = [];

  const positionClause = [];

  for (let j = 1; j <= verticesQt; j++) {
    const vertexPosVariable = `${vertex}_${j}`;

    usedVariables.push(`${vertexPosVariable}`);
    positionClause.push(`${vertexPosVariable}`);

    for (let nextPos = j + 1; nextPos <= verticesQt; nextPos++) {
      allClauses.push([`-${vertexPosVariable}`, `-${vertex}_${nextPos}`]);
    }
  }

  allClauses.push(positionClause);

  return {
    variables: usedVariables,
    clauses: allClauses,
  };
}

function createClauseAtNeighborsReach(vertex, verticesQt, graph) {
  const usedVariables = [];
  const allClauses = [];

  for (let j = 1; j < verticesQt; j++) {
    const neighborsReachClause = [`-${vertex}_${j}`];

    Array.from(graph[vertex].edges).forEach(neighbor => {
      neighborsReachClause.push(`${neighbor}_${j + 1}`);
    });

    allClauses.push(neighborsReachClause);
  }

  return {
    variables: usedVariables,
    clauses: allClauses,
  };
}

function createClauseOneVertexPerPosition(vertex, verticesQt, graph) {
  const usedVariables = [];
  const allClauses = [];

  for (let j = 1; j <= verticesQt; j++) {
    for (let i = vertex + 1; i <= verticesQt; i++) {
      allClauses.push([`-${vertex}_${j}`, `-${i}_${j}`]);
    }
  }

  return {
    variables: usedVariables,
    clauses: allClauses,
  };
}

function createClauseOnlyOneFinalPos(verticesQt) {
  const usedVariables = [];
  const allClauses = [];

  for (let i = 1; i <= verticesQt; i++) {
    for (let ni = i + 1; ni <= verticesQt; ni++) {
      allClauses.push([`-${i}_${4}`, `-${ni}_${4}`]);
    }
  }

  return {
    variables: usedVariables,
    clauses: allClauses,
  };
}

function createClausePositionHasVertex(verticesQt) {
  const usedVariables = [];
  const allClauses = [];

  for (let j = 1; j <= verticesQt; j++) {
    const positionClause = [];

    for (let i = 1; i <= verticesQt; i++) {
      positionClause.push(`${i}_${j}`);
    }

    allClauses.push(positionClause);
  }

  return {
    variables: usedVariables,
    clauses: allClauses,
  };
}

function hamiltonianPathToSAT(verticesQt, connections, asCNF = false) {
  if (!verticesQt || !connections) {
    console.error("Invalid input: No vertices or connections");
    return [];
  }

  for (let i = 0; i < connections.length; i++) {
    const connection = connections[i];

    if (connection[0] === connection[1]) {
      console.error(`Invalid input: Connection between same vertice, link ${i}`);
      return [];
    }
  }

  // Default form assumes Xij = i vertex, j position
  const clausesSet = new Set();
  const sanitizedConnections = sanitizeConnections(connections);

  const graph = buildGraph(verticesQt);
  createConnections(graph, sanitizedConnections);

  // Used to minify variables
  const variablesSet = new Set();

  // const onlyOneFinalPosObj = createClauseOnlyOneFinalPos(verticesQt);
  // onlyOneFinalPosObj.clauses.forEach(clause => clausesSet.add(`${clause.join(' ')}`));
  // onlyOneFinalPosObj.variables.forEach(variable => variablesSet.add(variable));

  const positionHasVertexObj = createClausePositionHasVertex(verticesQt);
  positionHasVertexObj.clauses.forEach(clause => clausesSet.add(`${clause.join(' ')}`));
  positionHasVertexObj.variables.forEach(variable => variablesSet.add(variable));

  for (let i = 1; i <= verticesQt; i++) {
    const vertexHasOnePositionObj = createClauseVertexHasOnePosition(i, verticesQt);
    vertexHasOnePositionObj.clauses.forEach(clause => clausesSet.add(`${clause.join(' ')}`));
    vertexHasOnePositionObj.variables.forEach(variable => variablesSet.add(variable));

    // const oneVertexPerPositionObj = createClauseOneVertexPerPosition(i, verticesQt);
    // oneVertexPerPositionObj.clauses.forEach(clause => clausesSet.add(`${clause.join(' ')}`));
    // oneVertexPerPositionObj.variables.forEach(variable => variablesSet.add(variable));

    const atNeighborsReachObj = createClauseAtNeighborsReach(i, verticesQt, graph);
    atNeighborsReachObj.clauses.forEach(clause => clausesSet.add(`${clause.join(' ')}`));
    atNeighborsReachObj.variables.forEach(variable => variablesSet.add(variable));
  }

  // Reduce variables to use less numbers
  const parsedClauses = [];
  const variablesMap = {};

  Array.from(variablesSet).forEach((variable, i) => {
    variablesMap[variable] = i + 1;
  });

  let highestVar = 0;

  clausesSet.forEach(clause => {
    const parsedClause = clause.split(' ').map(clauseVariable => {
      const hasMinus = clauseVariable.indexOf('-') > -1;
      const sanitizedVariable = clauseVariable.replace('-', '');
      const variableInt = parseInt(variablesMap[sanitizedVariable]);

      if (variableInt > highestVar) {
        highestVar = variableInt;
      }

      return `${hasMinus ? '-' : ''}${variableInt}`;
    });

    parsedClauses.push(`${parsedClause.join(' ')} 0`);
  });

  if (VERBOSE) {
    console.log(clausesSet);
  }

  if (asCNF) {
    const SATInput = [
      `p cnf ${highestVar} ${parsedClauses.length}`,
      ...parsedClauses,
    ];

    return SATInput;
  }

  const SATInput = [
    `${parsedClauses.length} ${highestVar}`,
    ...parsedClauses,
  ];

  return SATInput;
}

function test(outputType, onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => hamiltonianPathToSAT(
        5,
        [
          [1, 2],
          [2, 3],
          [3, 5],
          [4, 5],
        ],
        outputType === 'MINISAT'
      ),
      expected: 'SATISFIABLE'
    },
    {
      id: 2,
      run: () => hamiltonianPathToSAT(
        4,
        [
          [1, 2],
          [1, 3],
          [1, 4],
        ],
        outputType === 'MINISAT'
      ),
      expected: 'UNSATISFIABLE'
    },
    {
      id: 3,
      run: () => hamiltonianPathToSAT(
        6,
        [
          [1, 2],
          [1, 3],
          [2, 4],
          [4, 6],
          [3, 5],
          [5, 6],
        ],
        outputType === 'MINISAT'
      ),
      expected: 'SATISFIABLE'
    },
    {
      id: 4,
      run: () => hamiltonianPathToSAT(
        30,
        [
          [1, 9],
          [1, 10],
          [1, 16],
          [1, 20],
          [1, 24],
          [2, 7],
          [2, 11],
          [2, 23],
          [3, 5],
          [3, 7],
          [3, 18],
          [3, 22],
          [4, 6],
          [4, 13],
          [4, 20],
          [4, 22],
          [4, 23],
          [4, 22],
          [4, 30],
          [5, 9],
          [5, 18],
          [5, 25],
          [6, 9],
          [6, 13],
          [6, 15],
          [6, 17],
          [6, 19],
          [6, 22],
          [6, 27],
          [7, 20],
          [7, 26],
          [8, 12],
          [8, 16],
          [8, 26],
          [8, 28],
          [9, 13],
          [9, 26],
          [9, 30],
          [10, 24],
          [10, 25],
          [10, 27],
          [11, 16],
          [11, 17],
          [11, 20],
          [11, 27],
          [11, 28],
          [11, 29],
          [11, 30],
          [12, 13],
          [12, 29],
          [13, 15],
          [13, 18],
          [13, 21],
          [14, 21],
          [14, 22],
          [15, 16],
          [15, 28],
          [16, 18],
          [16, 23],
          [16, 30],
          [17, 14],
          [17, 22],
          [17, 29],
          [18, 25],
          [18, 27],
          [19, 12],
          [19, 24],
          [19, 30],
          [20, 23],
          [20, 24],
          [21, 29],
          [23, 29],
          [24, 27],
          [24, 28],
          [26, 29],
          [27, 28],
        ],
        outputType === 'MINISAT'
      ),
      expected: 'SATISFIABLE'
    },
    {
      id: 5,
      run: () => hamiltonianPathToSAT(
        5,
        [
          [1, 2],
          [1, 3],
          [1, 4],
          [5, 2],
          [5, 3],
          [5, 4],
        ],
        outputType === 'MINISAT'
      ),
      expected: 'SATISFIABLE'
    },
    {
      id: 6,
      run: () => hamiltonianPathToSAT(
        7,
        [
          [1, 2],
          [1, 4],
          [1, 5],
          [2, 3],
          [3, 4],
          [3, 6],
          [4, 5],
          [5, 6],
          [6, 7],
        ],
        outputType === 'MINISAT'
      ),
      expected: 'SATISFIABLE'
    },
    {
      id: 7,
      run: () => hamiltonianPathToSAT(
        4,
        [
          [1, 2],
          [2, 3],
          [2, 4],
          [3, 4],
        ],
        outputType === 'MINISAT'
      ),
      expected: 'SATISFIABLE'
    },
    {
      id: 8,
      run: () => hamiltonianPathToSAT(
        6,
        [
          [1, 2],
          [1, 3],
          [1, 4],
          [1, 5],
          [6, 2],
          [6, 3],
          [6, 4],
          [6, 5],
        ],
        outputType === 'MINISAT'
      ),
      expected: 'UNSATISFIABLE'
    },
  ];

  if (onlyTest !== undefined) {
    testCases = [testCases.find(testCase => testCase.id == onlyTest)].filter(test => test);
  }

  if (!testCases.length) {
    console.log('No tests found!');
    process.exit();
  }

  if (outputType === 'MINISAT') {
    const testCasesPromises = testCases.map(testCase => testCase.run());

    Promise.all(testCasesPromises).then(testSATInputs => {
      testSATInputs.forEach((testSATInput, i) => {
        const testCase = testCases[i];
        let execOutput = undefined;

        try {
          const FILENAME = 'sat_input.txt';

          fs.writeFileSync(FILENAME, testSATInput.join('\n'));

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

        if (result === testCase.expected) {
          console.log(`[V] Passed test ${testCase.id}`);
        } else {
          console.log(`[X] Failed test ${testCase.id}`);
          console.log(`Expected: ${testCase.expected}`);
          console.log(`Got: ${result}`);
        }
      });

      process.exit();
    });

    return;
  }

  testCases.forEach(testCase => {
    const result = testCase.run();

    if (outputType === 'RESULT') {
      console.log(result.join('\n'));
    } else if (outputType === 'TEST') {
      if (result.join('|') === testCase.expected) {
        console.log(`[V] Passed test ${testCase.id}`);
      } else {
        console.log(`[X] Failed test ${testCase.id}`);
        console.log(`Expected: ${testCase.expected}`);
        console.log(`Got: ${result.join('|')}`);
      }
    }
  });

  process.exit();
}

if (process && process.argv && process.argv.includes('-t')) {
  const onlyOutput = process.argv.includes('-o');
  const silent = process.argv.includes('-s');
  const minisat = process.argv.includes('-m');
  const indexOfT = process.argv.indexOf('-t');
  const testToRun = process.argv[indexOfT + 1];
  let outputType = 'TEST';

  if (onlyOutput) {
    outputType = 'RESULT';
  }

  if (silent) {
    outputType = 'SILENT';
  }

  if (minisat) {
    outputType = 'MINISAT';
  }

  VERBOSE = process.argv.includes('-v');

  return test(outputType, testToRun);
}

readLines();

module.exports = hamiltonianPathToSAT;
