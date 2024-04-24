// Input: First line integer n and m (n number of restrictions on the diet, m number of dishes/drinks).
//    Next n + 1 lines coefficients of inequalities (form Ax <= b, where x = amount is the vector of
//    length m with amounts of each ingredient, A is the n x m matrix with coefficients of inequalities and
//    b is the vector with the right-hand side of each inequality). Specifically, the next n lines contains
//    m integers Ai1, 𝐴i2, ... and the next line after those n contains n integers b1, b2, ... .These
//    lines describe n inequalities of the form Ai1 x amount1 + Ai2 x amount2 + ... x amountm <= bi. The
//    last line of the input contains m integers - the pleasure for consuming one item of each dish and drink
//    pleasure1, pleasure2, ... .
// Example input: 3 2
//                -1 -1
//                1 0
//                0 1
//                -1 2 2
//                -1 2
// Output: If there is no diet that satisfies all the restrictions, output "No solution".
//    If you can get as much pleasure as you want despite all the restrictions, output “Infinity".
//    If the maximum possible total pleasure is bounded, output two lines. On the first line, output
// “Bounded solution”. On the second line, output m real numbers - the optimal amounts for each dish and drink.
//         Output all the numbers with at least 15 digits after the decimal point.
// Example output: Bounded solution
//                 0.000000000000000 2.000000000000000

let stepCount = 0;

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

function normalizePivotRow(tableau, pivotRow, pivotColumn) {
  const divisor = tableau[pivotRow][pivotColumn];

  for (let i = 0; i < tableau[pivotRow].length; i++) {
    tableau[pivotRow][i] = tableau[pivotRow][i] / divisor;
  }
}

