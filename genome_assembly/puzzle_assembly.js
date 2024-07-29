// Input: A square piece is defined by the four colors of its four edges, in the format (up,left,down,right).
// “valid placement” is defined as a placement of n2 square pieces onto an n-by-n grid such 
// that all “outer edges” (i.e., edges that border no other square pieces), and only these edges, 
// are black, and for all edges that touch an edge in another square piece, the two touching 
// edges are the same color. All of the square pieces are given in the correct orientation.
// Each line of the input contains a single square piece.
// Example input: (yellow,black,black,blue)
//                (blue,blue,black,yellow)
//                (orange,yellow,black,black)
//                (red,black,yellow,green)
//                (orange,green,blue,blue)
//                (green,blue,orange,black)
//                (black,black,red,red)
//                (black,red,orange,purple)
//                (black,purple,green,black)
// Output: Output a “valid placement". Exactly n lines long. Each line should contain n square pieces,
// separated by semicolons. There should be no space characters.
// Example output: (black,black,red,red);(black,red,orange,purple);(black,purple,green,black)
//                 (red,black,yellow,green);(orange,green,blue,blue);(green,blue,orange,black)
//                 (yellow,black,black,blue);(blue,blue,black,yellow);(orange,yellow,black,black)

let VERBOSE = false;

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const pieces = [];

  const readLine = (line, prevTimeout) => {
    pieces.push(line);

    if (prevTimeout) {
      clearTimeout(prevTimeout);
    }

    const newTimeout = setTimeout(() => {
      process.stdout.write(assembly(pieces).join('\n'));
      process.exit();
    }, 300);

    rl.once('line', line => {
      readLine(line, newTimeout);
    });
  };

  rl.once('line', readLine);
};

function assembly(pieces) {
  console.log(pieces);
  return [];
}

function test(outputType, onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => assembly(
        [
          '(yellow,black,black,blue)',
          '(blue,blue,black,yellow)',
          '(orange,yellow,black,black)',
          '(red,black,yellow,green)',
          '(orange,green,blue,blue)',
          '(green,blue,orange,black)',
          '(black,black,red,red)',
          '(black,red,orange,purple)',
          '(black,purple,green,black)',
        ]
      ),
      expected: [
        '(black,black,red,red);(black,red,orange,purple);(black,purple,green,black)',
        '(red,black,yellow,green);(orange,green,blue,blue);(green,blue,orange,black)',
        '(yellow,black,black,blue);(blue,blue,black,yellow);(orange,yellow,black,black)',
      ]
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

    if (outputType === 'RESULT') {
      process.stdout.write(result.toString());
    } else if (outputType === 'TEST') {
      if (result === testCase.expected) {
        console.log(`[V] Passed test ${testCase.id}`);
      } else {
        console.log(`[X] Failed test ${testCase.id}`);
        console.log(`Expected: ${testCase.expected}`);
        console.log(`Got: ${result}`);
      }
    }
  });

  process.exit();
}

if (process && process.argv && process.argv.includes('-t')) {
  const onlyOutput = process.argv.includes('-o');
  const silent = process.argv.includes('-s');
  const indexOfT = process.argv.indexOf('-t');
  const testToRun = process.argv[indexOfT + 1];
  let outputType = 'TEST';

  if (onlyOutput) {
    outputType = 'RESULT';
  }

  if (silent) {
    outputType = 'SILENT';
  }

  VERBOSE = process.argv.includes('-v');

  return test(outputType, testToRun);
}

readLines();

module.exports = assembly;
