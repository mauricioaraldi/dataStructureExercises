// Input: First line n and m (vertices and edges). Next m lines u and v (both vertices which are connected by
//    a vertice). A vertex cannot be connected to itself.
// Example input: 3 3
//                1 2
//                2 3
//                1 3
// Output: SATISFIABLE or UNSATISFIABLE
// Example output: SATISFIABLE

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
    const [verticesQt, edges] = line.split(' ').map(v => parseInt(v, 10));
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

        const result = hexagonColoring(verticesQt, connections);

        process.stdout.write(result);
        process.exit();
      }
    };

    rl.on('line', readConnection);
  });
};

function createConnections(graph, connections) {
  connections.forEach(([origin, destiny]) => {
    graph[origin].edges.add(destiny);
    graph[destiny].edges.add(origin);
  });
}

function buildGraph(verticesQt) {
  const graph = {};

  for (let i = 1; i <= verticesQt; i++) {
    graph[i] = {
      edges: new Set(),
      color: undefined,
    };
  }

  return graph;
}

// Each neighbor vertex can only have one color
function createClauseSingleColorNeighbors(i, graph, variablesSet) {
  // e.g. i = 2, edges = 1, 3

  const allClauses = [];

  // Must have color
  variablesSet.add(`${i}_1`);
  variablesSet.add(`${i}_2`);
  variablesSet.add(`${i}_3`);

  allClauses.push([`${i}_1`, `${i}_2`, `${i}_3`]);

  // No same color between neighbors
  Array.from(graph[i].edges).forEach(edge => {
    const sortedNeighbors = [i, edge].sort();

    allClauses.push(sortedNeighbors.map(v => `-${v}_1`));
    allClauses.push(sortedNeighbors.map(v => `-${v}_2`));
    allClauses.push(sortedNeighbors.map(v => `-${v}_3`));
  });

  return allClauses;
}

function hexagonColoring(verticesQt, connections) {
  if (!verticesQt || !connections) {
    console.error("Invalid input: No vertices or connections");
    return [];
  }

  for (let i = 0; i < connections.length; i++) {
    const connection = connections[i];

    if (connection[0] === connection[1]) {
      console.error(`Invalid input: Connection between same vertice, link ${i}`);
      return [];
    }
  }

  // Default form assumes Xij = i vertex, j color
  const clausesSet = new Set();

  const graph = buildGraph(verticesQt);
  createConnections(graph, connections);

  const variablesSet = new Set();

  for (let i = 1; i <= verticesQt; i++) {
    const newClauses = createClauseSingleColorNeighbors(i, graph, variablesSet);

    newClauses.forEach(newClause => {
      clausesSet.add(`${newClause.join(' ')}`);
    });
  }

  // Reduce variables to use less numbers
  const parsedClauses = [];
  const variablesMap = {};

  Array.from(variablesSet).forEach((variable, i) => {
    variablesMap[variable] = i + 1;
  });

  let highestVar = 0;

  clausesSet.forEach(clause => {
    const parsedClause = clause.split(' ').map(clauseVariable => {
      const hasMinus = clauseVariable.indexOf('-') > -1;
      const sanitizedVariable = clauseVariable.replace('-', '');
      const variableInt = parseInt(variablesMap[sanitizedVariable]);

      if (variableInt > highestVar) {
        highestVar = variableInt;
      }

      return `${hasMinus ? '-' : ''}${variableInt}`;
    });

    parsedClauses.push(`${parsedClause.join(' ')} 0`);
  });

  const SATInput = [
    `p cnf ${highestVar} ${parsedClauses.length}`,
    ...parsedClauses,
  ].join(' \n');

  let execOutput = undefined;

  try {
    const FILENAME = 'sat_input.txt';

    fs.writeFileSync(FILENAME, SATInput);

    execOutput = childProcess.execSync(
      `minisat "${FILENAME}"`,
      { encoding: 'utf8' }
    );
  } catch (err) {
    // err.status
    // 10 = SATISFIABLE
    // 20 = UNSATISFIABLE
    if (err.status && [10, 20].indexOf(err.status) > -1 && err.stdout) {
      execOutput = err.stdout;
    } else {
      console.error(err);
    }
  }

  if (!execOutput) {
    console.error('No exec output!');
    return;
  }

  const result = execOutput.trim().split('\n').slice(-1)[0];

  return result;
}

