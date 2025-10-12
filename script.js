const canvas = document.querySelector("#canvas");
const scoreDisplay = document.querySelector("#score-display");

function setCanvas(board) {
  let htmlString = ``;

  const colors = {
    0: { background: "#CCC0B3", color: "#776E65" },
    2: { background: "#EEE4DA", color: "#776E65" },
    4: { background: "#EDE0C8", color: "#776E65" },
    8: { background: "#F2B179", color: "#F9F6F2" },
    16: { background: "#F59563", color: "#F9F6F2" },
    32: { background: "#F67C5F", color: "#F9F6F2" },
    64: { background: "#F65E3B", color: "#F9F6F2" },
    128: { background: "#EDCF72", color: "#F9F6F2" },
    256: { background: "#EDCC61", color: "#F9F6F2" },
    512: { background: "#EDC850", color: "#F9F6F2" },
    1024: { background: "#EDC53F", color: "#F9F6F2" },
    2048: { background: "#EDC22E", color: "#F9F6F2" },
    4096: { background: "#3E3933", color: "#F9F6F2" },
  };

  for (let row = 0; row < board.length; row++) {
    htmlString += "<tr>";
    for (let col = 0; col < board[row].length; col++) {
      const value = board[row][col];
      const tileColor = colors[value] || colors[4096]; // fallback

      // Add animation classes
      let animationClass = "";
      if (value === 2 || value === 4) animationClass = "animate-pop"; // new tiles
      if (value >= 8) animationClass = "animate-flash"; // merged tiles

      htmlString += `
        <td>
          <div 
            class="font-bold text-xl rounded-lg flex items-center justify-center size-16 shadow-inner ${animationClass}"
            style="background-color: ${tileColor.background}; color: ${
        tileColor.color
      };"
          >
            ${value === 0 ? "" : value}
          </div>
        </td>`;
    }
    htmlString += "</tr>";
  }

  canvas.innerHTML = htmlString;
  scoreDisplay.innerHTML = score;
}

function createBoard(size) {
  const board = [];
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
  const boardCopy = snapshotBoard(board);
  const emptyPositions = [];
  for (let i = 0; i < boardCopy.length; i++) {
    for (let j = 0; j < boardCopy.length; j++) {
      if (boardCopy[i][j] == 0) {
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
  const boardCopy = snapshotBoard(board);
  const emptyPositions = getEmptyPositionsForBoard(board);

  if (emptyPositions.length == 0) return boardCopy;

  const randomPosition =
    emptyPositions[Math.floor(Math.random() * emptyPositions.length)];

  const randomNumber = [2, 2, 2, 4][Math.floor(Math.random() * 4)];

  boardCopy[randomPosition[0]][randomPosition[1]] = randomNumber;

  return boardCopy;
}

function rotateBoardClockwise(board) {
  const boardCopy = snapshotBoard(board);
  const rotatedBoard = createBoard(board.length);
  for (let row = 0; row < boardCopy.length; row++) {
    for (let col = 0; col < boardCopy.length; col++) {
      const rotatedRow = rotatedRowFor(row, col, board.length);
      const rotatedCol = rotatedColFor(row, col, board.length);
      rotatedBoard[rotatedRow][rotatedCol] = boardCopy[row][col];
    }
  }
  return rotatedBoard;
}

function moveUp(column) {
  const columnSnapshot = [...column];
  const originalLength = columnSnapshot.length;
  const movedColumn = columnSnapshot.filter((item) => item != 0);

  for (let i = movedColumn.length; i < originalLength; i++) {
    movedColumn[i] = 0;
  }

  return movedColumn;
}

function joinUp(col) {
  const colSnapshot = [...col];
  const length = colSnapshot.length;
  for (let i = 0; i < length - 1; i++) {
    if (colSnapshot[i] == colSnapshot[i + 1]) {
      colSnapshot[i] *= 2;
      colSnapshot[i + 1] = 0;
      score += colSnapshot[i];
      i++;
    }
  }
  return colSnapshot;
}

function mergeUpColumn(board, target_col) {
  const boardCopy = snapshotBoard(board);
  const col = boardCopy.map((row) => row[target_col]);
  const mergedCol = moveUp(joinUp(moveUp(col)));

  for (let i = 0; i < boardCopy.length; i++) {
    boardCopy[i][target_col] = mergedCol[i];
  }

  return boardCopy;
}

function mergeUp(board) {
  let boardCopy = snapshotBoard(board);

  for (let col = 0; col < boardCopy.length; col++) {
    boardCopy = mergeUpColumn(boardCopy, col);
  }

  return boardCopy;
}

function noMovesLeft(board) {
  let rotatedBoard = snapshotBoard(board);

  if (getEmptyPositionsForBoard(rotatedBoard).length == 0) {
    let cantMergeCount = 0;

    for (let i = 0; i < 4; i++) {
      rotatedBoard = rotateBoardClockwise(rotatedBoard);
      if (boardIsEqual(rotatedBoard, mergeUp(rotatedBoard))) {
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

function mergeToDirection(board, numRotations) {
  let boardCopy = snapshotBoard(board);

  for (let i = 0; i < numRotations; i++) {
    boardCopy = rotateBoardClockwise(boardCopy);
  }

  boardCopy = mergeUp(boardCopy);

  for (let i = 0; i < 4 - numRotations; i++) {
    boardCopy = rotateBoardClockwise(boardCopy);
  }

  return snapshotBoard(boardCopy);
}

let score = 0;
let gameBoard = createBoard(4);
gameBoard = addToBoard(gameBoard);
gameBoard = addToBoard(gameBoard);

setCanvas(gameBoard);

let gameOver = false;

function handleKeyPress(numRotations) {
  const initialState = snapshotBoard(gameBoard);

  let mergedBoard = mergeToDirection(gameBoard, numRotations);

  if (!boardIsEqual(mergedBoard, initialState)) {
    // console.log("ADD");
    mergedBoard = addToBoard(mergedBoard);
  }

  setCanvas(mergedBoard);

  if (noMovesLeft(mergedBoard)) {
    setCanvas(mergedBoard);
    setTimeout(() => {
      alert("Game Over. Score: " + score);
      gameBoard = createBoard(4);
      gameBoard = addToBoard(gameBoard);
      gameBoard = addToBoard(gameBoard);
      score = 0;
      setCanvas(gameBoard);
    }, 50);
  }

  gameBoard = snapshotBoard(mergedBoard);
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

const swipeElement = document;
let touchStartX = 0;
let touchStartY = 0;
const threshold = 50; // Minimum pixel distance for a swipe

swipeElement.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].screenX;
  touchStartY = event.changedTouches[0].screenY;
});

swipeElement.addEventListener("touchend", (event) => {
  const touchEndX = event.changedTouches[0].screenX;
  const touchEndY = event.changedTouches[0].screenY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
    if (deltaX > 0) {
      console.log("Swipe Right");
      handleKeyPress(3);
    } else {
      console.log("Swipe Left");
      handleKeyPress(1);
    }
  } else if (Math.abs(deltaY) > threshold) {
    if (deltaY > 0) {
      console.log("Swipe Down");
      handleKeyPress(2);
    } else {
      console.log("Swipe Up");
      handleKeyPress(0);
    }
  }
});
