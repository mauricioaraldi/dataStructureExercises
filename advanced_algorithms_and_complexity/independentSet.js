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
      weight: weights[n],
      edges: new Set(),
      reverseEdges: new Set(),
      maximumWeight: Infinity,
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

function exploreTree(tree, v) {
  if (tree[v].maximumWeight === Infinity) {
    if (tree[v].edges.size === 0) {
      tree[v].maximumWeight = tree[v].weight;
      return tree[v].maximumWeight;
    }

    let m = tree[v].weight;
    tree[v].edges.forEach(edge => {
      tree[edge].edges.forEach(subEdge => {
        m += exploreTree(tree, subEdge);
      });
    });

    let w = 0;
    tree[v].edges.forEach(edge => {
      w += exploreTree(tree, edge);
    });

    tree[v].maximumWeight = Math.max(m, w);
  }

  return tree[v].maximumWeight;
}

function independentSet(weights, connections) {
  const tree = createTree(weights, connections);

  return exploreTree(tree, '0');
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
  const MIN_WEIGHT = 1;
  const MAX_WEIGHT = 1000;
  const nodesQt = 100000; //Max 100 000
  const weights = [];
  const connections = [];

  for (let i = 0; i < nodesQt; i++) {
    const weight = parseInt(Math.random() * (MAX_WEIGHT - MIN_WEIGHT) + MIN_WEIGHT + 1, 10);
    weights.push(weight);

    if (i < nodesQt - 1) {
      connections.push([i, i + 1]);
    }
  }

  console.log(independentSet(weights, connections));

  process.exit();
}

if (process && process.argv && process.argv.includes('-st')) {
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
