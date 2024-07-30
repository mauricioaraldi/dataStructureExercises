// Input: A square piece is defined by the four colors of its four edges, in the format (up,left,down,right).
// “valid placement” is defined as a placement of n2 square pieces onto an n-by-n grid such 
// that all “outer edges” (i.e., edges that border no other square pieces), and only these edges, 
// are black, and for all edges that touch an edge in another square piece, the two touching 
// edges are the same color. All of the square pieces are given in the correct orientation.
// Each line of the input contains a single square piece.
// Example input: (yellow,black,black,blue)
//                (blue,blue,black,yellow)
//                (orange,yellow,black,black)
//                (red,black,yellow,green)
//                (orange,green,blue,blue)
//                (green,blue,orange,black)
//                (black,black,red,red)
//                (black,red,orange,purple)
//                (black,purple,green,black)
// Output: Output a “valid placement". Exactly n lines long. Each line should contain n square pieces,
// separated by semicolons. There should be no space characters.
// Example output: (black,black,red,red);(black,red,orange,purple);(black,purple,green,black)
//                 (red,black,yellow,green);(orange,green,blue,blue);(green,blue,orange,black)
//                 (yellow,black,black,blue);(blue,blue,black,yellow);(orange,yellow,black,black)

let VERBOSE = false;

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const readLines = () => {
  process.stdin.setEncoding('utf8');

  const pieces = [];

  const readLine = (line, prevTimeout) => {
    pieces.push(line);

    if (prevTimeout) {
      clearTimeout(prevTimeout);
    }

    const newTimeout = setTimeout(() => {
      process.stdout.write(assembly(pieces).join('\n'));
      process.exit();
    }, 300);

    rl.once('line', line => {
      readLine(line, newTimeout);
    });
  };

  rl.once('line', readLine);
};

function createPiecesAndColors(piecesString) {
  const colors = {
    black: 'black',
  };
  const pieces = {
    all: {},
    center: {},
    down: {},
    left: {},
    right: {},
    up: {},
  };

  piecesString.forEach((pieceString, index) => {
    const pieceArray = pieceString.replace('(', '').replace(')', '').split(',');
    const piece = {
      id: index,
      down: pieceArray[2],
      left: pieceArray[1],
      right: pieceArray[3],
      up: pieceArray[0],
      forbiddenPos: [],
    };

    pieceArray.forEach(color => colors[color] = color);

    if (piece.up === colors.black) {
      pieces.up[piece.id] = piece;
    } else if (piece.down === colors.black) {
      pieces.down[piece.id] = piece;
    } else if (piece.left === colors.black) {
      pieces.left[piece.id] = piece;
    } else if (piece.right === colors.black) {
      pieces.right[piece.id] = piece;
    } else {
      pieces.center[piece.id] = piece;
    }

    pieces.all[piece.id] = piece;
  });

  return { pieces, colors };
}

function createBoard(size) {
  const board = [];

  for (let i = 0; i < size; i++) {
    board.push([]);

    for (let j = 0; j < size; j++) {
      board[i].push([]);
    }
  }

  return board;
}

function isPlacementAllowed(line, column, piece) {
  for (let i = 0; i < piece.forbiddenPos.length; i++) {
    if (piece.forbiddenPos[i][0] === line
        && piece.forbiddenPos[i][1] === column) {
      return false;
    }
  }

  return true;
}

