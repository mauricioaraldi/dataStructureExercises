// Input: 2 Lines. First line is number of elements. Second line is the array of elements separated by space.
// Example input: 5
//                5 4 3 2 1
// Output: All the swaps needed to build the heap sort
// Example output: 3
//                 1 4
//                 0 1
//                 1 3

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

      process.stdout.write(heapSort(arr).toString());
      process.exit();
    });
  });
};

function buildHeap(arr) {
  let heapArray = [...arr];

  let i = Math.floor(heapArray.length / 2);

  while(i--) {
    heapArray = siftDown(i, heapArray);
  }

  return heapArray;
}

function getLeftChildren(i) {
  return 2 * i + 1;
}

function getRightChildren(i) {
  return 2 * i + 2;
}

function siftDown(i, arr) {
  const heapArray = [...arr];
  let maxIndex = i;
  const leftChildren = getLeftChildren(i);
  const rightChildren = getRightChildren(i);

  if (leftChildren <= heapArray.length && heapArray[leftChildren] > heapArray[maxIndex]) {
    maxIndex = leftChildren;
  }

  if (rightChildren <= heapArray.length && heapArray[rightChildren] > heapArray[maxIndex]) {
    maxIndex = rightChildren;
  }

  if (i != maxIndex) {
    const firstSwapEl = heapArray[i];
    const lastSwapEl = heapArray[maxIndex];

    heapArray[i] = lastSwapEl;
    heapArray[maxIndex] = firstSwapEl;

    return siftDown(maxIndex, heapArray);
  }

  return heapArray;
}

function heapSort(arr) {
  let size = arr.length;
  let heapArray = buildHeap(arr);

    // for (let i = 0; i <= arr.length - 1; i++) {
  //   const firstSwapEl = heapArray[0];
  //   const lastSwapEl = heapArray[size];

  //   heapArray[0] = lastSwapEl;
  //   heapArray[size] = firstSwapEl;

  //   size = size - 1;

  //   heapArray = siftDown(0, heapArray);
  // }

  console.log(heapArray);
}

readLines();

module.exports = heapSort;
