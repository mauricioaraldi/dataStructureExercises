// Input: First line is number of queries. After that, one line for each query (
// add number name, del number, find number)
// Example input: 12
//                add 911 police
//                add 76213 Mom
//                add 17239 Bob
//                find 76213
//                find 910
//                find 911
//                del 910
//                del 911
//                find 911
//                find 76213
//                add 76213 daddy
//                find 76213
// Example output: Mom
//                 not found
//                 police
//                 not found
//                 Mom
//                 daddy

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const CONTACTS = {};

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const queries = [];

  rl.once('line', line => {
    let n = parseInt(line.toString(), 10);

    rl.on('line', line => {
      const query = line.toString();

      queries.push(query);

      if (!--n) {
        const results = processQueries(queries);

        results.forEach(result => process.stdout.write(`${result}\n`));

        process.exit();
      }
    });
  });
};

function createQuery(instruction) {
  const [type, phone, name] = instruction.split(' ');
  return { type, phone: parseInt(phone, 10), name };
}

function processQuery(query) {
  switch (query.type) {
    case 'add':
      CONTACTS[query.phone] = query;
      return;

    case 'del':
      delete CONTACTS[query.phone];
      return;

    case 'find':
      const contact = CONTACTS[query.phone];
      return contact ? contact.name : 'not found';

    default:
      return;
  }
}

function processQueries(arr) {
  return arr.reduce((acc, instruction) => {
    const result = processQuery(createQuery(instruction));

    if (result) {
      acc.push(result);
    }

    return acc;
  }, []);
}

readLines();

module.exports = processQueries;
