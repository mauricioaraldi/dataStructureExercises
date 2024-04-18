// Input: First line integer n and m (n number of restrictions on the diet, m number of dishes/drinks).
// Next n + 1 lines coefficients of inequalities (form Ax <= b, where x = amount is the vector of
// length m with amounts of each ingredient, A is the n x m matrix with coefficients of inequalities and
// b is the vector with the right-hand side of each inequality). Specifically, the next n lines contains
// m integers Ai1, Ai2, ... and the next line after those n contains n integers b1, b2, ... .These
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

function buildTableau(coefficients, rightHand, objectiveFunction) {
  const tableau = [];

  tableau[0] = [
    1,
    ...objectiveFunction.map(v => v * -1),
    ...new Array(coefficients.length + 1).fill(0),
  ];

  for (let i = 1; i < tableau.length; i++) {
    tableau[i] = new Array(objectiveFunction.length + coefficients.length + 2);
  }

  for (let i = 0; i < coefficients.length; i++) {
    const newRow = [
      0,
      ...coefficients[i],
      ...new Array(i).fill(0),
      1,
      ...new Array(coefficients.length - i - 1).fill(0),
      rightHand[i]
    ];

    if (rightHand[i] < 0) {
      tableau.push(newRow.map(v => v * -1));
      continue;
    }

    tableau.push(newRow);
  }

  return tableau;
}

function initializeVariablesTracker(restrictionsQt, itemsQt) {
  let usedVars = new Array(itemsQt + 1);
  let allVars = new Array(restrictionsQt + itemsQt + 2);

  usedVars[0] = 'c';

  for (let i = 0; i < itemsQt; i++) {
    usedVars[i + 1] = 's' + (i + 1);
  }

  allVars[0] = 'z';

  for (let i = 0; i < restrictionsQt; i++) {
    allVars[i + 1] = 'x' + (i+1);
  }

  for (let i = 0; i < itemsQt; i++) {
    allVars[restrictionsQt + i + 1] = 's' + (i + 1);
  }

  allVars[restrictionsQt + itemsQt + 1] = 'b';

  return { usedVars, allVars };
}

function hasNegative(tableau) {
  for (let i = 1; i < tableau[0].length; i++) {
    if (tableau[0][i] < 0) {
      return true;
    }
  }

  return false;
}

// For pseudo-pivot
function getInvertedPivotColumn(tableau) {
  let pivotColumn = 0;
  let max = Number.NEGATIVE_INFINITY;

  for (let i = 1; i < tableau[0].length - 1; i++) {
    if (tableau[0][i] > max) {
      pivotColumn = i;
      max = tableau[0][i];
    }
  }

  return pivotColumn;
}

// Selection of entering variable, max of first row (Cj - zj)
function getPivotColumn(tableau) {
  let pivotColumn = 0;
  let max = Number.POSITIVE_INFINITY;

  for (let i = 0; i < tableau[0].length - 1; i++) {
    if (tableau[0][i] < max) {
      pivotColumn = i;
      max = tableau[0][i];
    }
  }

  return pivotColumn;
}

function pivotNormalization(tableau, pivotColumn, pivotRow) {
  const newTableau = [];
  const pivotValue = tableau[pivotRow][pivotColumn];

  for (let i = 0; i < tableau.length; i++) {
    newTableau.push([...tableau[i]]);
  }

  // Row operation
  for (let i = 1; i < tableau[pivotRow].length; i++) {
    newTableau[pivotRow][i] = tableau[pivotRow][i] / pivotValue;
  }

  // Column operation
  for (let i = 1; i < tableau.length; i++) {
    if (i === pivotRow) {
      continue;
    }

    for (let j = 0; j < tableau[0].length; j++) {
      newTableau[i][j] -= (tableau[pivotRow][j] * tableau[i][pivotColumn]) / pivotValue;
    }
  }

  return newTableau;
}

function pad(text, width = 0, placeholder = ' ') {
  return `${text}`.length >= width ? text : new Array(width - `${text}`.length + 1).join(placeholder) + text;
}

function printTable(tableau, allVars, usedVars) {
  console.log(allVars.map(v => '=========').join('').slice(allVars.length - 4));
  console.log(`   [${allVars.map(v => pad(v, 7)).join('|')}]`);
  console.log(`   [${allVars.map(v => '--------').join('').slice(1)}]`);

  for (let i = 0; i < tableau.length; i++) {
    console.log(`${pad(usedVars[i], 2)} [${tableau[i].map(v => pad(v, 7)).join('|')}]`);
  }

  console.log(allVars.map(v => '=========').join('').slice(allVars.length - 4));
}

