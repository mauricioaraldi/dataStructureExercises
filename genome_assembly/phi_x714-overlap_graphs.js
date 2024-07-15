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

function checkAComesBeforeB(a, b) {
  let matchIndex = -1;
  let bestMatchIndex = -1;
  let windowSize = 0;

  while (true) {
    windowSize++;

    const query = a.slice(-windowSize);
    
    matchIndex = b.indexOf(query);

    if (matchIndex > -1) {
      bestMatchIndex = matchIndex;
      
      if (windowSize === b.length) {
        break;
      }
    } else {
      windowSize--;
      break;
    }
  }

  if (bestMatchIndex !== 0) {
    return 0;
  }

  return windowSize;
}

function buildGraph(reads) {
  const graph = {};

  graph[0] = {
    id: 0,
    read: reads[0],
    edges: {},
    visited: false,
  };

  for (let i = 0; i < reads.length; i++) {
    for (let j = i + 1; j < reads.length; j++) {
      if (!graph[j]) {
        graph[j] = {
          id: j,
          read: reads[j],
          edges: {},
          visited: false,
          sorted: false,
        };  
      }

      graph[i].edges[j] = checkAComesBeforeB(reads[i], reads[j]);
      graph[j].edges[i] = checkAComesBeforeB(reads[j], reads[i]);
    }
  }

  return graph;
}

function getTraverseOrder(graph) {
  const stack = new Set();
  const order = [];
  let startingNode = '0';

  for (let key in graph) {
    stack.add(key);
  }

  let currentNode = startingNode;
  let previousNode = undefined;

  while (true) {
    if (stack.size === 0) {
      break;
    }

    let nextNode = undefined;

    for (let v in graph[currentNode].edges) {
      const weight = graph[currentNode].edges[v];

      if (
        (
          !graph[v].visited
          || (!graph[currentNode].visited && v === startingNode)
        )
        && weight > 0
        && (!nextNode || weight > nextNode.weight)
      ) {
        nextNode = { node: v, weight: weight };
      }
    }

    if (nextNode === undefined) {
      if (!graph[currentNode].visited) {
        order.push(graph[currentNode]);
        graph[currentNode].visited = true;
        stack.delete(currentNode.toString());
      }

      currentNode = Array.from(stack)[0];
    } else if (nextNode.node === startingNode) {
      order.unshift(graph[currentNode]);
      graph[currentNode].visited = true;
      stack.delete(currentNode.toString());
      startingNode = currentNode;
      currentNode = previousNode;
      previousNode = undefined;
    } else {
      if (!graph[currentNode].visited) {
        order.push(graph[currentNode]);
        graph[currentNode].visited = true;
        stack.delete(currentNode.toString());
      }

      previousNode = currentNode;
      currentNode = nextNode.node;
    }

    if (!currentNode) {
      break;
    }
  }

  return order;
}

function buildGenome(order) {
  let curRead = order[0];
  let genome = curRead.read;

  for (let i = 1; i < order.length; i++) {
    const nextRead = order[i];
    const weight = curRead.edges[nextRead.id];

    genome += nextRead.read.slice(weight);

    curRead = nextRead;
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
