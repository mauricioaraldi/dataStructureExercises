// Input: First line "n m", where n is number of vertices, m number of edges.
// After this, m lines with "u v l", describing a directed connection of length l.
// After this, one line with "q". Number of queries to perform.
// After this, q lines with "u v", to compute distance between u and v.
// Example input: 2 1
//                1 2 1
//                4
//                1 1
//                2 2
//                1 2
//                2 1
// Output: The shortest distance between the two points in each query, or -1 if no path.
// Example output: 0
//                 0
//                 1
//                 -1

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const connections = [];
  const queries = [];

  rl.once('line', line => {
    const [vertices, edges] = line.toString().split(' ').map(v => parseInt(v, 10));
    let n = edges;

    if (edges === 0) {
      process.stdout.write('-1');
      process.exit();
    }

    const readConnection = line => {
      const link = line.toString().split(' ').map(v => parseInt(v, 10));

      connections.push(link);

      if (!--n) {
        rl.off('line', readConnection);

        rl.once('line', line => {
          let q = parseInt(line.toString(), 10);

          n = q;

          const readQuery = line => {
            const query = line.toString().split(' ').map(v => parseInt(v, 10));

            queries.push(query);

            if (!--n) {
              rl.off('line', readQuery);

              const suggestions = friendSuggestion(vertices, connections, queries);

              suggestions.forEach(suggestion => {
                process.stdout.write(`${suggestion.toString()}\n`);
              });

              process.exit();
            }
          };

          rl.on('line', readQuery);
        });
      }
    };

    rl.on('line', readConnection);
  });
};

class PriorityQueue {
  heap = [];
  positionKey = {};
  keyPosition = {};

  getLeftChild(index) {
     return index * 2 + 1;
  }

  getRightChild(index) {
    return index * 2 + 2;
  }

  getParent(index) {
    return Math.floor((index - 1) / 2);
  }

  swap(a, b) {
    const tmp = this.heap[a];
    const aKey = this.positionKey[a];
    const bKey = this.positionKey[b];

    this.heap[a] = this.heap[b];
    this.heap[b] = tmp;

    this.positionKey[a] = bKey;
    this.positionKey[b] = aKey;

    this.keyPosition[aKey] = b;
    this.keyPosition[bKey] = a;
  }

  siftDown(index) {
    const leftChild = this.getLeftChild(index);
    const rightChild = this.getRightChild(index);
    let maxIndex = index;

    if (leftChild < this.heap.length && this.heap[leftChild] < this.heap[maxIndex]) {
      maxIndex = leftChild;
    }

    if (rightChild < this.heap.length && this.heap[rightChild] < this.heap[maxIndex]) {
      maxIndex = rightChild;
    }

    if (maxIndex != index) {
      this.swap(maxIndex, index);
      this.siftDown(maxIndex);
    }
  }

  siftUp(index) {
    let newIndex = index;
    let parentIndex = this.getParent(index);

    while (newIndex !== 0 && this.heap[newIndex] < this.heap[parentIndex]) {
      this.swap(newIndex, parentIndex);
      newIndex = parentIndex;
      parentIndex = this.getParent(newIndex);
    }
  }

  peek() {
    return this.heap[0];
  }

  insert(priority, key) {
    const newIndex = this.heap.push(priority) - 1;

    this.keyPosition[key] = newIndex;
    this.positionKey[newIndex] = key;

    this.siftUp(newIndex);
  }

  extractMin() {
    const root = this.heap[0];
    const rootKey = this.positionKey[0];
    const lastElementIndex = this.heap.length - 1;
    const lastElementKey = this.positionKey[lastElementIndex];
    const lastElement = this.heap.pop();

    delete this.keyPosition[rootKey];

    if (this.heap.length) {
      this.heap[0] = lastElement;

      this.positionKey[0] = lastElementKey;
      this.keyPosition[lastElementKey] = 0;

      this.siftDown(0);

      delete this.positionKey[this.heap.length];
    }

    return { value: root, key: rootKey };
  }

  changePriority(key, newPriority) {
    const elementPosition = this.keyPosition[key];
    const oldPriority = this.heap[elementPosition];

    this.heap[elementPosition] = newPriority;

    if (newPriority < oldPriority) {
      this.siftUp(elementPosition);
    } else {
      this.siftDown(elementPosition);
    }
  }

  get length() {
    return this.heap.length;
  }

  get isEmpty() {
    return this.length === 0;
  }
}

function buildGraph(verticesQt) {
  const graph = {};

  for (let i = 0; i <= verticesQt - 1; i++) {
    graph[i] = {
      edges: {},
      reverseEdges: {},
      forwardProcessed: false,
      reverseProcessed: false,
    };
  }

  return graph;
}

function createConnections(graph, connections) {
  connections.forEach(([origin, destiny, weight]) => {
    graph[origin - 1].edges[destiny - 1] = weight;
    graph[destiny - 1].reverseEdges[origin - 1] = weight;
  });
}