function placeBorders(board, pieces, colors) {
  const LAST_POS = board.length - 1;
  let idsPiecesLeft = [];
  let curEmptySpace = 0;
  let currentPieceIndex = 0;

  // UP
  for (let id in pieces.up) {
    if (pieces.up[id].left === colors.black) {
      board[0][0] = id;
    } else if (pieces.up[id].right === colors.black) {
      board[0][LAST_POS] = id;
    } else {
      idsPiecesLeft.push(id);
    }
  }

  curEmptySpace = 1;
  currentPieceIndex = 0;
  while (idsPiecesLeft.length) {
    const curPiece = pieces.up[idsPiecesLeft[currentPieceIndex]];
    const prevPiece = pieces.up[board[0][curEmptySpace - 1]];

    if (!curPiece) {
      throw new Error('Piece not found for UP');
      break;
    }

    if (curPiece.left === prevPiece.right && isPlacementAllowed(0, curEmptySpace, curPiece)) {
      board[0][curEmptySpace] = curPiece.id.toString();
      idsPiecesLeft.pop();
      currentPieceIndex = 0;
      curEmptySpace++;
    } else {
      currentPieceIndex++;
    }
  }
  // END UP

  // DOWN
  idsPiecesLeft = [];

  for (let id in pieces.down) {
    if (pieces.down[id].left === colors.black) {
      board[LAST_POS][0] = id;
    } else if (pieces.down[id].right === colors.black) {
      board[LAST_POS][LAST_POS] = id;
    } else {
      idsPiecesLeft.push(id);
    }
  }

  curEmptySpace = 1;
  currentPieceIndex = 0;
  while (idsPiecesLeft.length) {
    const curPiece = pieces.down[idsPiecesLeft[currentPieceIndex]];
    const prevPiece = pieces.down[board[LAST_POS][curEmptySpace - 1]];

    if (!curPiece) {
      throw new Error('Piece not found for DOWN');
      break;
    }

    if (curPiece.left === prevPiece.right && isPlacementAllowed(LAST_POS, curEmptySpace, curPiece)) {
      board[LAST_POS][curEmptySpace] = curPiece.id.toString();
      idsPiecesLeft.pop();
      currentPieceIndex = 0;
      curEmptySpace++;
    } else {
      currentPieceIndex++;
    }
  }
  // END DOWN

  // LEFT
  idsPiecesLeft = [];

  for (let id in pieces.left) {
    idsPiecesLeft.push(id);
  }

  curEmptySpace = 1;
  currentPieceIndex = 0;
  while (idsPiecesLeft.length) {
    const curPiece = pieces.left[idsPiecesLeft[currentPieceIndex]];
    const prevPiece = pieces.all[board[curEmptySpace - 1][0]];

    if (!curPiece) {
      throw new Error('Piece not found for LEFT');
      break;
    }

    if (curPiece.up === prevPiece.down && isPlacementAllowed(curEmptySpace, 0, curPiece)) {
      board[curEmptySpace][0] = curPiece.id.toString();
      idsPiecesLeft.pop();
      currentPieceIndex = 0;
      curEmptySpace++;
    } else {
      currentPieceIndex++;
    }
  }
  // END LEFT

  // RIGHT
  idsPiecesLeft = [];

  for (let id in pieces.right) {
    idsPiecesLeft.push(id);
  }

  curEmptySpace = 1;
  currentPieceIndex = 0;
  while (idsPiecesLeft.length) {
    const curPiece = pieces.right[idsPiecesLeft[currentPieceIndex]];
    const prevPiece = pieces.all[board[curEmptySpace - 1][LAST_POS]];

    if (!curPiece) {
      throw new Error('Piece not found for RIGHT');
      break;
    }

    if (curPiece.up === prevPiece.down && isPlacementAllowed(curEmptySpace, LAST_POS, curPiece)) {
      board[curEmptySpace][LAST_POS] = curPiece.id.toString();
      idsPiecesLeft.pop();
      currentPieceIndex = 0;
      curEmptySpace++;
    } else {
      currentPieceIndex++;
    }
  }
  // END RIGHT

  return board;
}

function placeCenter(board, pieces, colors) {
  
}

function assembly(piecesString) {
  const { colors, pieces } = createPiecesAndColors(piecesString);
  const board = createBoard(Math.sqrt(piecesString.length));

  placeBorders(board, pieces, colors);

  placeCenter(board, pieces, colors);

  console.log(board);

  return [];
}

function test(outputType, onlyTest) {
  let testCases = [
    {
      id: 1,
      run: () => assembly(
        [
          '(yellow,black,black,blue)',
          '(blue,blue,black,yellow)',
          '(orange,yellow,black,black)',
          '(red,black,yellow,green)',
          '(orange,green,blue,blue)',
          '(green,blue,orange,black)',
          '(black,black,red,red)',
          '(black,red,orange,purple)',
          '(black,purple,green,black)',
        ]
      ),
      expected: [
        '(black,black,red,red);(black,red,orange,purple);(black,purple,green,black)',
        '(red,black,yellow,green);(orange,green,blue,blue);(green,blue,orange,black)',
        '(yellow,black,black,blue);(blue,blue,black,yellow);(orange,yellow,black,black)',
      ]
    },
  ];

  if (onlyTest !== undefined) {
    testCases = [testCases.find(testCase => testCase.id == onlyTest)].filter(test => test);
  }

  if (!testCases.length) {
    console.log('No tests found!');
    process.exit();
  }

  testCases.forEach(testCase => {
    const result = testCase.run();

    if (outputType === 'RESULT') {
      process.stdout.write(result.toString());
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

module.exports = assembly;
