// Input: First line "n" number of points. Next lines define where each of these
// points are in an "x y" plane. The length of a segment with endpoints (x1,y1)
// and (x2,y2) is equal to √︀(x1 − x2)2 + (y1 − y2)2.
// Example input: 5
//                0 0
//                0 2
//                1 1
//                3 0
//                3 2
// Output: Output the minimum total length of segments. Output your answer
// with at least seven digits after the decimal point.
// Example output: 7.064495102

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const connections = [];

  rl.once('line', line => {
    const n = parseInt(line.toString(), 10);
    const points = new Array(n);

    rl.on('line', line => {
      let coordinates = line.toString().split(' ').map(v => parseInt(v, 10));

      points.push(coordinates);

      if (points.length === n) {
        process.stdout.write(checkShortestPath(points).toString());
        process.exit();
      }
    });
  });
};

function createEdges(points) {
  const graph = {};
  let n = points.length;

  while (n--) {
    // if (!graph[n]) {
      graph[n] = {
        x: points[n][0],
        y: points[n][1],
        edges: {},
      };
    // }

    let m = n;

    while (--m > -1) {
      // if (!graph[m]) {
      //   graph[m] = {
      //     x: points[m][0],
      //     y: points[m][1],
      //     edges: {},
      //   };
      // }

      const distanceX = Math.abs(points[n][0] - points[m][0]);
      const distanceY = Math.abs(points[n][1] - points[m][1]);

      graph[n].edges[m] = Math.sqrt((distanceX * 2) + (distanceY * 2));
      // graph[m].edges[n] = graph[n].edges[m];
    }
  }

  return graph;
}

function checkShortestPath(points) {
  const graph = createEdges(points);
  const edges = [];

  // Object.entries(graph).forEach(([nodeKey, nodeValue]) => {
  //   Object.entries(nodeValue.edges).forEach(([edgeKey, edgeWeight]) => {
  //     edges.push([nodeKey, edgeKey]);
  //   });
  // });



  console.log(graph);

  // Implement algorithm
  return 0;
}

function test() {
  const result = checkShortestPath([
    [0, 0],
    [0, 2],
    [1, 1],
    [3, 0],
    [3, 2],
  ]);

  if (result === 7.064495102) {
    process.stdout.write('Success');
  } else {
    process.stdout.write(`Error: ${result}`);
  }

  process.exit();
}

// readLines();
test();

module.exports = checkShortestPath;
