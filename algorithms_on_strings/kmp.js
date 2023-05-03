// Input: First line string Pattern. Second line string Genome.
// Example input: ATAT
//                GATATATGCATATACTT
// Output: All starting positions in Genome where Pattern appears as a substring
// Example output: 1 3 9

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  rl.once('line', pattern => {
    rl.once('line', text => {
      process.stdout.write(kmp(pattern, text).join(' '));
      process.exit();
    });
  });
};

function computePrefixFunction(pattern) {
  const positions = new Array(pattern.length);

  let border = 0;

  positions[0] = 0;

  for (let i = 1; i < pattern.length; i++) {
    while (border > 0 && pattern[i] !== pattern[border]) {
      border = positions[border - 1];
    }

    if (pattern[i] === pattern[border]) {
      border = border + 1;
    } else {
      border = 0;
    }

    positions[i] = border;
  }

  return positions;
}

function findAllOcurrences(pattern, text) {
  const fullString = `${pattern}$${text}`;
  const prefix = computePrefixFunction(fullString);
  const result = [];

  for (let i = pattern.length + 1; i < fullString.length; i++) {
    if (prefix[i] === pattern.length) {
      result.push(i - (2 * pattern.length));
    }
  }

  return result;
}

function kmp(pattern, text) {
  if (pattern.length > text.length) {
    return [];
  }

  return findAllOcurrences(pattern, text);
}

function autoTest() {
  const POSSIBLE_CHARS = ['T', 'C', 'G', 'A'];
  const SUCCESS_LOG_INTERVAL = 10;
  const MIN_STRING_SIZE = 2;
  const MAX_STRING_SIZE = 10000;
  let NUMBER_OF_TESTS = 100000;

  while (NUMBER_OF_TESTS--) {
    let stringSize = Math.floor(Math.random() * (MAX_STRING_SIZE - MIN_STRING_SIZE) + MIN_STRING_SIZE);
    const randomPatternStart = Math.floor(Math.random() * stringSize);
    const randomPatternEnd = Math.floor(Math.random() * (stringSize - (randomPatternStart + 1)) + (randomPatternStart + 1));
    let text = '';

    while (stringSize--) {
      const randomCharIndex = Math.floor(Math.random() * POSSIBLE_CHARS.length);
      text = `${text}${POSSIBLE_CHARS[randomCharIndex]}`;
    }

    const pattern = text.slice(randomPatternStart, randomPatternEnd);

    const expected = [];

    for (
      let nextIndex = text.indexOf(pattern);
      nextIndex !== -1;
      nextIndex = text.indexOf(pattern, nextIndex + 1)
    ) {
      expected.push(nextIndex);
    }

    const result = kmp(pattern, text);

    if (result.join(' ') === expected.join(' ')) {
      const curTest = NUMBER_OF_TESTS + 1;

      if (curTest === 0 || curTest % SUCCESS_LOG_INTERVAL === 0) {
        console.log(`Test ${curTest} passed`);
      }
    } else {
      console.log(`Test ${NUMBER_OF_TESTS + 1} failed`);
      console.log(`Text: ${text}`);
      console.log(`Pattern: ${pattern}`);
      console.log(`Expected: ${expected}`);
      console.log(`Result: ${result}`);
      return;
    }
  }
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => kmp('TACG', 'GT'),
      expected: [],
    },

    {
      id: 2,
      run: () => kmp('ATA', 'ATATA'),
      expected: [0, 2],
    },

    {
      id: 3,
      run: () => kmp('ATAT', 'GATATATGCATATACTT'),
      expected: [1, 3, 9],
    },
  ];

  if (onlyTest !== undefined) {
    testCases = [testCases.find(testCase => testCase.id == onlyTest)];
  }

  testCases.forEach(testCase => {
    const result = testCase.run();

    if (result.join(' ') === testCase.expected.join(' ')) {
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

module.exports = kmp;
