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

function calculateDiet(coefficients, pleasures) {
  if (!coefficients || !coefficients.length) {
    return ['No solution'];
  }

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

module.exports = calculateDiet;
