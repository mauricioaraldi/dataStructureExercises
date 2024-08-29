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

function findAllPaths(graph, startNode, bubbleThreshold, bubbleNodes) {
  const stack = [[startNode]];
  const paths = [];
  const threshold = bubbleThreshold + 1;

  while (stack.length) {
    const path = stack.pop();
    const lastNode = path[path.length - 1];
    const neighbors = graph[lastNode];

    if (path.length >= threshold || !neighbors.size) {
      paths.push(path);
      continue;
    }

    for (let neighbor of neighbors) {
      if (path.length < threshold) {
        let newPath = path.concat(neighbor);
        stack.push(newPath);
      }
    }
  }

  return paths.filter(path => {
    for (let nodeIn in bubbleNodes.in) {
      if (path.includes(nodeIn)) {
        return true;
      }
    }

    return false;
  });
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

function getBubblePaths(path1, path2, bubbleNodes) {
  if (path1[0] !== path2[0]) {
    return false;
  }

  // console.log(111111, path1, path2);

  let bubblePath1;
  let bubblePath2;

  for (let i = 1; i < path1.length; i++) {
    // if path1 node is in IN
    if (bubbleNodes.in[path1[i]]) {
      const path2NodeIndex = path2.indexOf(path1[i]);

      // and exist in path2
      if (path2NodeIndex > -1) {
        bubblePath1 = path1.slice(0, i + 1);
        bubblePath2 = path2.slice(0, path2NodeIndex + 1);
        break;
      }
    }
  }

  // console.log(22222, bubblePath1, bubblePath2);

  if (
    !bubblePath1 || !bubblePath2 ||
    bubblePath1[bubblePath1.length - 1] !== bubblePath2[bubblePath2.length - 1] ||
    bubblePath1.length < 2 ||
    bubblePath2.length < 2 ||
    bubblePath1.toString() === bubblePath2.toString() ||
    !isDisjoint(bubblePath1, bubblePath2)
  ) {
    return null;
  }

  return [bubblePath1, bubblePath2];
}

function detectBubbles(graph, bubbleThreshold, bubbleNodes) {
  const bubbles = {};
  let bubblesQt = 0;

  for (let nodeOut in bubbleNodes.out) {
    const neighbors = graph[nodeOut];
    const paths = findAllPaths(graph, nodeOut, bubbleThreshold, bubbleNodes);

    if (paths.length < 2) {
      continue;
    }

    for (let i = 0; i < paths.length; i++) {
      for (let j = i + 1; j < paths.length; j++) {
        const bubblePaths = getBubblePaths(paths[i], paths[j], bubbleNodes);

        if (!bubblePaths) {
          continue;
        }

        // console.log(333333, bubblePaths);

        const path1String = bubblePaths[0].join('');
        const path2String = bubblePaths[1].join('');

        if (!bubbles[path1String]) {
          bubbles[path1String] = new Set();
        }

        if (!bubbles[path1String].has(path2String)) {
          bubbles[path1String].add(path2String);
          bubblesQt++;
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
      expected: 6
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
