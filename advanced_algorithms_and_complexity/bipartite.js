// Input: First line 'n m' where 'flights crews'. Next n lines contains m binary integers.
// If the j integer in the i line is 1, it means crew j can work on flight i. 
// Example input: 3 4
//                1 1 0 1
//                0 1 0 0
//                0 0 0 0
// Output: n (flights) integers: the 1-based index of the crew working on that flight. No
// crew means -1. Must be pairwise different (except -1). When multiple choices, output any
// Example output: 1 2 -1

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = (asXML) => {
  process.stdin.setEncoding('utf8');

  const distributions = [];

  rl.once('line', line => {
    const [flights, crews] = line.split(' ').map(v => parseInt(v, 10));
    let n = flights;

    if (flights === 0) {
      process.stdout.write('');
      process.exit();
    }

    const readDistribution = line => {
      const distribution = line.toString().split(' ').map(v => parseInt(v, 10));

      distributions.push(distribution);

      if (!--n) {
        rl.removeListener('line', readDistribution);

        process.stdout.write(assignCrewsToFlights(flights, crews, distributions).toString());

        process.exit();
      }
    };

    rl.on('line', readDistribution);
  });
};

class FordFulkerson {
  constructor() {
    this.graph = new Map();
  }

  addEdge(u, v, capacity) {
    if (!this.graph.has(u)) {
      this.graph.set(u, []);
    }

    if (!this.graph.has(v)) {
      this.graph.set(v, []);
    }

    this.graph.get(u).push({ node: v, capacity, reverse: null });
    this.graph.get(v).push({ node: u, capacity: 0, reverse: null });
    this.graph.get(u)[this.graph.get(u).length - 1].reverse = this.graph.get(v)[this.graph.get(v).length - 1];
    this.graph.get(v)[this.graph.get(v).length - 1].reverse = this.graph.get(u)[this.graph.get(u).length - 1];
  }

  bfs(source, sink, parent) {
    const visited = new Set();
    const queue = [source];

    visited.add(source);

    while (queue.length > 0) {
      const u = queue.shift();

      for (const edge of this.graph.get(u)) {
        const v = edge.node;
        const capacity = edge.capacity;

        if (!visited.has(v) && capacity > 0) {
          parent[v] = { node: u, edge: edge };
          visited.add(v);
          queue.push(v);

          if (v === sink) {
            return true;
          }
        }
      }
    }

    return false;
  }

  maxFlow(source, sink) {
    const parent = {};
    let maxFlow = 0;

    while (this.bfs(source, sink, parent)) {
      let pathFlow = Number.POSITIVE_INFINITY;
      let currentNode = sink;

      while (currentNode !== source) {
        const { edge } = parent[currentNode];

        pathFlow = Math.min(pathFlow, edge.capacity);
        currentNode = parent[currentNode].node;
      }

      maxFlow += pathFlow;

      currentNode = sink;

      while (currentNode !== source) {
        const { edge } = parent[currentNode];

        edge.capacity -= pathFlow;
        edge.reverse.capacity += pathFlow;

        currentNode = parent[currentNode].node;
      }
    }

    return maxFlow;
  }
}

function buildGraph(connections) {
  const fordFulkerson = new FordFulkerson();

  connections.forEach(connection => {
    fordFulkerson.addEdge(connection[0], connection[1], connection[2]);
  });

  return fordFulkerson;
}

function assignCrewsToFlights(flightsQt, crewsQt, distribution) {
  console.log(flightsQt, crewsQt, distribution);
  // const graph = buildGraph(connections);

  // return graph.maxFlow(1, verticesQt);
  return [];
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => assignCrewsToFlights(
        3,
        4,
        [
          [1, 1, 0, 1],
          [0, 1, 0, 0],
          [0, 0, 0, 0],
        ]
      ),
      expected: [1, 2, -1],
    },

    {
      id: 2,
      run: () => assignCrewsToFlights(
        2,
        2,
        [
          [1, 1],
          [1, 0],
        ]
      ),
      expected: [2, 1],
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

module.exports = assignCrewsToFlights;
