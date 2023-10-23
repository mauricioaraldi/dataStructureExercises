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
  constructor(graph) {
    this.graph = graph;
  }

  bfs(graph, parent, source, sink) {
    const visited = new Array(graph.length).fill(false);

    visited[source] = true;

    const queue = [source];

    while (queue.length > 0) {
      const u = queue.shift();

      for (let v = 0; v < graph.length; v++) {
        if (!visited[v] && graph[u][v] > 0) {
          parent[v] = u;
          visited[v] = true;
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
    const graph = this.graph;
    const numVertices = graph.length;
    const parent = new Array(numVertices);

    let maxFlow = 0;

    while (this.bfs(graph, parent, source, sink)) {
      let pathFlow = Number.MAX_VALUE;
      let s = sink;

      while (s !== source) {
        const u = parent[s];

        pathFlow = Math.min(pathFlow, graph[u][s]);
        s = u;
      }

      maxFlow += pathFlow;

      let v = sink;

      while (v !== source) {
        const u = parent[v];

        graph[u][v] -= pathFlow;
        graph[v][u] += pathFlow;
        v = u;
      }
    }

    return maxFlow;
  }
}

function assignCrewsToFlights(flightsQt, crewsQt, distribution) {
  const fordFulkerson = new FordFulkerson(distribution);

  return fordFulkerson.maxFlow(1, flightsQt);
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
