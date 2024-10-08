// Input: First line 'n m' where 'cities roads'. Next m lines contains 'u v c' respectively
//    start of the road, end of the road and capacity. u and v are 1-based indices. Graph is
//    mono directional; 
// Example input: 5 7
//                1 2 2
//                2 5 5
//                1 3 6
//                3 4 2
//                4 5 1
//                3 2 3
//                2 4 1
// Output: Single integer representing maximum flow capacity
// Example output: GAGAGA$

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

        process.stdout.write(evacuation(vertices, connections).toString());

        process.exit();
      }
    };

    rl.on('line', readConnection);
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

    console.log(parent);

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

function evacuation(verticesQt, connections) {
  const graph = buildGraph(connections);

  const r = graph.maxFlow(1, verticesQt);

  console.log(graph.graph);

  return r;
}

function test(onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => evacuation(
        5,
        [
          [1, 2, 2],
          [2, 5, 5],
          [1, 3, 6],
          [3, 4, 2],
          [4, 5, 1],
          [3, 2, 3],
          [2, 4, 1],
        ]
      ),
      expected: 6,
    },

    {
      id: 2,
      run: () => evacuation(
        4,
        [
          [1, 2, 10000],
          [1, 3, 10000],
          [2, 3, 1],
          [2, 4, 10000],
          [3, 4, 10000],
        ]
      ),
      expected: 20000,
    },

    {
      id: 3,
      run: () => evacuation(
        2,
        [
          [1, 1, 10000],
          [1, 2, 1],
          [1, 2, 4],
          [1, 2, 100],
          [2, 1, 900],
        ]
      ),
      expected: 105,
    },

    {
      id: 4,
      run: () => evacuation(
        4,
        [
          [1, 2, 2],
          [2, 3, 2],
          [3, 1, 2],
          [3, 4, 1],
        ]
      ),
      expected: 1,
    },

    {
      id: 5,
      run: () => evacuation(
        5,
        [
          [1, 2, 2],
          [2, 3, 2],
          [4, 5, 1],
        ]
      ),
      expected: 0,
    },

    {
      id: 6,
      run: () => evacuation(
        5,
        [
          [1, 2, 3],
          [2, 3, 3],
          [3, 1, 3],
          [3, 4, 5],
          [4, 5, 3],
        ]
      ),
      expected: 3,
    },

    {
      id: 7,
      run: () => evacuation(
        5,
        [
          [1, 2, 3],
          [2, 2, 4],
          [2, 3, 3],
          [3, 1, 3],
          [3, 3, 2],
          [3, 4, 5],
          [4, 4, 6],
          [4, 5, 3],
        ]
      ),
      expected: 3,
    },

    {
      id: 8,
      run: () => evacuation(
        100,
        [
          [50, 66, 9961],
          [55, 87, 9808],
          [75, 20, 10000],
          [82, 13, 9930],
          [18, 58, 9894],
          [57, 17, 9410],
          [81, 57, 9920],
          [80, 21, 9570],
          [42, 12, 9476],
          [92, 39, 9923],
          [76, 55, 9940],
          [84, 73, 9833],
          [84, 41, 9951],
          [54, 30, 9664],
          [41, 65, 9611],
          [31, 93, 9667],
          [26, 3, 9537],
          [41, 61, 9821],
          [26, 32, 9769],
          [34, 93, 9787],
          [42, 22, 9782],
          [9, 78, 9998],
          [32, 25, 9706],
          [97, 44, 9546],
          [85, 100, 9745],
          [91, 14, 9739],
          [91, 86, 9938],
          [63, 83, 9434],
          [10, 87, 9615],
          [80, 72, 9571],
          [75, 8, 9414],
          [31, 24, 9870],
          [62, 90, 9680],
          [89, 69, 9867],
          [53, 96, 9598],
          [30, 23, 9543],
          [35, 42, 9630],
          [66, 20, 9541],
          [88, 66, 9429],
          [29, 32, 9815],
          [41, 55, 9906],
          [24, 1, 9744],
          [38, 2, 9730],
          [33, 84, 9739],
          [57, 75, 9867],
          [40, 38, 9718],
          [31, 10, 9962],
          [80, 55, 9586],
          [33, 25, 9782],
          [69, 95, 9878],
          [47, 60, 9944],
          [64, 74, 9597],
          [94, 31, 9735],
          [70, 84, 9924],
          [48, 89, 9577],
          [37, 87, 9666],
          [20, 64, 9784],
          [84, 3, 9749],
          [47, 77, 9740],
          [50, 37, 9638],
          [80, 17, 9394],
          [23, 29, 9872],
          [12, 18, 9626],
          [9, 40, 9608],
          [4, 65, 9416],
          [28, 16, 9839],
          [20, 61, 9546],
          [92, 9, 9688],
          [3, 99, 9828],
          [17, 10, 9468],
          [26, 6, 9660],
          [63, 62, 9985],
          [26, 12, 9981],
          [72, 16, 9989],
          [11, 58, 9471],
          [54, 59, 9702],
          [84, 37, 9620],
          [1, 49, 9537],
          [27, 33, 9504],
          [40, 100, 9511],
          [12, 72, 9866],
          [69, 37, 9852],
          [87, 65, 9452],
          [24, 54, 9742],
          [71, 98, 9641],
          [44, 67, 9469],
          [22, 30, 9977],
          [77, 24, 9391],
          [61, 46, 9657],
          [44, 68, 9753],
          [20, 30, 9446],
          [70, 7, 9995],
          [90, 68, 9594],
          [29, 67, 9775],
          [19, 81, 9494],
          [94, 32, 9927],
          [39, 16, 9918],
          [64, 72, 9683],
          [41, 48, 9858],
          [82, 49, 9436],
          [69, 29, 9826],
          [7, 78, 9528],
          [54, 89, 9491],
          [29, 70, 9699],
          [6, 74, 9405],
          [1, 76, 9553],
          [7, 54, 9535],
          [50, 99, 9875],
          [36, 40, 9821],
          [44, 56, 9663],
          [83, 85, 9878],
          [23, 47, 9911],
          [37, 6, 9857],
          [72, 6, 9734],
          [31, 8, 9650],
          [63, 69, 9858],
          [80, 91, 9473],
          [3, 48, 9921],
          [30, 45, 9561],
          [77, 92, 9615],
          [97, 12, 9678],
          [84, 10, 9591],
          [41, 17, 9793],
          [55, 8, 9563],
          [66, 31, 9416],
          [34, 29, 9953],
          [95, 40, 9736],
          [82, 31, 9845],
          [75, 27, 9573],
          [13, 89, 9623],
          [19, 63, 9502],
          [60, 87, 9693],
          [84, 79, 9960],
          [39, 17, 9595],
          [39, 20, 9571],
          [52, 50, 9485],
          [24, 90, 9569],
          [89, 79, 9944],
          [48, 24, 9620],
          [42, 32, 9721],
          [41, 87, 9831],
          [97, 31, 9676],
          [8, 1, 9942],
          [81, 69, 9513],
          [85, 1, 9540],
          [86, 89, 9471],
          [46, 11, 9964],
          [40, 16, 9905],
          [29, 55, 9413],
          [96, 42, 9578],
          [34, 18, 9646],
          [75, 6, 9940],
          [19, 6, 9516],
          [78, 83, 9449],
          [61, 22, 9974],
          [45, 85, 9704],
          [71, 66, 9560],
          [81, 76, 9612],
          [100, 46, 9938],
          [28, 45, 9933],
          [40, 55, 9422],
          [5, 84, 9811],
          [45, 32, 9571],
          [20, 46, 9820],
          [67, 57, 9985],
          [79, 56, 9496],
          [77, 28, 9405],
          [53, 26, 9969],
          [61, 79, 9557],
          [27, 36, 9978],
          [82, 20, 9724],
          [52, 37, 9579],
          [10, 46, 9766],
          [80, 28, 9651],
          [65, 80, 9916],
          [70, 52, 9554],
          [70, 86, 9578],
          [47, 88, 9946],
          [42, 7, 9432],
          [1, 88, 9529],
          [99, 91, 9760],
          [100, 29, 9604],
          [22, 94, 9837],
          [41, 73, 10000],
          [7, 21, 9986],
          [68, 48, 9583],
          [95, 87, 9799],
          [86, 34, 9686],
          [93, 76, 9405],
          [56, 85, 9572],
          [91, 26, 9757],
          [32, 57, 9420],
          [45, 8, 9967],
          [3, 11, 9423],
          [100, 9, 9811],
          [2, 42, 9799],
          [59, 39, 9778],
          [84, 43, 9532],
          [77, 70, 9568],
          [62, 27, 9551],
          [89, 88, 9404],
          [82, 48, 9900],
          [52, 86, 9715],
          [61, 84, 9758],
          [48, 23, 9988],
          [84, 17, 9757],
          [27, 63, 9752],
          [29, 59, 9442],
          [99, 42, 9492],
          [30, 16, 9745],
          [84, 96, 9958],
          [19, 11, 9484],
          [100, 88, 9727],
          [74, 82, 9635],
          [90, 97, 9439],
          [75, 18, 9949],
          [20, 68, 9763],
          [98, 84, 9861],
          [45, 54, 9696],
          [82, 75, 9700],
          [33, 79, 9635],
          [55, 25, 9573],
          [44, 80, 9489],
          [73, 58, 9978],
          [42, 84, 9829],
          [11, 5, 9747],
          [76, 54, 9426],
          [91, 18, 9743],
          [2, 15, 9400],
          [64, 26, 9561],
          [90, 49, 9507],
          [39, 56, 9958],
          [80, 84, 9753],
          [99, 100, 9842],
          [93, 38, 9750],
          [32, 52, 9802],
          [6, 15, 9499],
          [2, 88, 9462],
          [54, 86, 9532],
          [19, 57, 9635],
          [42, 53, 9548],
          [49, 23, 9404],
          [13, 9, 9902],
          [20, 34, 9884],
          [70, 47, 9935],
          [87, 82, 9854],
          [94, 46, 9712],
          [74, 70, 9992],
          [96, 31, 9558],
          [45, 47, 9545],
          [33, 18, 9947],
          [29, 12, 9817],
          [98, 20, 9881],
          [93, 71, 9944],
          [66, 98, 9478],
          [90, 74, 9634],
          [90, 57, 9618],
          [34, 69, 9863],
          [23, 72, 9494],
          [25, 85, 9455],
          [8, 80, 9786],
          [83, 59, 9481],
          [96, 9, 9982],
          [27, 68, 9643],
          [30, 40, 9508],
          [69, 13, 9844],
          [33, 8, 9985],
          [28, 7, 9627],
          [97, 34, 9642],
          [38, 72, 9826],
          [96, 40, 9994],
          [43, 18, 9499],
          [80, 77, 9970],
          [73, 50, 9530],
          [42, 23, 9459],
          [84, 100, 9495],
          [30, 93, 9572],
          [19, 17, 9665],
          [12, 11, 9399],
          [81, 5, 9789],
          [71, 23, 9796],
          [78, 77, 9914],
          [39, 80, 9491],
          [85, 75, 9802],
          [15, 59, 9749],
          [88, 73, 9526],
          [44, 52, 9857],
          [44, 61, 9407],
          [90, 5, 9656],
          [25, 2, 9623],
          [34, 56, 9543],
          [85, 4, 9899],
          [41, 91, 9780],
          [76, 31, 9924],
          [27, 53, 9601],
          [88, 19, 9416],
          [5, 4, 9554],
          [4, 61, 9465],
          [76, 70, 9581],
          [71, 43, 9532],
          [53, 76, 9701],
          [79, 80, 9401],
          [59, 52, 9754],
          [85, 81, 9842],
          [46, 73, 9986],
          [60, 16, 9995],
          [63, 54, 9887],
          [25, 70, 9520],
          [77, 83, 9739],
          [95, 54, 9673],
          [4, 27, 9790],
          [79, 36, 9671],
          [98, 17, 9630],
          [28, 96, 9665],
          [3, 34, 9747],
          [45, 80, 9836],
          [63, 55, 9888],
          [1, 73, 9707],
          [10, 82, 9772],
          [24, 95, 9933],
          [2, 68, 9891],
          [29, 26, 9398],
          [67, 14, 9900],
          [41, 77, 9424],
          [80, 24, 9909],
          [23, 13, 9416],
          [60, 48, 9703],
          [55, 33, 9842],
          [17, 83, 9574],
          [85, 72, 9813],
          [52, 36, 9782],
          [25, 18, 9623],
          [75, 30, 9959],
          [63, 15, 9606],
          [15, 44, 9894],
          [20, 100, 9556],
          [52, 39, 9615],
          [6, 20, 9616],
          [3, 98, 9793],
          [23, 43, 9728],
          [17, 42, 9496],
          [4, 42, 9704],
          [94, 26, 9896],
          [28, 61, 9523],
          [86, 62, 9470],
          [8, 10, 9805],
          [71, 83, 9902],
          [70, 82, 9820],
          [81, 100, 9852],
          [33, 93, 9470],
          [1, 95, 9517],
          [40, 70, 9695],
          [10, 95, 9919],
          [96, 59, 9992],
          [13, 93, 9670],
          [31, 69, 9690],
          [71, 18, 9710],
          [1, 50, 9493],
          [69, 67, 9918],
          [99, 60, 9488],
          [100, 28, 9614],
          [6, 77, 9847],
          [80, 74, 9511],
          [29, 21, 9849],
          [51, 83, 9900],
          [61, 56, 9823],
          [70, 34, 9731],
          [63, 9, 9985],
          [90, 99, 9878],
          [48, 70, 9443],
          [11, 100, 9842],
          [66, 92, 9631],
          [79, 18, 9863],
          [28, 52, 9589],
          [57, 54, 9716],
          [98, 7, 9837],
          [49, 28, 9920],
          [67, 34, 9878],
          [15, 58, 9457],
          [29, 83, 9648],
          [91, 60, 9630],
          [53, 69, 9565],
          [42, 71, 9614],
          [26, 18, 9397],
          [78, 56, 9638],
          [55, 3, 9593],
          [14, 34, 9836],
          [73, 2, 9583],
          [53, 21, 9601],
          [53, 60, 9836],
          [72, 73, 9420],
          [21, 54, 9843],
          [46, 41, 9973],
          [5, 22, 9494],
          [61, 99, 9390],
          [49, 92, 9986],
          [89, 95, 9956],
          [19, 43, 9417],
          [57, 26, 9654],
          [4, 23, 9573],
        ]
      ),
      expected: 57336,
    },

    {
      id: 9,
      run: () => evacuation(
        5,
        [
          [1, 2, 1],
          [2, 3, 1],
          [3, 4, 2],
          [4, 2, 2],
          [4, 5, 1],
        ]
      ),
      expected: 1,
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

module.exports = evacuation;
