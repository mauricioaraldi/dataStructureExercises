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

  const coefficients = []

  rl.once('line', line => {
    let [restrictionsQt, dishesQt] = line.toString().split(' ').map(v => parseInt(v, 10));

    let n = restrictionsQt;

    if (n === 0) {
      process.stdout.write('');
      process.exit();
    }

    const readCoefficients = line => {
      const coefficient = line.toString().split(' ').map(v => parseInt(v, 10));

      coefficients.push(coefficient);

      if (!--n) {
        rl.removeListener('line', readCoefficients);

        rl.once('line', line => {
          const rightHand = line.toString().split(' ').map(v => parseInt(v, 10));

          rl.once('line', line => {
          const pleasures = line.toString().split(' ').map(v => parseInt(v, 10));

            process.stdout.write(calculateDiet(coefficients, rightHand, pleasures).join('\n'));

            process.exit();
          });
        });
      }
    };

    rl.on('line', readCoefficients);
  });
};

function normalizePivotRow(matrix, pivotRow, pivotColumn) {
  const divisor = matrix[pivotRow][pivotColumn];

  for (let i = 0; i < matrix[pivotRow].length; i++) {
    matrix[pivotRow][i] = matrix[pivotRow][i] / divisor;
  }
}

function normalizePivotColumn(matrix, pivotRow, pivotColumn) {
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i][pivotColumn] === 0 || i === pivotRow) {
      continue;
    }

    const shouldAdd = matrix[i][pivotColumn] < 0;
    const multiplier = Math.abs(matrix[i][pivotColumn]);

    for (let j = 0; j < matrix[i].length; j++) {
      if (shouldAdd) {
        matrix[i][j] += (matrix[pivotRow][j] * multiplier);
      } else {
        matrix[i][j] -= (matrix[pivotRow][j] * multiplier);
      }
    }
  }
}

function toPrecision(number) {
  const strNumber = number.toString();
  const decimalPointIndex = strNumber.indexOf('.');

  return Number(strNumber.slice(0, decimalPointIndex + 7)).toFixed(6);
}

function equalizeInequalities(coefficients) {
  for (let i = 0; i < coefficients.length; i++) {
    coefficients[i].push(...Array(i).fill(0), 1, ...Array(coefficients.length - i).fill(0));
  }
}

/**
 * Gets the smallest value from last row
 */
function identifyPivotColumn(matrix) {
  const lastRow = matrix[matrix.length - 1];
  let pivotColumn = undefined;

  for (let column = 0; column < lastRow.length; column++) {
    if (
      lastRow[column] < 0
      && (pivotColumn === undefined || lastRow[column] < lastRow[pivotColumn])
    ) {
      pivotColumn = column;
    }
  }

  return pivotColumn;
}

function identifyPivotRow(matrix, pivotColumn) {
  const pivotRow = {
    value: undefined,
    index: undefined,
  };

  for (let row = 0; row < matrix.length - 1; row++) {
    const matrixRow = matrix[row];
    const value = matrixRow[matrixRow.length - 1] / matrixRow[pivotColumn];

    if (pivotRow.index === undefined || value < pivotRow.value) {
      pivotRow.value = value;
      pivotRow.index = row;
    }
  }

  return pivotRow.index;
}

function simplex(matrix) {
  const pivotColumn = identifyPivotColumn(matrix);

  if (pivotColumn === undefined) {
    return;
  }

  const pivotRow = identifyPivotRow(matrix, pivotColumn);

  normalizePivotRow(matrix, pivotRow, pivotColumn);
  normalizePivotColumn(matrix, pivotRow, pivotColumn);

  return simplex(matrix);
}

function buildResult(matrix) {
  const result = [];

  for (let column = 0; column < matrix[0].length - 1; column++) {
    const columnValues = [];
    let rowIndex = undefined;

    for (let row = 0; row < matrix.length; row++) {
      if (matrix[row][column] !== 0) {
        columnValues.push(matrix[row][column]);
        rowIndex = row;
      }
    }

    if (Number(columnValues.join('')) === 1) {
      result.push(matrix[rowIndex][matrix[0].length - 1]);
    }

    rowIndex = undefined;
  }

  return result;
}

function calculateDiet(coefficients, rightHand, pleasures) {
  if (!coefficients || !coefficients.length) {
    console.error("Invalid input: No coefficients");
    return ['No solution'];
  }

  for (let i = 0; i < coefficients.length; i++) {
    if (coefficients[i].length !== pleasures.length) {
      console.error("Invalid input: The number of coefficients in each row of coefficients must match the number of pleasures");
      return ['No solution'];
    }
  }

  if (coefficients.length !== rightHand.length) {
    console.error("Invalid input: The number of rows in coefficients must match the length of rightHand");
    return ['No solution'];
  }

  equalizeInequalities(coefficients);

  const table = [];

  for (let i = 0; i <= coefficients.length - 1; i++) {
    table.push([...coefficients[i], rightHand[i]]);
  }

  table.push([...pleasures.map(v => -v), ...Array(table[0].length - pleasures.length - 2).fill(0), 1, 0]);

  simplex(table);

  const result = buildResult(table);

  return ['Bounded solution', result.map(v => v.toFixed(15)).join(' ')];
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
        ],
        [-1, 2, 2],
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
        ],
        [1, -2],
        [1, 1],
      ),
      expected: 'No solution',
    },
    {
      id: 3,
      run: () => calculateDiet(
        [
          [0, 0, 1],
        ],
        [3],
        [1, 1, 1],
      ),
      expected: 'Infinity',
    },
    {
      id: 4,
      run: () => calculateDiet(
        [
          [1, 1],
          [2, 1],
        ],
        [12, 16],
        [40, 30],
      ),
      expected: 'Bounded solution 4.000000000000000 8.000000000000000 400.000000000000000',
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
