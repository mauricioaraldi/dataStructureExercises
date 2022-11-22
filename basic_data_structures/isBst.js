// Input: First line is number of vertices n. The next n lines contain information
// about vertices in order. Each of these lines contains three integers i (key of
// the i-th vertex), left i (the index of the left child of the i-th vertex) and right
// i (the index of the right child of the i-th vertex). If i doesn’t have left or right
// child (or both), the corresponding left-i or right-i (or both) will be equal to −1.
// Example input: 3
//                2 1 2
//                1 -1 -1
//                3 -1 -1
// Output: "CORRECT" for a valid binary tree, or "INCORRECT" otherwise.
// Example output: CORRECT

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  rl.once('line', line => {
    let n = parseInt(line.toString(), 10);
    const vertices = [];

    if (n === 0) {
      process.stdout.write('CORRECT');
      process.exit();
    }

    rl.on('line', line => {
      const verticeInfo = line.toString().split(' ').map(v => parseInt(v, 10));

      vertices.push(verticeInfo);

      if (!--n) {
        process.stdout.write(isTreeBST(vertices) ? 'CORRECT' : 'INCORRECT');

        process.exit();
      }
    });
  });
};

function isBST(tree, nodeIndex = 0, min, max) {
  if (!tree[nodeIndex]) {
    return true;
  }

  const node = tree[nodeIndex];

  if (node[0] < min || node[0] > max) {
    return false;
  }

  return isBST(tree, node[1], min, node[0] - 1) && isBST(tree, node[2], node[0] + 1, max);
}

function isTreeBST(tree) {
  return isBST(tree, 0, Math.MIN_VALUE, Math.MAX_VALUE);
}

readLines();

module.exports = isBST;
