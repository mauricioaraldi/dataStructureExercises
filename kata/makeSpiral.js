/**
 * From CodeWars -- https://www.codewars.com/kata/534e01fbbb17187c7e0000c6
 *
 * Your task, is to create a NxN spiral with a given size. For example, spiral
 * with size 5 should look like this:
 *
 * 00000
 * ....0
 * 000.0
 * 0...0
 * 00000
 *
 * and with the size 10:
 *
 * 0000000000
 * .........0
 * 00000000.0
 * 0......0.0
 * 0.0000.0.0
 * 0.0..0.0.0
 * 0.0....0.0
 * 0.000000.0
 * 0........0
 * 0000000000
 *
 * Return value should contain array of arrays, of 0 and 1, with the first
 * row being composed of 1s. For example for given size 5 result should be:
 *
 * [[1,1,1,1,1],[0,0,0,0,1],[1,1,1,0,1],[1,0,0,0,1],[1,1,1,1,1]]
 *
 * Because of the edge-cases for tiny spirals, the size will be at least 5.
 *
 * General rule-of-a-thumb is, that the snake made with '1' cannot touch to itself.
 */
function sum(n) {
  const SIGNAL_PLUS = Symbol('+');
  const SIGNAL_MINUS = Symbol('-');
  const partitions = [1, 1];
  let currentSignal = SIGNAL_PLUS;
  
  function getInterval(iN) {
    return iN % 2 === 1 ? iN : iN / 2;
  }

  function getPartition(partitionN) {
    let intervalIndex = 1;
    let interval = 1;
    let result = partitions[partitionN - interval];

    currentSignal = SIGNAL_PLUS;

    while(true) {
      interval += getInterval(++intervalIndex);

      const partitionIndex = partitionN - interval;

      if (partitionIndex < 0) {
        break;
      }

      if (intervalIndex % 2 === 1) {
        currentSignal = currentSignal === SIGNAL_PLUS ? SIGNAL_MINUS : SIGNAL_PLUS;
      }

      if (currentSignal === SIGNAL_PLUS) {
        result += partitions[partitionIndex];
      } else {
        result -= partitions[partitionIndex];
      }
    }

    return result;
  }

  for (let currentN = 2; currentN <= n; currentN++) {
    partitions[currentN] = getPartition(currentN);
  }

  return partitions[n];
}