function checkSolvability(coefficients, rightHand, objectiveFunction) {
  const newObjectiveFunction = new Array(objectiveFunction.length).fill(0);
  newObjectiveFunction.push(-1);

  const newCoefficients = coefficients.map(coefficient => [...coefficient, -1]);

  // make pseudo-pivot
  let tableau = buildTableau(newCoefficients, rightHand, newObjectiveFunction);

  const { usedVars, allVars } = initializeVariablesTracker(newCoefficients[0].length, newCoefficients.length);

  printTable(tableau, allVars, usedVars);

  const pivotColumn = getInvertedPivotColumn(tableau);
  let maxRatio = Number.NEGATIVE_INFINITY;
  let pivotRow = undefined;

  for (let i = 1; i < tableau.length; i++) {
    if (tableau[i][pivotColumn] <= 0) {
      continue;
    }

    const ratio = tableau[i][tableau[i].length - 1] / tableau[i][pivotColumn];

    if (ratio > maxRatio) {
      maxRatio = ratio;
      pivotRow = i;
    }
  }

  if (!pivotRow) {
    return ['Infinity'];
  }

  // console.log(`PSEUDO-OUT: ${usedVars[pivotRow]}. PSEUDO-IN: ${allVars[pivotColumn]}`);

  usedVars[pivotRow] = allVars[pivotColumn];

  tableau = pivotNormalization(tableau, pivotColumn, pivotRow);
  calculateBaseVariables(tableau, newObjectiveFunction, usedVars, allVars);

  printTable(tableau, allVars, usedVars);

  const tableauResult = simplex(tableau, newObjectiveFunction, usedVars, allVars);

  printTable(tableauResult.tableau, allVars, usedVars);

  for (let i = 1; i < tableauResult.tableau[0].length; i++) {
    if (tableauResult.tableau[0][i] < 0) {
      return ['No solution'];
    }
  }

  return true;
}

function calculateBaseVariables(tableau, objectiveFunction, usedVars, allVars) {
  // Base column
  for (let i = 1; i < tableau.length; i++) {
    if (usedVars[i].indexOf('x') === -1) {
      tableau[i][0] = 0;
    } else {
      const xIndex = parseInt(usedVars[i].slice(1), 10);
      tableau[i][0] = objectiveFunction[xIndex - 1];
    }
  }

  // Z row
  for (let j = 1; j < tableau[0].length; j++) {
    const columnVar = allVars[j];
    const varValue = j <= objectiveFunction.length ? objectiveFunction[j - 1] : 0;
    let zValue = -varValue;

    for (let i = 1; i < tableau.length; i++) {
      zValue += tableau[i][0] * tableau[i][j]
    }

    tableau[0][j] = zValue;
  }
}

function simplex(tableau, objectiveFunction, usedVars, allVars) {
  while (hasNegative(tableau)) {
    const pivotColumn = getPivotColumn(tableau);
    let minRatio = Number.POSITIVE_INFINITY;
    let pivotRow = undefined;

    for (let i = 1; i < tableau.length; i++) {
      if (tableau[i][pivotColumn] <= 0) {
        continue;
      }

      const ratio = tableau[i][tableau[i].length - 1] / tableau[i][pivotColumn];

      if (ratio < minRatio) {
        minRatio = ratio;
        pivotRow = i;
      }
    }

    if (!pivotRow) {
      return {
        tableau,
        noPivot: true
      };
    }

    console.log(`OUT: ${usedVars[pivotRow]}. IN: ${allVars[pivotColumn]}`);

    if (usedVars[pivotRow] === allVars[pivotColumn]) {
      return {
        tableau,
        looping: true
      };
    }

    usedVars[pivotRow] = allVars[pivotColumn];

    tableau = pivotNormalization(tableau, pivotColumn, pivotRow);
    calculateBaseVariables(tableau, objectiveFunction, usedVars, allVars);
  }

  return { tableau };
}

function getResult(tableau, usedVars, allVars) {
  const result = [];
  const variablesBaseValues = {};
  const variablesEndValues = {};

  for (let i = 0; i < allVars.length - 1; i++) {
    let hasValue = false;

    for (let j = 0; j < usedVars.length; j++) {
      if (allVars[i] === usedVars[j]) {
        variablesBaseValues[usedVars[j]] = tableau[j][i];
        variablesEndValues[usedVars[j]] = tableau[j][tableau[0].length - 1];

        if (allVars[i].indexOf('x') > -1) {
          result.push(tableau[j][tableau[0].length-1]);
        }

        hasValue = true;
        break;
      }
    }

    if (!hasValue) {
      variablesEndValues[allVars[i]] = 0;

      if (allVars[i].indexOf('x') > -1) {
        result.push(0);
      }
    }
  }

  return {
    result,
    variablesEndValues,
    variablesBaseValues,
  };
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

  const solvabilityResult = checkSolvability(coefficients, rightHand, objectiveFunction);

  if (solvabilityResult !== true) {
    return solvabilityResult;
  }

  console.log(12321312);

  const tableau = buildTableau(coefficients, rightHand, objectiveFunction);

  // usedVars = rowVars = basicVars
  // allVars = columnVars = baseVars
  const { usedVars, allVars } = initializeVariablesTracker(coefficients[0].length, coefficients.length);

  const tableauResult = simplex(tableau, objectiveFunction, usedVars, allVars)

  if (tableauResult.noPivot) {
    return ['Infinity'];
  } else if (tableauResult.looping) {
    return ['No solution'];
  }

  const { result, variablesEndValues, variablesBaseValues } = getResult(tableauResult.tableau, usedVars, allVars);

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
        [-1, 2]
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
        [1, 1]
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
        [1, 1, 1]
      ),
      expected: 'Infinity',
    },
    {
      id: 4,
      run: () => calculateDiet(
        [
          [-1],
          [1],
        ],
        [-39, 86],
        [-20]
      ),
      expected: 'Bounded solution 39.000000000000000000',
    },
    {
      id: 5,
      run: () => calculateDiet(
        [
          [10, 5],
          [2, 3],
          [1, 0],
          [0, 1],
        ],
        [200, 60, 34, 14],
        [1000, 1200]
      ),
      expected: 'Bounded solution 15.000000000000000 10.000000000000000',
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
      console.log(`Got: ${result.join(' ')}`);
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
