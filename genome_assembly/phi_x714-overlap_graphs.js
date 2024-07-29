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
  let highestWeightNode = '0';
  let lowestWeightNode = '0';

  graph[0] = {
    id: '0',
    read: reads[0],
    edges: {},
    visited: false,
    totalWeight: 0,
  };

  for (let i = 0; i < reads.length; i++) {
    for (let j = i + 1; j < reads.length; j++) {
      if (!graph[j]) {
        graph[j] = {
          id: j.toString(),
          read: reads[j],
          edges: {},
          visited: false,
          totalWeight: 0,
        };
      }

      graph[i].edges[j] = checkAComesBeforeB(reads[i], reads[j]);
      graph[j].edges[i] = checkAComesBeforeB(reads[j], reads[i]);

      graph[i].totalWeight += graph[i].edges[j];
      graph[j].totalWeight += graph[j].edges[i];

      if (graph[i].totalWeight > graph[highestWeightNode].totalWeight) {
        highestWeightNode = i.toString();
      }

      if (graph[j].totalWeight > graph[highestWeightNode].totalWeight) {
        highestWeightNode = j.toString();
      }

      if (graph[i].totalWeight < graph[highestWeightNode].totalWeight) {
        lowestWeightNode = i.toString();
      }

      if (graph[j].totalWeight < graph[highestWeightNode].totalWeight) {
        lowestWeightNode = j.toString();
      }
    }
  }

  return {
    graph,
    highestWeightNode,
    lowestWeightNode,
  };
}

function getTraverseOrder(graph, startingNode) {
  const stack = new Set();
  const order = [];

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
        !graph[v].visited 
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

  const lastToFirstWeight = order[order.length - 1].edges[order[0].id];

  if (lastToFirstWeight > 0) {
    genome = genome.slice(0, genome.length - lastToFirstWeight);
  }

  return genome;
}

function assembly(reads) {
  const { graph, highestWeightNode, lowestWeightNode } = buildGraph(reads);
  const order = getTraverseOrder(graph, lowestWeightNode);
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
    {
      /*
       * Unresolved problem: How to know if the last letter
       * and the first letter should overlap?
       */
      id: 2,
      run: () => assembly(
        [
          'TAAC',
          'ACGG',
          'GTTT',
          'TTAG',
          'GTAC',
          'CGAT',
        ]
      ),
      expected: 'TAACGGTTTAGTACGAT',
    },
    {
      /*
       * Both highest and lowest weights return
       * results different from example
       *
       * Is it really correct?
       */
      id: 3,
      run: () => assembly(
        [
          'TAA',
          'AAT',
          'ATG',
          'TGC',
          'GCC',
          'CCA',
          'CAT',
          'ATG',
          'TGG',
          'GGG',
          'GGA',
          'GAT',
          'ATG',
          'TGT',
          'GTT',
        ]
      ),
      expected: 'TAATGCCATGGGATGTT',
      // ATGCCATAATGGGATGTT -- Using highestWeight
      // GTTAATGCCATGGGAT -- Using lowestWeight
      // TAATGGGATGCCATGTT -- Expect 1
      // TAATGCCATGGGATGTT -- Expect 2
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
