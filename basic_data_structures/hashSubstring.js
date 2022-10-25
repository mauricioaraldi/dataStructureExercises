// Input: First line is the pattern to search. Second line is the string to
// be searched.
// Example input: aba
//                abacaba
// Example output: 0 4

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const queries = [];

  rl.once('line', line => {
    let pattern = line.toString();

    rl.once('line', line => {
      let text = line.toString();

      process.stdout.write(findPattern(pattern, text));
      process.exit();
    });
  });
};

function findPattern(pattern, text) {
  return;
}

readLines();

module.exports = processQueries;