function normalizePivotColumn(tableau, pivotRow, pivotColumn) {
  for (let i = 0; i < tableau.length; i++) {
    if (tableau[i][pivotColumn] === 0 || i === pivotRow) {
      continue;
    }

    const shouldAdd = tableau[i][pivotColumn] < 0;
    const multiplier = Math.abs(tableau[i][pivotColumn]);

    for (let j = 0; j < tableau[i].length; j++) {
      if (shouldAdd) {
        tableau[i][j] += (tableau[pivotRow][j] * multiplier);
      } else {
        tableau[i][j] -= (tableau[pivotRow][j] * multiplier);
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
    coefficients[i].push(...Array(i).fill(0), 1, ...Array(coefficients.length - i - 1).fill(0));
  }
}

/**
 * Gets the smallest value from last row for Primal
 */
function identifyPivotColumnPrimal(tableau) {
  const lastRow = tableau[tableau.length - 1];

  for (let column = 0; column < lastRow.length; column++) {
    if (lastRow[column] > 0) {
      return column;
    }
  }

  return undefined;
}

/**
 * Gets the smallest value from last row - for Dual
 */
function identifyPivotColumnDual(tableau, pivotRow) {
  const lastRow = tableau[tableau.length - 1];
  const pivotColumn = {
    index: undefined,
    value: undefined,
  };

  for (let column = 0; column < lastRow.length - 1; column++) {
    const elementValue = tableau[pivotRow][column];

    if (elementValue >= 0) {
      continue;
    }

    const value = -lastRow[column] / elementValue;

    if (pivotColumn.index === undefined || value < pivotColumn.value) {
      pivotColumn.value = value;
      pivotColumn.index = column;
    }
  }

  return pivotColumn.index;
}

/**
 * Gets the smallest value from pivot column, dividing values in the column
 * by values in the right hand - for Primal
 */
function identifyPivotRowPrimal(tableau, pivotColumn) {
  const pivotRow = {
    value: undefined,
    index: undefined,
  };

  for (let row = 0; row < tableau.length - 1; row++) {
    const tableauRow = tableau[row];
    const elementValue = matrixRow[pivotColumn];

    if (elementValue <= 0) {
      continue;
    }

    const value = matrixRow[matrixRow.length - 1] / elementValue;

    if (pivotRow.index === undefined || value < pivotRow.value) {
      pivotRow.value = value;
      pivotRow.index = row;
    }
  }

  return pivotRow.index;
}

/**
 * Gets the smallest value last column (which is the same as
 * right hand), dividing values in the column by values in the right hand - for Dual
 */
function identifyPivotRowDual(tableau) {
  const rightHandIndex = tableau[0].length - 1;
  const pivotRow = {
    value: undefined,
    index: undefined,
  };

  for (let row = 0; row < tableau.length - 1; row++) {
    if (
      tableau[row][rightHandIndex] < 0
      || pivotRow.index === undefined && tableau[row][rightHandIndex] < pivotRow.value
    ) {
      pivotRow.value = tableau[row][rightHandIndex];
      pivotRow.index = row;
    }
  }

  return pivotRow.index;
}

/**
 * Used for the primal function
 */
function simplex(tableau) {
  const pivotColumn = identifyPivotColumnPrimal(tableau);

  if (pivotColumn === undefined) {
    return tableau;
  }

  const pivotRow = identifyPivotRowPrimal(tableau, pivotColumn);

  normalizePivotRow(tableau, pivotRow, pivotColumn);
  normalizePivotColumn(tableau, pivotRow, pivotColumn);

  return simplex(tableau);
}

/**
 * Used for the dual function
 */
function dualSimplex(tableau) {
  const pivotRow = identifyPivotRowDual(tableau);

  if (pivotRow === undefined) {
    return tableau;
  }

  const pivotColumn = identifyPivotColumnDual(tableau, pivotRow);

  console.log({ pivotRow, pivotColumn, value: tableau[pivotRow][pivotColumn] });

  normalizePivotRow(tableau, pivotRow, pivotColumn);
  normalizePivotColumn(tableau, pivotRow, pivotColumn);

  console.log(tableau);

  return dualSimplex(tableau);
}

function buildTableau(coefficients, rightHand, objectiveFunction) {
  const tableau = [];

  for (let i = 0; i < coefficients.length; i++) {
    tableau.push([...coefficients[i], rightHand[i]]);
  }

  tableau.push([...objectiveFunction, ...Array(tableau[0].length - objectiveFunction.length).fill(0)]);

  return tableau;
}

function phaseOne(originalCoefficients, originalRightHand, originalObjectiveFunction) {
  const coefficients = new Array(originalCoefficients[0].length);
  const rightHand = originalObjectiveFunction.map(v => v * -1);
  const objectiveFunction = originalRightHand;

  for (let i = 0; i < originalCoefficients.length; i++) {
    for (let j = 0; j < originalCoefficients[i].length; j++) {
      if (coefficients[j] === undefined) {
        coefficients[j] = [];
      }

      coefficients[j].push(originalCoefficients[i][j] * -1);
    }
  }

  equalizeInequalities(coefficients);

  const tableau = buildTableau(coefficients, rightHand, objectiveFunction);

  console.log(111, tableau);

  dualSimplex(tableau);

  return tableau[tableau.length - 1].slice(0, objectiveFunction.length);
}

function phaseTwo(coefficients, rightHand, objectiveFunction) {
  equalizeInequalities(coefficients);

  const tableau = buildTableau(coefficients, rightHand, objectiveFunction);

  simplex(buildTableau);

  return tableau[tableau.length - 1].slice(0, objectiveFunction.length);
}

function calculateDiet(coefficients, rightHand, objectiveFunction) {
  if (!coefficients || !coefficients.length) {
    console.error("Invalid input: No coefficients");
    return ['No solution'];
  }

  for (let i = 0; i < coefficients.length; i++) {
    if (coefficients[i].length !== objectiveFunction.length) {
      console.error("Invalid input: The number of coefficients in each row of coefficients must match the number of pleasures");
      return ['No solution'];
    }
  }

  if (coefficients.length !== rightHand.length) {
    console.error("Invalid input: The number of rows in coefficients must match the length of rightHand");
    return ['No solution'];
  }

  const tableOne = phaseOne([...coefficients], [...rightHand], [...objectiveFunction]);
  // const tableTwo = phaseTwo([...coefficients], [...rightHand], [...objectiveFunction]);
  // 
  console.log(tableOne);

  const result = tableOne;

  return ['Bounded solution', ...result.map(v => v.toFixed(15))];
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
          [4, 8],
          [2, 1],
          [3, 2],
        ],
        [12, 3, 4],
        [2, 3],
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
