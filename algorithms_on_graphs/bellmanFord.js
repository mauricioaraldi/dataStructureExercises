// Input: First line "n m w", where n is number of vertices, m number of edges and w is weight.
// After this, m lines with "u v", where both are connected vertices of the graph.
// Example input: 4 4
//                1 2 -5
//                4 1 2
//                2 3 2
//                3 1 1
// Output: 1 if there's a negative cycle. 0 otherwise.
// Example output: 1

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const connections = [];

  rl.once('line', line => {
    const [vertices, edges] = line.toString().split(' ').map(v => parseInt(v, 10));
    let n = edges;

    if (edges === 0) {
      process.stdout.write(checkConnectedComponents(vertices, connections).toString());
      process.exit();
    }

    const readConnection = line => {
      const link = line.toString().split(' ').map(v => parseInt(v, 10));

      connections.push(link);

      if (!--n) {
        process.stdout.write(checkNegativeCycles(vertices, connections).toString());
        process.exit();
      }
    };

    rl.on('line', readConnection);
  });
};

function bellmanFord(verticesQt, connections, dist, start = 0) {
  for (let i = 0; i < dist.length; i++) {
    dist[i] = 1001;
  }

  dist[start] = 0;

  for (let i = 1; i < verticesQt; i++) {
    for (let j = 0; j < connections.length; j++) {
      const [u, v, weight] = connections[j];

      if (dist[u] != 1001 && dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight;
      }
    }
  }

  for (let j = 0; j < connections.length; j++) {
    const [u, v, weight] = connections[j];

    if (dist[u] != 1001 && dist[u] + weight < dist[v]) {
      return 1;
    }
  }

  return 0;
}

function checkNegativeCycles(verticesQt, connections) {
  const visited = new Array(verticesQt + 1).fill(false);
  const dist = new Array(verticesQt + 1).fill(1001);

  for (let i = 1; i < verticesQt; i++) {
    if (visited[i] === false) {
      if (bellmanFord(verticesQt, connections, dist, i)) {
        return 1;
      }

      for (let j = 1; j < verticesQt; j++) {
        if (dist[j] !== 1001) {
          visited[j] = true;
        }
      }
    }
  }

  return 0;
}

readLines();
// test();

// function test() {
//   const NUMBER_OF_NODES = 1000;
//   const connections = [];

//   let n = 10000;

//   while (--n) {
//     connections.push([(n % NUMBER_OF_NODES) + 1, n % NUMBER_OF_NODES, 1000]);
//   }

//   connections.push([1, NUMBER_OF_NODES, 1000]);

//   console.log(connections);

//   console.log(checkNegativeCycles(NUMBER_OF_NODES, connections));
//   process.exit();
// }

module.exports = checkNegativeCycles;
