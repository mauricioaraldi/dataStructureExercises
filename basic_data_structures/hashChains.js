// Input: First line is number of buckets. Second line is the number of queries.
// After that, one line for each query (add string, del string, find string,
// check i).
// Example input: 5
//                12
//                add world
//                add HellO
//                check 4
//                find World
//                find world
//                del world
//                check 4
//                del HellO
//                add luck
//                add GooD
//                check 2
//                del good
// Example output: HellO world
//                 no
//                 yes
//                 HellO
//                 GooD luck

const PRIME = 1000000007;
const MULTIPLIER = 263;
let ELEMENTS = null;

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const queries = [];

  rl.once('line', line => {
    let bucketsQt = parseInt(line.toString(), 10);

    rl.once('line', line => {
      let n = parseInt(line.toString(), 10);

      rl.on('line', line => {
        const query = line.toString();

        queries.push(query);

        if (!--n) {
          const results = processQueries(queries, bucketsQt);

          results.forEach(result => process.stdout.write(`${result}\n`));

          process.exit();
        }
      });
    });
  });
};

function hashFunc(string, bucketsQt) {
  let hash = 0;

  for (let i = string.length - 1; i >= 0; --i) {
    hash = (hash * MULTIPLIER + string.charCodeAt(i)) % PRIME;
  }

  return hash % bucketsQt;
}

function createQuery(instruction, bucketsQt) {
  const separatorIndex = instruction.indexOf(' ');
  const type = instruction.slice(0, separatorIndex);
  const text = instruction.slice(separatorIndex + 1).trim();
  const hash = type !== 'check' ? hashFunc(text, bucketsQt) : parseInt(text, 10);

  return { type, text, hash };
}

function processQuery(query, bucketsQt) {
  switch (query.type) {
    case 'add':
      if (!ELEMENTS[query.hash]) {
        ELEMENTS[query.hash] = [];
      }

      if (!ELEMENTS[query.hash].includes(query.text)) {
        ELEMENTS[query.hash].unshift(query.text);
      }
      return;

    case 'del':
      if (!ELEMENTS[query.hash]) {
        return;
      }

      const index = ELEMENTS[query.hash].indexOf(query.text);

      if (index > -1) {
        ELEMENTS[query.hash].splice(index, 1);
      }

      return;

    case 'find':
      return ELEMENTS[query.hash] && ELEMENTS[query.hash].includes(query.text) ?
        'yes':
        'no';

    case 'check':
      return ELEMENTS[query.hash] ? ELEMENTS[query.hash].join(' ') : '';

    default:
      return;
  }
}

function processQueries(arr, bucketsQt) {
  ELEMENTS = new Array(bucketsQt);

  return arr.reduce((acc, instruction) => {
    const result = processQuery(
      createQuery(instruction, bucketsQt),
      bucketsQt,
    );

    if (result !== undefined) {
      acc.push(result);
    }

    return acc;
  }, []);
}

readLines();

module.exports = processQueries;
