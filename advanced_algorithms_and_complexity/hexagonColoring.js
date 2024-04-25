// Input: First line n and m (vertices and edges). Next m lines u and v (both vertices which are connected by
//    a vertice). A vertex cannot be connected to itself.
// Example input: 3 3
//                1 2
//                2 3
//                1 3
// Output: SATISFIABLE or UNSATISFIABLE
// Example output: SATISFIABLE

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

        const result = hexagonColoring(verticesQt, connections);

        process.stdout.write(result);
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
      color: undefined,
    };
  }

  return graph;
}

// Each neighbor vertex can only have one color
function createClauseSingleColorNeighbors(i, graph) {
  // e.g. i = 2, edges = 1, 3
  
  // e.g. [2, 1, 3]
  const vertexAndNeighbors = [i, ...Array.from(graph[i].edges)];
  const sampleClauses = [];
  const allClauses = [];

  vertexAndNeighbors.sort();

  // e.g. [1, 2, 3]
  sampleClauses.push([...vertexAndNeighbors]);

  //Guarantees only one of each neighbors to be true
  vertexAndNeighbors.forEach((vertex, index) => {
    if (index === vertexAndNeighbors.length - 1) {
      return;
    }

    vertexAndNeighbors.slice(index + 1).forEach((neighborVertex) => {
      // e.g. [-1, -2] [-1, -3] [-2, -3]
      sampleClauses.push([-vertex, -neighborVertex]);
    });
  });

  const mustHaveColorClause = [];

  // repeat for each color
  for (let j = 1; j <= 3; j++) {
    mustHaveColorClause.push(`${i}${j}`);

    allClauses.push(
      ...sampleClauses.map(
        sampleClause => sampleClause.map(vertex => `${vertex}${j}`)
      )
    );
  }

  allClauses.push(mustHaveColorClause);

  return allClauses;
}

function hexagonColoring(verticesQt, connections) {
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

  // Default form assumes Xij = i vertex, j color
  const clauses = new Set();

  const graph = buildGraph(verticesQt);
  createConnections(graph, connections);

  for (let i = 1; i <= verticesQt; i++) {
    const newClauses = createClauseSingleColorNeighbors(i, graph);

    newClauses.forEach(newClause => {
      clauses.add(`${newClause.join(' ')} 0`);
    });
  }

  const SATInput = [`${clauses.size} ${verticesQt}`, ...Array.from(clauses)].join('\n');
  let execOutput = undefined;

  try {
    const FILENAME = 'sat_input.txt';

    fs.writeFileSync(FILENAME, SATInput);

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
    console.error('No exec output!');
    return;
  }

  const result = execOutput.trim().split('\n').slice(-1)[0];

  return result;
}

function test(outputType, onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => hexagonColoring(
        3,
        [
          [1, 2],
          [2, 3],
          [1, 3],
        ]
      ),
      expected: 'SATISFIABLE',
      // expected: [
      //   [1, 1],
      //   [1, -1, 0],
      // ]
    },
    {
      id: 2,
      run: () => hexagonColoring(
        4,
        [
          [1, 2],
          [1, 3],
          [1, 4],
          [2, 3],
          [2, 4],
          [3, 4],
        ]
      ),
      expected: 'UNSATISFIABLE',
      // expected: [
      //   [2, 1],
      //   [1, 0],
      //   [-1, 0],
      // ]
    },
  ];

  if (onlyTest !== undefined) {
    testCases = [testCases.find(testCase => testCase.id == onlyTest)].filter(test => test);
  }

  if (!testCases.length) {
    console.log('No tests found!');
    process.exit();
  }

  const testCasesPromises = testCases.map(testCase => testCase.run());

  Promise.all(testCasesPromises).then(results => {
    results.forEach((result, i) => {
      const testCase = testCases[i];

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
  });
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

module.exports = hexagonColoring;
