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
        rl.off('line', readConnection);

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
  connections.forEach(([origin, destiny, capacity]) => {
    graph[origin].edges[destiny] = {
      residual: capacity,
      exhausted: false,
      capacity,
    };
  });
}

function explore(graph, node, sinkId, previousFlow) {
  if (node === sinkId) {
    return previousFlow;
  }

  const edges = graph[node].edges;

  for (let key in edges) {
    const destiny = parseInt(key, 10);

    console.log('edge!', node, destiny, 'r', edges[destiny].residual);
    if (edges[destiny].exhausted) {
      continue;
    }

    const currentFlow = previousFlow ? Math.min(edges[destiny].residual, previousFlow) : edges[destiny].residual;

    console.log('current', currentFlow);

    if (destiny === sinkId) {
      console.log('ENDS DESTINY');
      edges[destiny].residual -= currentFlow;

      if (edges[destiny].residual === 0) {
        edges[destiny].exhausted = true;
      }

      console.log('CCCC', currentFlow);

      return currentFlow;
    }

    const exploreFlow = explore(graph, destiny, sinkId, currentFlow);

    console.log('explore', exploreFlow, 'return', node, destiny);

    if (exploreFlow) {
      edges[destiny].residual -= exploreFlow;

      if (edges[destiny].residual === 0) {
        edges[destiny].exhausted = true;
      }

      return exploreFlow;
    } else {
      edges[destiny].exhausted = true;
    }
  }

  return 0;
}

function checkSourcesResiduals(graph) {
  return Object.keys(graph[1].edges).reduce((acc, destiny) =>
   acc += graph[1].edges[destiny].capacity - graph[1].edges[destiny].residual
  , 0);
}

function print(graph) {
  Object.keys(graph).forEach(nodeKey =>
    Object.keys(graph[nodeKey].edges).forEach(destiny => 
      console.log(nodeKey, destiny, graph[nodeKey].edges[destiny])
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
  }

  print(graph);

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
          [1, 2, 10000],
          [2, 3, 1],
          [3, 4, 10000],
          [2, 4, 10000],
        ]
      ),
      expected: 20000,
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
