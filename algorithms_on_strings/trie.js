// Input: First line "n", where n is number of patterns
// After this, n lines with the patterns
// Example input: 1
//                ATA
// Output: If Trie(Patterns) has n nodes, first label the root with 0 and then label the remaining nodes with the
// integers 1 through n − 1 in any order. Each edge of the adjacency list of Trie(Patterns) will be encoded by a triple:
// the first two members of the triple must be the integers i, j labeling the initial and terminal nodes of the edge,
// respectively; the third member of the triple must be the symbol c labeling the edge; output each such triple in the
// format u->v:c (with no spaces) on a separate line.
// Example output: 0->1:A
//                 2->3:A
//                 1->2:T

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const patterns = [];

  rl.once('line', line => {
    const n = parseInt(line.toString().split(' '), 10);

    rl.on('line', line => {
      const pattern = line.toString();

      patterns.push(pattern);

      if (patterns.length >= n) {
        const result = trie(patterns);

        result.forEach(r => process.stdout.write(`${r}\n`));

        process.exit();
      }
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

function trie(patterns) {
  const trie = buildTrie(patterns);
  const outputFormat = [];

  for (let i = 0; i < trie.size; i++) {
    const edges = trie.getNode(i).edges;

    for (let edge in edges) {
      outputFormat.push(`${i}->${edge}:${edges[edge]}`);
    }
  }

  return outputFormat;
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => trie(
        [
          'ATA',
        ]
      ),
      expected: ['0->1:A', '2->3:A', '1->2:T'],
    },

    {
      id: 2,
      run: () => trie(
        [
          'AT',
          'AG',
          'AC',
        ]
      ),
      expected: ['0->1:A', '1->4:C', '1->3:G', '1->2:T'],
    },

    {
      id: 3,
      run: () => trie(
        [
          'ATAGA',
          'ATC',
          'GAT',
        ]
      ),
      expected: ['0->1:A', '1->2:T', '2->3:A', '3->4:G', 
        '4->5:A', '2->6:C', '0->7:G', '7->8:A', '8->9:T'],
    },

    {
      id: 4,
      run: () => trie(
        [
          'GTATGACGCGGGTTTCATTAGATCTTAATTACCCTCCAGCAAGACTCTGTCTTCTTAGGACCGTAGGCTAA',
          'TGATGGCTGGCTAAGTAAGAATAAACACGTCGGTCAGGGTAATAATATGCTGCGA',
          'CGCGTCGAAGAG',
          'CGTAGGAGGGGTCGGCAGCCTTGGCCGACATATCTACCGCGGTGGACGGAATTCTTCCCAAATTCTCCTCTCAAAGACGCTGCAACT',
          'CTGCTTTCGACAACAAGACTGAA',
          'TCCGGCATCGGAACCGTAGGCTCAC',
          'CAGCTGGGGACTTCCGCTTGAAAGCCCGGTGTAACGAGGCCCGCGGATCTGTG',
          'ACTCGCTCTCAATGAACTGCTACGCAATCTATATTATCACTCGAATAAATCAAATTAAACAATGTGACGTCTAATTTGCGTGCGATTTCATCCCACCAT',
          'GGTTCTAG',
          'AAGTTGATAAACCGTAACTCATATCCCATGGACCGCGTCGGTACTGTCCACTTTATGCAACCCGTGAGCAATAGGATGTCGGTCAACGCGCATTCA',
          'CAGATTCAGCAGAGAAACCAATGTGGACCGTTGTATCCGTGATTGAACAAAGT',
          'CATGGTCGACTATACAGGTTCACTCGTTGAATCCTATGTATCTTCAACGCGTGGTGG',
          'GGTCCTTTAGTGTTGGGTTATGGGGCGGTCTAAACACCATCACTTGTATGT',
          'TCGAGCTCCAGATATTTTGGGGCGCGTTGGTATCTTC',
          'TCAATAACGCCGTCAGACCCAGGTCTTCCTGCGGAGCAAATACCCTTATAGT',
          'GACGACATGCTGAGGTTCGTCGCACGTTTGTCTCGCGTACAGTATAATAGCCCTCCCTTCTGATGTGCGATTTGTC',
          'CGTTTCCTTGGCACGGGCTAATTGTCGAAGGCCCGGAAAGCACAA',
          'ACCTACACACTTTTTTCTGTCGCAGCACCCTCGGGGCGTGTCGCGGGCGCCA',
          'CCGCGCTCTGTCTATCATTTT',
          'TTTCTGCTTGGTTTCTTGTTCAGTGCGAATTACCTATTAGC',
          'GCCTGCGCTTGCAACAGTCCCG',
          'CGTGCTGAATTCGCCGGATGACCCGGGAGACTCG',
          'TGT',
          'CCCGAG',
          'CATGCTCTTTAGAAAAG',
          'AG',
          'GGCAGCGTTTTAACAAACAAACCGGTTGTATAGCGGTA',
          'GTTAGAAAGAG',
          'TGGGCATCGACACTGTGCTCGG',
          'CTCTGTGAAAAAGTTCCTTAGCCCGAGCGTAAA',
          'TAACATCAACGTCTCGCACGGTAAC',
          'AAATCCGGTTTAAACCGTGGATCTAACATTATTAA',
          'CCCTGTTATACGATCCTTTTCCACTGGCCGCATCGAGA',
          'GTAAGGCAACTCTGAGCCCGGCAGTTAACA',
          'CTAGGATTCATGTAGGAAAGCGAGTCCCGGGGGTGCCAGATTCCCGGTTGTTCATTTTAAATATGACGAGTGAAA',
          'AACATTGGCGACGAGGTCTTCCTTATTCTACAGATCGCCGT',
          'CGAGGGGCAGGCCATACCTGGCTCCCAGAGGATCTTCTGTAGCGACATGTCAAAGC',
          'TTGAGCAATTTATGTGGGGCAGCATCGGGTTCAGCTGGGAACAGTGGGCGCATCGTCAGAGTAAGTGGGTGGCGG',
          'GTAC',
          'CGAAAAACAGGCAAATTGTTCCCTTGACGCGAAGCCTCAAGGTTTTTCGCCAAAGCGCGTTACCGGC',
          'GGCGTACC',
          'ACAGCTATGCCGGCATC',
          'TGGCATGGGGCGTACCAAAGATCTCCCCGAGGGCGCATGCATCCTCAGAC',
          'CCCTACCGTGCCATTCCGGATTTCATCTTGAACATCCGAGATCGTGTGCCGGATGCATTTAG',
          'AAGCTCAGACGTATTCTATTAACAAAGCTTGATACCTATTGTAATTCTTATCATATTTCTTAG',
          'CTAATACTCATGATAG',
          'ATGTCGCAGAAATACGGGAGGAGCCATCAGCAGTTATGGCAGATAATCGGTGATTGTTCCAGGGCGTGTGAGCACG',
          'CTTTTAGCG',
          'CCTGCTTTAGAGTAAGGACC',
          'CAAAGCTGTGTAGGGAGTTGACATGACTTATGTGAAATCAGGCGAGCACAACTACTAAACCGCTCGTAACGGTGACACGAGCGTAGTTCAGTCCCAGA',
          'TATCGAGGCGCTTTTGGGGAAGAAGTAGCTGCTTTTTTATAGGCAAGTAGCATCTAACCGAGCGATAGCTGTAGTTATTTTAAGCTAGTACC',
          'TAAGCAGAGGAGCTCATACCATGTGGGCGGTCACAACCTTAGTATCGTGCCCATA',
        ]
      ),
      expected: ['0->322:A', '0->72:T', '0->1:G', '0->127:C', '1->761:A', '1->2:T',
                  '1->421:G', '1->988:C', '2->3:A', '2->1095:T'],
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
  const indexOfT = process.argv.indexOf('-t');
  const testToRun = process.argv[indexOfT + 1];

  test(testToRun);
} else {
  readLines();
}

module.exports = trie;
