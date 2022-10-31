// Input: First line is the pattern to search. Second line is the string to
// be searched.
// Example input: aba
//                abacaba
// Example output: 0 4

const PRIME = 1000000007;

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const queries = [];

  rl.once('line', line => {
    let pattern = line.toString();

    rl.once('line', line => {
      let text = line.toString();

      process.stdout.write(findPattern(pattern, text));
      process.exit();
    });
  });
};

function polyHash(string, prime, generator) {
  let hash = 0;

  for (let i = string.length - 1; i >= 0; --i) {
    hash = (hash * generator + string.charCodeAt(i)) % prime;
  }

  return hash;
}

function preComputeHashes(text, patternLength, prime, generator) {
  const hashes = new Array(text.length - patternLength + 1);
  const curSubstring = text.slice(text.length - patternLength, text.length);
  let y = 1;

  hashes[text.length - patternLength] = polyHash(curSubstring, prime, generator);

  for (let i = 1; i <= patternLength; i++) {
    y = (y * generator) % prime;
  }

  let i = text.length - patternLength;

  while (i--) {
    hashes[i] = (
      hashes[i + 1] * generator + 
      (
        (
          (
            (
               text.charCodeAt(i) - y * text.charCodeAt(i + patternLength)
            ) % prime
          ) + prime
        ) % prime
      )
    ) % prime;
  }

  return hashes;
}

function rabinKarp(text, pattern) {
  // const generator = Math.floor(Math.random() * (PRIME - 2) + 1);
  const generator = 263;
  const patternHash = polyHash(pattern, PRIME, generator);
  const computedHashes = preComputeHashes(text, pattern.length, PRIME, generator);
  const positions = [];

  for (let i = 0; i <= text.length - pattern.length; i++) {
    if (patternHash !== computedHashes[i]) {
      continue;
    }

    if (pattern === text.slice(i, i + pattern.length)) {
      positions.push(i);
    }
  }

  return positions;
}

function findPattern(pattern, text) {
  if (!pattern || pattern.length > text.length) {
    return '';
  }

  return rabinKarp(text, pattern).join(' ');
}

function test() {
  const generateRandomString = length => {
      const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      let n = length;

      while (n--) {
        result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
      }

      return result;
  }

  const runTest = () => {
    const randomStringSize = Math.floor(Math.random() * (100 - 1) + 1);
    const randomString = generateRandomString(randomStringSize);

    const expectedStringIndex = Math.floor(Math.random() * (randomStringSize - 0) + 0);
    const expectedStringSize = Math.floor(Math.random() * (randomString.slice(expectedStringIndex).length - 1) + 1);
    const expectedString = randomString.slice(expectedStringIndex, expectedStringIndex + expectedStringSize);

    const resultIndexes = [];

    let lastFoundIndex = undefined;
    while (true) {
      lastFoundIndex = randomString.indexOf(expectedString, lastFoundIndex + 1);

      if (lastFoundIndex === -1) {
        break;
      }

      resultIndexes.push(lastFoundIndex);
    }

    const testResult = resultIndexes.join(' ');
    const algorithmResult = findPattern(expectedString, randomString);

    return {
      result: algorithmResult === testResult,
      algorithmResult,
      expectedString,
      randomString,
      testResult,
    };
  };

  const NUMBER_OF_TESTS = 100000;

  for (let curTest = 0; curTest <= NUMBER_OF_TESTS; curTest++) {
    const test = runTest();

    if (test.result) {
      console.log(`Success test ${curTest}`);
    } else {
      console.log(`Error test ${curTest}`);
      console.log(`Used string: ${test.randomString}`);
      console.log(`Searched for: ${test.expectedString}`);
      console.log(`Correct was: ${test.testResult}`);
      console.log(`Got: ${test.algorithmResult}`);
      break;
    }
  }

  console.log('- - Finished tests - -');
  process.exit();
}

readLines();
// test();

module.exports = findPattern;
