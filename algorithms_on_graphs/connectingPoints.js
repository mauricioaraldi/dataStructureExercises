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
    const points = [];

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

class DisjointSet {
  parent;
  rank;

  constructor(size) {
    this.parent = new Array(size);
    this.rank = new Array(size);
  }

  makeSet(i) {
    this.parent[i] = i;
    this.rank[i] = 0;
  }

  find(i) {
    while (i !== this.parent[i]) {
      i = this.parent[i];
    }

    return i;
  }

  union(i, j) {
    const iId = this.find(i);
    const jId = this.find(j);

    if (iId === jId) {
      return;
    }

    if (this.rank[iId] > this.rank[jId]) {
      this.parent[jId] = iId;
    } else {
      this.parent[iId] = jId;

      if (this.rank[iId] === this.rank[jId]) {
        this.rank[jId]++;
      }
    }
  }
}

function createEdgesAndSets(points) {
  const edges = [];
  const set = new DisjointSet(points.length);
  let n = points.length;

  while (n--) {
    let m = n;

    set.makeSet(n);

    while (--m > -1) {
      const distanceX = Math.abs(points[n][0] - points[m][0]);
      const distanceY = Math.abs(points[n][1] - points[m][1]);

      const powerX = Math.pow(distanceX, 2);
      const powerY = Math.pow(distanceY, 2);

      edges.push({
        origin: n,
        destiny: m,
        weight: Math.sqrt(powerX + powerY),
      });
    }
  }

  return { edges, set };
}

function checkShortestPath(points) {
  const shortestPath = [];
  const { edges, set } = createEdgesAndSets(points);

  edges.sort((a, b) => a.weight - b.weight);

  edges.forEach(edge => {
    if (set.find(edge.origin) !== set.find(edge.destiny)) {
      shortestPath.push(edge);
      set.union(edge.origin, edge.destiny);
    }
  });

  return shortestPath.reduce((acc, edge) => acc + edge.weight, 0);
}

// function test() {
//   const result = checkShortestPath([
//     [0, 0],
//     [0, 2],
//     [1, 1],
//     [3, 0],
//     [3, 2],
//   ]);

//   if (result.toString().includes('7.064495102')) {
//     process.stdout.write('Success');
//   } else {
//     process.stdout.write(`Error: ${result}`);
//   }

//   process.exit();
// }

readLines();
// test();

module.exports = checkShortestPath;
