/**
 * From CodeWars -- https://www.codewars.com/kata/52ec24228a515e620b0005ef
 *
 * # How many ways can you make the sum of a number?
 *
 * From wikipedia: https://en.wikipedia.org/wiki/Partition_(number_theory)
 *
 * In number theory and combinatorics, a partition of a positive integer n, also called an integer partition, is a way of writing n as a sum of positive integers. Two sums that differ only in the order of their summands are considered the same partition. If order matters, the sum becomes a composition. For example, 4 can be partitioned in five distinct ways:
 *
 * 4
 * 3 + 1
 * 2 + 2
 * 2 + 1 + 1
 * 1 + 1 + 1 + 1
 *
 * # Examples
 *
 * ## Basic
 * sum(1) // 1
 * sum(2) // 2  -> 1+1 , 2
 * sum(3) // 3 -> 1+1+1, 1+2, 3
 * sum(4) // 5 -> 1+1+1+1, 1+1+2, 1+3, 2+2, 4
 * sum(5) // 7 -> 1+1+1+1+1, 1+1+1+2, 1+1+3, 1+2+2, 1+4, 5, 2+3
 *
 * sum(10) // 42
 *
 * ## Explosive
 * sum(50) // 204226
 * sum(80) // 15796476
 * sum(100) // 190569292
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
