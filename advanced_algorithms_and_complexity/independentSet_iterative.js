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
const treeView = require('../text-treeview.js');

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

function printTree(tree, traverseOrder, codeResult) {
  const treeViewFormat = {};
  const treeArray = [];

  let maxI = 0;
  let maxE = 0;

  for (let v in tree) {
    tree[v].visited = false;
  }

  while (traverseOrder.length) {
    const v = traverseOrder.pop();

    treeViewFormat[v] = {
      v: v,
      text: `${v} [${tree[v].weight}]`,
      children: [],
    };

    tree[v].edges.forEach(edge => {
      if (tree[edge].visited) {
        treeViewFormat[v].children.push(treeViewFormat[edge]);
        delete treeViewFormat[edge];
      }
    });

    tree[v].visited = true;
  }

  for (let v in treeViewFormat) {
    treeArray.push(treeViewFormat[v]);
  }

  const treeViewResult = treeView(treeArray, {
    format: (indents, treeNode, node, parentNode) => {
      if (indents.length % 2 === 0) {
        maxI += tree[node.v].weight;
      } else {
        maxE += tree[node.v].weight;
      }

      return `${indents.join('')}${treeNode}${node.text}\n`;
    },
  });

  if (STRESS_TESTING) {
    if (codeResult) {
      if (codeResult === Math.max(maxI, maxE)) {
        console.log(`Passed test ${CURRENT_TEST}`);
        // console.log(treeViewResult);
        // console.log(`I: ${maxI} | E: ${maxE}`);
      } else {
        console.log(`Failed test ${CURRENT_TEST}`);
        console.log(treeViewResult);
        console.log(`I: ${maxI} | E: ${maxE}`);
        console.log(`[X] Code looks incorrect: ${codeResult}`);
        TEST_PASSING = false;
      }
    }
  } else {
    console.log(treeViewResult);
    console.log(`I: ${maxI} | E: ${maxE}`);
    if (codeResult) {
      if (codeResult === Math.max(maxI, maxE)) {
        console.log(`[V] Code looks correct: ${codeResult}`);
      } else {
        console.log(`[X] Code looks incorrect: ${codeResult}`);
      }
    }
  }

}

function createTree(weights, connections) {
  const tree = {};
  let n = weights.length;

  while (n--) {
    tree[n] = {
      visited: false,
      weight: weights[n],
      edges: new Set(),
      maxWeight: 0,
    };
  }

  connections.forEach(connection => {
    tree[connection[0]].edges.add(connection[1].toString());
    tree[connection[1]].edges.add(connection[0].toString());
  });

  return tree;
}

function traverseOrder(tree, v, nodesQt) {
  const order = [v];
  const queue = [v];

  while (queue.length) {
    const node = queue.shift();

    tree[node].visited = true;

    tree[node].edges.forEach(edge => {
      if (!tree[edge].visited) {
        order.push(edge);
        queue.push(edge);
      }
    });

    if (queue.length === 0) {
      for (let i = 0; i < nodesQt; i++) {
        if (!tree[i.toString()].visited) {
          queue.push(i.toString());
          break;
        }
      }
    }
  }

  return order;
}

function exploreTree(tree, stack, traverseOrder) {
  const treeRoot = stack[0];

  while (stack.length) {
    const v = stack.pop();
    let maxI = tree[v].weight;
    let maxE = 0;

    tree[v].edges.forEach(edge => {
      if (tree[edge].visited) {
        tree[edge].edges.forEach(subEdge => {
          if (tree[subEdge].visited) {
            maxI += tree[subEdge].maxWeight;
          }
        });
      }
    });

    tree[v].edges.forEach(edge => {
      if (tree[edge].visited) {
        maxE += tree[edge].maxWeight;
      }
    });

    tree[v].maxWeight = Math.max(maxI, maxE);
    tree[v].visited = true;
  }

  const result = tree[treeRoot].maxWeight;

  if (VERBOSE) {
    printTree(tree, traverseOrder, result);
  }

  return result;
}

function independentSet(weights, connections) {
  const tree = createTree(weights, connections);
  const order = traverseOrder(tree, '0', weights.length);

  for (let v in tree) {
    tree[v].visited = false;
  }

  return exploreTree(tree, [...order], order);
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
      expected: 31
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
      expected: 22
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
      expected: 21
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
      expected: 21
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
      expected: 27
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
      expected: 103
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
      expected: 103
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
      expected: 7
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
      expected: 25
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
