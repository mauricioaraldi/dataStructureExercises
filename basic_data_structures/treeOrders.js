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

function iteractiveTraverseByLevel(tree) {
  if (!tree) {
    return [];
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

function iteractiveTraverseInOrder(tree) {
  const queue = [];
  const print = [];

  let node = tree[0];

  while(queue.length || node) {
    while(node) {
      queue.push(node);

      node = tree[node[1]];
    }

    node = queue.pop();

    print.push(node[0]);

    node = tree[node[2]];
  }

  return print;
}

function recursiveTraverseInOrder(tree, nodeIndex = 0) {
  if (!tree) {
    return [];
  }

  const print = [];
  const node = tree[nodeIndex];

  if (node[1] !== -1) {
    print.push(...recursiveTraverseInOrder(tree, node[1]));
  }

  print.push(node[0]);

  if (node[2] !== -1) {
    print.push(...recursiveTraverseInOrder(tree, node[2]));
  }

  return print;
}

function iteractiveTraversePreOrder(tree) {
  const queue = [tree[0]];
  const print = [];

  let node;

  while(queue.length) {
    node = queue.pop();

    print.push(node[0]);

    if(node[2] !== -1) {
      queue.push(tree[node[2]]);
    }

    if(node[1] !== -1) {
      queue.push(tree[node[1]]);
    }
  }

  return print;
}

function recursiveTraversePreOrder(tree, nodeIndex = 0) {
  if (!tree) {
    return [];
  }

  const print = [];
  const node = tree[nodeIndex];

  print.push(node[0]);

  if (node[1] !== -1) {
    print.push(...recursiveTraversePreOrder(tree, node[1]));
  }

  if (node[2] !== -1) {
    print.push(...recursiveTraversePreOrder(tree, node[2]));
  }

  return print;
}

function iteractiveTraversePostOrder(tree) {
  const queue = [tree[0]];
  const visitOrder = [];
  const print = [];

  let node;

  while (queue.length) {
    node = queue.pop();

    if (node[1] !== -1) {
      queue.push(tree[node[1]]);
    }

    if (node[2] !== -1) {
      queue.push(tree[node[2]]);
    }

    visitOrder.push(node);
   }

   while (visitOrder.length) {
     node = visitOrder.pop();
     print.push(node[0]);
   }

   return print;
}

function recursiveTraversePostOrder(tree, nodeIndex = 0) {
  if (!tree) {
    return [];
  }

  const print = [];
  const node = tree[nodeIndex];

  if (node[1] !== -1) {
    print.push(...recursiveTraversePostOrder(tree, node[1]));
  }

  if (node[2] !== -1) {
    print.push(...recursiveTraversePostOrder(tree, node[2]));
  }

  print.push(node[0]);

  return print;
}

function traverseTree(tree) {
  const print = [];

  print.push(iteractiveTraverseInOrder(tree));
  print.push(iteractiveTraversePreOrder(tree));
  print.push(iteractiveTraversePostOrder(tree));

  return print;
}

function testFullLeftHeight() {
  const tree = [];
  const HEIGHT = 10000;

  for (let i = 1; i < HEIGHT; i++) {
    tree.push([i, i === HEIGHT - 1 ? -1 : i, -1]);
  }

  const results = traverseTree(tree);

  results.forEach(result => process.stdout.write(`${result.join(' ')}\n`));

  process.exit();
}

readLines();
// testFullLeftHeight();

module.exports = traverseTree;
