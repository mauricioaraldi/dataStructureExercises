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
        process.stdout.write(getResult(bubbleThreshold, k, reads).toString());
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

function buildDeBruijnGraph(reads, size) {
  const bubbleNodes = {
    in: {},
    out: {},
  };
  const graph = {};
  let lastRead = '';

  reads.forEach(read => {
    const maxWindowIndex = read.length - size;

    for (let i = 0; i <= maxWindowIndex; i++) {
      const curRead = read.substring(i, i + size);

      if (!graph[curRead]) {
        graph[curRead] = new Set();

        bubbleNodes.in[curRead] = 0;
        bubbleNodes.out[curRead] = 0;
      }

      if (lastRead && !graph[lastRead].has(curRead)) {
        graph[lastRead].add(curRead);

        bubbleNodes.out[lastRead]++;
        bubbleNodes.in[curRead]++;
      }

      lastRead = curRead;
    }

    lastRead = '';
  });

  for (let node in bubbleNodes.in) {
    if (bubbleNodes.in[node] < 2) {
      delete bubbleNodes.in[node];
    }

    if (bubbleNodes.out[node] < 2) {
      delete bubbleNodes.out[node];
    }
  }

  return {
    bubbleNodes,
    graph,
  };
}

function findAllPaths(graph, startNode, endNode, bubbleThreshold) {
  const stack = [[startNode]];
  const paths = [];

  while (stack.length) {
    const path = stack.pop();
    const lastNode = path[path.length - 1];
    const neighbors = graph[lastNode];

    if (lastNode === endNode) {
      paths.push(path);
      continue;
    }

    if (!neighbors.size) {
      continue;
    }

    for (let neighbor of neighbors) {
      if (path.length < bubbleThreshold + 1) {
        let newPath = path.concat(neighbor);
        stack.push(newPath);
      }
    }
  }

  return paths;
}

function isDisjoint(path1, path2) {
  const path1Core = path1.slice(1, -1);
  const path2Core = path2.slice(1, -1);

  for (let i = 0; i < path1Core.length; i++) {
    if (path2Core.includes(path1Core[i])) {
      return false;
    }
  }

  return true;
}

function isBubble(path1, path2) {
  return (
    path1[0] === path2[0] &&
    path1[path1.length - 1] === path2[path2.length - 1] &&
    // path1.length > 2 &&
    // path2.length > 2 &&
    isDisjoint(path1, path2)
  );
}

function detectBubbles(graph, bubbleThreshold, bubbleNodes) {
  const bubbles = {};
  let bubblesQt = 0;

   for (let nodeOut in bubbleNodes.out) {
      for (let nodeIn in bubbleNodes.in) {
        if (nodeOut === nodeIn) {
          continue;
        }

        console.log(nodeOut, nodeIn);

        const neighbors = graph[nodeOut];
        const paths = findAllPaths(graph, nodeOut, nodeIn, bubbleThreshold);

        if (paths.length < 2) {
          continue;
        }

        for (let i = 0; i < paths.length; i++) {
          for (let j = i + 1; j < paths.length; j++) {
            if (isBubble(paths[i], paths[j])) {
              const pathIString = paths[i].join('');
              const pathJString = paths[j].join('');

              if (!bubbles[pathIString]) {
                bubbles[pathIString] = new Set();
              }

              if (!bubbles[pathIString].has(pathJString)) {
                bubbles[pathIString].add(pathJString);
                bubblesQt++;
              }
            }
          }
        }
      }
    }

  return bubblesQt;
}

function getResult(bubbleThreshold, k, reads) {
  const { bubbleNodes, graph } = buildDeBruijnGraph(reads, k - 1);
  const bubblesQt = detectBubbles(graph, bubbleThreshold, bubbleNodes);

  return bubblesQt;
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
      run: () => getResult(
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

    {
      id: 2,
      run: () => getResult(
        4,
        4,
        [
          'AAACGCGTTGAACCCTCAAT',
          'GAATTGGAAACACGTTGAAT',
          'TGGAAACGCGTTGAACCCTC',
          'TGGAAACGCGTTGAACCCTC',
        ]
      ),
      expected: 4
    },

    {
      id: 3,
      run: () => getResult(
        3,
        4,
        [
          'AAABBBA',
          'AABCCBA',
          'AAABBCBA',
        ]
      ),
      expected: 4
    },

    {
      id: 4,
      run: () => getResult(
        3,
        1,
        [
          'AABBAABB',
        ]
      ),
      expected: 0
    },

    {
      id: 5,
      run: () => getResult(
        3,
        6,
        [
          'AABACBADAA',
        ]
      ),
      expected: 0
    },

    {
      id: 6,
      run: () => getResult(
        3,
        3,
        [
          'AABBA',
          'AACBA',
          'AADBA',
        ]
      ),
      expected: 3
    },

    {
      id: 7,
      run: () => getResult(
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

    {
      id: 8,
      run: () => getResult(
        3,
        3,
        [
          'AACG',
          'CGTT',
          'TTAA',
          'AATG',
          'TGTT',
          'ACCT',
          'CCTT',
        ]
      ),
      expected: 2
    },

    {
      id: 9,
      run: () => getResult(
        4,
        6,
        [
          'ATCCTAG',
          'TCCTAGA',
          'ATCGTCA',
          'CGTCAGA',
          'CGTTTCA',
          'TTTCAGA',
        ]
      ),
      expected: 2
    },

    {
      id: 10,
      run: () => getResult(
        3,
        4,
        [
          'ATGCAG',
          'ATCGCA',
          'ATACGC',
        ]
      ),
      expected: 3
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

module.exports = getResult;
