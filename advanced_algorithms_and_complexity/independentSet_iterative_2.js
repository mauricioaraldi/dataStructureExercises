// Input: First line n (number of nodes). Next line n numbers f (the weight of each node). Next n-1 lines
// the connections between nodes (u and v). There are no cycles.
// Example input: 5
//                1 5 3 7 5
//                5 4
//                2 3
//                4 2
//                1 2
// Output: Maximum sum of weights of independent set
// Example output: 11

let VERBOSE = false;
let TEST_PASSING = true;
let CURRENT_TEST = 0;
let STRESS_TESTING = false;

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
    const nodesQt = parseInt(line, 10);

    rl.once('line', line => {
      const weights = line.split(' ').map(v => parseInt(v, 10));

      let n = nodesQt - 1;

      if (!n) {
        process.stdout.write(independentSet(weights, connections).toString());
        process.exit();
      }

      const readConnection = line => {
        const connection = line.toString().split(' ').map(v => parseInt(v, 10) - 1);

        connections.push(connection);

        if (!--n) {
          rl.removeListener('line', readConnection);

          process.stdout.write(independentSet(weights, connections).toString());

          process.exit();
        }
      };

      rl.on('line', readConnection);
    });
  });
};

function createTree(weights, connections) {
  const tree = {};
  let n = weights.length;

  while (n--) {
    tree[n] = {
      visited: false,
      weight: weights[n],
      edges: new Set(),
      reverseEdges: new Set(),
      maximumI: weights[n], // Self and grandchildren
      maximumE: 0, // Only direct children
    };
  }

  connections.forEach(connection => {
    connection.sort((a, b) => {
      if (a > b) {
        return 1;
      }

      if (a < b) {
        return -1
      }

      return 0;
    });

    tree[connection[0]].edges.add(connection[1].toString());
    tree[connection[1]].reverseEdges.add(connection[0].toString());
  });

  return tree;
}

function exploreTree(tree) {
  const stack = [0];

  while (stack.length > 0) {
    const node = stack[stack.length - 1];

    if (tree[node].visited) {
      stack.pop();

      for (let edge of tree[node].edges) {
        tree[node].maximumI += tree[edge].maximumE;
        tree[node].maximumE += Math.max(tree[edge].maximumI, tree[edge].maximumE);
      }
    } else {
      tree[node].visited = true;

      for (let edge of tree[node].edges) {
        if (!tree[edge].visited) {
          stack.push(edge);
        }
      }
    }
  }

  return Math.max(tree[0].maximumI, tree[0].maximumE);
}

function independentSet(weights, connections) {
  const tree = createTree(weights, connections);
  return exploreTree(tree);
}

