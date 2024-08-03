// Input: First line n (vertices) and m (edges). Next m lines "u v" (directed edge connection). There are no cycles.
// There may be self loops (u u connection) or parallel edges (several copies of same edge). Guaranteed strongly connected.
// Example input: 3 4
//                2 3
//                2 2
//                1 2
//                3 1
// Output: If no Eulerian Cycle, 0. Otherwise, 1 in first line and a sequence of V1 V2 V3... in second line (Eulerian Path).
// Each edge should appear exactly once. Accepted any possible cycle.
// Example output: 1
//                 1 2 2 3

let VERBOSE = false;

const fs = require('fs');
const childProcess = require('child_process');
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

    if (!n) {
      process.stdout.write(eulerianCycle(vertices, connections).toString());
      process.exit();
    }

    const readConnection = line => {
      const connection = line.toString().split(' ').map(v => parseInt(v, 10) - 1);

      connections.push(connection);

      if (!--n) {
        rl.removeListener('line', readConnection);

        process.stdout.write(eulerianCycle(vertices, connections).toString());

        process.exit();
      }
    };

    rl.on('line', readConnection);
  });
};

function buildGraph(connections) {
  const graph = {};
  const allEdges = {};
  let curEdgeId = 0;

  connections.forEach(([originInt, destinyInt]) => {
    const origin = originInt.toString();
    const destiny = destinyInt.toString();

    allEdges[curEdgeId] = {
      destiny: destinyInt,
      id: curEdgeId,
      origin: originInt,
    };

    if (!graph[origin]) {
      graph[origin] = {
        edges: new Set(),
        reverseEdges: new Set(),
        visited: false,
      };
    }

    if (!graph[destiny]) {
      graph[destiny] = {
        edges: new Set(),
        reverseEdges: new Set(),
        visited: false,
      };
    }

    graph[origin].edges.push(curEdgeId);
    graph[destiny].reverseEdges.push(curEdgeId);

    curEdgeId++;
  });

  return {
    allEdges,
    graph,
  }
}

function countEvenOdd(graph) {
  const oddVertices = [];
  const evenVertices = [];

  for (let key in graph) {
    const vertex = graph[key];
    const totalEdges = vertex.edges.size + vertex.reverseEdges.size;

    if (totalEdges % 2 === 0) {
      evenVertices.push(key);
    } else {
      oddVertices.push(key);
    }
  }

  return {
    evenVertices,
    oddVertices,
  };
}

function dfs(graph, allEdges, startingPoint) {
  const stack = [startingPoint];
  const edgesOrder = [];
  const verticesOrder = [];

  while(stack.length) {
    const vertexId = stack.pop();
    const vertex = graph[vertexId];

    if (vertex.visited) {
      continue;
    }

    vertex.visited = true;
    verticesOrder.push(vertexId);

    if (vertex.edges.size) {
      Array.from(vertex.edges).forEach(edgeId => {
        const edge = allEdges[edgeId];

        if (!graph[edge.destiny].visited) {
          edgesOrder.push(edge.id);
          stack.push(edge.destiny);
        }
      });
    }
  }

  return {
    edgesOrder,
    verticesOrder,
  };
}

function explore(graph, allEdges, startVertex) {
  const path = [];
  const idsEdgesLeft = new Set();
  let curVertexId = startVertex;

  for (let key in allEdges) {
    idsEdgesLeft.add(key);
  }

  while (idsEdgesLeft.size) {
    path.push(curVertexId);

    const {edgesOrder, verticesOrder} = dfs(graph, allEdges, curVertexId);

    console.log(edgesOrder);

    const curVertexEdges = graph[curVertexId].edges;
    let edgeToDelete = null;

    if (curVertexEdges.size === 1) {
      idEdgeToDelete = curVertexEdges[0];
    } else {
      idEdgeToDelete = curVertexEdges.filter(edge => edgesOrder.indexOf(edge.id) === -1)[0];
    }

    if (curVertexId === allEdges[idEdgeToDelete].origin) {
      curVertexId = allEdges[idEdgeToDelete].destiny;
    } else {
      curVertexId = allEdges[idEdgeToDelete].origin;
    }

    idsEdgesLeft.remove(idEdgeToDelete);

    if (idsEdgesLeft.size === 0) {
      path.push(curVertexId);
    }

    graph[allEdges[idEdgeToDelete].origin].edges.remove(idEdgeToDelete);
  }

  return path;
}

function eulerianCycle(verticesQt, connections) {
  const {allEdges, graph} = buildGraph(connections);
  const {evenVertices, oddVertices} = countEvenOdd(graph);
  const isCircuit = !oddVertices.length.length;

  if (!isCircuit && oddRankVertices.length !== 2) {
    throw new Error('A path needs to contain two odd vertices');
  }

  let startVertex = null;

  if (isCircuit) {
    // If circuit, start vertex doesn't matter
    startVertex = evenVertices[0];
  } else {
    // If path, start in one of the two odd vertices
    startVertex = oddVertices[0];
  }

  const eulerianPath = explore(graph, allEdges, startVertex);

  return eulerianPath;
}

function test(outputType, onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => eulerianCycle(
        3,
        [
          [2, 3],
          [2, 2],
          [1, 2],
          [3, 1],
        ]
      ),
      expected: `
1
1 2 2 3
`.trim()
    },
    {
      id: 2,
      run: () => eulerianCycle(
        3,
        [
          [1, 3],
          [2, 3],
          [1, 2],
          [3, 1],
        ]
      ),
      expected: `0`.trim()
    },
    {
      id: 3,
      run: () => eulerianCycle(
        4,
        [
          [1, 2],
          [2, 1],
          [1, 4],
          [4, 1],
          [2, 4],
          [3, 2],
          [4, 3],
        ]
      ),
      expected: `
1
4 3 2 4 1 2 1
`.trim()
    },
    {
      id: 4,
      run: () => eulerianCycle(
        4,
        [
          [2, 3],
          [3, 4],
          [1, 4],
          [3, 1],
          [4, 2],
          [2, 3],
          [4, 2],
        ]
      ),
      expected: `
1
2 3 4 2 3 1 4
`.trim()
    },
  ];

  if (onlyTest !== undefined) {
    testCases = [testCases.find(testCase => testCase.id == onlyTest)].filter(test => test);
  }

  if (!testCases.length) {
    console.log('No tests found!');
    process.exit();
  }

  testCases.forEach(testCase => {
    const result = testCase.run();

    if (outputType === 'RESULT') {
      process.stdout.write(result);
    } else if (outputType === 'TEST') {
      if (result === testCase.expected) {
        console.log(`[V] Passed test ${testCase.id}`);
      } else {
        console.log(`[X] Failed test ${testCase.id}`);
        console.log(`Expected: ${testCase.expected}`);
        console.log(`Got: ${result}`);
      }
    }
  });

  process.exit();
}

if (process && process.argv && process.argv.includes('-t')) {
  const onlyOutput = process.argv.includes('-o');
  const silent = process.argv.includes('-s');
  const indexOfT = process.argv.indexOf('-t');
  const testToRun = process.argv[indexOfT + 1];
  let outputType = 'TEST';

  if (onlyOutput) {
    outputType = 'RESULT';
  }

  if (silent) {
    outputType = 'SILENT';
  }

  VERBOSE = process.argv.includes('-v');

  return test(outputType, testToRun);
}

readLines();

module.exports = independentSet;
