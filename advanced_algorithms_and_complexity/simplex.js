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

function buildTableau(coefficients, rightHand, objectiveFunction, mVars) {
  const tableau = [];

  tableau[0] = [
    1,
    ...objectiveFunction.map(v => v * -1),
    ...new Array(coefficients.length).fill(0),
  ];

  for (let i = 1; i < tableau.length; i++) {
    tableau[i] = new Array(objectiveFunction.length + coefficients.length + 2);
  }

  objectiveFunction.push(...new Array(coefficients.length).fill(0));

  const artificialVariables = [];

  for (let i = 0; i < coefficients.length; i++) {
    let newRow = [
      0,
      ...coefficients[i],
      ...new Array(i).fill(0),
      1,
      ...new Array(coefficients.length - i - 1).fill(0),
    ];

    if (rightHand[i] < 0) {
      const artificialColumn = new Array(coefficients.length + 1).fill(0);
      const newVarIndex = objectiveFunction.push(0);

      mVars[newVarIndex]++;

      artificialColumn[i + 1] = -1;

      artificialVariables.push(artificialColumn);
    }

    tableau.push(newRow);
  }

  for (let j = 0; j < artificialVariables.length; j++) {
    for (let i = 0; i < artificialVariables[j].length; i++) {
      tableau[i].push(artificialVariables[j][i]);
    }
  }

  tableau[0].push(0);

  for (let i = 0; i < rightHand.length; i++) {
    tableau[i + 1].push(rightHand[i]);

    if (rightHand[i] < 0) {
      tableau[i + 1] = [tableau[i + 1][i], ...tableau[i + 1].slice(1).map(v => v * -1)];
    }
  }

  return tableau;
}

function initializeVariablesTracker(restrictionsQt, itemsQt, rightHand) {
  let usedVars = [];
  let allVars = [];

  usedVars.push('z');

  for (let i = 0; i < itemsQt; i++) {
    usedVars.push(`s${i + 1}`);
  }

  allVars.push('b');

  for (let i = 0; i < restrictionsQt; i++) {
    allVars.push(`x${i+1}`);
  }

  for (let i = 0; i < itemsQt; i++) {
    allVars.push(`s${i + 1}`);
  }

  for (let i = 0; i < rightHand.length; i++) {
    if (rightHand[i] < 0) {
      allVars.push(`a${i + 1}`);
      usedVars[i + 1] = `a${i + 1}`;
    }
  }

  allVars.push('r-h');

  return {
    allVars,
    usedVars, 
    mVars: new Array(allVars.length).fill(0),
  };
}

function hasNegative(tableau, allVars, mVars) {
  const validVariablesCount = allVars.reduce((acc, variable) => {
    if (variable.indexOf('x') !== -1 || variable.indexOf('s') !== -1) {
      acc++;
    }

    return acc;
  }, 0);

  for (let i = 1; i < validVariablesCount; i++) {
    if (mVars[i] < 0 || tableau[0][i] < 0) {
      return true;
    }
  }

  return false;
}