function test(outputType, onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => hexagonColoring(
        3,
        [
          [1, 2],
          [2, 3],
          [1, 3],
        ]
      ),
      expected: 'SATISFIABLE',
    },
    {
      id: 2,
      run: () => hexagonColoring(
        4,
        [
          [1, 2],
          [1, 3],
          [1, 4],
          [2, 3],
          [2, 4],
          [3, 4],
        ]
      ),
      expected: 'UNSATISFIABLE',
    },
    {
      id: 3,
      run: () => hexagonColoring(
        300,
        [
          [142, 166],
          [188, 164],
          [207, 123],
          [258, 53],
          [223, 141],
          [289, 239],
          [179, 251],
          [111, 255],
          [145, 100],
          [216, 283],
          [208, 185],
          [227, 278],
          [261, 287],
          [14, 138],
          [213, 35],
          [34, 32],
          [142, 295],
          [93, 107],
          [103, 119],
          [20, 185],
          [140, 211],
          [14, 241],
          [11, 155],
          [232, 216],
          [212, 196],
          [270, 94],
          [58, 258],
          [35, 130],
          [25, 248],
          [18, 118],
          [126, 291],
          [41, 117],
          [152, 150],
          [275, 295],
          [31, 18],
          [198, 117],
          [233, 99],
          [57, 65],
          [242, 8],
          [19, 183],
          [276, 161],
          [201, 11],
          [209, 272],
          [225, 128],
          [93, 50],
          [263, 41],
          [244, 234],
          [299, 197],
          [185, 282],
          [31, 61],
          [93, 274],
          [171, 115],
          [146, 102],
          [105, 151],
          [283, 182],
          [190, 235],
          [261, 146],
          [200, 109],
          [194, 227],
          [45, 92],
          [117, 244],
          [247, 260],
          [202, 265],
          [215, 149],
          [162, 129],
          [282, 261],
          [201, 140],
          [263, 167],
          [90, 168],
          [175, 119],
          [214, 154],
          [38, 45],
          [233, 191],
          [298, 65],
          [26, 225],
          [242, 118],
          [184, 61],
          [84, 255],
          [287, 87],
          [121, 70],
          [278, 14],
          [59, 101],
          [152, 148],
          [23, 82],
          [254, 118],
          [5, 18],
          [283, 212],
          [149, 30],
          [273, 139],
          [123, 258],
          [255, 243],
          [215, 37],
          [103, 36],
          [199, 111],
          [88, 124],
          [74, 101],
          [2, 236],
          [38, 89],
          [284, 212],
          [197, 53],
          [210, 209],
          [244, 286],
          [120, 274],
          [15, 140],
          [300, 29],
          [141, 154],
          [294, 99],
          [172, 271],
          [117, 226],
          [67, 273],
          [122, 125],
          [56, 294],
          [198, 112],
          [168, 57],
          [107, 18],
          [212, 95],
          [21, 88],
          [88, 97],
          [50, 75],
          [287, 59],
          [192, 260],
          [280, 228],
          [10, 214],
          [220, 136],
          [137, 214],
          [89, 163],
          [112, 73],
          [201, 136],
          [41, 118],
          [94, 112],
          [7, 166],
          [132, 25],
          [36, 54],
          [298, 77],
          [90, 205],
          [262, 153],
          [24, 36],
          [184, 124],
          [190, 106],
          [75, 188],
          [255, 146],
          [11, 178],
          [255, 68],
          [156, 31],
          [36, 294],
          [152, 86],
          [18, 232],
          [64, 13],
          [203, 288],
          [262, 81],
          [195, 299],
          [121, 44],
          [16, 268],
          [231, 239],
          [7, 107],
          [114, 251],
          [285, 241],
          [168, 151],
          [15, 224],
          [176, 254],
          [56, 50],
          [184, 4],
          [277, 214],
          [30, 215],
          [286, 268],
          [291, 115],
          [195, 263],
          [180, 248],
          [58, 45],
          [116, 11],
          [201, 50],
          [91, 175],
          [208, 21],
          [74, 80],
          [189, 274],
          [266, 204],
          [88, 180],
          [76, 114],
          [157, 134],
          [97, 107],
          [247, 99],
          [252, 66],
          [175, 273],
          [122, 68],
          [179, 3],
          [7, 211],
          [20, 69],
          [193, 227],
          [270, 108],
          [62, 270],
          [285, 177],
          [52, 240],
          [51, 106],
          [230, 184],
          [16, 52],
          [230, 94],
          [261, 60],
          [286, 217],
          [211, 252],
          [66, 5],
          [30, 221],
          [176, 297],
          [166, 1],
          [295, 184],
          [191, 276],
          [2, 11],
          [182, 175],
          [62, 87],
          [39, 187],
          [268, 189],
          [184, 289],
          [106, 295],
          [112, 98],
          [118, 231],
          [294, 135],
          [278, 226],
          [52, 122],
          [41, 136],
          [197, 9],
          [57, 31],
          [204, 259],
          [288, 86],
          [9, 244],
          [186, 144],
          [218, 171],
          [92, 274],
          [218, 285],
          [193, 221],
          [143, 122],
          [144, 25],
          [223, 276],
          [32, 178],
          [284, 26],
          [202, 291],
          [134, 145],
          [247, 236],
          [198, 213],
          [218, 95],
          [169, 249],
          [257, 227],
          [257, 102],
          [298, 212],
          [16, 134],
          [43, 11],
          [284, 218],
          [63, 87],
          [244, 100],
          [141, 105],
          [41, 144],
          [201, 204],
          [172, 67],
          [208, 45],
          [100, 170],
          [79, 35],
          [46, 163],
          [194, 98],
          [265, 37],
          [239, 246],
          [246, 232],
          [170, 142],
          [300, 151],
          [93, 1],
          [277, 15],
          [7, 158],
          [200, 12],
          [37, 299],
          [54, 222],
          [165, 178],
          [146, 224],
          [239, 270],
          [263, 278],
          [13, 39],
          [299, 175],
          [181, 198],
          [236, 264],
          [198, 148],
          [288, 8],
          [277, 29],
          [183, 238],
          [135, 255],
          [60, 208],
          [240, 295],
          [193, 223],
          [296, 147],
          [217, 204],
          [94, 31],
          [209, 217],
          [182, 273],
          [150, 26],
          [185, 164],
          [268, 49],
          [217, 189],
          [119, 90],
          [45, 142],
          [97, 120],
          [56, 293],
          [109, 63],
          [105, 43],
          [263, 162],
          [226, 84],
          [208, 118],
          [256, 124],
          [200, 286],
          [193, 15],
          [51, 18],
          [187, 298],
          [73, 100],
          [192, 251],
          [109, 5],
          [283, 206],
          [209, 59],
          [135, 7],
          [54, 271],
          [118, 186],
          [97, 54],
          [255, 213],
          [76, 27],
          [137, 219],
          [98, 103],
          [116, 273],
          [77, 3],
          [5, 53],
          [270, 95],
          [167, 172],
          [105, 6],
          [191, 18],
          [135, 173],
          [72, 5],
          [98, 264],
          [38, 170],
          [164, 63],
          [236, 98],
          [122, 206],
          [50, 258],
          [273, 131],
          [188, 40],
          [231, 273],
          [103, 273],
          [74, 86],
          [280, 83],
          [287, 52],
          [173, 284],
          [264, 51],
          [182, 216],
          [89, 280],
          [247, 292],
          [42, 266],
          [141, 251],
          [254, 211],
          [151, 299],
          [144, 184],
          [209, 241],
          [270, 238],
          [130, 152],
          [32, 140],
          [29, 194],
          [261, 33],
          [231, 9],
          [208, 177],
          [8, 284],
          [212, 107],
          [276, 192],
          [198, 275],
          [81, 49],
          [224, 186],
          [32, 200],
          [134, 186],
          [87, 216],
          [150, 51],
          [225, 260],
          [43, 82],
          [12, 48],
          [145, 248],
          [216, 123],
          [248, 256],
          [90, 170],
          [149, 198],
          [81, 24],
          [153, 279],
          [134, 247],
          [35, 70],
          [253, 284],
          [47, 286],
          [246, 21],
          [220, 224],
          [103, 27],
          [139, 34],
          [190, 278],
          [80, 47],
          [30, 208],
          [233, 47],
          [139, 199],
          [259, 16],
          [22, 238],
          [119, 172],
          [50, 276],
          [191, 285],
          [232, 116],
          [124, 93],
          [188, 254],
          [158, 190],
          [178, 242],
          [224, 131],
          [67, 20],
          [206, 288],
          [71, 4],
          [222, 122],
          [46, 64],
          [228, 19],
          [127, 35],
          [34, 284],
          [66, 200],
          [17, 49],
          [208, 244],
          [198, 166],
          [147, 43],
          [195, 275],
          [147, 168],
          [111, 78],
          [169, 40],
          [124, 182],
          [152, 272],
          [16, 164],
          [74, 98],
          [28, 242],
          [16, 161],
          [66, 201],
          [142, 54],
          [235, 279],
          [173, 117],
          [150, 34],
          [297, 154],
          [86, 197],
          [28, 47],
          [66, 240],
          [210, 113],
          [192, 46],
          [93, 213],
          [291, 282],
          [37, 68],
          [17, 101],
          [70, 61],
          [107, 180],
          [108, 148],
          [214, 298],
          [104, 96],
          [213, 202],
          [98, 200],
          [1, 276],
          [92, 132],
          [82, 289],
          [51, 30],
          [79, 72],
          [88, 104],
          [98, 160],
          [256, 9],
          [226, 28],
          [113, 176],
          [205, 106],
          [265, 281],
          [183, 290],
          [2, 43],
          [235, 29],
          [223, 75],
          [117, 175],
          [265, 121],
          [99, 243],
          [55, 134],
          [189, 244],
          [234, 86],
          [117, 66],
          [245, 64],
          [225, 92],
          [242, 116],
          [194, 109],
          [166, 238],
          [24, 111],
          [225, 174],
          [88, 35],
          [298, 134],
          [263, 270],
          [173, 224],
          [157, 239],
          [77, 272],
          [93, 188],
          [104, 133],
          [94, 142],
          [192, 20],
          [21, 75],
          [220, 94],
          [242, 127],
          [90, 7],
          [248, 71],
          [103, 170],
          [278, 240],
          [169, 281],
          [255, 43],
          [169, 254],
          [130, 29],
          [9, 125],
          [104, 194],
          [122, 255],
          [223, 43],
          [254, 153],
          [78, 199],
          [11, 151],
          [91, 176],
          [21, 20],
          [204, 297],
          [144, 167],
          [293, 43],
          [186, 99],
          [27, 258],
          [20, 282],
          [220, 155],
          [266, 214],
          [207, 269],
          [41, 162],
          [133, 154],
          [93, 155],
          [67, 225],
          [102, 93],
          [74, 188],
          [136, 34],
          [151, 103],
          [8, 277],
          [91, 217],
          [24, 213],
          [77, 48],
          [300, 98],
          [23, 148],
          [245, 213],
          [118, 83],
          [102, 126],
          [158, 181],
          [112, 208],
          [208, 288],
          [252, 105],
          [124, 81],
          [288, 124],
          [190, 81],
          [174, 87],
          [152, 252],
          [41, 102],
          [260, 178],
          [221, 293],
          [43, 249],
          [149, 221],
          [250, 225],
          [264, 49],
          [55, 18],
          [216, 94],
          [149, 48],
          [9, 82],
          [288, 142],
          [287, 82],
          [101, 130],
          [61, 284],
          [170, 223],
          [53, 34],
          [75, 118],
          [213, 104],
          [22, 13],
          [49, 35],
          [76, 72],
          [202, 172],
          [257, 283],
          [107, 211],
          [123, 218],
          [10, 166],
          [20, 154],
          [13, 233],
          [17, 27],
          [9, 248],
          [144, 128],
          [126, 284],
          [254, 277],
          [294, 72],
          [61, 95],
          [129, 280],
          [242, 232],
          [75, 189],
          [100, 207],
          [197, 90],
          [233, 172],
          [284, 70],
          [295, 41],
          [298, 235],
          [140, 83],
          [44, 123],
          [177, 6],
          [43, 248],
          [279, 146],
          [38, 115],
          [30, 98],
          [21, 206],
          [161, 113],
          [254, 207],
          [265, 223],
          [130, 85],
          [98, 267],
          [267, 231],
          [147, 75],
          [32, 93],
          [190, 68],
          [78, 268],
          [41, 171],
          [60, 115],
          [95, 39],
          [47, 94],
          [250, 114],
          [105, 290],
          [47, 277],
          [138, 51],
          [286, 88],
          [113, 291],
          [45, 79],
          [284, 163],
          [36, 160],
          [219, 207],
          [61, 202],
          [188, 83],
          [70, 210],
          [260, 214],
          [1, 167],
          [16, 236],
          [109, 192],
          [209, 153],
          [237, 210],
          [102, 170],
          [249, 80],
          [125, 57],
          [187, 273],
          [260, 187],
          [59, 51],
          [252, 84],
          [199, 234],
          [108, 202],
          [182, 127],
          [35, 209],
          [264, 262],
          [205, 59],
          [252, 153],
          [52, 242],
          [153, 295],
          [7, 236],
        ]
      ),
      expected: [],
    },
  ];

  if (onlyTest !== undefined) {
    testCases = [testCases.find(testCase => testCase.id == onlyTest)].filter(test => test);
  }

  if (!testCases.length) {
    console.log('No tests found!');
    process.exit();
  }

  const testCasesPromises = testCases.map(testCase => testCase.run());

  Promise.all(testCasesPromises).then(results => {
    results.forEach((result, i) => {
      const testCase = testCases[i];

      if (outputType === 'RESULT') {
        console.log(result);
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
  });
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

module.exports = hexagonColoring;
