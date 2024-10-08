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

    CUR_EDGE_ID++;

    const curReverseEdgeIdString = CUR_EDGE_ID.toString();

    highestLowerBound = Math.max(highestLowerBound, lowerBound);

    allEdges[curEdgeIdString] = {
      capacity,
      destiny,
      lowerBound,
      origin,
      id: curEdgeIdString,
      originalCapacity: capacity,
      reverse: curReverseEdgeIdString,
      used: false,
    };

    allEdges[curReverseEdgeIdString] = {
      capacity: 0,
      destiny: origin,
      id: curReverseEdgeIdString,
      lowerBound: 0,
      origin: destiny,
      originalCapacity: 0,
      reverse: curEdgeIdString,
      used: false,
    };

    connectionsEdges.push(curEdgeIdString);

    if (!graph[origin]) {
      graph[origin] = {
        edges: new Set(),
        reverseEdges: new Set(),
        demand: 0,
      };
    }

    if (!graph[destiny]) {
      graph[destiny] = {
        edges: new Set(),
        reverseEdges: new Set(),
        demand: 0,
      };
    }

    graph[origin].edges.add(curEdgeIdString);
    graph[destiny].reverseEdges.add(curEdgeIdString);

    graph[destiny].edges.add(curReverseEdgeIdString);
    graph[origin].reverseEdges.add(curReverseEdgeIdString);

    CUR_EDGE_ID++;
  });

  return {
    allEdges,
    connectionsEdges,
    graph,
    lowerBound: highestLowerBound,
  }
}

function bfs(graph, allEdges, source, sink, order) {
  const visited = new Set();
  const queue = [source];

  visited.add(source);

  while (queue.length > 0) {
    const u = queue.shift();
    const edges = Array.from(graph[u].edges);

    for (const edgeId of edges) {
      const edge = allEdges[edgeId];
      const {capacity, destiny} = edge;

      if (!visited.has(destiny) && capacity > 0) {
        order[destiny] = { node: u, edge };
        visited.add(destiny);
        queue.push(destiny);

        if (destiny === sink) {
          return true;
        }
      }
    }
  }

  return false;
}

function maxFlow(graph, allEdges, source, sink) {
  const order = {};
  let flow = 0;

  while (bfs(graph, allEdges, source, sink, order)) {
    let pathFlow = Number.POSITIVE_INFINITY;
    let currentNodeId = sink;

    while (currentNodeId !== source) {
      const { node: orderNode, edge } = order[currentNodeId];

      pathFlow = Math.min(pathFlow, edge.capacity);
      currentNodeId = orderNode;
    }

    flow += pathFlow;

    currentNodeId = sink;

    while (currentNodeId !== source) {
      const { node: orderNode, edge } = order[currentNodeId];

      edge.capacity -= pathFlow;
      allEdges[edge.reverse].capacity += pathFlow;

      currentNodeId = orderNode;
    }
  }

  return flow;
}

function checkDependencies(graph, allEdges) {
  for (let key in graph) {
    const vertex = graph[key];
    const input = Array.from(vertex.reverseEdges).reduce((acc, edgeId) => acc + allEdges[edgeId].lowerBound, 0);
    const output = Array.from(vertex.edges).reduce((acc, edgeId) => acc + allEdges[edgeId].lowerBound, 0);

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
  const sinkId = (verticesQt + 1).toString();
  const sourceVertex = {
    edges: new Set(),
    reverseEdges: new Set(),
    demand: 0,
  };
  const sinkVertex = {
    edges: new Set(),
    reverseEdges: new Set(),
    demand: 0,
  };

  for (let vertexId in graph) {
    const vertex = graph[vertexId];

    if (vertex.demand > 0) {
      const curEdgeIdString = CUR_EDGE_ID.toString();

      CUR_EDGE_ID++;

      const curReverseEdgeIdString = CUR_EDGE_ID.toString();

      allEdges[curEdgeIdString] = {
        capacity: vertex.demand,
        destiny: vertexId,
        id: curEdgeIdString,
        lowerBound: 0,
        origin: '0',
        originalCapacity: vertex.demand,
        used: false,
        reverse: curReverseEdgeIdString,
      };

      allEdges[curReverseEdgeIdString] = {
        capacity: 0,
        destiny: '0',
        id: curReverseEdgeIdString,
        lowerBound: 0,
        origin: vertexId,
        originalCapacity: 0,
        used: false,
        reverse: curEdgeIdString,
      };

      sourceVertex.edges.add(curEdgeIdString);
      vertex.reverseEdges.add(curEdgeIdString);

      sourceVertex.reverseEdges.add(curReverseEdgeIdString);
      vertex.edges.add(curReverseEdgeIdString);

      CUR_EDGE_ID++;
    } else if (vertex.demand < 0) {
      const curEdgeIdString = CUR_EDGE_ID.toString();

      CUR_EDGE_ID++;

      const curReverseEdgeIdString = CUR_EDGE_ID.toString();

      allEdges[curEdgeIdString] = {
        capacity: vertex.demand * -1,
        destiny: sinkId,
        id: curEdgeIdString,
        origin: vertexId,
        originalCapacity: vertex.demand * -1,
        reverse: curReverseEdgeIdString,
        used: false,
      };

      allEdges[curReverseEdgeIdString] = {
        capacity: 0,
        destiny: vertexId,
        id: curEdgeIdString,
        origin: sinkId,
        originalCapacity: 0,
        reverse: curEdgeIdString,
        used: false,
      };

      vertex.edges.add(curEdgeIdString);
      sinkVertex.reverseEdges.add(curEdgeIdString);

      sinkVertex.edges.add(curReverseEdgeIdString);
      vertex.reverseEdges.add(curReverseEdgeIdString);

      CUR_EDGE_ID++;
    }
  }

  graph['0'] = sourceVertex;
  graph[sinkId] = sinkVertex;

  return sinkId;
}

function getResult(allEdges, connectionsEdges) {
  return connectionsEdges.map(connectionEdge => {
    const originalEdge = allEdges[connectionEdge];
    const reverseEdge = allEdges[originalEdge.reverse];
    const flow = reverseEdge.capacity + originalEdge.lowerBound;

    return flow;
  });
}

function hasCirculation(graph, allEdges, sinkId, maxFlow) {
  const totalSupply = Array.from(graph['0'].edges).reduce((acc, edgeId) => {
    const edge = allEdges[edgeId];
    const vertex = graph[edge.destiny];

    return acc + vertex.demand;
  }, 0);

  return totalSupply === maxFlow;
}

function circulationNetwork(verticesQt, connections) {
  const {allEdges, connectionsEdges, graph} = buildGraph(connections);

  checkDependencies(graph, allEdges);

  updateCapacities(allEdges);

  const sinkId = addSourceSink(graph, allEdges, verticesQt);
  const flow = maxFlow(graph, allEdges, '0', sinkId);

  if (!hasCirculation(graph, allEdges, sinkId, flow)) {
    return 'NO';
  }

  const result = getResult(allEdges, connectionsEdges);

  return `YES\n${result.join('\n')}`;
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
