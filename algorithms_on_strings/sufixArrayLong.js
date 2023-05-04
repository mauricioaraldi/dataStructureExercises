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

function sortCharacters(text) {
  const count = {};
  let order = 0;

  for (const char of text) {
    if (!count[char]) {
      count[char] = {
        repetition: 0,
        order: order++,
      };
    }

    count[char].repetition++;
  };

  return Object.keys(count).sort((a, b) => {
    if (count[a].repetition > count[b].repetition) {
      return 1;
    }

    if (count[a].repetition < count[b].repetition) {
      return -1;
    }

    if (count[a].repetition === count[b].repetition) {
      return count[a].order - count[b].order;
    }

    return 0;
  });
}

function computeCharClasses(text, order) {}

function sortDoubled(text, cycleLength, order, classes) {
  const count = new Array(text.length).fill(0);
  const newOrder = new Array(text.length);

  for (let i = 0; i < text.length; i++) {
    count[classes[i]] = count[classes[i]] + 1;
  }

  for (let i = 1; i < text.length; i++) {
    count[classes[i]] = count[classes[i]] + 1;
  }

  for (let i = text.length - 1; i >= 0; i--) {
    const start = (order[i] - cycleLength + text.length) % text.length;
    const cl = classes[start];

    count[cl] = count[cl] - 1;
    newOrder[count[cl]] = start;
  }

  return newOrder;
}

function updateClasses(newOrder, classes, cycleLength) {
  const newClasses = new Array(newOrder.length);

  newClasses[newOrder[0]] = 0;

  for (let i = 1; i < newOrder.length; i++) {
    const cur = newOrder[i];
    const prev = newOrder[i - 1];
    const mid = (cur + cycleLength);
    const midPrev = (prev + cycleLength) % newOrder.length;

    if (classes[cur] !== classes[prev] || classes[mid] !== classes[midPrev]) {
      newClasses[cur] = newClasses[prev] + 1;
    } else {
      newClasses[cur] = newClasses[prev];
    }
  }

  return newClasses;
}

function buildSuffixArray(text) {
  const order = sortCharacters(text);
  const classes = computeCharClasses(text, order);

  const cycleLength = 1;

  while (cycleLength < text.length) {
    order = sortDoubled(text, cycleLength, order, classes);
    classes = updateClasses(order, classes, cycleLength);
    cycleLength = 2 * cycleLength;
  }

  return order;
}

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
