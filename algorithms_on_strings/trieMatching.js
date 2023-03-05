// Input: First line the text. Second line "n", where n is number of patterns
// After this, n lines with the patterns
// Example input: AAA
//                1
//                AA
// Output: All starting positions in Text where a string from Patterns appears
// as a substring in increasing order (assuming that the text is a 0-based array
// of symbols)
// Example output: 0 1

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const patterns = [];

  rl.once('line', line => {
    const text = line.toString();

    rl.once('line', line => {
      const n = parseInt(line.toString().split(' '), 10);

      rl.on('line', line => {
        const pattern = line.toString();

        patterns.push(pattern);

        if (patterns.length >= n) {
          process.stdout.write(trieMatching(text, patterns).toString());
          process.exit();
        }
      });
    });
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

  add(edges = {}) {
    this.graph[this.graphSize++] = {
      edges,
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

function buildTrie(patterns) {
  const trie = new Graph(1);

  patterns.forEach(pattern => {
    let curNode = 0;

    for (let i = 0; i < pattern.length; i++) {
      const curSymbol = pattern[i];
      const edges = trie.getNode(curNode).edges;
      let nextNode = Object.keys(edges).find(k => edges[k] === curSymbol);

      if (!nextNode) {
        nextNode = trie.add();
        trie.connect(curNode, nextNode, curSymbol);
      }

      curNode = nextNode;
    }
  });

  return trie;
}

function prefixTrieMatching(text, trie) {
  let v = trie.getNode(0);
  let curLetter = 0;
  let symbol = text[curLetter++];

  let matchingEdge = Object.keys(v.edges).find(k => v.edges[k] === symbol);

  while (true) {
    if (Object.keys(v.edges).length === 0) {
      return true;
    } else if (matchingEdge) {
      symbol = text[curLetter++];
      v = trie.getNode(matchingEdge);

      matchingEdge = Object.keys(v.edges).find(k => v.edges[k] === symbol);
    } else {
      return false;
    }
  }
}

function matchTries(text, trie) {
  let curCharacter = 0;
  let result = [];

  while (curCharacter < text.length) {
    const hasPatternBeenFound = prefixTrieMatching(text.slice(curCharacter), trie);

    if (hasPatternBeenFound) {
      result.push(curCharacter);
    }

    curCharacter++;
  }

  return result.join(' ');
}

function trieMatching(text, patterns) {
  const trie = buildTrie(patterns);

  return matchTries(text, trie);
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => trieMatching(
        'AAA',
        [
          'AA',
        ]
      ),
      expected: '0 1',
    },

    {
      id: 2,
      run: () => trieMatching(
        'AA',
        [
          'T',
        ]
      ),
      expected: '',
    },

    {
      id: 3,
      run: () => trieMatching(
        'AATCGGGTTCAATCGGGGT',
        [
          'ATCG',
          'GGGT',
        ]
      ),
      expected: '1 4 11 15',
    },
  ];

  if (onlyTest !== undefined) {
    testCases = [testCases.find(testCase => testCase.id == onlyTest)];
  }

  testCases.forEach(testCase => {
    const result = testCase.run();

    if (result === testCase.expected) {
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
  const indexOfT = process.argv.indexOf('-t');
  const testToRun = process.argv[indexOfT + 1];

  test(testToRun);
} else {
  readLines();
}

module.exports = trieMatching;
