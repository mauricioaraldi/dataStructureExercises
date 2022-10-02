// Input: Number to be reached trought the possible operations
// Example input: 150
// Example output: 7 (Number of operations)
//                 1 3 6 12 24 25 75 150 (Numbers needed to reach the one desired)

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const POSSIBLE_OPERATIONS = ['+1', '*2', '*3'];

const readLines = () => {
  process.stdin.setEncoding('utf8');
  rl.once('line', line => {
    const diagram = [new Set([1])];
    const finalNumber = Number(line.toString());
    const paths = new Set([1]);

    calculate(diagram, finalNumber, paths);

    const correctPath = backtrack(diagram, finalNumber);

    process.stdout.write(`${(diagram.length - 1).toString()}\n${correctPath.join(' ')}`);
    process.exit();
  });
};

function backtrack(diagram, finalNumber) {
  const path = [];
  let currentNumber = finalNumber;
  let n = diagram.length - 1;

  while (n--) {
    POSSIBLE_OPERATIONS.some(operationDescription => {
      let newNumber;
      const operationNumber = parseInt(operationDescription.replace(/\D/g, ''));

      if (operationDescription.includes('*')) {
        newNumber = currentNumber / operationNumber;

        if (newNumber.toString().includes('.')) {
          return false;
        }
      } else {
        newNumber = currentNumber - operationNumber;
      }

      if (diagram[n].has(newNumber)) {
        path.unshift(currentNumber);
        currentNumber = newNumber;
        return true;
      }
    });
  }

  path.unshift(1);

  return path;
}

function calculate(diagram, finalNumber, paths) {
  const lastRow = diagram[diagram.length - 1];

  if (lastRow.has(finalNumber)) {
    return;
  }

  const newRow = new Set();

  lastRow.forEach(currentNumber => {
    POSSIBLE_OPERATIONS.forEach(operationDescription => {
      let newNumber;
      const operationNumber = Number(operationDescription.replace(/\D/g, ''));

      if (operationDescription.includes('*')) {
        newNumber = currentNumber * operationNumber;
      } else {
        newNumber = currentNumber + operationNumber;
      }

      if (!newRow.has(newNumber) && !paths.has(newNumber) && newNumber <= finalNumber) {
        newRow.add(newNumber);
        paths.add(newNumber);
      }
    });
  });

  diagram.push(newRow);

  return calculate(diagram, finalNumber, paths);
}

readLines();

module.exports = calculate;
