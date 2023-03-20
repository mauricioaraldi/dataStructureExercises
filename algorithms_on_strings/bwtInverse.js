// Input: Transform ending in '$'
// Example input: AGGGAA$
// Output: Burrows Text that generated trasnform
// Example output: GAGAGA$

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

function bwtInverse(text) {
  const variations = [text];

  variations.unshift(text.split('').sort().join(''));

  console.log(variations)

  return text;
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => bwtInverse('AC$A'),
      expected: 'ACA$',
    },

    {
      id: 2,
      run: () => bwtInverse('AGGGAA$'),
      expected: 'GAGAGA$',
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

module.exports = bwtInverse;
