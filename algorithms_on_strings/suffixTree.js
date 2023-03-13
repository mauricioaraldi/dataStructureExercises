// Input: Text to be transformed into a trie (ending with $)
// Example input: ACA$
// Example output: $
//                 A
//                 $
//                 CA$
//                 CA$

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  rl.once('line', line => {
    const text = line.toString();
    const results = suffixTrie(text);

    results.forEach(result => {
      process.stdout.write(`${result.toString()}\n`);
    });

    process.exit();
  });
};

class Graph {
  constructor(nodeQt) {
    this.graphSize = 0;
    this.graph = {};

    for (let i = 0; i < nodeQt; i++) {
      this.add();
    }
  }

  add(edges = {}, symbol = '') {
    this.graph[this.graphSize++] = {
      edges,
      symbol,
    };

    return this.graphSize - 1;
  }

  connect(start, end, symbol = '') {
    this.graph[start].edges[end] = symbol;
  }

  getNode(k) {
    return this.graph[k];
  }

  get size() {
    return this.graphSize;
  }

  get isEmpty() {
    return this.graphSize === 0;
  }
}

function buildTrie(text) {
  const trie = new Graph(1);

  for (let i = 0; i < text.length; i++) {
    let curNode = 0;
    let curIndex = i;

    console.log('NOW FOR', text[curIndex]);

    while (true) {
      const curSymbol = text[curIndex];
      const edges = trie.getNode(curNode).edges;
      let nextNode = Object.keys(edges).find(k => text[edges[k][0]] === curSymbol);

      if (!nextNode) {
        nextNode = trie.add({}, i);
        console.log('ADD', curNode, nextNode, curIndex, text.length - curIndex);
        trie.connect(curNode, nextNode, [curIndex, text.length - curIndex]);
        break;
      }

      let [startPos, length] = edges[nextNode];

      if (length > 1) {
        console.log('Starting point', trie.getNode(nextNode), length);
        for (let j = 1; j < length; j++) {
          console.log(text[startPos + j], text[curIndex + j]);
          if (text[startPos + j] !== text[curIndex + j]) {
            console.log('-->', curNode, nextNode, startPos, j, 'X', curIndex);
            trie.connect(curNode, nextNode, [startPos, j]);

            curIndex += j;
            curNode = nextNode;
            nextNode = trie.add({}, i + j);

            const prevNodeStartPos = startPos + j;

            console.log('ADD child', curNode, nextNode, prevNodeStartPos, text.length - prevNodeStartPos);

            trie.connect(curNode, nextNode, [prevNodeStartPos, text.length - prevNodeStartPos]);

            visualizeTrie(text, trie);
            console.log(JSON.stringify(trie));
            break;
          }
        }

        console.log('aaaaa', curIndex);

        curNode = nextNode;
        nextNode = trie.add({}, curIndex);
        trie.connect(curNode, nextNode, [curIndex, text.length - curIndex]);

        visualizeTrie(text, trie);

        break;
      }

      curNode = nextNode;
      curIndex += length;
    }
  }

  return trie;
}

function suffixTrie(text) {
  const trie = buildTrie(text);
  const outputFormat = [];

  for (let i = 0; i < trie.size; i++) {
    const edges = trie.getNode(i).edges;

    for (let edge in edges) {
      const [start, length] = edges[edge];
      outputFormat.push(text.slice(start, start + length));
    }
  }

  console.log('OUT', outputFormat);
  console.log(visualizeTrie(text, trie));

  return outputFormat;
}

function visualizeTrie(text, trie) {
  for (let i = 0; i < trie.size; i++) {
    const node = trie.getNode(i);

    console.log(`Node ${i}:${node.symbol}`);

    const edges = node.edges;

    for (let edge in edges) {
      const [start, length] = edges[edge];
      console.log(`  ${edge}:${text.slice(start, start + length)}`);
    }
  }
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => suffixTrie('A$'),
      expected: ['$', 'A$'],
    },

    {
      id: 2,
      run: () => suffixTrie('ACA$'),
      expected: ['$', 'A', '$', 'CA$', 'CA$'],
    },

    {
      id: 3,
      run: () => suffixTrie('ATAAATG$'),
      expected: ['AAATG$', 'G$', 'T', 'ATG$', 'TG$', 'A', 'A', 'AAATG$', 'G$', 'T', 'G$', '$'],
    },
  ];

  if (onlyTest !== undefined) {
    testCases = [testCases.find(testCase => testCase.id == onlyTest)];
  }

  testCases.forEach(testCase => {
    const result = testCase.run();
    const hasPassed = !testCase.expected.some(expectedTrio => 
      !result.find(resultTrio => resultTrio === expectedTrio));

    if (hasPassed) {
      console.log(`[V] Passed test ${testCase.id}`);
    } else {
      console.log(`[X] Failed test ${testCase.id}`);
      console.log(`Expected: ${testCase.expected}`);
      console.log(`Got: ${result}`);
    }
  });

  process.exit();
}


if (process && process.argv && process.argv.includes('-t')) {
  if (process.argv.includes('-a')) {
    return autoTest();
  }

  const indexOfT = process.argv.indexOf('-t');
  const testToRun = process.argv[indexOfT + 1];

  test(testToRun);
} else {
  readLines();
}

module.exports = suffixTrie;
