// Input: Each line is a an error-free read ({A, C, G, T}), from a set of thousands. Each read is 100 nucleotides
// long. The input doesn't contain the 100-mer composition of the genome, i.e., some 100-mers may be missing
// Example input: AAC
//                ACG
//                GAA
//                GTT
//                TCG
// Output: Assembled genome, from the overlap of the reads, in a single line
// Example output: ACGTTCGA

let VERBOSE = false;

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const reads = [];

  const readLine = (line, prevTimeout) => {
    reads.push(line);

    if (prevTimeout) {
      clearTimeout(prevTimeout);
    }

    const newTimeout = setTimeout(() => {
      process.stdout.write(assembly(reads));
      process.exit();
    }, 300);

    rl.once('line', line => {
      readLine(line, newTimeout);
    });
  };

  rl.once('line', readLine);
};

function compareReads(a, b) {
  console.log(a, b);
  let windowSize = 1;

  let startWeight = 0;
  while (true) {
    const query = a.slice(0, windowSize);
    const matchIndex = b.indexOf(query);

    if (matchIndex > -1) {
      if (matchIndex === 0) {
        startWeight = windowSize;
      }

      if (matchIndex + windowSize === b.length) {
        startWeight = windowSize;
        break;
      }

      windowSize++;
    } else {
      break;
    }
  }

  windowSize = 1;

  let endWeight = 0;
  while (true) {
    const query = a.slice(-windowSize);
    const matchIndex = b.indexOf(query);

    if (matchIndex > -1) {
      if (matchIndex + windowSize === b.length) {
        endWeight = windowSize;
      }

      if (windowSize === b.length) {
        endWeight = windowSize;
        break;
      }

      windowSize++;
    } else {
      break;
    }
  }

  return { start: startWeight, end: endWeight };
}

function buildGraph(reads) {
  const graph = {};

  graph[0] = {
    read: reads[0],
    edges: [],
  };

  for (let i = 0; i < reads.length - 1; i++) {
    for (let j = i + 1; j < reads.length; j++) {
      graph[j] = {
        read: reads[j],
        edges: [],
      };

      const weight = compareReads(reads[i], reads[j]);
      const edge = { node: j, weight };

      graph[i].edges.push(edge);
      graph[j].edges.push(edge);
    }
  }

  return graph;
}

function assembly(reads) {
  const graph = buildGraph(reads);

  console.log(graph);

  return '';
}

function test(outputType, onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => assembly(
        [
          'AAC',
          'ACG',
          'GAA',
          'GTT',
          'TCG',
        ]
      ),
      expected: 'ACGTTCGA',
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

module.exports = assembly;
