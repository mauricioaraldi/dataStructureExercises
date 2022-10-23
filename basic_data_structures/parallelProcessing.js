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

function parallelProccess(threadsQt, jobsQt, jobTimes) {
  const threads = new Array(threadsQt);
  const processedJobs = [];
  let currentTime = 0;

  while (processedJobs.length < jobsQt) {
    for (let i = 0; i < threads.length; i++) {
      if (!threads[i] || !--threads[i]) {
        threads[i] = jobTimes.shift();

        processedJobs.push([i, currentTime]);
      }
    }

    currentTime++;
  }

  return processedJobs;
}

readLines();

module.exports = parallelProccess;
