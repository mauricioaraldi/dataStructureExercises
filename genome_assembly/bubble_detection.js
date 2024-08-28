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
  const graph = {};
  let lastRead = '';

  reads.forEach(read => {
    const maxWindowIndex = read.length - size;

    for (let i = 0; i <= maxWindowIndex; i++) {
      const curRead = read.substring(i, i + size);

      if (!graph[curRead]) {
        graph[curRead] = new Set();
      }

      if (lastRead) {
        graph[lastRead].add(curRead);
      }

      lastRead = curRead;
    }

    lastRead = '';
  });

  return graph;
}

function dfs(graph, startNode) {
  const order = [];
  const stack = [startNode];
  const visited = new Set();

  while(stack.length) {
    const currentVertex = stack.pop();

    if (!visited.has(currentVertex)) {
      visited.add(currentVertex);
      order.push(currentVertex);

      const neighbors = Array.from(graph[currentVertex]);

      neighbors.forEach(destiny => {
        if (neighbors.length > 1) {

        }

        if (!visited.has(destiny)) {
          stack.push(destiny);
        }
      });
    }
  }

  return order;
}

function findAllPaths(graph, startNode, bubbleThreshold) {
  const stack = [[startNode]];
  const paths = [];

  while (stack.length > 0) {
    const path = stack.pop();
    const lastNode = path[path.length - 1];
    const neighbors = graph[lastNode];

    if (!neighbors.size) {
      paths.push(path);
    }

    for (let neighbor of neighbors) {
      if (path.length >= bubbleThreshold) {
        paths.push(path);
      } else {
        let newPath = path.concat(neighbor);
        stack.push(newPath);
      }
    }
  }

  return paths;
}

function isBubble(path1, path2) {
  return (
    path1[0] === path2[0] &&
    path1[path1.length - 1] === path2[path2.length - 1] &&
    path1.length > 2 &&
    path2.length > 2 &&
    path1.toString() !== path2.toString()
  );
}

function detectBubbles(graph, bubbleThreshold) {
  const bubbles = {};
  const threshold = bubbleThreshold + 2;
  let bubblesQt = 0;

  for (const startNode in graph) {
    const neighbors = graph[startNode];

    if (neighbors.size > 1) {
      const paths = findAllPaths(graph, startNode, threshold);

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

            console.log(paths[i], paths[j]);

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
  const graph = buildDeBruijnGraph(reads, k - 1);
  const bubblesQt = detectBubbles(graph, bubbleThreshold);

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
