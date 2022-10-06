// Input: 2 Lines. First line is number of nodes. Second line represents a tree with numbers
// from −1 to n − 1 — parents of nodes. If the i-th one of them (0 ≤ i ≤ n − 1) is −1, node i
// is the root, otherwise it’s 0-based index of the parent of i-th node. It is guaranteed
// that there is exactly one root.
// Example input: 5
//                4 -1 4 1 1
// Example output: 3

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  rl.once('line', line => {
    const n = line.toString();

    rl.once('line', line => {
      const tree = line.toString();

      process.stdout.write(getHeight(tree).toString());
      process.exit();
    });
  });
};

function getHeight(stringTree) {
  const plainTree = stringTree.split(' ');
  const tree = {};
  let stack = [];
  let height = 1;

  plainTree.forEach((el, i) => {
    if (!tree[el]) {
      tree[el] = new Array();
    }

    tree[el].push(i.toString());
  });

  stack.push(...tree['-1']);

  while (stack.length) {
    const nextStack = [];

    stack.forEach(el => {
      nextStack.push(...(tree[el] || []));
    });

    stack = nextStack;

    if (stack.length) {
      height++;
    }
  }

  return height;
}

readLines();

module.exports = getHeight;
