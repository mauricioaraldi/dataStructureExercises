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
    const dishes = parseInt(line, 10);

    if (dishes === 0) {
      process.stdout.write('');
      process.exit();
    }

    const readIngredients = line => {
      const ingredients = line.toString().split(' ').map(v => parseInt(v, 10));

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
  for (let i = pivot; i < matrix[i].length - 1; i++) {
    if (matrix[i][pivot]) {
      return i;
    }
  }

  return null;
}

function rescalePivot(matrix, pivot) {
  const divisor = Math.min(matrix[pivot][pivot], matrix[pivot][matrix[0].length - 1]);

  for (let i = pivot; i < matrix[pivot].length; i++) {
    matrix[pivot][i] = matrix[pivot][i] / divisor;
  }

  if (matrix[pivot][pivot] !== 1) {
    rescalePivot(matrix,pivot);
  }
}

function normalizePivot(matrix, columnIndex) {
  let shouldNormalize = false;

  for (let i = 1; i < matrix.length; i++) {
    if (matrix[i][columnIndex]) {
      shouldNormalize = true;
      break;
    };
  }

  if (!shouldNormalize) {
    return;
  }

  for (let i = 1; i < matrix.length; i++) {
    for (let j = 0; j <= matrix.length; j++) {
      matrix[i][j] -= matrix[0][j];
    }
  }

  return normalizePivot(matrix, columnIndex);
}

function swapArrayRows(matrix, initial, final) {
  const initialContent = matrix[initial];

  console.log('=========', matrix, initial, final);

  matrix[initial] = matrix[final];
  matrix[final] = initialContent;

  console.log('-------', matrix);
}

function rowReduce(matrix, pivot) {
  const leftmostNonZeroRowIndex = getLeftmostNonZeroRowIndex(matrix, pivot);

  if (leftmostNonZeroRowIndex === null
    || pivot === leftmostNonZeroRowIndex) {
    return;
  }

  swapArrayRows(matrix, pivot, leftmostNonZeroRowIndex);

  if (matrix[pivot][pivot] !== 1) {
    rescalePivot(matrix, pivot);
  }

  // console.log(matrix);

  // normalizePivot(matrix, columnIndex);

  // console.log('pppppp');
  // console.log(matrix);
  // console.log('iiiiiiii');
  // console.log(solvedColumns);
  // console.log('pppppp');

  // solvedColumns.add(columnIndex);

  // console.log(solvedColumns);

  // if (solvedColumns.length === solvedRowsInitialSize) {
  //   return;
  // }

  // return rowReduce(matrix, solvedColumns);
}

function gaussianElimination(matrix) {
  console.log(matrix);
  for (let i = 0; i < matrix[0].length - 1; i++) {
    rowReduce(matrix, i);
  }
}

function calculateEnergyValues(dishes) {
  if (!dishes || !dishes.length) {
    return '';
  }

  gaussianElimination(dishes);

  const result = [];

  for (let i = 0; i < dishes.length; i++) {
    result.push(parseFloat(dishes[i][dishes[i].length - 1]).toFixed(6));
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
          [1, 0, 0, 0, 1],
          [0, 1, 0, 0, 5],
          [0, 0, 1, 0, 4],
          [0, 0, 0, 1, 3],
        ]
      ),
      expected: '1.000000 5.000000 4.000000 3.000000',
    },

    {
      id: 3,
      run: () => calculateEnergyValues(
        [
          [1, 1, 3],
          [2, 3, 7],
        ]
      ),
      expected: '2.000000 1.000000',
    },

    {
      id: 4,
      run: () => calculateEnergyValues(
        [
          [5, -5, -1],
          [-1, -2, -1],
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
