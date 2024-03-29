// Input: Text ending in '$'
// Example input: ACACACAC$
// Output: Burrows Wheeler Transform of Text
// Example output: CCCC$AAAA

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  rl.once('line', line => {
    process.stdout.write(bwt(line.toString()).toString());
    process.exit();
  });
};

function bwt(text) {
  const variations = [text];
  const result = [];

  for (let i = 1; i < text.length; i++) {
    variations.push(`${text.slice(-i)}${text.slice(0, text.length - i)}`);
  }

  variations.sort();

  variations.forEach(variation => result.push(variation[variation.length - 1]));

  return result.join('');
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => bwt('AA$'),
      expected: 'AA$',
    },

    {
      id: 2,
      run: () => bwt('ACACACAC$'),
      expected: 'CCCC$AAAA',
    },

    {
      id: 3,
      run: () => bwt('AGACATA$'),
      expected: 'ATG$CAAA',
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

module.exports = bwt;
