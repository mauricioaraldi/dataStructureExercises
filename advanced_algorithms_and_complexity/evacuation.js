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
      edges: new Set(),
      visited: false,
      distance: null,
    };
  }

  return graph;
}

function buildGraph(verticesQt) {
  const graph = {};

  for (let i = 1; i <= verticesQt; i++) {
    graph[i] = {
      edges: {},
      exhausted: false,
    };
  }

  return graph;
}

function createConnections(graph, connections) {
  connections.forEach(([origin, destiny, capacity], i) => {
    graph[origin].edges[i] = {
      destiny,
      residual: capacity,
      exhausted: false,
      visited: false,
      capacity,
    };
  });
}

function bfs(graph, start, end) {
  if (!graph[start] || !graph[end]) {
    return -1;
  }

  graph[start].distance = 0;

  const shortestPathTree = [];
  const queue = new Queue();

  queue.enqueue(start);

  while (queue.length) {
    const nodeKey = queue.dequeue();
    const node = graph[nodeKey];

    node.visited = true;

    if (!shortestPathTree[node.distance]) {
      shortestPathTree[node.distance] = [];
    }

    shortestPathTree[node.distance].push(nodeKey);

    Object.keys(node.edges).forEach(edgeKey => {
      const edge = node.edges[edgeKey];

      if (edge.exhausted || graph[edge.destiny].distance) {
        return;
      }

      graph[edge.destiny].distance = node.distance + 1;
      queue.enqueue(edge.destiny);
    });

    if (graph[end].distance) {
      return graph[end].distance;
    }
  }

  return -1;
}

function explore(graph, node, sinkId, previousFlow) {
  console.log('explore', node);
  if (node === sinkId) {
    return previousFlow;
  }

  const { edges } = graph[node];
  const edgesOrderByKey = Object.keys(edges).sort(
    (a, b) => {
      const aDistance = graph[node].distance + graph[edges[a].destiny].distance;
      const bDistance = graph[node].distance + graph[edges[b].destiny].distance;

      console.log(edges[a].destiny, aDistance, edges[b].destiny, bDistance);

      if (aDistance < bDistance) {
        return -1;
      }

      if (aDistance > bDistance) {
        return 1;
      }

      if (aDistance === bDistance) {
        return a - b;
      }
    }
  );
  const keyToExplore = edgesOrderByKey.find(key => !edges[key].exhausted);

  if (!keyToExplore) {
    return -1;
  }

  const edge = edges[keyToExplore];
  const destiny = parseInt(edge.destiny, 10);

  if (node === destiny || edge.visited) {
    edge.exhausted = true;
    return -1;
  }

  edge.visited = true;

  const currentFlow = previousFlow ? Math.min(edge.residual, previousFlow) : edge.residual;

  if (destiny === sinkId) {
    edge.residual -= currentFlow;

    if (edge.residual === 0) {
      edge.exhausted = true;
    }

    return currentFlow;
  }

  const destinyHasUnvisitedEdges = Object.keys(graph[destiny].edges).some(key => 
      !graph[destiny].edges[key].visited);

  if (!destinyHasUnvisitedEdges) {
    edge.exhausted = true;
    return 0;
  }

  const exploreFlow = explore(graph, destiny, sinkId, currentFlow);

  if (exploreFlow > 0) {
    edge.residual -= exploreFlow;

    if (edge.residual === 0) {
      edge.exhausted = true;
    }

    return exploreFlow;
  } else {
    if (exploreFlow === 0) {
      return 0;
    }

    edge.exhausted = true;
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
    graph[nodeKey].visited = false;

    Object.keys(graph[nodeKey].edges).forEach(edgeKey =>
      graph[nodeKey].edges[edgeKey].visited = graph[nodeKey].edges[edgeKey].exhausted
    );
  });
}

function evacuation(verticesQt, connections) {
  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

  bfs(graph, 1, verticesQt);

  let continueExploring = true;
  while (continueExploring) {
    explore(graph, 1, verticesQt);

    checkSourcesResiduals(graph);

    continueExploring = false;

    for (let key in graph[1].edges) {
      if (!graph[1].edges[key].exhausted) {
        continueExploring = true;
      }
    }

    resetVisitedGraph(graph);
  }

  return checkSourcesResiduals(graph)
}

function generateGraphXML(verticesQt, connections) {
  const NODE_SIZE = 30;
  const BORDER = 150;
  const NODES_PER_COLUMN = 9;

  let uidGraph = 0;
  let uidEdge = 10000;

  const nodes = [];
  const edges = [];

  for (let i = 0; i < verticesQt; i++) {
    const column = parseInt(i / NODES_PER_COLUMN, 10);
    const row = i % NODES_PER_COLUMN;

    nodes.push(`<node
      positionX="${(column * NODE_SIZE) + NODE_SIZE + (column * BORDER)}"
      positionY="${(row * NODE_SIZE) + NODE_SIZE + (row * BORDER)}"
      id="${uidGraph++}"
      mainText="${i+1}"
      upText=""
      size="${NODE_SIZE}"
    ></node>`);
  }

  connections.forEach(([origin, destiny, capacity]) => {
    edges.push(`<edge
      source="${origin - 1}"
      target="${destiny - 1}"
      isDirect="true"
      weight="${capacity}"
      useWeight="true"
      id="${uidEdge++}"
      text=""
      upText=""
      arrayStyleStart=""
      arrayStyleFinish=""
      model_width="4"
      model_type="0"
      model_curveValue="0.1"
    ></edge>`);
  });

  process.stdout.write(`<?xml version="1.0" encoding="UTF-8"?><graphml>`);
  process.stdout.write(`<graph id="Graph" uidGraph="${uidGraph - 1}" uidEdge="${uidEdge - 1}">`);
  process.stdout.write(nodes.join('').replace(/\n     /g, '').replace(/\n    /g, ''));
  process.stdout.write(edges.join('').replace(/\n     /g, '').replace(/\n    /g, ''));
  process.stdout.write(`</graph></graphml>`);
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
        4,
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
