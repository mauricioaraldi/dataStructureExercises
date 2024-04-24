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

        process.stdout.write(hexagonColoring(verticesQt, connections).toString());

        process.exit();
      }
    };

    rl.on('line', readConnection);
  });
};

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

  return [[1, 2], [1, 2]];
}

function test(onlyTest) {
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
      expected: [
        [1, 1],
        [1, -1, 0],
      ]
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

    if (result.join('') === testCase.expected.join('')) {
      console.log(`[V] Passed test ${testCase.id}`);
    } else {
      console.log(`[X] Failed test ${testCase.id}`);
      console.log(`Expected: ${testCase.expected.join('')}`);
      console.log(`Got: ${result.join('')}`);
    }
  });

  process.exit();
}

if (process && process.argv && process.argv.includes('-t')) {
  const indexOfT = process.argv.indexOf('-t');
  const testToRun = process.argv[indexOfT + 1];

  VERBOSE = process.argv.includes('-v');

  return test(testToRun);
}

readLines();

module.exports = calculateDiet;