// Selection of entering variable, min of first row (Cj - zj)
function getPivotColumn(tableau, allVars, mVars) {
  let pivotColumn = 0;
  let min = 0;

  const validVariablesCount = allVars.reduce((acc, variable) => {
    if (variable.indexOf('x') !== -1 || variable.indexOf('s') !== -1) {
      acc++;
    }

    return acc;
  }, 0);

  for (let i = 1; i < validVariablesCount; i++) {
    if (mVars[i] < min) {
      pivotColumn = i;
      min = mVars[i];
    }
  }

  if (min !== 0) {
    return pivotColumn
  }

  min = Number.POSITIVE_INFINITY;

  for (let i = 1; i < validVariablesCount; i++) {
    if (tableau[0][i] < min) {
      pivotColumn = i;
      min = tableau[0][i];
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

function calculateZRow(tableau, objectiveFunction, usedVars, allVars, mVars) {
  for (let j = 1; j < tableau[0].length; j++) {
    const columnVar = allVars[j];
    const varValue = objectiveFunction[j - 1];
    let cValue = 0;

    mVars[j] = 0;

    for (let i = 1; i < tableau.length; i++) {
      const cellValue = tableau[i][j];
      const zVarIndex = allVars.findIndex(v => v === usedVars[i]);
      const zValue = tableau[i][0];
      const zMValue = (mVars[zVarIndex] * -1) * cellValue;

      cValue += zValue * cellValue;
      mVars[j] += zMValue;
    }

    cValue -= varValue;

    tableau[0][j] = cValue;
  }
}

function calculateBaseColumn(tableau, objectiveFunction, usedVars, allVars) {
  for (let i = 1; i < tableau.length; i++) {
    const allVarsIndex = allVars.findIndex(v => v === usedVars[i]);
    tableau[i][0] = objectiveFunction[allVarsIndex - 1];
  }
}

function calculateBaseVariables(tableau, objectiveFunction, usedVars, allVars, mVars) {
  calculateBaseColumn(tableau, objectiveFunction, usedVars, allVars);
  calculateZRow(tableau, objectiveFunction, usedVars, allVars, mVars);
}

function simplex(tableau, objectiveFunction, usedVars, allVars, mVars) {
  while (hasNegative(tableau, allVars, mVars)) {
    const pivotColumn = getPivotColumn(tableau, allVars, mVars);
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
      return 1;
    }

    console.log(`OUT: ${usedVars[pivotRow]}. IN: ${allVars[pivotColumn]}`);

    if (usedVars[pivotRow] === allVars[pivotColumn]) {
      return 2;
    }

    usedVars[pivotRow] = allVars[pivotColumn];

    tableau = pivotNormalization(tableau, pivotColumn, pivotRow);

    console.log(111111);
    printTable(tableau, allVars, usedVars, mVars);

    calculateBaseVariables(tableau, objectiveFunction, usedVars, allVars, mVars);

    console.log(22222);
    printTable(tableau, allVars, usedVars, mVars);
  }

  return tableau;
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

function pad(text, width = 0, placeholder = ' ') {
  return `${text}`.length >= width ? text : new Array(width - `${text}`.length + 1).join(placeholder) + text;
}

function printTable(tableau, allVars, usedVars, mVars) {
  console.log(allVars.map(v => '=========').join('').slice(allVars.length - 4));
  console.log(`   [${allVars.map(v => pad(v, 7, ' ')).join('|')}]`);
  console.log(`   [${allVars.map(v => '--------').join('').slice(1)}]`);

  const getMValue = (v, j, isZColumn = false) => {
    const mIndex = isZColumn ? allVars.findIndex(mV => mV === usedVars[j]) : j;

    if (mIndex === -1) {
      return v;
    }

    const mValue = mVars[mIndex];

    if (mValue !== 0) {
      const mText = `${mValue}M`;
      let text = '';

      if (v > 0) {
        text = `+${v}`;
      } else if (v < 0) {
        text = `${v}`;
      }

      return `${mText}${text}`;
    }

    return v;
  };

  for (let i = 0; i < tableau.length; i++) {
    if (i === 0) {
      console.log(`${pad(usedVars[i], 2, ' ')} [${tableau[i].map((v, j) => pad(getMValue(v, j), 7, ' ')).join('|')}]`);
    } else {
      console.log(`${pad(usedVars[i], 2, ' ')} [${tableau[i].map((v, j) => j === 0 ? pad(getMValue(v, i, true), 7, ' ') : pad(v, 7, ' ')).join('|')}]`);
    }
  }
  console.log(allVars.map(v => '=========').join('').slice(allVars.length - 4));
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

  // usedVars = rowVars = basicVars
  // allVars = columnVars = baseVars
  const { allVars, usedVars, mVars } = initializeVariablesTracker(coefficients[0].length, coefficients.length, rightHand);

  let tableau = buildTableau(coefficients, rightHand, objectiveFunction, mVars);

  calculateBaseVariables(tableau, objectiveFunction, usedVars, allVars, mVars);

  console.log('INITIAL CALCULATED');
  printTable(tableau, allVars, usedVars, mVars);

  tableau = simplex(tableau, objectiveFunction, usedVars, allVars, mVars);

  if (tableau === 1) {
    return ['Infinity'];
  } else if (tableau === 2) {
    return ['No solution'];
  }

  const { result, variablesEndValues, variablesBaseValues } = getResult(tableau, usedVars, allVars);

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
      expected: 'Bounded solution 39.000000000000000',
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
    {
      id: 6,
      run: () => calculateDiet(
        [
          [26],
        ],
        [4362],
        [27]
      ),
      expected: 'Bounded solution 167.769230769230774',
    },
    {
      id: 7,
      run: () => calculateDiet(
        [
          [30],
        ],
        [1680],
        [-87]
      ),
      expected: 'Bounded solution 0.000000000000000',
    },
    {
      id: 8,
      run: () => calculateDiet(
        [
          [-38],
          [-49],
        ],
        [-5087, -5042],
        [39]
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
