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
        stack.push({ char: curChar, pos: p + 1 });
    }

    if ([')', ']', '}'].includes(curChar)) {
      if (!stack.length || curChar !== MATCHES[stack[stack.length - 1].char]) {
        return p + 1;
      }

      stack.pop();
    }
  }

  return stack.length ? stack[stack.length - 1].pos : 'Success';
}

readLines();

module.exports = checkBrackets;
