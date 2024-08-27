// Input: First line k and t. Next lines, a list of error-prone reads
// Example input: 3 3
//                AACG
//                AAGG
//                ACGT
//                AGGT
//                CGTT
//                GCAA
//                GGTT
//                GTTG
//                TGCA
//                TTGC
// Output: Given a bubble length threshold of t, detect (v, w)-bubbles in the de Bruijn graph generated
// from k-mers of the reads.
// Example output: 1

let PROFILE = false;
let VERBOSE = false;
let EDGE_ID = 0;
const MIN_WINDOW_SIZE = 5;

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const reads = [];

  rl.once('line', line => {
    const [bubbleThreshold, k] = line.split(' ').map(v => parseInt(v, 10));

    const readLine = (line, prevTimeout) => {
      reads.push(line);

      if (prevTimeout) {
        clearTimeout(prevTimeout);
      }

      const newTimeout = setTimeout(() => {
        process.stdout.write(detectBubbles(bubbleThreshold, k, reads).toString());
        process.exit();
      }, 300);

      rl.once('line', line => {
        readLine(line, newTimeout);
      });
    };

    rl.once('line', readLine);
  });
};

function checkAComesBeforeB(a, b) {
  let weight = 0;
  let windowSize = 0;

  while (true) {
    windowSize++;

    const query = a.slice(-windowSize);

    if (b.substring(0, windowSize) === query) {
      weight = windowSize;

      if (windowSize === b.length) {
        break;
      }
    } else {
      break;
    }
  }

  return weight;
}

function buildGraph(reads) {
  if (PROFILE) {
    console.time('build_graph');
  }

  const graph = {};
  const allEdges = {};
  let highestWeightNode = '0';
  let lowestWeightNode = '0';

  graph[0] = {
    id: '0',
    read: reads[0],
    edges: new Set(),
    reverseEdges: new Set(),
    visited: false,
    totalWeight: 0,
  };

  for (let i = 0; i < reads.length; i++) {
    for (let j = i + 1; j < reads.length; j++) {
      if (!graph[j]) {
        graph[j] = {
          id: j.toString(),
          read: reads[j],
          edges: new Set(),
          reverseEdges: new Set(),
          visited: false,
          totalWeight: 0,
        };
      }

      const iJResult = checkAComesBeforeB(reads[i], reads[j]);
      const jIResult = checkAComesBeforeB(reads[j], reads[i]);

      if (iJResult) {
        const edgeId = EDGE_ID++

        allEdges[edgeId] = { id: edgeId, destiny: j.toString(), weight: iJResult };

        graph[i].edges.add(edgeId);
        graph[j].reverseEdges.add(edgeId);
        graph[i].totalWeight += iJResult;
      }

      if (jIResult) {
        const edgeId = EDGE_ID++

        allEdges[edgeId] = { id: EDGE_ID++, destiny: i.toString(), weight: jIResult };

        graph[j].edges.add(edgeId);
        graph[i].reverseEdges.add(edgeId);
        graph[j].totalWeight += jIResult;
      }

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

  if (PROFILE) {
    console.timeEnd('build_graph');
  }

  return {
    allEdges,
    graph,
    highestWeightNode,
    lowestWeightNode,
  };
}

function breakReads(originalReads, size) {
  const reads = new Set();

  originalReads.forEach(originalRead => {
    const maxWindowIndex = originalRead.length - size;

    for (let i = 0; i <= maxWindowIndex; i++) {
      reads.add(originalRead.substring(i, i + size));
    }
  });

  return reads;
}

function isGraphBalanced(graph) {
  for (let key in graph) {
    if (graph[key].edges.size !== graph[key].reverseEdges.size) {
      return false;
    }
  }

  return true;
}

function hierholzer(graph, allEdges) {
  const stack = ['1'];
  const path = [];
  const usedEdges = new Set();

  while (stack.length) {
    const curVertexId = stack[stack.length - 1];
    const vertexUnusedEdges = Array.from(graph[curVertexId].edges).filter(e => !usedEdges.has(e));

    if (vertexUnusedEdges.length) {
      const nextEdgeId = vertexUnusedEdges[vertexUnusedEdges.length - 1];

      stack.push(allEdges[nextEdgeId].destiny);
      usedEdges.add(nextEdgeId);
    } else {
      path.push(stack.pop());
    }
  }

  if (path[path.length - 1] === path[0]) {
    path.shift();
  }

  return path.reverse();
}

function detectBubbles(bubbleThreshold, k, reads) {
  console.log(bubbleThreshold, k, reads);
  // let currentK = reads[0].length;

  // while (currentK--) {
  //   console.log(`CurrentK ${currentK}`);
  //   if (currentK < MIN_WINDOW_SIZE) {
  //     console.error(`Current Kmer size lower than ${MIN_WINDOW_SIZE}`);
  //     break;
  //   }

  //   EDGE_ID = 0;

  //   const kmerReads = breakReads(reads, currentK);

  //   const { allEdges, graph, highestWeightNode, lowestWeightNode } = buildGraph(Array.from(kmerReads));

  //   if (!isGraphBalanced(graph, allEdges)) {
  //     if (VERBOSE) {
  //       console.error('Graph is not balanced');
  //     }
  //     continue;
  //   }

  //   // const eulerianPath = hierholzer(graph, allEdges);

  //   // if (!eulerianPath.length) {
  //   //   if (VERBOSE) {
  //   //     console.error('No Eulerian Path');
  //   //   }
  //   //   continue;
  //   // }

  //   break;
  // }

  // return currentK + 1;
  return 0;
}

function generateRandomRead(size) {
  const letters = ['A', 'C', 'G', 'T'];
  const read = [];

  for (let i = 0; i < size; i++) {
    const randomLetter = Math.floor(Math.random() * letters.length);
    console.log(randomLetter);
    read.push(letters[randomLetter]);
  }

  return read.join('');
}

function test(outputType, onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => detectBubbles(
        3,
        3,
        [
          'AACG',
          'AAGG',
          'ACGT',
          'AGGT',
          'CGTT',
          'GCAA',
          'GGTT',
          'GTTG',
          'TGCA',
          'TTGC',
        ]
      ),
      expected: 1
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
  PROFILE = process.argv.includes('-p');

  return test(outputType, testToRun);
}

readLines();

module.exports = detectBubbles;