function test(outputType, onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => independentSet(
        [1000],
        []
      ),
      expected: 1000
    },
    {
      id: 2,
      run: () => independentSet(
        [1, 2],
        [
          [0, 1]
        ]
      ),
      expected: 2
    },
    {
      id: 3,
      run: () => independentSet(
        [1, 5, 3, 7, 5],
        [
          [4, 3],
          [1, 2],
          [3, 1],
          [0, 1]
        ]
      ),
      expected: 11
    },
    {
      id: 4,
      run: () => independentSet(
        [1, 2, 3, 4, 5],
        [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4]
        ]
      ),
      expected: 9
    },
    {
      id: 5,
      run: () => independentSet(
        [1, 2, 3, 8, 9, 10, 11, 4, 5, 6, 7],
        [
          [0, 1],
          [0, 2],
          [1, 3],
          [1, 4],
          [2, 5],
          [2, 6],
          [3, 7],
          [4, 8],
          [5, 9],
          [6, 10],
        ]
      ),
      expected: 39
    },
    {
      id: 6,
      run: () => independentSet(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        [
          [0, 1],
          [0, 2],
          [1, 3],
          [3, 4],
          [4, 5],
          [5, 6],
          [6, 7],
          [2, 8],
          [8, 9],
        ]
      ),
      expected: 28
    },
    {
      id: 7,
      run: () => independentSet(
        [1, 2, 3, 4, 5, 6, 7, 8],
        [
          [0, 1],
          [0, 2],
          [1, 3],
          [3, 4],
          [4, 5],
          [5, 6],
          [2, 7],
        ]
      ),
      expected: 19
    },
    {
      id: 8,
      run: () => independentSet(
        [1, 2, 3, 4, 5, 7, 6, 8],
        [
          [0, 1],
          [0, 2],
          [1, 3],
          [3, 4],
          [4, 5],
          [5, 6],
          [2, 7],
        ]
      ),
      expected: 20
    },
    {
      id: 9,
      run: () => independentSet(
        [1, 2, 3, 4, 5, 6, 7, 8],
        [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 5],
          [5, 6],
          [6, 7],
        ]
      ),
      expected: 20
    },
    {
      id: 10,
      run: () => independentSet(
        [1, 2, 3, 4, 5, 6, 7, 8],
        [
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
          [0, 5],
          [0, 6],
          [0, 7],
        ]
      ),
      expected: 35
    },
    {
      id: 11,
      run: () => independentSet(
        [1, 2, 3, 4, 5, 6, 7],
        [
          [0, 1],
          [0, 2],
          [0, 3],
          [3, 4],
          [1, 5],
          [1, 6],
        ]
      ),
      expected: 19
    },
    {
      id: 12,
      run: () => independentSet(
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [
          [0, 1],
          [0, 2],
          [0, 3],
          [3, 4],
          [1, 5],
          [1, 6],
          [5, 7],
          [6, 8],
        ]
      ),
      expected: 26
    },
    {
      id: 13,
      run: () => independentSet(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        [
          [0, 1],
          [0, 2],
          [0, 3],
          [3, 4],
          [1, 5],
          [1, 6],
          [5, 7],
          [6, 8],
          [4, 9],
          [7, 10],
          [7, 11],
          [8, 12],
          [8, 13],
          [9, 14],
          [14, 15],
          [15, 16],
        ]
      ),
      expected: 101
    },
    {
      id: 14,
      run: () => independentSet(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        [
          [0, 1],
          [0, 2],
          [0, 3],
          [3, 4],
          [1, 5],
          [1, 6],
          [5, 7],
          [6, 8],
          [4, 9],
          [7, 10],
          [7, 11],
          [8, 12],
          [8, 13],
          [9, 14],
          [14, 15],
          [15, 16],
        ]
      ),
      expected: 101
    },
    {
      id: 15,
      run: () => independentSet(
        [1, 2, 3],
        [
          [0, 1],
          [1, 2],
          [2, 0],
        ]
      ),
      expected: 6
    },
    {
      id: 16,
      run: () => independentSet(
        [1, 2, 3, 4, 5],
        [
          [0, 3],
          [3, 1],
          [0, 4],
          [4, 2]
        ]
      ),
      expected: 9
    },
    {
      id: 17,
      run: () => independentSet(
        [1, 2, 3, 4, 5],
        [
          [1, 1],
          [0, 1],
          [1, 2],
          [1, 3],
          [1, 1],
          [1, 4],
        ]
      ),
      expected: 15
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
      process.stdout.write(result.toString());
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

function stressTest() {
  let TEST_QUANTITY = 1000000;
  const MIN_WEIGHT = 1;
  const MAX_WEIGHT = 10;
  const MAX_NODE_QT = 10;
  const nodesQt = parseInt(Math.random() * (MAX_NODE_QT - 1) + 2, 10); //Max 100 000
  const weights = [];
  const connections = [];
  const usedNumbers = [0];

  const getRandomNumber = (used = false, avoid) => {
    if (used) {
      const index = parseInt(Math.random() * (usedNumbers.length - 1) + 1, 10);

      if (usedNumbers[index] !== avoid) {
        return usedNumbers[index];
      }

      return usedNumbers[1];
    }

    const randomNumber = parseInt(Math.random() * nodesQt, 10);

    if (usedNumbers.indexOf(randomNumber) === -1 && randomNumber !== avoid) {
      usedNumbers.push(randomNumber);
      return randomNumber;
    }

    for (let i = 1; i < nodesQt; i++) {
      if (usedNumbers.indexOf(i) === -1 && randomNumber !== avoid) {
        usedNumbers.push(i);
        return i;
      }
    }
  };

  connections.push([0, getRandomNumber()]);
  weights.push(parseInt(Math.random() * (MAX_WEIGHT - MIN_WEIGHT) + MIN_WEIGHT + 1, 10));

  for (let i = 1; i < nodesQt; i++) {
    const weight = parseInt(Math.random() * (MAX_WEIGHT - MIN_WEIGHT) + MIN_WEIGHT + 1, 10);
    weights.push(weight);

    if (i < nodesQt - 1) {
      if (Math.random() > 0.5) {
        connections.push([getRandomNumber(true), getRandomNumber()]);
      } else {
        const var1 = getRandomNumber();
        connections.push([var1, getRandomNumber(true, var1)]);
      }
    }
  }

  CURRENT_TEST = TEST_QUANTITY;

  while (CURRENT_TEST--) {
    independentSet(weights, connections);

    if (!TEST_PASSING) {
      process.exit();
    }
  }

  process.exit();
}

if (process && process.argv && process.argv.includes('-st')) {
  STRESS_TESTING = true;
  VERBOSE = process.argv.includes('-v');

  stressTest();
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

module.exports = independentSet;
