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
let PROFILE = false;
let GRAPH_TIME = 0;

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

function invertL(l) {
  const stringL = l.toString();
  return stringL.indexOf('-') > -1 ? stringL.replace('-', '') : `-${stringL}`;
}

function buildImplicationGraph(clauses) {
  const graph = {};
  const connections = [];

  clauses.forEach(clause => {
    const invertedL1 = invertL(clause[0]);

    if (clause.length === 2) {
      const invertedL2 = invertL(clause[1]);

      //First directed edge -l1 -> l2
      connections.push([invertedL1, clause[1].toString()]);

      //Second directed edge -l2 -> l1
      connections.push([invertedL2, clause[0].toString()]);
    } else {
      //Only one directed edge -l1 -> l1
      connections.push([invertedL1, clause[0].toString()]);
    }
  });

  return buildGraph(connections);
}

function buildGraph(connections) {
  const graph = {};

  connections.forEach(([originInt, destinyInt]) => {
    const origin = originInt.toString();
    const destiny = destinyInt.toString();

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

    graph[origin].edges.add(destiny);
    graph[destiny].reverseEdges.add(origin);
  });

  return graph;
}

function tarjan(graph, verticesQt) {
  const result = [];
  const tarjanStack = [];
  const executionStack = [];

  const sortVariables = (a, b) => {
    const intA = parseInt(a, 10);
    const intB = parseInt(b, 10);

    if (intA > 0 && intB > 0) {
      if (intA > intB) {
        return -1;
      }

      if (intB > intA) {
        return 1;
      }
    }

    if (intA < 0 && intB < 0) {
      if (intA > intB) {
        return 1;
      }

      if (intB > intA) {
        return -1;
      }
    }

    if (intA > intB) {
      return -1;
    }

    if (intA < intB) {
      return 1;
    }

    return 0;
  };

  for (let i in graph) {
    let component = new Set();

    if (graph[i].discovery === -1) {
      executionStack.push({vertex: i, state: 0});

      while (executionStack.length > 0) {
        let { vertex, state } = executionStack.pop();

        if (state === 0) {
          graph[vertex].discovery = graph[vertex].low = ++GRAPH_TIME;
          tarjanStack.push(vertex);
          graph[vertex].visited = true;

          executionStack.push({vertex: vertex, state: 1});

          const neighbors = Array.from(graph[vertex].edges).sort(sortVariables);

          neighbors.forEach(neighbor => {
            if (graph[neighbor].discovery === -1) {
              executionStack.push({vertex: neighbor, state: 0});
            }
          });
        } else {
          const neighbors = Array.from(graph[vertex].edges).sort(sortVariables);

          neighbors.forEach(neighbor => {
            if (graph[neighbor].visited) {
              graph[vertex].low = Math.min(graph[neighbor].low, graph[vertex].low);
            }
          });

          if (graph[vertex].low === graph[vertex].discovery) {
            let componentMember = -1;

            while (tarjanStack[tarjanStack.length - 1] !== vertex) {
              componentMember = tarjanStack.pop();
              graph[componentMember].visited = false;
              component.add(componentMember.toString());
            }

            componentMember = tarjanStack.pop();
            graph[componentMember].visited = false;
            component.add(componentMember.toString());

            if (component.size) {
              result.push(component);
              component = new Set();
            }
          }
        }
      }
    }
  }

  return result;
}

function getUniqueLResults(connectedComponents, clausesVariables, clauses, variablesQt) {
  const result = new Set();

  connectedComponents.forEach(component => {
    component.forEach(vertex => {
      const normalizedVertex = Math.abs(parseInt(vertex, 10)).toString();

      if (
        !result.has(normalizedVertex)
        && !result.has(`-${normalizedVertex}`)
        && clausesVariables.has(vertex)
      ) {
        result.add(vertex);
      }
    });
  });

  for (let i = 1; i <= variablesQt; i++) {
    if (!result.has(i.toString()) && !result.has(`-${i}`)) {
      result.add(`-${i}`)
    }
  }

  return Array.from(result).sort((a, b) => {
    const absA = Math.abs(parseInt(a, 10));
    const absB = Math.abs(parseInt(b, 10));

    if (absA > absB) {
      return 1;
    }

    if (absA < absB) {
      return -1;
    }

    return 0;
  });
}

function getClausesVariables(clauses) {
  const result = new Set();

  clauses.forEach(clause => {
    result.add(clause[0].toString());
    result.add(clause[1] ? clause[1].toString() : undefined);
  });

  return result;
}

