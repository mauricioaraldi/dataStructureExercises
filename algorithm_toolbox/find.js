// Input: 4 Lines. Number of elements of reference array, reference array, number of elements to be searched, search array
// Example input: 3
//                1 2 3
//                2
//                2 3
// Example output: 1 2 (Indexes of searched elements)

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
      const arr = line.toString().split(' ').map(Number);

      rl.once('line', line => {
        const keysLength = Number(line.toString());

          rl.once('line', line => {
            const keys = line.toString().split(' ').map(Number);
            const result = [];

            for (let key of keys) {
              result.push(binarySearch(arr, key));
            }

            const res = result.join(' ');
            const maxLength = 50000;

            for (let i = 0; i < res.length; i += maxLength) {
              process.stdout.write(res.slice(i, i + maxLength));
            }

            process.stdout.write('\n');
            process.exit();
        });
      });
    });
  });
};

function binarySearch(arr = [], query) {
  if (!query) {
    return -1;
  }

  return arr.findIndex(e => e === query);
}

readLines();

module.exports = binarySearch;
