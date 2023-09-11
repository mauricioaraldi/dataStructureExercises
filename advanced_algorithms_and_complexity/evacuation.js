// Input: First line 'n m' where 'cities roads'. Next m lines contains 'u v c' respectively
// start of the road, end of the road and capacity. u and v are 1-based indices. Graph is
// mono directional; 
// Example input: 5 7
//                1 2 2
//                2 5 5
//                1 3 6
//                3 4 2
//                4 5 1
//                3 2 3
//                2 4 1
// Output: Single integer representing maximum flow capacity
// Example output: GAGAGA$

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = (asXML) => {
  process.stdin.setEncoding('utf8');

  const connections = [];

  rl.once('line', line => {
    const [vertices, edges] = line.split(' ').map(v => parseInt(v, 10));
    let n = edges;

    if (edges === 0) {
      process.stdout.write('0');
      process.exit();
    }

    const readConnection = line => {
      const link = line.toString().split(' ').map(v => parseInt(v, 10));

      connections.push(link);

      if (!--n) {
        rl.removeListener('line', readConnection);

        if (asXML) {
          generateGraphXML(vertices, connections);
        } else {
          process.stdout.write(evacuation(vertices, connections).toString());
        }

        process.exit();
      }
    };

    rl.on('line', readConnection);
  });
};

class Queue {
  constructor() {
    this.elements = {};
    this.head = 0;
    this.tail = 0;
  }

  enqueue(element) {
    this.elements[this.tail++] = element;
  }

  dequeue() {
    const item = this.elements[this.head];

    delete this.elements[this.head++];

    return item;
  }

  peek() {
    return this.elements[this.head];
  }

  get length() {
    return this.tail - this.head;
  }

  get isEmpty() {
    return this.length === 0;
  }
}

function buildGraph(verticesQt) {
  const graph = {};

  for (let i = 1; i <= verticesQt; i++) {
    graph[i] = {
      edges: {},
      exhausted: false,
      reverseEdges: {},
    };
  }

  return graph;
}

function createConnections(graph, connections) {
  connections.forEach(([origin, destiny, capacity], i) => {
    graph[origin].edges[i] = {
      destiny,
      origin,
      residual: capacity,
      exhausted: false,
      visited: false,
      capacity,
    };

    graph[destiny].reverseEdges[i] = graph[origin].edges[i];
  });
}

function reverseBfs(graph, start, end) {
  if (!graph[start] || !graph[end]) {
    return -1;
  }

  graph[end].distance = 0;

  const shortestPathTree = [];
  const queue = new Queue();

  queue.enqueue(end);

  while (queue.length) {
    const nodeKey = queue.dequeue();
    const node = graph[nodeKey];

    node.visited = true;

    Object.keys(node.reverseEdges).forEach(edgeKey => {
      const edge = node.reverseEdges[edgeKey];

      if (edge.exhausted || graph[edge.origin].distance) {
        return;
      }

      graph[edge.origin].distance = node.distance + 1;
      queue.enqueue(edge.origin);
    });

    if (graph[start].distance) {
      return graph[start].distance;
    }
  }

  return -1;
}

function checkSourcesResiduals(graph) {
  return Object.keys(graph[1].edges).reduce((acc, destiny) =>
    acc += graph[1].edges[destiny].capacity - graph[1].edges[destiny].residual
  , 0);
}

function print(graph) {
  Object.keys(graph).forEach(nodeKey =>
    Object.keys(graph[nodeKey].edges).forEach(edgeKey => 
      console.log(nodeKey, graph[nodeKey].edges[edgeKey].destiny, graph[nodeKey].edges[edgeKey])
    )
  );
}

function resetVisitedGraph(graph) {
  Object.keys(graph).forEach(nodeKey => {
    let areAllEdgesExhausted = true;

    graph[nodeKey].visited = false;

    Object.keys(graph[nodeKey].edges).forEach(edgeKey => {
      if (areAllEdgesExhausted && !graph[nodeKey].edges[edgeKey].exhausted) {
        areAllEdgesExhausted = false;
      }

      graph[nodeKey].edges[edgeKey].visited = graph[nodeKey].edges[edgeKey].exhausted;
    });

    graph[nodeKey].exhausted = areAllEdgesExhausted;
  });
}

