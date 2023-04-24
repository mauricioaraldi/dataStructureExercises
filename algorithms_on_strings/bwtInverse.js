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
    process.stdout.write(bwtInverse(line.toString()).toString());
    process.exit();
  });
};

function bwtInverse(text) {
  const variations = [
    {
      characters: text.split('').sort(),
      repetitions: {},
    }, 
    {
      characters: text.split(''),
      repetitions: {},
    }
  ];
  const originalText = [];

  variations.forEach(variation =>
    variation.characters.forEach((character, index) => {
      if (!variation.repetitions[character]) {
        variation.repetitions[character] = {
          byIndex: {},
          byRepetition: {},
          quantity: 0,
        };
      }

      const curCharacter = variation.repetitions[character];
      const curQuantity = ++variation.repetitions[character].quantity;

      curCharacter.byIndex[index] = curQuantity;
      curCharacter.byRepetition[curQuantity] = index;
    })
  );

  let currentIndex = text.indexOf('$');
  let currentChar = '$';
  let charRepetition = 1;

  while (true) {
    variations[1].characters[currentIndex] = null;

    currentIndex = variations[0].repetitions[currentChar].byRepetition[charRepetition];

    variations[0].characters[currentIndex] = null;

    originalText.push(currentChar);

    currentChar = variations[1].characters[currentIndex];

    if (currentChar === null) {
      return originalText.reverse().join('');
    }

    charRepetition = variations[1].repetitions[currentChar].byIndex[currentIndex];
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
      run: () => bwtInverse('CTTTTTTTCCCCCCCGGGGGGG$AAAAAAAAAAAAAA'),
      expected: 'CATAGCATAGCATAGCATAGCATAGCATAGCATAGC$',
    }
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