function solver(variablesQt, clauses) {
  if (PROFILE) {
    console.time('graph_built');
    console.time('connected_components');
    console.time('checked_unsat');
    console.time('got_valid_variables');
    console.time('got_result');
  }

  const clausesVariables = getClausesVariables(clauses);
  const graph = buildImplicationGraph(clauses);

  if (PROFILE) {
    console.timeEnd('graph_built');
  }

  const connectedComponents = tarjan(graph, variablesQt * 2);

  if (PROFILE) {
    console.timeEnd('connected_components');
  }

  if (VERBOSE) {
    console.log('Graph', '\n ', graph);
    console.log('Connected components', '\n ', connectedComponents);
  }

  for (let componentIndex in connectedComponents) {
    const component = Array.from(connectedComponents[componentIndex]).sort((a, b) => {
      const absA = a.replace('-', '');
      const absB = b.replace('-', '');

      if (absA > absB) {
        return 1;
      }

      if (absB > absA) {
        return -1;
      }

      return 0;
    });

    for (let i = 0; i < component.length; i++) {
      for (let j = i + 1; j < component.length; j++) {
        const l1 = Math.abs(parseInt(component[i], 10));
        const l2 = Math.abs(parseInt(component[j], 10));

        if (l2 > l1) {
          break;
        }

        //If x and -x are in the same connectedComponent, UNSAT
        if (l1 === l2) {
          if (VERBOSE) {
            console.log(`Component [${componentIndex} = ${component}] contains both sides of var ${i}`);
          }

          return ['UNSATISFIABLE'];
        }
      }
    }
  }

  if (PROFILE) {
    console.timeEnd('checked_unsat');
  }

  const result = getUniqueLResults(connectedComponents, clausesVariables, clauses, variablesQt);

  if (PROFILE) {
    console.timeEnd('got_valid_variables');
  }

  if (PROFILE) {
    console.timeEnd('got_result');
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
    {
      id: 8,
      run: () => solver(
        12,
        [
          [3, 8],
          [-7, -10],
          [-9, 2],
          [6, -2],
          [2, 1],
          [-4, -5],
        ]
      ),
      expected: 'SATISFIABLE 1 2 3 -4 -5 6 -7 8 -9 -10 -11 -12'
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
      expected: 'SATISFIABLE -1 -2 -3 -4 -5 -6 -7 -8 -9 -10 11 12 -13 14 -15 -16 -17 -18'
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
      expected: 'SATISFIABLE -1 -2 -3 -4 -5 6 7 -8 9 -10 -11'
    },
    {
      id: 11,
      run: () => solver(
        1,
        [
          [1, -1],
        ]
      ),
      expected: 'SATISFIABLE 1'
    },
    {
      id: 12,
      run: () => solver(
        0,
        []
      ),
      expected: 'SATISFIABLE'
    },
    {
      id: 13,
      run: () => solver(
        1,
        [
          [-1],
        ]
      ),
      expected: 'SATISFIABLE -1'
    },
    {
      id: 14,
      run: () => solver(
        1,
        [
          [1],
          [-1],
        ]
      ),
      expected: 'UNSATISFIABLE'
    },
    {
      id: 15,
      run: () => solver(
        2,
        [
          [1, 2],
          [1, -2],
        ]
      ),
      expected: 'SATISFIABLE 1 2'
    },
    {
      id: 16,
      run: () => solver(
        1,
        [
          [1, -2],
          [-1, -2],
        ]
      ),
      expected: 'SATISFIABLE 1 -2'
    },
    {
      id: 17,
      run: () => solver(
        1,
        [
          [1, 2],
          [1, -2],
          [3, -4],
          [-3, -4]
        ]
      ),
      expected: 'SATISFIABLE 1 2 3 -4'
    },
    {
      id: 18,
      run: () => solver(
        6,
        [
          [6],
          [6],
          [6],
        ]
      ),
      expected: 'SATISFIABLE -1 -2 -3 -4 -5 6'
    },
    {
      id: 19,
      run: () => solver(
        4,
        [
          [2, 2],
          [4, 4],
          [2, 2],
        ]
      ),
      expected: 'SATISFIABLE -1 2 -3 4'
    },
    {
      id: 20,
      run: () => solver(
        1,
        [
          [-2, -2],
          [4, 4],
          [2, 2],
        ]
      ),
      expected: 'UNSATISFIABLE'
    },
    {
      id: 21,
      run: () => solver(
        6,
        [
          [1, 2],
          [-2, 3],
          [3, -4],
          [-4, 5],
          [5, -6],
          [-1, -5],
          [6, 1],
        ]
      ),
      expected: 'SATISFIABLE 1 2 3 -4 -5 -6'
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

function getMinisatResult(id, clauses, highestVar, forceVariables = []) {
  const INPUT_FILENAME = `${id}_sat_input.txt`;
  const OUTPUT_FILENAME = `sat_output.txt`;
  const parsedClauses = [];

  clauses.forEach(clause => parsedClauses.push(`${clause.join(' ')} 0`));
  forceVariables.forEach(variable => parsedClauses.push(`${variable} 0`));

  const SATInput = [
    `p cnf ${highestVar} ${clauses.length}`,
    ...parsedClauses,
  ];

  try {
    fs.writeFileSync(INPUT_FILENAME, SATInput.join('\n'));

    execOutput = childProcess.execSync(
      `minisat ${INPUT_FILENAME} ${OUTPUT_FILENAME}`,
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

  const minisatResult = fs.readFileSync(OUTPUT_FILENAME, 'utf8').trim().split('\n');

  if (!execOutput) {
    console.error(`No exec output for test ${testCase.id}`);
    return;
  }

  return [
    `${minisatResult[0]}ISFIABLE`,
    minisatResult[1] ? minisatResult[1].replace(' 0', '') : ''
  ];
}

function stressTest(untilFail) {
  let NUMBER_OF_TESTS = untilFail ? 1 : 1;
  let NUMBER_OF_TESTS_EXECUTED = {
    total: 0,
    SATISFIABLE: 0,
    UNSATISFIABLE: 0,
  };
  const MIN_VAR = 1;
  const MAX_VAR = 500;
  const MAX_CLAUSES = 1000;

  const generateRandomVar = () => {
    const signal = Math.random() < 0.5 ? '+' : '-';
    const number = Math.random() * (MAX_VAR - MIN_VAR) + MIN_VAR;

    return parseInt(`${signal}${number}`, 10);
  };

  while (NUMBER_OF_TESTS--) {
    if (untilFail && NUMBER_OF_TESTS_EXECUTED.total % 5 === 0) {
      console.clear();
      console.log(`Total ${NUMBER_OF_TESTS_EXECUTED.total} tests passed!`);
      console.log(`    SATISFIABLE: ${NUMBER_OF_TESTS_EXECUTED.SATISFIABLE}`);
      console.log(`    UNSATISFIABLE: ${NUMBER_OF_TESTS_EXECUTED.UNSATISFIABLE}`);
    }

    const clauses = [];
    const clausesQt = Math.random() * (MAX_CLAUSES - 2) + 2;
    let highestVar = 0;

    for (let c = 0; c < clausesQt; c++) {
      const var1 = generateRandomVar();
      const var2 = generateRandomVar();

      highestVar = Math.max(highestVar, Math.abs(var1), Math.abs(var2));

      clauses.push([var1, var2]);
    }

    let codeResult = solver(highestVar, clauses);
    let codeVariables = [];

    if (codeResult[1]) {
      codeVariables = codeResult[1].split(' ').sort((a, b) => {
        const absA = Math.abs(parseInt(a, 10));
        const absB = Math.abs(parseInt(b, 10));

        if (absA > absB) {
          return 1;
        }

        if (absB > absA) {
          return -1;
        }

        return 0;
      });

      codeResult[1] = codeVariables.join(' ');
    }

    const minisatResult = getMinisatResult(NUMBER_OF_TESTS + 1, clauses, highestVar, codeVariables);

    NUMBER_OF_TESTS_EXECUTED[minisatResult[0]]++;

    if (minisatResult[0] !== codeResult[0]) {
      console.clear();
      console.log(`[X] Failed test ${untilFail ? NUMBER_OF_TESTS_EXECUTED.total : NUMBER_OF_TESTS + 1}`);
      console.log(` -  Minisat: ${minisatResult}`);
      console.log(` -  Code: ${codeResult}`);
    } else if (untilFail) {
      NUMBER_OF_TESTS = 1;
    }

    NUMBER_OF_TESTS_EXECUTED.total++;
  }

  process.exit();
}

if (process && process.argv && process.argv.includes('-st')) {
  VERBOSE = process.argv.includes('-v');
  PROFILE = process.argv.includes('-p');

  return stressTest(process.argv.includes('-untilFail'));
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
  PROFILE = process.argv.includes('-p');

  return test(outputType, testToRun);
}

readLines();

module.exports = solver;