function findShortestPath(graph, sinkId) {
  const path = [];
  let maxFlow = undefined;
  let currentNode = 1;
  let lastCurrentNode = undefined;
  let addEdge = undefined;

  while (currentNode && currentNode !== sinkId) {
    console.log('cur', currentNode);

    if (currentNode === lastCurrentNode) {
      break;
    }

    const { edges } = graph[currentNode];

    console.log('edges', edges);

    graph[currentNode].visited = true;

    lastCurrentNode = currentNode;

    currentNode = Object.keys(edges).reduce((acc, edgeKey) => {
      console.log('LOOP EDGE KEY', edgeKey);
      const edge = edges[edgeKey];

      console.log(1111111, edge.exhausted, graph[edge.destiny].visited);

      if (edge.exhausted || graph[edge.destiny].visited) {
        return acc;
      }

      if (graph[edge.destiny].exhausted) {
        edge.exhausted = true;
        return acc;
      }

      console.log('LOOP', acc, edge.destiny);

      if (acc === undefined) {
        addEdge = edge;
        return edge.destiny;
      }

      const edgeDistance = graph[edge.destiny].distance;
      const accDistance = graph[acc].distance;

      if (
        edgeDistance < accDistance
        || ((edgeDistance === accDistance) && edge.destiny < acc)
      ) {
        addEdge = edge;
        return edge.destiny;
      }

      return acc;
    }, undefined);

    console.log('currentNode', currentNode);

    console.log('add', addEdge);

    if (addEdge) {
      path.push(addEdge);

      if (maxFlow === undefined) {
        maxFlow = addEdge.residual;
      } else {
        maxFlow = Math.min(maxFlow, addEdge.residual);
      }
    }

    addEdge = undefined
  }

  if (path.length && path[path.length - 1].destiny !== sinkId) {
    console.log('NEGATIVE path to return', { path, maxFlow });
    path[path.length - 1].exhausted = true;

    console.log('NOW IS EXHAUSTED', path[path.length - 1]);

    resetVisitedGraph(graph);

    return findShortestPath(graph, sinkId);
  }

  console.log('POSITIVE path to return', { path, maxFlow });

  return { path, maxFlow };
}

function evacuation(verticesQt, connections) {
  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

  reverseBfs(graph, 1, verticesQt);

  resetVisitedGraph(graph);

  let shortestPath = findShortestPath(graph, verticesQt);

  resetVisitedGraph(graph);

  while (shortestPath.maxFlow > 0) {
    shortestPath.path.forEach(edge => {
      edge.residual-= shortestPath.maxFlow;

      if (!edge.residual) {
        edge.exhausted = true;
      }
    });

    print(graph);

    shortestPath = findShortestPath(graph, verticesQt);
    resetVisitedGraph(graph);
  }

  return checkSourcesResiduals(graph)
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => evacuation(
        5,
        [
          [1, 2, 2],
          [2, 5, 5],
          [1, 3, 6],
          [3, 4, 2],
          [4, 5, 1],
          [3, 2, 3],
          [2, 4, 1],
        ]
      ),
      expected: 6,
    },

    {
      id: 2,
      run: () => evacuation(
        4,
        [
          [1, 2, 10000],
          [1, 3, 10000],
          [2, 3, 1],
          [2, 4, 10000],
          [3, 4, 10000],
        ]
      ),
      expected: 20000,
    },

    {
      id: 3,
      run: () => evacuation(
        2,
        [
          [1, 1, 10000],
          [1, 2, 1],
          [1, 2, 4],
          [1, 2, 100],
          [2, 1, 900],
        ]
      ),
      expected: 105,
    },

    {
      id: 4,
      run: () => evacuation(
        4,
        [
          [1, 2, 2],
          [2, 3, 2],
          [3, 1, 2],
          [3, 4, 1],
        ]
      ),
      expected: 1,
    },

    {
      id: 5,
      run: () => evacuation(
        5,
        [
          [1, 2, 2],
          [2, 3, 2],
          [4, 5, 1],
        ]
      ),
      expected: 0,
    },
  ];

  if (onlyTest !== undefined) {
    testCases = [testCases.find(testCase => testCase.id == onlyTest)];
  }

  testCases.forEach(testCase => {
    const result = testCase.run();

    if (result === testCase.expected) {
      console.log(`[V] Passed test ${testCase.id}`);
    } else {
      console.log(`[X] Failed test ${testCase.id}`);
      console.log(`Expected: ${testCase.expected}`);
      console.log(`Got: ${result}`);
    }
  });

  process.exit();
}

if (process && process.argv) {
  if (process.argv.includes('-xml')) {
    return readLines(true);
  } else if (process.argv.includes('-t')) {
    const indexOfT = process.argv.indexOf('-t');
    const testToRun = process.argv[indexOfT + 1];

    return test(testToRun);
  }
}

readLines();

module.exports = evacuation;
