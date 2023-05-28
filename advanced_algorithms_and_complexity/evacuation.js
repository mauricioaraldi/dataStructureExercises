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

const readLines = () => {
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

        process.stdout.write(evacuation(vertices, connections).toString());
        process.exit();
      }
    };

    rl.on('line', readConnection);
  });
};

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

function explore(graph, node, sinkId, previousFlow) {
  if (node === sinkId) {
    return previousFlow;
  }

  const { edges } = graph[node];
  const edgesOrderByKey = Object.keys(edges).sort((a, b) => edges[b].residual - edges[a].residual);
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

function resetVisitedEdges(graph) {
  Object.keys(graph).forEach(nodeKey =>
    Object.keys(graph[nodeKey].edges).forEach(edgeKey =>
      graph[nodeKey].edges[edgeKey].visited = graph[nodeKey].edges[edgeKey].exhausted
    )
  );
}

function evacuation(verticesQt, connections) {
  const graph = buildGraph(verticesQt);

  createConnections(graph, connections);

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

    resetVisitedEdges(graph);
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
          [3, 4, 10000],
          [2, 4, 10000],
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


if (process && process.argv && process.argv.includes('-t')) {
  const indexOfT = process.argv.indexOf('-t');
  const testToRun = process.argv[indexOfT + 1];

  test(testToRun);
} else {
  readLines();
}

module.exports = evacuation;
