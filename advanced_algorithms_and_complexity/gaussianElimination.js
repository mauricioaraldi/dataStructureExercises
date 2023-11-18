// Input: First line integer n - the number of dishes in the menu, and the number of different ingredients is the same.
// Next n lines description 'an', E of a single menu item. 'ai' amount of i-th ingredient in the dish, and E is the
// energy value. If ingredient is not used, amount will be specified as ai = 0; need to work with negative numbers ai < 0.
// Example input: 4
//                1 0 0 0 1
//                0 1 0 0 5
//                0 0 1 0 4
//                0 0 0 1 3
// Output: n numbers (energy value for each ingredient). Max 3 digits after decimal point.
// Example output: 1.000000 5.000000 4.000000 3.000000

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = (asXML) => {
  process.stdin.setEncoding('utf8');

  const dishes = [];

  rl.once('line', line => {
    let n = parseInt(line, 10);

    if (n === 0) {
      process.stdout.write('');
      process.exit();
    }

    const readIngredients = line => {
      const ingredients = line.toString().split(' ').map(v => parseInt(v, 10));

      ingredients.push(0);

      dishes.push(ingredients);

      if (!--n) {
        rl.removeListener('line', readIngredients);

        process.stdout.write(calculateEnergyValues(dishes).toString());

        process.exit();
      }
    };

    rl.on('line', readIngredients);
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

function rescalePivot(matrix, pivotColumn) {
  const divisor = matrix[0][pivotColumn];

  for (let i = 0; i < matrix[0].length - 1; i++) {
    matrix[0][i] = matrix[0][i] / divisor;
  }

  if (matrix[0][pivotColumn] !== 1) {
    rescalePivot(matrix, pivotColumn);
  }
}

function normalizePivot(matrix, pivotColumn) {
  let shouldNormalize = false;

  for (let i = 1; i < matrix.length; i++) {
    if (matrix[i][pivotColumn]) {
      shouldNormalize = true;
      break;
    };
  }

  if (!shouldNormalize) {
    return;
  }

  for (let i = 1; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length - 1; j++) {
      if (matrix[i][j] < 0) {
        matrix[i][j] += matrix[0][j];
      }

      if (matrix[i][j] > 0) {
        matrix[i][j] -= matrix[0][j];
      }
    }
  }

  return normalizePivot(matrix, pivotColumn);
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
    rescalePivot(matrix, pivotColumn);
  }

  normalizePivot(matrix, pivotColumn);
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

function calculateEnergyValues(dishes) {
  if (!dishes || !dishes.length) {
    return '';
  }

  gaussianElimination(dishes);

  const result = [];

  for (let i = 0; i < dishes.length; i++) {
    result.push(parseFloat(Math.abs(dishes[i][dishes[i].length - 2])).toFixed(6));
  }

  return result.join(' ');
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => calculateEnergyValues(
        []
      ),
      expected: '',
    },

    {
      id: 2,
      run: () => calculateEnergyValues(
        [
          [1, 0, 0, 0, 1, 0],
          [0, 1, 0, 0, 5, 0],
          [0, 0, 1, 0, 4, 0],
          [0, 0, 0, 1, 3, 0],
        ]
      ),
      expected: '1.000000 5.000000 4.000000 3.000000',
    },

    {
      id: 3,
      run: () => calculateEnergyValues(
        [
          [1, 1, 3, 0],
          [2, 3, 7, 0],
        ]
      ),
      expected: '2.000000 1.000000',
    },

    {
      id: 4,
      run: () => calculateEnergyValues(
        [
          [5, -5, -1, 0],
          [-1, -2, -1, 0],
        ]
      ),
      expected: '0.200000 0.400000',
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

    if (result === testCase.expected) {
      console.log(`[V] Passed test ${testCase.id}`);
    } else {
      console.log(`[X] Failed test ${testCase.id}`);
      console.log(`Expected: ${testCase.expected}`);
      console.log(`Got: ${result}`);
    }
  });

  process.exit();
}

if (process && process.argv) {
  if (process.argv.includes('-xml')) {
    return readLines(true);
  } else if (process.argv.includes('-t')) {
    const indexOfT = process.argv.indexOf('-t');
    const testToRun = process.argv[indexOfT + 1];

    return test(testToRun);
  }
}

readLines();

module.exports = calculateEnergyValues;
