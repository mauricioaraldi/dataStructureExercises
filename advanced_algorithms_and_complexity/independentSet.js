// Input: First line n (number of nodes). Next line n numbers f (the factor of each node). Next n-1 lines
// the connections between nodes (u and v). There are no cycles.
// Example input: 5
//                1 5 3 7 5
//                5 4
//                2 3
//                4 2
//                1 2
// Output: Maximum sum of factors of independent set
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
      const factors = line.split(' ').map(v => parseInt(v, 10));

      let n = nodesQt - 1;

      if (!n) {
        process.stdout.write(independentSet(factors, connections).toString());
        process.exit();
      }

      const readConnection = line => {
        const connection = line.toString().split(' ').map(v => parseInt(v, 10));

        connections.push(connection);

        if (!--n) {
          rl.removeListener('line', readConnection);

          process.stdout.write(independentSet(factors, connections).toString());

          process.exit();
        }
      };

      rl.on('line', readConnection);
    });
  });
};

function independentSet(factors, connections) {
  console.log(factors);
  console.log('xxxxxx');
  console.log(connections);
  return 0;
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
          [1, 2]
        ]
      ),
      expected: 2
    },
    {
      id: 3,
      run: () => independentSet(
        [1, 5, 3, 7, 5],
        [
          [5, 4],
          [2, 3],
          [4, 2],
          [1, 2]
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
