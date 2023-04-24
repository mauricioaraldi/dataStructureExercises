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
    console.log('Look for:', currentChar);

    console.log('From', currentIndex);
    console.log('In', variations[0]);

    variations[1].characters[currentIndex] = null;

    currentIndex = variations[0].repetitions[currentChar].byRepetition[charRepetition];

    console.log('Found in', currentIndex);

    variations[0].characters[currentIndex] = null;

    originalText.push(currentChar);

    console.log('Next char from', variations[1]);

    console.log(123123, currentChar, currentIndex);

    currentChar = variations[1].characters[currentIndex];
    charRepetition = variations[1].repetitions[currentChar].byIndex[currentIndex];

    if (currentChar === null) {
      return originalText.reverse().join('');
    }

    console.log('GOT', currentChar);

    console.log('-- - - -- - -');
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
