// Input: 1 Line. String to be checked
// Example input: {[}
// Example output: 3

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  rl.once('line', line => {
    const text = line.toString();

    process.stdout.write(checkBrackets(text).toString());
    process.exit();
  });
};

function checkBrackets(text) {
  const MATCHES = {
    '(': ')',
    '[': ']',
    '{': '}',
  };
  const stack = [];

  for (let p = 0; p < text.length; ++p) {
    const curChar = text[p];

    if (['(', '[', '{'].includes(curChar)) {
        stack.push(curChar);
    }

    if ([')', ']', '}'].includes(curChar)) {
        if (curChar !== MATCHES[stack[stack.length - 1]]) {
          return p + 1;
        }

        stack.pop();
    }
  }

  return stack.length ? stack.length : 'Success';
}

readLines();

module.exports = checkBrackets;
