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
        process.stdout.write(trie.toString());
        process.exit();
      }
    });
  });
};

function trie(patterns) {
  return '';
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => trie(
        [
          'ATA',
        ],
      ),
      expected: ['0->1:A', '2->3:A', '1->2:T'],
    },
  ];

  if (onlyTest !== undefined) {
    testCases = [testCases.find(testCase => testCase.id == onlyTest)];
  }

  testCases.forEach(testCase => {
    const result = testCase.run();

    if (result.toString() === testCase.expected.toString()) {
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
