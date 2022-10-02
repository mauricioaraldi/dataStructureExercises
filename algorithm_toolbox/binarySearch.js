// Input: 4 Lines. Number of elements on reference array, reference array, number of elements to be searched, elements to be searched
// Example input: 3
//                1 2 3
//                2
//                2 5
// Example output: 1 -1 (Index position if element is found, -1 if not. Repeat for every searched element)

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');
  rl.once('line', line => {
    const arrayLength = Number(line.toString());

    rl.once('line', line => {
      const arr = line.toString().split(' ').filter(e => e).map(Number);

      rl.once('line', line => {
        const keysLength = Number(line.toString());

          rl.once('line', line => {
            const keys = line.toString().split(' ').filter(e => e).map(Number);
            const result = [];

            if (!keys.length) {
              result.push();
            } else {
              for (let key of keys) {
                result.push(binarySearch(arr, key));
              }
            }

            process.stdout.write(result.join(' '));
            process.exit();
        });
      });
    });
  });
};

function binarySearch(arr = [], query) {
  if (!arr.length || !query) {
    return -1;
  }

  let minIndex = 0;
  let maxIndex = arr.length - 1;

  while (maxIndex >= minIndex) {
    const midIndex = Math.floor((minIndex + maxIndex) / 2);

    if (arr[midIndex] === query) {
      return midIndex;
    } else if (arr[midIndex] < query) {
      minIndex = midIndex + 1;
    } else {
      maxIndex = midIndex - 1;
    }
  }

  return -1;
}

readLines();

module.exports = binarySearch;
