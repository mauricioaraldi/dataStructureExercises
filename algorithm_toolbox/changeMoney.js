// Input: Quantity of money to be changed using the least amount of coins possible
// Example input: 150
// Example output: 38 (Number of coins needed)

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const POSSIBLE_COINS = [1, 3, 4];

const readLines = () => {
  process.stdin.setEncoding('utf8');
  rl.once('line', line => {
    const diagram = [new Set(POSSIBLE_COINS)];
    const money = Number(line.toString());
    const paths = new Set(POSSIBLE_COINS);

    process.stdout.write(changeDP(diagram, money, paths).toString());
    process.exit();
  });
};

function changeDP(diagram, money, paths) {
  const lastRow = diagram[diagram.length - 1];

  if (lastRow.has(money)) {
    return diagram.length;
  }

  const newRow = new Set();

  lastRow.forEach(change => {
    POSSIBLE_COINS.forEach(coin => {
      const newChange = change + coin;

      if (!newRow.has(newChange) && !paths.has(newChange) && newChange <= money) {
        newRow.add(newChange);
        paths.add(newChange);
      }
    });
  });

  diagram.push(newRow);

  return changeDP(diagram, money, paths);
}

readLines();

module.exports = changeDP;
