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
let EXPORT = false;

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const reads = [];

  rl.once('line', line => {
    const [k, bubbleThreshold] = line.split(' ').map(v => parseInt(v, 10));

    const readLine = (line, prevTimeout) => {
      reads.push(line);

      if (prevTimeout) {
        clearTimeout(prevTimeout);
      }

      const newTimeout = setTimeout(() => {
        process.stdout.write(getResult(k, bubbleThreshold, reads).toString());
        process.exit();
      }, 300);

      rl.once('line', line => {
        readLine(line, newTimeout);
      });
    };

    rl.once('line', readLine);
  });
};

function buildDeBruijnGraph(reads, size) {
  const bubbleNodes = new Map([
    ['in', new Map()],
    ['out', new Map()],
  ]);
  const graph = new Map();
  const processedReads = new Set();
  let lastKmer = '';

  reads.forEach(read => {
    if (processedReads.has(read)) {
      return;
    }

    processedReads.add(read);

    const maxWindowIndex = read.length - size;

    for (let i = 0; i <= maxWindowIndex; i++) {
      const kmer = read.substring(i, i + size);

      if (kmer === lastKmer) {
        continue;
      }

      if (!graph.has(kmer)) {
        graph.set(kmer, new Set());

        bubbleNodes.get('in').set(kmer, 0);
        bubbleNodes.get('out').set(kmer, 0);
      }

      if (lastKmer && !graph.get(lastKmer).has(kmer)) {
        graph.get(lastKmer).add(kmer);

        bubbleNodes.get('out').set(lastKmer, bubbleNodes.get('out').get(lastKmer) + 1);
        bubbleNodes.get('in').set(kmer, bubbleNodes.get('in').get(kmer) + 1);
      }

      lastKmer = kmer;
    }

    lastKmer = '';
  });

  for (let [node, count] of bubbleNodes.get('in')) {
    if (count < 2) {
      bubbleNodes.get('in').delete(node);
    }

    if (bubbleNodes.get('out').get(node) < 2) {
      bubbleNodes.get('out').delete(node);
    }
  }

  return {
    bubbleNodes,
    graph,
  };
}

function findAllPaths(graph, startNode, bubbleThreshold, bubbleNodes, dictionary) {
  const stack = [[startNode]];

  while (stack.length) {
    const path = stack.pop();
    const lastNode = path[path.length - 1];
    const neighbors = graph.get(lastNode);

    if (bubbleNodes.get('in').has(lastNode) && lastNode !== startNode) {
      if (!dictionary.get(startNode).has(lastNode)) {
        dictionary.get(startNode).set(lastNode, []);
      }

      dictionary.get(startNode).get(lastNode).push(path.slice(1, -1));
    }

    for (let neighbor of neighbors) {
      if (!path.includes(neighbor) && path.length < bubbleThreshold + 1) {
        let newPath = path.concat(neighbor);
        stack.push(newPath);
      }
    }
  }
}

function isDisjoint(path1, path2) {
  for (let i = 0; i < path1.length; i++) {
    if (path2.includes(path1[i])) {
      return false;
    }
  }

  return true;
}

function detectBubbles(graph, bubbleThreshold, bubbleNodes) {
  const bubbles = new Map();
  const dictionary = new Map();
  let bubblesQt = 0;

  if (PROFILE) { console.time(`find_all_paths`) }
  for (let [nodeOut, count] of bubbleNodes.get('out')) {
    dictionary.set(nodeOut, new Map());

    // if (PROFILE) { console.time(`find_all_paths_${nodeOut}`) }
    findAllPaths(graph, nodeOut, bubbleThreshold, bubbleNodes, dictionary);
    // if (PROFILE) { console.timeEnd(`find_all_paths_${nodeOut}`) }
  }
  if (PROFILE) { console.timeEnd(`find_all_paths`) }

  if (PROFILE) { console.time(`get_bubbles`) }
  for (let [nodeOut,] of dictionary) {
    // if (PROFILE) { console.time(`get_bubbles_${nodeOut}`) }
    for (let [nodeIn, paths] of dictionary.get(nodeOut)) {
      for (let i = 0; i < paths.length; i++) {
        for (let j = i + 1; j < paths.length; j++) {
          const path1 = paths[i];
          const path2 = paths[j];

          if (!isDisjoint(path1, path2)) {
            continue;
          }

          if (VERBOSE) {
            console.log('BubblePaths', bubblePaths);
          }

          const path1String = `${nodeOut}${path1.join('')}${nodeIn}`;
          const path2String = `${nodeOut}${path2.join('')}${nodeIn}`;

          if (path1String === path2String) {
            continue;
          }

          if (!bubbles.has(path1String)) {
            bubbles.set(path1String, new Set());
          }

          if (!bubbles.get(path1String).has(path2String)) {
            bubbles.get(path1String).add(path2String);
            bubblesQt++;
          }
        }
      }
    }
    // if (PROFILE) { console.timeEnd(`get_bubbles_${nodeOut}`) }
  }
  if (PROFILE) { console.timeEnd(`get_bubbles`) }

  return bubblesQt;
}

function getResult(k, bubbleThreshold, reads) {
  if (PROFILE) { console.time(`build_graph`) }
  const { bubbleNodes, graph } = buildDeBruijnGraph(reads, k - 1);
  if (PROFILE) { console.timeEnd(`build_graph`) }

  if (EXPORT) {
    return exportDrawIoGraph(graph);
  }

  if (VERBOSE) {
    console.log(bubbleNodes, graph);
  }

  const bubblesQt = detectBubbles(graph, bubbleThreshold, bubbleNodes);

  return bubblesQt;
}

function exportDrawIoGraph(graph) {
  const nodesText = [];
  for (let node in graph) {
    nodesText.push(`
<mxCell id="${node}" value="${node}" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="1">
  <mxGeometry x="${100 + (60 * nodesText.length)}" y="${100 + (60 * nodesText.length)}" width="40" height="40" as="geometry" />
</mxCell>
`.trim());
  }

  for (let node in graph) {
    for (let neighbor in graph[node]) {
      nodesText.push(`
<mxCell id="${node}_${neighbor}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" parent="1" source="${node}" target="${neighbor}">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
`.trim());
    }
  }

  return `
<?xml version="1.0" encoding="UTF-8"?>
<mxfile version="24.7.8">
  <diagram name="Page-1" id="x">
    <mxGraphModel dx="0" dy="0" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        ${nodesText.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
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
        3, //k
        3, //threshold
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

    {
      id: 11,
      run: () => getResult(
        15,
        32,
        [
          'AAAAAAAAAAAAAAATATTTTTATTAAATAATTAAAATAAGAAAAAATAAAAATATAATTATTAATATTTATATTTATTTTTTTTATAAAAATAATATTT',
          'AAAAAAAAAAAAAAATATTTTTATTAAATAAGTAAAATAAGAAAAAATAAAAATATAATTATTAATATTTATATTTATTTTTTTTATAAAAATAATATTT',
        ]
      ),
      expected: 1
    },

    {
      id: 12,
      run: () => getResult(
        15,
        32,
        [
          'AAAAAAAAAAAAAAATATTTTTATTAAATAATTAAAATAAGAAAAAATAAAAATATAATTATTAATATTTATATTTATTTTTTTTATAAAAATAATATTT',
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
  EXPORT = process.argv.includes('-e');

  return test(outputType, testToRun);
}

readLines();

module.exports = getResult;
