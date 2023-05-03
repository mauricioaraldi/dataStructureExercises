// Input: A string ending with $
// Example input: AAA$
// Output: The list of starting positions of sorted suffixes separated by spaces
// Example output: 3 2 1 0

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  rl.once('line', line => {
    process.stdout.write(suffix(line).toString());
    process.exit();
  });
};

function suffix(text) {
  return '';
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => suffix('AAA$'),
      expected: '3 2 1 0',
    },

    {
      id: 2,
      run: () => suffix('GAC$'),
      expected: '3 1 2 0',
    },

    {
      id: 3,
      run: () => suffix('GAGAGAGA$'),
      expected: '8 7 5 3 1 6 4 2 0',
    },

    {
      id: 4,
      run: () => suffix('AACGATAGCGGTAGA$'),
      expected: '15 14 0 1 12 6 4 2 8 13 3 7 9 10 11 5',
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

module.exports = suffix;
