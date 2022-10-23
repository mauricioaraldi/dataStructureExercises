// Input: 2 Lines. First line is number of threads and number of jobs. Second line is
// the times each i-th job take to process.
// Example input: 2 5
//                1 2 3 4 5
// Output: Each line contain a thread that is processing the i-th job, and the time it starts processing
// Example output: 0 0
//                 1 0
//                 0 1
//                 1 2
//                 0 4

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  rl.once('line', line => {
    const [threadsQt, jobsQt] = line.toString().split(' ').map(v => parseInt(v, 10));

    rl.once('line', line => {
      const times = line.split(' ').map(v => parseInt(v, 10));

      const processedJobs = parallelProccess(threadsQt, jobsQt, times);

      processedJobs.forEach(job => {
        process.stdout.write(`${job.join(' ').toString()}\n`);
      });

      process.exit();
    });
  });
};

function getLeftChildren(i) {
  return 2 * i + 1;
}

function getRightChildren(i) {
  return 2 * i + 2;
}

function siftDown(i, arr) {
  let maxIndex = i;
  const leftChildren = getLeftChildren(i);
  const rightChildren = getRightChildren(i);

  if (leftChildren <= arr.length && arr[leftChildren] < arr[maxIndex]) {
    maxIndex = leftChildren;
  }

  if (rightChildren <= arr.length && arr[rightChildren] < arr[maxIndex]) {
    maxIndex = rightChildren;
  }

  if (i != maxIndex) {
    const firstSwapEl = arr[i];
    const lastSwapEl = arr[maxIndex];

    arr[i] = lastSwapEl;
    arr[maxIndex] = firstSwapEl;

    return siftDown(maxIndex, arr);
  }
}

function parallelProccess(threadsQt, jobsQt, jobTimes) {
  const processedJobs = [];
  const threadsHeap = new Array(threadsQt);
  let currentSecond = 0;

  for (let i = 0; i < threadsQt; i++) {
    threadsHeap[i] = i / (threadsQt + 1);
  }

  while (processedJobs.length < jobsQt) {
    const threadTime = parseInt(threadsHeap[0]);
    const threadIdentifier = threadsHeap[0].toString().split('.')[1];
    const nextJob = jobTimes.shift();

    processedJobs.push([Math.round(parseFloat(`0.${threadIdentifier}`) * (threadsQt + 1)), threadTime]);

    threadsHeap[0] = nextJob + threadsHeap[0];

    siftDown(0, threadsHeap);
  }

  return processedJobs;
}

readLines();

module.exports = parallelProccess;
