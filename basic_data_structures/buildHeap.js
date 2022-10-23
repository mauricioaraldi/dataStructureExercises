// Input: 2 Lines. First line is number of elements. Second line is the array of elements separated by space.
// Example input: 5
//                5 4 3 2 1
// Output: All the swaps needed to build the heap sort
// Example output: 3
//                 1 4
//                 0 1
//                 1 3

const SWAPS = [];

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  rl.once('line', line => {
    const n = line.toString();

    rl.once('line', line => {
      const arr = line.toString().split(' ').map(v => parseInt(v, 10));

      heapSort(arr);

      process.stdout.write(`${SWAPS.length.toString()}\n`);

      SWAPS.forEach(swap => process.stdout.write(`${swap.join(' ')}\n`));

      process.exit();
    });
  });
};

function buildHeap(arr) {
  let i = Math.floor(arr.length / 2);

  while(i--) {
    siftDown(i, arr, arr.length, true);
  }
}

function getLeftChildren(i) {
  return 2 * i + 1;
}

function getRightChildren(i) {
  return 2 * i + 2;
}

function siftDown(i, arr, usableSize, registerSwap) {
  let maxIndex = i;
  const leftChildren = getLeftChildren(i);
  const rightChildren = getRightChildren(i);

  if (leftChildren <= usableSize && arr[leftChildren] < arr[maxIndex]) {
    maxIndex = leftChildren;
  }

  if (rightChildren <= usableSize && arr[rightChildren] < arr[maxIndex]) {
    maxIndex = rightChildren;
  }

  if (i != maxIndex) {
    const firstSwapEl = arr[i];
    const lastSwapEl = arr[maxIndex];

    if (registerSwap) {
      SWAPS.push([i, maxIndex]);
    }

    arr[i] = lastSwapEl;
    arr[maxIndex] = firstSwapEl;

    return siftDown(maxIndex, arr, usableSize, registerSwap);
  }
}

function heapSort(arr) {
  let size = arr.length - 1;

  buildHeap(arr);

  // Ordering output array. Not really needed for the exercise (commenting to save memory and execution time)
  // for (let i = 0; i <= arr.length - 1; i++) {
  //   const firstEl = arr[0];
  //   const lastSizeEl = arr[size];

  //   arr[0] = lastSizeEl;
  //   arr[size] = firstEl;

  //   size = size - 1;

  //   arr = siftDown(0, arr, size, false);
  // }

  return arr;
}

readLines();

module.exports = heapSort;
