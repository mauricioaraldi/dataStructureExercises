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
  let windowSize = 1;

  let startWeight = 0;
  let startMatchIndex = -1;
  while (true) {
    const query = a.slice(0, windowSize);
    const matchIndex = b.indexOf(query);

    if (matchIndex > -1) {
      if (matchIndex === 0) {
        startWeight = windowSize;
        startMatchIndex = matchIndex;
      }

      if (matchIndex + windowSize === b.length) {
        startWeight = windowSize;
        startMatchIndex = matchIndex;
        break;
      }

      windowSize++;
    } else {
      break;
    }
  }

  windowSize = 1;

  let endWeight = 0;
  let endMatchIndex = -1;
  while (true) {
    const query = a.slice(-windowSize);
    const matchIndex = b.indexOf(query);

    if (matchIndex > -1) {
      if (matchIndex + windowSize === b.length) {
        endWeight = windowSize;
        endMatchIndex = matchIndex;
      }

      if (windowSize === b.length) {
        endWeight = windowSize;
        endMatchIndex = matchIndex;
        break;
      }

      windowSize++;
    } else {
      break;
    }
  }

  return {
    start: {
      weight: startWeight,
      index: startMatchIndex,
    },
    end: {
      weight: endWeight,
      index: endMatchIndex,
    }
  };
}

function buildGraph(reads) {
  const graph = {};

  graph[0] = {
    id: 0,
    read: reads[0],
    edges: {},
    visited: false,
  };

  for (let i = 0; i < reads.length - 1; i++) {
    for (let j = i + 1; j < reads.length; j++) {
      graph[j] = {
        id: j,
        read: reads[j],
        edges: {},
        visited: false,
        sorted: false,
      };

      const weight = compareReads(reads[i], reads[j]);
      const edge = weight;

      graph[i].edges[j] = edge;
      graph[j].edges[i] = edge;
    }
  }

  return graph;
}

function getTraverseOrder(graph) {
  const stack = new Set();
  const order = [];

  for (let key in graph) {
    stack.add(key);
  }

  let currentNode = 0;

  while (true) {
    graph[currentNode].visited = true;
    order.push(graph[currentNode]);

    stack.delete(currentNode.toString());

    if (stack.size === 0) {
      break;
    }

    const nextNode = Array.from(graph[currentNode].edges).reduce((acc, edge) => {
      const edgeWeight = Math.max(edge.start.weight, edge.end.weight);

      if (!graph[edge.node].visited && (!acc || edgeWeight > acc.weight)) {
        return { node: edge.node, weight: edgeWeight, edge };
      }

      return acc;
    }, { node: undefined });

    currentNode = nextNode.node;

    if (!currentNode) {
      currentNode = Array.from(stack)[0];
    }

    if (!currentNode) {
      break;
    }
  }

  return order;
}

function buildGenome(order) {
  const genome = order[0].read;

  for (let i = 1; i < order.length; i++) {
    const curRead = order[i];

    console.log(curRead.edges);
  }

  return genome;
}

function assembly(reads) {
  const graph = buildGraph(reads);
  const order = getTraverseOrder(graph);
  const result = buildGenome(order);

  return result;
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
