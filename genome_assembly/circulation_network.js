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
  let curEdgeId = 0;

  connections.forEach(([originInt, destinyInt, lowerBound, capacity]) => {
    const origin = originInt.toString();
    const destiny = destinyInt.toString();
    const curEdgeIdString = curEdgeId.toString();

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
      };
    }

    if (!graph[destiny]) {
      graph[destiny] = {
        edges: new Map(),
        reverseEdges: new Map(),
      };
    }

    if (!graph[origin].edges[destiny]) {
      graph[origin].edges.set(destiny, new Set());
      graph[destiny].reverseEdges.set(origin, new Set());
    }

    graph[origin].edges.get(destiny).add(curEdgeIdString);
    graph[destiny].reverseEdges.get(origin).add(curEdgeIdString);

    curEdgeId++;
  });

  return {
    allEdges,
    connectionsEdges,
    graph,
    lowerBound: highestLowerBound,
  }
}

function checkFlow(verticesQt, graph, lowerBound, allEdges) {
  const startingNode = '1';
  const stack = [startingNode];
  const visited = new Set();

  while (stack.length) { 
    const curNode = stack.pop();
    let hasFlow = false;

    visited.add(curNode);

    const destinies = Array.from(graph[curNode].edges.keys());

    while (destinies.length) {
      const destiny = destinies.pop();

      if (destiny === startingNode && destinies.length > 1) {
        destinies.unshift(startingNode);
      }

      if (destiny !== startingNode && visited.has(destiny)) {
        continue;
      }

      const destinyEdges = Array.from(graph[curNode].edges.get(destiny));

      for (let i = 0; i < destinyEdges.length; i++) {
        const curEdge = allEdges[destinyEdges[i]];

        if (curEdge.lowerBound <= lowerBound && lowerBound <= curEdge.capacity) {
          hasFlow = true;
          curEdge.used = true;
          stack.push(curEdge.destiny);
          break;
        }
      }

      if (hasFlow) {
        break;
      }
    }
  }

  return visited.size === verticesQt;
}

function circulationNetwork(verticesQt, connections) {
  const {allEdges, connectionsEdges, lowerBound, graph} = buildGraph(connections);
  const hasFlow = checkFlow(verticesQt, graph, lowerBound, allEdges);

  if (!hasFlow) {
    return 'NO';
  }

  const result = connectionsEdges.map(edgeId => {
    const edge = allEdges[edgeId];

    return edge.used ? lowerBound.toString() : '0';
  });

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
