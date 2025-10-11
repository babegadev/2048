const canvas = document.querySelector("#canvas");

function setCanvas(board) {
  let htmlString = ``;

  colors = [
    "#CCC0B3", // pixel 0
    "#EEE4DA", // pixel 2
    "#EEE4DA", // pixel 4
    "#F2B179", // pixel 8
    "#F59563", // pixel 16
    "#F2B179", // pixel 32
    "#F2B179", // pixel 64
    "#EDCF72", // pixel 128
    "#F2B179", // pixel 256
    "#F2B179", // pixel 512
    "#F2B179", // pixel 1024
    "#F2B179", // pixel 2048
    "#3E3933", // pixel 4096
  ];

  for (let row = 0; row < board.length; row++) {
    htmlString += "<tr>";
    for (let col = 0; col < board.length; col++) {
      const value = board[row][col];
      const colorIndex = value == 0 ? 0 : Math.log2(value);
      htmlString += `<td><div class='font-bold m-1 size-16 flex items-center justify-center bg-[${colors[colorIndex]}]'>`;
      htmlString += value == 0 ? "" : value;
      htmlString += "</div></td>";
    }
    htmlString += "</tr>";
  }

  canvas.innerHTML = htmlString;
}

function createBoard(size) {
  let board = [];
  for (let i = 0; i < size; i++) {
    board[i] = [];
    for (let j = 0; j < size; j++) {
      board[i][j] = 0;
    }
  }
  return board;
}

function sizeOfBoard(board) {
  return board.length == board[0].length ? board.length : undefined;
}

function getEmptyPositionsForBoard(board) {
  const emptyPositions = [];
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (board[i][j] == 0) {
        emptyPositions.push([i, j]);
      }
    }
  }
  return emptyPositions;
}

function rotatedRowFor(row, col, size) {
  return col;
}

function rotatedColFor(row, col, size) {
  return size - 1 - row;
}

function addToBoard(board) {
  emptyPositions = getEmptyPositionsForBoard(board);

  randomPosition =
    emptyPositions[Math.floor(Math.random() * (emptyPositions.length + 1))];

  randomNumber = [2, 2, 2, 4][Math.floor(Math.random() * 4)];

  board[randomPosition[0]][randomPosition[1]] = randomNumber;

  return board;
}

function rotateBoardClockwise(board) {
  const rotatedBoard = createBoard(board.length);
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board.length; col++) {
      const rotatedRow = rotatedRowFor(row, col, board.length);
      const rotatedCol = rotatedColFor(row, col, board.length);
      rotatedBoard[rotatedRow][rotatedCol] = board[row][col];
    }
  }
  return rotatedBoard;
}

function moveUp(column) {
  const originalLength = column.length;
  const movedColumn = column.filter((item) => item != 0);

  for (let i = movedColumn.length; i < originalLength; i++) {
    movedColumn[i] = 0;
  }

  return movedColumn;
}

function joinUp(col) {
  for (let i = 0; i < col.length - 1; i++) {
    if (col[i] == col[i + 1]) {
      col[i] *= 2;
      col[i + 1] = 0;
      i++;
    }
  }
  return col;
}

function mergeUpColumn(board, target_col) {
  const col = board.map((row) => row[target_col]);

  const mergedCol = moveUp(joinUp(moveUp(col)));

  for (let i = 0; i < board.length; i++) {
    board[i][target_col] = mergedCol[i];
  }

  return board;
}

function mergeUp(board) {
  let newBoard = [...board];

  for (let col = 0; col < newBoard.length; col++) {
    newBoard = mergeUpColumn(newBoard, col);
  }

  return newBoard;
}

function noMovesLeft(board) {
  let rotatedBoard = board;
  if (getEmptyPositionsForBoard(board).length == 0) {
    let cantMergeCount = 0;

    for (let i = 0; i < 4; i++) {
      rotatedBoard = rotateBoardClockwise(rotatedBoard);
      if (rotatedBoard == mergeUp(rotatedBoard)) {
        cantMergeCount++;
      }
    }

    if (cantMergeCount == 4) {
      return true;
    }
  }
  return false;
}

function snapshotBoard(board) {
  const newBoard = createBoard(board.length);

  for (let i = 0; i < newBoard.length; i++) {
    for (let j = 0; j < newBoard.length; j++) {
      newBoard[i][j] = board[i][j];
    }
  }

  return newBoard;
}

function boardIsEqual(board1, board2) {
  for (let i = 0; i < board1.length; i++) {
    for (let j = 0; j < board1.length; j++) {
      if (board1[i][j] !== board2[i][j]) return false;
    }
  }
  return true;
}

let gameBoard = [
  [2, 0, 0, 0],
  [2, 2, 0, 0],
  [0, 2, 0, 0],
  [0, 0, 0, 0],
];

setCanvas(gameBoard);

let gameOver = false;

function handleKeyPress(numRotations) {
  const initialState = snapshotBoard(gameBoard);
  const size = gameBoard.length;

  for (let i = 0; i < numRotations; i++) {
    gameBoard = rotateBoardClockwise(gameBoard);
  }

  gameBoard = mergeUp(gameBoard);

  for (let i = 0; i < size - numRotations; i++) {
    gameBoard = rotateBoardClockwise(gameBoard);
  }

  console.log("initial", initialState);
  console.log("current", gameBoard);

  if (!boardIsEqual(gameBoard, initialState)) {
    console.log("ADD");
    gameBoard = addToBoard(gameBoard);
  }

  setCanvas(gameBoard);
}

document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowUp":
      console.log("UP");
      handleKeyPress(0);
      break;
    case "ArrowDown":
      console.log("DOWN");
      handleKeyPress(2);
      break;
    case "ArrowLeft":
      console.log("LEFT");
      handleKeyPress(1);
      break;
    case "ArrowRight":
      console.log("RIGHT");
      handleKeyPress(3);
      break;
    default:
      // Handle other key presses or do nothing
      break;
  }
});
