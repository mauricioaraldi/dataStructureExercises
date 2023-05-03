// Input: Transform ending in '$'
// Example input: AGGGAA$
// Output: Burrows Text that generated transform
// Example output: GAGAGA$

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  rl.once('line', line => {
    process.stdout.write(bwtInverse(line.toString()).toString());
    process.exit();
  });
};

function prepareMatrix(matrix, text) {
  for (let i = 0; i < matrix.length; i++) {
    matrix[i][0] = text.charCodeAt(i);
    matrix[i][2] = i;
  }
}

function execute(matrix) {
  matrix.sort((a, b) => {
    if (a[0] < b[0]) {
      return -1;
    }

    if (a[0] > b[0]) {
      return 1;
    }

    if (a[0] === b[0]) {
      return a[2] - b[2];
    }
  });

  const dollarSignPosition = matrix[0][2];

  let next = dollarSignPosition;

  for (let i = 0; i < matrix.length; i++) {
    matrix[i][1] = matrix[next][0];
    next = matrix[next][2];
  }
}

function bwtInverse(text) {
  const matrix = new Array(text.length);

  for (let i = 0; i < matrix.length; i++) {
    matrix[i] = new Array(3);
  }

  prepareMatrix(matrix, text);

  execute(matrix);

  let result = '';

  for (let i = 0; i < matrix.length; i++) {
    result = result.concat(String.fromCharCode(matrix[i][1]));
  }

  return result;
}

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

function autoTest() {
  const POSSIBLE_CHARS = ['T', 'C', 'G', 'A'];
  const SUCCESS_LOG_INTERVAL = 1;
  const MIN_STRING_SIZE = 1;
  const MAX_STRING_SIZE = 200000;
  let NUMBER_OF_TESTS = 1;

  while (NUMBER_OF_TESTS--) {
    let stringSize = Math.floor(Math.random() * (MAX_STRING_SIZE - MIN_STRING_SIZE) + MIN_STRING_SIZE);
    let input = '';

    while (stringSize--) {
      const randomCharIndex = Math.floor(Math.random() * POSSIBLE_CHARS.length);
      input = `${input}${POSSIBLE_CHARS[randomCharIndex]}`;
    }

    input = `${input}$`;

    const bwtResult = bwt(input);
    const bwtInverseResult = bwtInverse(bwtResult);

    if (bwtInverseResult === input) {
      const curTest = NUMBER_OF_TESTS + 1;

      if (curTest === 0 || curTest % SUCCESS_LOG_INTERVAL === 0) {
        console.log(`Test ${curTest} passed`);
      }
    } else {
      console.log(`Test ${NUMBER_OF_TESTS + 1} failed`);
      console.log(`Input: ${input}`);
      console.log(`BWT result: ${bwtResult}`);
      console.log(`Inverse result: ${bwtInverseResult}`);
      return;
    }
  }
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

    {
      id: 3,
      run: () => bwtInverse('TTCCTAACG$A'),
      expected: 'TACATCACGT$',
    },

    {
      id: 4,
      run: () => bwtInverse('G$AAAAAAAAAAAAA'),
      expected: 'AAAAAAAAAAAAAG$',
    },

    {
      id: 5,
      run: () => bwtInverse('TTCCTAACG$A'),
      expected: 'TACATCACGT$',
    }
  ];

  if (onlyTest !== undefined) {
    testCases = [testCases.find(testCase => testCase.id == onlyTest)];
  }

  testCases.forEach(testCase => {
    const result = testCase.run();

    if (result === testCase.expected) {
      console.log(`[V] Passed test ${testCase.id}`);
      console.log(result);
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
    autoTest();
    process.exit();
    return;
  }

  const indexOfT = process.argv.indexOf('-t');
  const testToRun = process.argv[indexOfT + 1];

  test(testToRun);
} else {
  readLines();
}

module.exports = bwtInverse;
