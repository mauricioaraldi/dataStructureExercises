// Input: 2 Lines. Number of elements to be sorted, elements to be sorted
// Example input: 3
//                3 1 2
// Example output: 1 2 3 (Sorted elements)

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

      arr.sort((a, b) => a - b);
      randomizedQuickSort(arr, 0, arr.length - 1);

      for (let i = 0; i < arr.length; i++) {
        process.stdout.write(`${arr[i]} `);
      }

      process.exit();
    });
  });
};

function partition(a, l, r) {
  const x = a[l];
  let j = l;

  for (let i = l + 1; i <= r; i++) {
    if (a[i] <= x) {
      j++;

      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
  }

  const t = a[l];
  a[l] = a[j];
  a[j] = t;

  return j;
}

function randomizedQuickSort(a, l, r) {
  if (l >= r) {
    return;
  }

  const k = Math.floor(Math.random() * (r - l + 1) + l);
  const t = a[l];
  a[l] = a[k];
  a[k] = t;

  const m = partition(a, l, r);

  randomizedQuickSort(a, l, m - 1);
  randomizedQuickSort(a, m + 1, r);
}

readLines();

module.exports = randomizedQuickSort;
