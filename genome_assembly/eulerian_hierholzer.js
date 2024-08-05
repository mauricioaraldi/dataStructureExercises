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
      const connection = line.toString().split(' ').map(v => parseInt(v, 10));

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
    const curEdgeIdString = curEdgeId.toString();

    allEdges[curEdgeIdString] = {
      destiny: destiny,
      id: curEdgeIdString,
      origin: origin,
    };

    if (!graph[origin]) {
      graph[origin] = {
        edges: new Set(),
        reverseEdges: new Set(),
      };
    }

    if (!graph[destiny]) {
      graph[destiny] = {
        edges: new Set(),
        reverseEdges: new Set(),
      };
    }

    graph[origin].edges.add(curEdgeIdString);
    graph[destiny].reverseEdges.add(curEdgeIdString);

    curEdgeId++;
  });

  return {
    allEdges,
    graph,
  }
}

function isGraphBalanced(graph) {
  for (let key in graph) {
    const vertex = graph[key];

    if (vertex.edges.size !== vertex.reverseEdges.size) {
      return false;
    }
  }

  return true;
}

function hierholzer(graph, allEdges) {
  const stack = ['1'];
  const path = [];
  const usedEdges = new Set();

  while (stack.length) {
    const curVertexId = stack[stack.length - 1];
    const vertexUnusedEdges = Array.from(graph[curVertexId].edges).filter(e => !usedEdges.has(e));

    if (vertexUnusedEdges.length) {
      const nextEdgeId = vertexUnusedEdges[vertexUnusedEdges.length - 1];

      stack.push(allEdges[nextEdgeId].destiny);
      usedEdges.add(nextEdgeId);
    } else {
      path.push(stack.pop());
    }
  }

  if (path[path.length - 1] === path[0]) {
    path.shift();
  }

  return path.reverse();
}

function eulerianCycle(verticesQt, connections) {
  const {allEdges, graph} = buildGraph(connections);

  if (!isGraphBalanced(graph)) {
    return '0';
  }

  const eulerianPath = hierholzer(graph, allEdges);

  return [
    1,
    eulerianPath.join(' ')
  ].join('\n');
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

module.exports = eulerianCycle;
