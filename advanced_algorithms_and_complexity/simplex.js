// Input: First line integer n and m (n number of restrictions on the diet, m number of dishes/drinks).
// Next n + 1 lines coefficients of inequalities (form Ax <= b, where x = amount is the vector of
// length m with amounts of each ingredient, A is the n x m matrix with coefficients of inequalities and
// b is the vector with the right-hand side of each inequality). Specifically, the next n lines contains
// m integers Ai1, 𝐴i2, ... and the next line after those n contains n integers b1, b2, ... .These
// lines describe n inequalities of the form Ai1 x amount1 + Ai2 x amount2 + ... x amountm <= bi. The
// last line of the input contains m integers - the pleasure for consuming one item of each dish and drink
// pleasure1, pleasure2, ... .
// Example input: 3 2
//                -1 -1
//                1 0
//                0 1
//                -1 2 2
//                -1 2
// Output: If there is no diet that satisfies all the restrictions, output "No solution".
//         If you can get as much pleasure as you want despite all the restrictions, output “Infinity".
//         If the maximum possible total pleasure is bounded, output two lines. On the first line, output
// “Bounded solution”. On the second line, output m real numbers - the optimal amounts for each dish and drink.
//         Output all the numbers with at least 15 digits after the decimal point.
// Example output: Bounded solution
//                 0.000000000000000 2.000000000000000

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = (asXML) => {
  process.stdin.setEncoding('utf8');

  const allCoefficients = []

  rl.once('line', line => {
    let [restrictionsQt, dishesQt] = line.toString().split(' ').map(v => parseInt(v, 10));

    let n = restrictionsQt + 1;

    if (n === 0) {
      process.stdout.write('');
      process.exit();
    }

    const readCoefficients = line => {
      const coefficients = line.toString().split(' ').map(v => parseInt(v, 10));

      allCoefficients.push(coefficients);

      if (!--n) {
        rl.removeListener('line', readCoefficients);

        rl.once('line', line => {
          const pleasures = line.toString().split(' ').map(v => parseInt(v, 10));

          process.stdout.write(calculateDiet(allCoefficients, pleasures).join('\n'));

          process.exit();
        });
      }
    };

    rl.on('line', readCoefficients);
  });
};

function getLeftmostNonZeroRowIndex(matrix, pivot) {
  for (let column = 0; column < matrix[0].length - 2; column++) {
    for (let row = 0; row < matrix.length; row++) {
      if (matrix[row][matrix[row].length - 1] === 0 && matrix[row][column]) {
        return { row, column };
      }
    }
  }

  return null;
}

function normalizePivotRow(matrix, pivotColumn) {
  const divisor = matrix[0][pivotColumn];

  for (let i = 0; i < matrix[0].length - 1; i++) {
    matrix[0][i] = matrix[0][i] / divisor;
  }

  if (matrix[0][pivotColumn] !== 1) {
    normalizePivotRow(matrix, pivotColumn);
  }
}
let maxLoop = 0;
function normalizePivotColumn(matrix, pivotColumn) {
  let shouldNormalize = false;

  console.log(111111, pivotColumn, matrix);

  for (let i = 1; i < matrix.length; i++) {
    console.log(matrix[i][pivotColumn]);
    if (matrix[i][pivotColumn]) {
      shouldNormalize = true;
      break;
    };

    console.log(12121212);
  }

  if (++maxLoop === 5) {
    return;
  }

  console.log(222222);

  if (!shouldNormalize) {
    return;
  }

  console.log(2333333);

  for (let i = 1; i < matrix.length; i++) {
    if (matrix[i][pivotColumn] === 0) {
      continue;
    }

    const shouldAdd = matrix[i][pivotColumn] < 0;
    const multiplier = Math.abs(matrix[i][pivotColumn]);

    for (let j = 0; j < matrix[i].length - 1; j++) {
      if (shouldAdd) {
        matrix[i][j] += (matrix[0][j] * multiplier);
      } else {
        matrix[i][j] -= (matrix[0][j] * multiplier);
      }
    }
  }

  console.log(444444);

  return normalizePivotColumn(matrix, pivotColumn);
}

function swapArrayRows(matrix, initial, final) {
  const initialContent = matrix[initial];

  matrix[initial] = matrix[final];
  matrix[final] = initialContent;
}

function rowReduce(matrix, currentColumn) {
  const { row: pivotRow, column: pivotColumn } = getLeftmostNonZeroRowIndex(matrix, currentColumn);

  matrix[pivotRow][matrix[pivotRow].length - 1] = 1;

  swapArrayRows(matrix, 0, pivotRow);

  if (matrix[pivotRow][pivotColumn] !== 1) {
    normalizePivotRow(matrix, pivotColumn);
  }

  normalizePivotColumn(matrix, pivotColumn);
}

function reorder(matrix) {
  for (let column = 0; column < matrix[0].length - 2; column++) {
    for (let row = 0; row < matrix.length; row++) {
      if (matrix[row][column] && row !== column) {
        swapArrayRows(matrix, column, row);

        return reorder(matrix);
      }
    }
  }
}

function gaussianElimination(matrix) {
  for (let i = 0; i < matrix[0].length - 2; i++) {
    rowReduce(matrix, i);
  }

  reorder(matrix);
}

function toPrecision(number) {
  const strNumber = number.toString();
  const decimalPointIndex = strNumber.indexOf('.');

  return Number(strNumber.slice(0, decimalPointIndex + 7)).toFixed(6);
}


function calculateDiet(coefficients, pleasures) {
  if (!coefficients || !coefficients.length) {
    return ['No solution'];
  }

  for (let i = 0; i < coefficients.length - 1; i++) {
    coefficients[i].push(coefficients[coefficients.length - 1][i]);
    coefficients[i].push(0);
  }

  coefficients.pop();

  console.log(coefficients);

  gaussianElimination(coefficients);

  const result = [];

  for (let i = 0; i < dishes.length; i++) {
    result.push(toPrecision(dishes[i][dishes[i].length - 2]));
  }

  console.log(results);

  return ['...', '...'];
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => calculateDiet(
        [
          [-1, -1],
          [1, 0],
          [0, 1],
          [-1, 2, 2],
        ],
        [-1, 2],
      ),
      expected: 'Bounded solution 0.000000000000000 2.000000000000000',
    },
    {
      id: 2,
      run: () => calculateDiet(
        [
          [1, 1],
          [-1, -1],
          [1, -2],
        ],
        [1, 1],
      ),
      expected: 'No solution',
    },
    {
      id: 3,
      run: () => calculateDiet(
        [
          [0, 0, 1],
          [3],
        ],
        [1, 1, 1],
      ),
      expected: 'Infinity',
    },
  ];

  if (onlyTest !== undefined) {
    testCases = [testCases.find(testCase => testCase.id == onlyTest)].filter(test => test);
  }

  if (!testCases.length) {
    console.log('No tests found!');
    process.exit();
  }

  testCases.forEach(testCase => {
    const result = testCase.run();

    if (result.join(' ') === testCase.expected) {
      console.log(`[V] Passed test ${testCase.id}`);
    } else {
      console.log(`[X] Failed test ${testCase.id}`);
      console.log(`Expected: ${testCase.expected}`);
      console.log(`Got: ${result}`);
    }
  });

  process.exit();
}

if (process && process.argv && process.argv.includes('-t')) {
  const indexOfT = process.argv.indexOf('-t');
  const testToRun = process.argv[indexOfT + 1];

  return test(testToRun);
}

readLines();

module.exports = calculateDiet;
