// Input: First line is number of vertices n. The next n lines contain information
// about vertices in order. Each of these lines contains three integers i (key of
// the i-th vertex), left i (the index of the left child of the i-th vertex) and right
// i (the index of the right child of the i-th vertex). If i doesn’t have left or right
// child (or both), the corresponding left-i or right-i (or both) will be equal to −1.
// Example input: 5
//                4 1 2
//                2 3 4
//                5 -1 -1
//                1 -1 -1
//                3 -1 -1
// Output: Three lines. The first line should contain the keys of the vertices in the
// in-order traversal of the tree. The second line should contain the keys of the vertices
// in the pre-order traversal of the tree. The third line should contain the keys of the
// vertices in the post-order traversal of the tree.
// Example output: 1 2 3 4 5
//                 4 2 1 3 5
//                 1 3 2 5 4

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

    rl.on('line', line => {
      const verticeInfo = line.toString().split(' ').map(v => parseInt(v, 10));

      vertices.push(verticeInfo);

      if (!--n) {
        const results = traverseTree(vertices);

        results.forEach(result => process.stdout.write(`${result.join(' ')}\n`));

        process.exit();
      }
    });
  });
};

function traverseByLevel(tree) {
  if (!tree) {
    return;
  }

  const print = [];
  const queue = [];

  queue.push(tree[0]);

  while (queue.length) {
    const node = queue.pop();

    print.push(node[0]);

    if (node[1] !== -1) {
      queue.push(tree[node[1]]);
    }

    if (node[2] !== -1) {
      queue.push(tree[node[2]]);
    }
  }

  return print;
}

function traverseInOrder(tree, nodeIndex = 0) {
  if (!tree) {
    return;
  }

  const print = [];
  const node = tree[nodeIndex];

  if (node[1] !== -1) {
    print.push(...traverseInOrder(tree, node[1]));
  }

  print.push(node[0]);

  if (node[2] !== -1) {
    print.push(...traverseInOrder(tree, node[2]));
  }

  return print;
}

function traversePreOrder(tree, nodeIndex = 0) {
  if (!tree) {
    return;
  }

  const print = [];
  const node = tree[nodeIndex];

  print.push(node[0]);

  if (node[1] !== -1) {
    print.push(...traversePreOrder(tree, node[1]));
  }

  if (node[2] !== -1) {
    print.push(...traversePreOrder(tree, node[2]));
  }

  return print;
}

function traversePostOrder(tree, nodeIndex = 0) {
  if (!tree) {
    return;
  }

  const print = [];
  const node = tree[nodeIndex];

  if (node[1] !== -1) {
    print.push(...traversePostOrder(tree, node[1]));
  }

  if (node[2] !== -1) {
    print.push(...traversePostOrder(tree, node[2]));
  }

  print.push(node[0]);

  return print;
}

function traverseTree(tree) {
  const print = [];

  print.push(traverseInOrder(tree));
  print.push(traversePreOrder(tree));
  print.push(traversePostOrder(tree));

  return print;
}

readLines();

module.exports = traverseTree;
