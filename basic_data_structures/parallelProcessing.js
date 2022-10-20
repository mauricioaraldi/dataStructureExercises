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
    const [threadsQt, jobsQt] = line.toString().split(' ');

    rl.once('line', line => {
      const times = line.toString();

      process.stdout.write(parallelProccess(threadsQt, jobsQt, times).toString());
      process.exit();
    });
  });
};

function parallelProccess(threadsQt, jobsQt, times) {
}

readLines();

module.exports = parallelProccess;
