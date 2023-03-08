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
    const suffixedPattern = `${pattern}$`;
    let curNode = 0;

    for (let i = 0; i < suffixedPattern.length; i++) {
      const curSymbol = suffixedPattern[i];
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

  const matchEdge = (curSymbol, edges) => {
    const edgeKeys = Object.keys(edges);
    let nextSymbol = -1;

    for (let i = 0; i < edgeKeys.length; i++) {
      const k = edgeKeys[i];
      const edgeSymbol = edges[k];

      if (edgeSymbol === '$') {
        return k;
      }

      if (edgeSymbol === curSymbol) {
        nextSymbol = k;
      }
    }

    return nextSymbol;
  };

  let matchingEdge = matchEdge(symbol, v.edges);

  while (true) {
    if (Object.keys(v.edges).length === 0) {
      return true;
    } else if (matchingEdge !== -1) {
      symbol = text[curLetter++];
      v = trie.getNode(matchingEdge);

      matchingEdge = matchEdge(symbol, v.edges);
    } else if (matchingEdge === -1) {
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

function autoTest() {
  const MAX_STRING_SIZE = 10;
  const MAX_PATTERN_QUANTITY = 5;
  const POSSIBLE_CHARACTERS = ['A', 'C', 'G', 'T'];
  let NUMBER_OF_TESTS = 100;

  while (NUMBER_OF_TESTS--) {
    const patterns = new Set();
    const expected = new Set();
    let text = '';
    let textSize = Math.floor(Math.random() * (MAX_STRING_SIZE - 1) + 1);
    let patternQuantity = Math.floor(Math.random() * (MAX_PATTERN_QUANTITY - 1) + 1);

    while (textSize--) {
      text = `${text}${
        POSSIBLE_CHARACTERS[
          Math.floor(Math.random() * POSSIBLE_CHARACTERS.length)
        ]
      }`;
    }

    while (patternQuantity--) {
      const randomTextPos = Math.floor(Math.random() * (text.length - 1));
      const finalPos = randomTextPos + 3 > text.length ? 1 : 3;

      patterns.add(text.slice(randomTextPos, randomTextPos + finalPos));
    }

    const patternsArray = Array.from(patterns);

    patternsArray.forEach(pattern => {
      let curIndex = text.indexOf(pattern);

      while (curIndex !== -1) {
        expected.add(curIndex);
        curIndex = text.indexOf(pattern, curIndex + 1);
      }
    });

    const result = trieMatching(text, patternsArray);
    const expectedInOrder = Array.from(expected).sort((a, b) => a - b);

    if (result === expectedInOrder.join(' ')) {
      console.log(`Auto test ${NUMBER_OF_TESTS + 1} completed successfully`);
    } else {
      console.log(`Auto test ${NUMBER_OF_TESTS + 1} failed`)

      console.log(`Text: ${text}`);
      console.log(`Patterns: ${patternsArray}`);

      console.log(`Expected: ${expectedInOrder.join(' ')}`);
      console.log(`Got: ${result}`);

      break;
    }
  }

  process.exit();
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
        'ACATA',
        [
          'AT',
          'A',
          'AG',
        ]
      ),
      expected: '0 2 4',
    },

    {
      id: 3,
      run: () => trieMatching(
        'ACATACATAACATAGATACAAGAGACATATTCCAAGGAGAGAGAACC',
        [
          'AT',
          'AG',
          'CAT',
          'TAA',
        ]
      ),
      expected: '1 2 5 6 7 10 11 13 15 20 22 25 26 28 34 37 39 41',
    },

    {
      id: 4,
      run: () => trieMatching(
        'ACATGACATGACATG',
        [
          'A',
          'C',
          'T',
          'G',
        ]
      ),
      expected: '0 1 2 3 4 5 6 7 8 9 10 11 12 13 14',
    },

    {
      id: 5,
      run: () => trieMatching(
        'ACATGACATGACATG',
        [
          'A',
          'AC',
          'ACA',
          'ACAT',
          'ACATG',
          'C',
          'T',
          'G',
          'GA',
          'GAC',
          'GACA',
        ]
      ),
      expected: '0 1 2 3 4 5 6 7 8 9 10 11 12 13 14',
    },

    {
      id: 6,
      run: () => trieMatching(
        'ACACA',
        [
          'AC',
          'ACAC',
        ]
      ),
      expected: '0 2',
    },

    {
      id: 7,
      run: () => trieMatching(
        'ACACA',
        [
          'X',
        ]
      ),
      expected: '',
    },

    {
      id: 8,
      run: () => trieMatching(
        'TTTC',
        [
          'TTC',
          'T'
        ]
      ),
      expected: '0 1 2',
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
  if (process.argv.includes('-a')) {
    return autoTest();
  }

  const indexOfT = process.argv.indexOf('-t');
  const testToRun = process.argv[indexOfT + 1];

  test(testToRun);
} else {
  readLines();
}

module.exports = trieMatching;