function BiDirectionalDijkstra(graph, verticesQt, start, end) {
  const dist = new Array(verticesQt).fill(Infinity);
  const reverseDist = new Array(verticesQt).fill(Infinity);

  dist[start] = 0;
  reverseDist[end] = 0;

  const queue = new PriorityQueue();
  const reverseQueue = new PriorityQueue();

  dist.forEach((v, i) => queue.insert(v, i));
  reverseDist.forEach((v, i) => reverseQueue.insert(v, i));

  while(!queue.isEmpty && !reverseQueue.isEmpty) {
    const { key } = queue.extractMin();
    const { key: reverseKey } = reverseQueue.extractMin();

    graph[key].forwardProcessed = true;
    graph[reverseKey].reverseProcessed = true;

    if (graph[reverseKey].forwardProcessed && graph[key].reverseProcessed) {
      if (dist[key] !== Infinity && reverseDist[key] !== Infinity) {
        return dist[key] + reverseDist[key];
      }
    }

    // if (reverseDist[key] !== Infinity) {
    //   console.log('OPTIMAL PATH FOUND', dist, reverseDist);
    //   console.log('CURRENT KEY', key);

    //   for (let i = key + 1; i <= dist.length; i++) {
    //     console.log('DIST', dist);

    //     const distance = dist[i];
    //     const biDirectionalDistance = dist[i - 1] + reverseDist[i + 1];

    //     if (biDirectionalDistance < distance) {
    //       dist[i] = biDirectionalDistance;
    //     }

    //     // if (distance !== Infinity || reverseDist[i] !== Infinity) {
    //     //   continue;
    //     // }

    //     // if (distance === Infinity && reverseDist[i] === Infinity) {
    //     //   continue;
    //     // }
    //   }

    //   return dist;
    // }

    Object.entries(graph[key].edges).forEach(([edge, weight]) => {
      const edgeDistance = dist[key] + weight;

      if (dist[edge] > edgeDistance) {
        dist[edge] = edgeDistance;

        queue.changePriority(edge, dist[edge]);
      }
    });

    Object.entries(graph[reverseKey].reverseEdges).forEach(([edge, weight]) => {
      const edgeDistance = reverseDist[reverseKey] + weight;

      if (reverseDist[edge] > edgeDistance) {
        reverseDist[edge] = edgeDistance;

        reverseQueue.changePriority(edge, reverseDist[edge]);
      }
    });
  }

  return -1;
}

function resetGraph(graph) {
  Object.values(graph).forEach(node => {
    node.forwardProcessed = false;
    node.reverseProcessed = false;
  });
}

function friendSuggestion(verticesQt, connections, queries) {
  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

  console.log(graph);

  const r = queries.map(query => {
    const [start, end] = query;

    resetGraph(graph);

    if (start === end) {
      return 0;
    }

    return BiDirectionalDijkstra(graph, verticesQt, start - 1, end - 1);
  });

  return r;
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => friendSuggestion(
        2,

        [
          [1, 2, 1],
        ],

        [
          [1, 1],
          [2, 2],
          [1, 2],
          [2, 1],
        ],
      ),
      expected: [0, 0, 1, -1],
    },

    {
      id: 2,
      run: () => friendSuggestion(
        4,

        [
          [1, 2, 1],
          [4, 1, 2],
          [2, 3, 2],
          [1, 3, 5],
        ],

        [
          [1, 3],
        ],
      ),
      expected: [3],
    },

    {
      id: 3,
      run: () => friendSuggestion(
        7,

        [
          [1, 2, 1],
          [2, 3, 1],
          [3, 4, 1],
          [4, 5, 1],
          [5, 6, 1],
          [6, 7, 1],
          [1, 7, 7],
        ],

        [
          [1, 7],
        ],
      ),
      expected: [6],
    },

    {
      id: 4,
      run: () => friendSuggestion(
        7,

        [
          [1, 2, 1],
          [2, 3, 1],
          [3, 4, 1],
          [4, 5, 1],
          [5, 6, 1],
          [1, 7, 2],
          [7, 6, 2],
        ],

        [
          [1, 6],
        ],
      ),
      expected: [4],
    },

    {
      id: 5,
      run: () => friendSuggestion(
        5,

        [
          [1, 2, 1],
          [2, 3, 1],
          [3, 4, 1],
          [1, 5, 2],
          [5, 4, 2],
        ],

        [
          [1, 4],
        ],
      ),
      expected: [3],
    }
  ];

  if (onlyTest !== undefined) {
    testCases = [testCases.find(testCase => testCase.id == onlyTest)];
  }

  testCases.forEach(testCase => {
    const result = testCase.run();

    if (result.toString() === testCase.expected.toString()) {
      console.log(`[V] Passed test ${testCase.id}`);
    } else {
      console.log(`[X] Failed test ${testCase.id}`);
      console.log(`Expected: ${testCase.expected}`);
      console.log(`Got: ${result}`);
    }
  });

  process.exit();
}


if (process?.argv?.includes('-t')) {
  const indexOfT = process.argv.indexOf('-t');
  const testToRun = process.argv[indexOfT + 1];

  test(testToRun);
} else {
  readLines();
}

module.exports = friendSuggestion;
