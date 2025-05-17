
const grid = document.querySelector(".grid-container");
const scoreDisplay = document.querySelector("#score");
const gameOverScreen = document.querySelector("#game-over");
let score = 0;
let board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
];

function startGame() {
    generateNewTile();
    generateNewTile();
    updateBoard();
}

function generateNewTile() {
    let emptyCells = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                emptyCells.push({ x: i, y: j });
            }
        }
    }

    if (emptyCells.length > 0) {
        let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateBoard() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const cell = document.getElementById(`${i}-${j}`);
            cell.textContent = board[i][j] === 0 ? "" : board[i][j];
            cell.className = "grid-cell"; // Reset classes
            if (board[i][j] > 0) {
                cell.classList.add(`tile-${board[i][j]}`);
            }
        }
    }
    scoreDisplay.textContent = score;
}

function move(direction) {
    let boardChanged = false;

    if (direction === "ArrowRight") {
        for (let i = 0; i < 4; i++) {
            for (let j = 3; j > 0; j--) {
                if (board[i][j] === 0) continue;

                let k = j - 1;
                while (k >= 0 && board[i][k] === 0) {
                    k--;
                }

                if (k < 0) continue;

                if (board[i][j] === board[i][k]) {
                    board[i][j] *= 2;
                    score += board[i][j];
                    board[i][k] = 0;
                    boardChanged = true;
                } else if (board[i][j] !== board[i][k]) {
                        continue;
                }
            }
        }

        for (let i = 0; i < 4; i++) {
            for (let j = 3; j > 0; j--) {
                if (board[i][j] === 0) {
                    let k = j - 1;
                    while (k >= 0 && board[i][k] === 0) {
                        k--;
                    }
                    if (k >= 0) {
                        board[i][j] = board[i][k];
                        board[i][k] = 0;
                        boardChanged = true;
                    }
                }
            }
        }
    }
    
    else if (direction === "ArrowLeft") {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === 0) continue;

                let k = j + 1;
                while (k < 4 && board[i][k] === 0) {
                    k++;
                }

                if (k >= 4) continue;

                if (board[i][j] === board[i][k]) {
                    board[i][j] *= 2;
                    score += board[i][j];
                    board[i][k] = 0;
                    boardChanged = true;
                } else if (board[i][j] !== board[i][k]) {
                    continue;
                }
            }
        }

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === 0) {
                    let k = j + 1;
                    while (k < 4 && board[i][k] === 0) {
                        k++;
                    }
                    if (k < 4) {
                        board[i][j] = board[i][k];
                        board[i][k] = 0;
                        boardChanged = true;
                    }
                }
            }
        }
    }

   else if (direction === "ArrowUp") {
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 3; i++) {
                if (board[i][j] === 0) continue;

                let k = i + 1;
                while (k < 4 && board[k][j] === 0) {
                    k++;
                }

                if (k >= 4) continue;

                if (board[i][j] === board[k][j]) {
                    board[i][j] *= 2;
                    score += board[i][j];
                    board[k][j] = 0;
                    boardChanged = true;
                } else if (board[i][j] !== board[k][j]) {
                    continue;
                }
            }
        }

        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 3; i++) {
                if (board[i][j] === 0) {
                    let k = i + 1;
                    while (k < 4 && board[k][j] === 0) {
                        k++;
                    }
                    if (k < 4) {
                        board[i][j] = board[k][j];
                        board[k][j] = 0;
                        boardChanged = true;
                    }
                }
            }
        }
    }

    else if (direction === "ArrowDown") {
        for (let j = 0; j < 4; j++) {
            for (let i = 3; i > 0; i--) {
                if (board[i][j] === 0) continue;

                let k = i - 1;
                while (k >= 0 && board[k][j] === 0) {
                    k--;
                }

                if (k < 0) continue;

                if (board[i][j] === board[k][j]) {
                    board[i][j] *= 2;
                    score += board[i][j];
                    board[k][j] = 0;
                    boardChanged = true;
                } else if (board[i][j] !== board[k][j]) {
                    continue;
                }
            }
        }

        for (let j = 0; j < 4; j++) {
            for (let i = 3; i > 0; i--) {
                if (board[i][j] === 0) {
                    let k = i - 1;
                    while (k >= 0 && board[k][j] === 0) {
                        k--;
                    }
                    if (k >= 0) {
                        board[i][j] = board[k][j];
                        board[k][j] = 0;
                        boardChanged = true;
                    }
                }
            }
        }
    }

    if (boardChanged) {
        generateNewTile();
        updateBoard();
    }

    isGameOver();
}

function isGameOver() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                return false;
            }
            if (i < 3 && board[i][j] === board[i + 1][j]) {
                return false;
            }
            if (j < 3 && board[i][j] === board[i][j + 1]) {
                return false;
            }
        }
    }
    gameOverScreen.classList.add("show");
    return true;
}

document.addEventListener("keydown", (event) => {
    move(event.key);
});

function restartGame() {
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    score = 0;
    gameOverScreen.classList.remove("show");
    startGame();
}

startGame();
