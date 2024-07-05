const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const clauses = [];

  rl.once('line', line => {
    const [variablesQt, clausesQt] = line.split(' ').map(v => parseInt(v, 10));
    let n = clausesQt;

    if (!n) {
      twoSAT(variablesQt, []).forEach(line => process.stdout.write(`${line}\n`));
      process.exit();
    }

    const readClause = line => {
      const clause = line.toString().split(' ').map(v => parseInt(v, 10));

      clauses.push(clause);

      if (!--n) {
        rl.removeListener('line', readClause);

        twoSAT(variablesQt, clauses).forEach(line => process.stdout.write(`${line}\n`));

        process.exit();
      }
    };

    rl.on('line', readClause);
  });
};

class Graph {
    constructor(vertices) {
        this.vertices = vertices;
        this.adjList = new Map();
        for (let i = 0; i < vertices; i++) {
            this.adjList.set(i, []);
        }
    }

    addEdge(v, w) {
        this.adjList.get(v).push(w);
    }

    getAdjList() {
        return this.adjList;
    }

    reverse() {
        const reversedGraph = new Graph(this.vertices);
        for (let [v, neighbors] of this.adjList.entries()) {
            for (let w of neighbors) {
                reversedGraph.addEdge(w, v);
            }
        }
        return reversedGraph;
    }
}

function kosarajuSCC(graph) {
    const visited = new Array(graph.vertices).fill(false);
    const stack = [];
    const adjList = graph.getAdjList();

    function fillOrder(v) {
        visited[v] = true;
        for (let neighbor of adjList.get(v)) {
            if (!visited[neighbor]) {
                fillOrder(neighbor);
            }
        }
        stack.push(v);
    }

    for (let i = 0; i < graph.vertices; i++) {
        if (!visited[i]) {
            fillOrder(i);
        }
    }

    const reversedGraph = graph.reverse();
    const sccs = [];
    visited.fill(false);

    function dfs(v, component) {
        visited[v] = true;
        component.push(v);
        for (let neighbor of reversedGraph.getAdjList().get(v)) {
            if (!visited[neighbor]) {
                dfs(neighbor, component);
            }
        }
    }

    while (stack.length) {
        const v = stack.pop();
        if (!visited[v]) {
            const component = [];
            dfs(v, component);
            sccs.push(component);
        }
    }

    return sccs;
}

function twoSAT(numVars, clauses) {
  const graph = new Graph(2 * numVars);

  function index(x) {
      if (x > 0) {
          return x - 1;
      } else {
          return numVars - x - 1;
      }
  }

  for (let [a, b] of clauses) {
      graph.addEdge(index(-a), index(b));
      graph.addEdge(index(-b), index(a));
  }

  const sccs = kosarajuSCC(graph);
  const assignment = new Array(numVars).fill(false);
  const componentIndex = new Array(2 * numVars).fill(-1);

  for (let i = 0; i < sccs.length; i++) {
      for (let v of sccs[i]) {
          componentIndex[v] = i;
      }
  }

  for (let i = 0; i < numVars; i++) {
      if (componentIndex[i] === componentIndex[i + numVars]) {
          return ['UNSATISFIABLE'];
      }
      assignment[i] = componentIndex[i] < componentIndex[i + numVars];
  }

  const result = [];

  assignment.forEach((value, index) => result.push(`${value ? '-' : ''}${index + 1}`));

  return [
    'SATISFIABLE',
    result.join(' '),
  ];

  return assignment;
}

readLines();

module.exports = twoSAT;
