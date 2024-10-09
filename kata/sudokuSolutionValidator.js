/**
 * From CodeWars -- https://www.codewars.com/kata/529bf0e9bdf7657179000008
 *
 * Sudoku is a game played on a 9x9 grid. The goal of the game is to fill
 * all cells of the grid with digits from 1 to 9, so that each column,
 * each row, and each of the nine 3x3 sub-grids (also known as blocks)
 * contain all of the digits from 1 to 9.
 *
 * Write a function that accepts a 2D array representing a Sudoku board,
 * and returns true if it is a valid solution, or false otherwise. The
 * cells of the sudoku board may also contain 0's, which will represent
 * empty cells. Boards containing one or more zeroes are considered to
 * be invalid solutions.
 *
 * The board is always 9 cells by 9 cells, and every cell only contains
 * integers from 0 to 9.
 */
function validSolution(board) {
  const SUM_RESULT = 45;

  const checkSum = (numbers) =>
    numbers.reduce((acc, num) => acc + num, 0) === SUM_RESULT;

  const parseArraysToNumbers = (arrays) =>
    arrays
      .toString()
      .split(",")
      .map((number) => parseInt(number, 10));

  const rotateMatrix = matrix => matrix[0].map((val, index) => matrix.map(row => row[index]).reverse());
  const validateLine = (line) => checkSum(parseArraysToNumbers(line));
  const validateLines = (b) => !board.some((line) => !validateLine(line));
  const areLinesValid = validateLines(board);

  if (!areLinesValid) {
    return false;
  }

  const validateColumns = b => validateLines(rotateMatrix(b));
  const areColumnsValid = validateColumns(board);

  if (!areColumnsValid) {
    return false;
  }

  const validateThird = (third) => checkSum(parseArraysToNumbers(third));
  const validateThirds = (b) => {
    const thirds = [];

    for (let l = 0; l < 9; l = l + 3) {
      for (let c = 0; c < 9; c = c + 3) {
        thirds.push([
          b[l].slice(c, c + 3),
          b[l + 1].slice(c, c + 3),
          b[l + 2].slice(c, c + 3),
        ]);
      }
    }

    return !thirds.some((third) => !validateThird(third));
  };

  const areThirdsValid = validateThirds(board);

  if (!areThirdsValid) {
    return false;
  }

  return true;
}
