// Input: First line 'n m' where 'vertices edges'. Next m lines contains 'u v l c' respectively
//    origin, destiny, lower bound and capacity. u and v are 1-based indices. No self loops. May
//    contain parallel edges
// Example input: 3 2
//                1 2 0 3
//                2 3 0 3
// Output: YES or NO in first line (if there is circulation). Next m lines, value of the flow along
// an edge (assuming the same order of edges as in the input).
// Example output: YES
//                 0
//                 0

let CUR_EDGE_ID = 0;

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

        process.stdout.write(circulationNetwork(vertices, connections).toString());

        process.exit();
      }
    };

    rl.on('line', readConnection);
  });
};

function buildGraph(connections) {
  const graph = {};
  const allEdges = {};
  const connectionsEdges = [];
  let highestLowerBound = 0;
  

  connections.forEach(([originInt, destinyInt, lowerBound, capacity]) => {
    const origin = originInt.toString();
    const destiny = destinyInt.toString();
    const curEdgeIdString = CUR_EDGE_ID.toString();

    highestLowerBound = Math.max(highestLowerBound, lowerBound);

    allEdges[curEdgeIdString] = {
      capacity,
      lowerBound,
      destiny: destiny,
      id: curEdgeIdString,
      origin: origin,
      used: false,
    };

    connectionsEdges.push(curEdgeIdString);

    if (!graph[origin]) {
      graph[origin] = {
        edges: new Map(),
        reverseEdges: new Map(),
        demand: 0,
      };
    }

    if (!graph[destiny]) {
      graph[destiny] = {
        edges: new Map(),
        reverseEdges: new Map(),
        demand: 0,
      };
    }

    if (!graph[origin].edges[destiny]) {
      graph[origin].edges.set(destiny, new Set());
      graph[destiny].reverseEdges.set(origin, new Set());
    }

    graph[origin].edges.get(destiny).add(curEdgeIdString);
    graph[destiny].reverseEdges.get(origin).add(curEdgeIdString);

    CUR_EDGE_ID++;
  });

  return {
    allEdges,
    connectionsEdges,
    graph,
    lowerBound: highestLowerBound,
  }
}

// bfs(source, sink, parent) {
//     const visited = new Set();
//     const queue = [source];

//     visited.add(source);

//     while (queue.length > 0) {
//       const u = queue.shift();

//       for (const edge of this.graph.get(u)) {
//         const v = edge.node;
//         const capacity = edge.capacity;

//         if (!visited.has(v) && capacity > 0) {
//           parent[v] = { node: u, edge: edge };
//           visited.add(v);
//           queue.push(v);

//           if (v === sink) {
//             return true;
//           }
//         }
//       }
//     }

//     return false;
//   }

//   maxFlow(source, sink) {
//     const parent = {};
//     let maxFlow = 0;

//     while (this.bfs(source, sink, parent)) {
//       let pathFlow = Number.POSITIVE_INFINITY;
//       let currentNode = sink;

//       while (currentNode !== source) {
//         const { edge } = parent[currentNode];

//         pathFlow = Math.min(pathFlow, edge.capacity);
//         currentNode = parent[currentNode].node;
//       }

//       maxFlow += pathFlow;

//       currentNode = sink;

//       while (currentNode !== source) {
//         const { edge } = parent[currentNode];

//         edge.capacity -= pathFlow;
//         edge.reverse.capacity += pathFlow;

//         currentNode = parent[currentNode].node;
//       }
//     }

//     return maxFlow;
//   }

function checkDependencies(graph, allEdges) {
  for (let key in graph) {
    const vertex = graph[key];

    const inputEdges = [];
    Array.from(vertex.edges.values()).map(destinyEdges => {
      Array.from(destinyEdges).forEach(edgeId => inputEdges.push(edgeId));
    });

    const outputEdges = [];
    Array.from(vertex.reverseEdges.values()).map(destinyEdges => {
      Array.from(destinyEdges).forEach(edgeId => outputEdges.push(edgeId));
    });

    const input = inputEdges.reduce((acc, edgeId) => acc + allEdges[edgeId].lowerBound, 0);
    const output = outputEdges.reduce((acc, edgeId) => acc + allEdges[edgeId].lowerBound, 0);

    vertex.demand = input - output;
  }
}

function updateCapacities(allEdges) {
  for (let edgeId in allEdges) {
    const edge = allEdges[edgeId];

    edge.capacity = edge.capacity - edge.lowerBound;
  }
}

function addSourceSink(graph, allEdges, verticesQt) {
  const sinkId = verticesQt + 1;
  const sourceVertex = {
    edges: new Map(),
    reverseEdges: new Map(),
    demand: 0,
  };
  conts sinkVertex = {
    edges: new Map(),
    reverseEdges: new Map(),
    demand: 0,
  };

  for (let vertexId in graph) {
    const vertex = graph[vertexId];

    if (vertex.demand > 0) {
      const curEdgeIdString = CUR_EDGE_ID.toString();

      allEdges[curEdgeIdString] = {
        lowerBound,
        capacity: vertex.demand,
        destiny: vertexId,
        id: curEdgeIdString,
        origin: '0',
        used: false,
      };

      sourceVertex.edges.get(vertexId).add(curEdgeIdString);
      vertex.reverseEdges.get('0').add(curEdgeIdString);

      CUR_EDGE_ID++;
    } else if (vertex.demand < 0) {
      const curEdgeIdString = CUR_EDGE_ID.toString();

      allEdges[curEdgeIdString] = {
        lowerBound,
        capacity: vertex.demand,
        destiny: sinkId,
        id: curEdgeIdString,
        origin: vertexId,
        used: false,
      };

      vertex.edges.get(sinkId).add(curEdgeIdString);
      sinkVertex.reverseEdges.get(vertexId).add(curEdgeIdString);

      CUR_EDGE_ID++;
    }
  }

  graph['0'] = sourceVertex;
  graph[sinkId] = sinkVertex;
}

function circulationNetwork(verticesQt, connections) {
  const {allEdges, graph} = buildGraph(connections);

  checkDependencies(graph, allEdges);

  updateCapacities(allEdges);

  addSourceSink(graph, allEdges, verticesQt);

  return graph.maxFlow(1, verticesQt);
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => circulationNetwork(
        3,
        [
          [1, 2, 0, 3],
          [2, 3, 0, 3],
        ]
      ),
      expected: `
YES
0
0
`.trim()
    },
    {
      id: 2,
      run: () => circulationNetwork(
        3,
        [
          [1, 2, 1, 3],
          [2, 3, 2, 4],
          [3, 1, 1, 2],
        ]
      ),
      expected: `
YES
2
2
2
`.trim(),
    },
    {
      id: 3,
      run: () => circulationNetwork(
        3,
        [
          [1, 2, 1, 3],
          [2, 3, 2, 4],
          [1, 3, 1, 2],
        ]
      ),
      expected: 'NO',
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

module.exports = circulationNetwork;
