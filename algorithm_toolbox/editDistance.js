// Input: 2 lines, each with one word
// Example input: ports
//                sport
// Example output: 4 (The score for the edit distance)

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');
  rl.once('line', line => {
    const firstString = line.toString();

    rl.once('line', line => {
      const secondString = line.toString();
      
      process.stdout.write(editDistance(secondString, firstString).toString());
      process.exit();
    });
  });
};

function editDistance(firstString, secondString) {
  const score = 0;
  const matrix = [];

  for (let i = 0; i <= firstString.length; i++) {
    const row = new Array(secondString.length + 1);

    if (i === 0) {
      for (let j = 0; j <= secondString.length; j++) {
        row[j] = j;
      }
    } else {
      row[0] = i;
    }

    matrix.push(row);
  }

  for (let j = 1; j <= secondString.length; j++) {
    for (let i = 1; i <= firstString.length; i++) {
      const insertion = matrix[i][j - 1] + 1;
      const deletion = matrix[i - 1][j] + 1;
      const mismatch = matrix[i - 1][j - 1] + 1;
      const match = matrix[i - 1][j - 1];

      if (firstString[i - 1] === secondString[j - 1]) {
        matrix[i][j] = Math.min(insertion, deletion, match);
      } else {
        matrix[i][j] = Math.min(insertion, deletion, mismatch);
      }
    }
  }

  return matrix[firstString.length][secondString.length];
}

readLines();

module.exports = editDistance;
