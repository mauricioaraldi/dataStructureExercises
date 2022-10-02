// Input: 1 Line. Expression without spaced nor parenthesis
// Example input: 2+3*4-8
// Example output: 12 (Best result obtained by palcing the parenthesis in the positions that will return biggest number)

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  rl.once('line', line => {
    const expression = line.toString();

    process.stdout.write(placeParenthesis(expression).toString());
    process.exit();
  });
};

function evaluate(a, b, op) {
  if (op === '+') {
    return a + b;
  } else if (op === '-') {
    return a - b;
  } else if (op === '*') {
    return a * b;
  } else {
    return 0;
  }
}

function minAndMax(i, j, operations, maxes, mins) {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let k = i; k < j; k++) {
    let a = evaluate(maxes[i][k], maxes[k + 1][j], operations[k]);
    let b = evaluate(maxes[i][k], mins[k + 1][j], operations[k]);
    let c = evaluate(mins[i][k], maxes[k + 1][j], operations[k]);
    let d = evaluate(mins[i][k], mins[k + 1][j], operations[k]);

    min = Math.min(min, a, b, c, d);
    max = Math.max(max, a, b, c, d);
  }

  return [min, max];
}

function placeParenthesis(expression) {
  const numbers = expression.match(/\d+/g).map(v => Number(v));
  const operations = expression.match(/\D/g);
  const maxes = new Array(numbers.length - 1);
  const mins = new Array(numbers.length - 1);

  for (let i = 0; i < numbers.length; i++) {
    mins[i] = new Array(numbers.length);
    maxes[i] = new Array(numbers.length);

    mins[i][i] = numbers[i];
    maxes[i][i] = numbers[i];
  }

  for (let s = 1; s < numbers.length; s++) {
    for (let i = 0; i < numbers.length - s; i++) {
      const j = i + s;

      [mins[i][j], maxes[i][j]] = minAndMax(i, j, operations, mins, maxes);
    }
  }

  return maxes[0][numbers.length - 1];
}

readLines();

module.exports = placeParenthesis;
