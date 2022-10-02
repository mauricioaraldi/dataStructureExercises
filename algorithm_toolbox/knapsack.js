// Input: 2 Lines. Capacity of knapsack and number of elements to choose from, elements to choose from
// Example input: 10 2
//                4 4
// Example output: 8 (How much of the capacity was used)

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');
  rl.once('line', line => {
    const firstLine = line.toString();
    const [capacity, barsQuantity] = firstLine.split(' ').map(v => Number(v));

    rl.once('line', line => {
      const weights = line.toString().split(' ').map(v => Number(v));
      
      process.stdout.write(knapsack(capacity, weights).toString());
      process.exit();
    });
  });
};

function knapsack(capacity, weights) {
  const matrix = [];

  for (let i = 0; i <= weights.length; i++) {
    const row = new Array(capacity + 1);

    if (i === 0) {
      for (let j = 0; j <= capacity; j++) {
        row[j] = 0;
      }
    } else {
      row[0] = 0;
    }

    matrix.push(row);
  }

  for (let i = 1; i <= weights.length; i++) {
    for (let j = 1; j <= capacity; j++) {
      matrix[i][j] = matrix[i - 1][j];

      if (weights[i - 1] <= capacity) {
        const val = matrix[i - 1][j - weights[i - 1]] + weights[i - 1];

        if (matrix[i][j] < val) {
          matrix[i][j] = val;
        }
      }
    }
  }

  return matrix[weights.length][capacity];
}

readLines();

module.exports = knapsack;
