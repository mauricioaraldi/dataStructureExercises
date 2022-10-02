// Input: 2 Lines. Number of elements, elements
// Example input: 3
//                5 4 4
// Example output: 1 (1 If there's one element that appears more than the others, 0 otherwise)

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  rl.once('line', line => {
    const n = Number(line.toString());

    rl.once('line', line => {
      const arr = line.toString().split(' ').filter(e => e).map(Number);

      process.stdout.write(majorityElement(arr));
      process.exit();
    });
  });
};

function majorityElement(arr = []) {
  if (!arr.length) {
    return '0';
  }

  const numberOfElements = Object.entries(
    arr.reduce((acc, el) => {
      if (!acc[el]) {
        acc[el] = 0;
      }

      acc[el]++;

      return acc;
    }, {})
  );

  numberOfElements.sort((a, b) => b[1] - a[1]);

  return numberOfElements[0][1] > (arr.length / 2) ? '1' : '0';
}

readLines();

module.exports = majorityElement;
