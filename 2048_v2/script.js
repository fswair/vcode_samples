// Game logic will go here

const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const gameStatusOverlay = document.getElementById('game-status-overlay');
const gameStatusMessage = document.getElementById('game-status-message');
const tryAgainBtn = document.getElementById('try-again-btn');

let board = [];
let size = 4; // Default size
let score = 0;
let isGameOver = false;

// Function to initialize the game board structure in HTML
function createBoard(size) {
    gameContainer.innerHTML = ''; // Clear previous board
    gameContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('game-cell');
        // Add a span inside for centering the tile value
        const tileValueSpan = document.createElement('span');
        cell.appendChild(tileValueSpan);
        gameContainer.appendChild(cell);
    }
}

// Function to initialize the internal game board array
function initializeBoardArray(size) {
    board = Array(size).fill(null).map(() => Array(size).fill(0));
}

// Function to add a random tile (2 or 4) to an empty cell
function addRandomTile() {
    let emptyCells = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === 0) {
                emptyCells.push({ row: r, col: c });
            }
        }
    }

    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newValue = Math.random() < 0.9 ? 2 : 4; // 90% chance of 2, 10% chance of 4
        board[randomCell.row][randomCell.col] = newValue;
    }
}

// Function to update the HTML based on the board array and score
function updateUI() {
    const cells = gameContainer.querySelectorAll('.game-cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / size);
        const col = index % size;
        const tileValue = board[row][col];
        const tileValueSpan = cell.querySelector('span');

        tileValueSpan.textContent = tileValue === 0 ? '' : tileValue;

        // Reset classes
        cell.className = 'game-cell';

        if (tileValue > 0) {
            cell.classList.add(`tile-${tileValue}`);

            if (cell.dataset.prevValue != tileValue) {
                if (cell.dataset.prevValue && tileValue > cell.dataset.prevValue) {
                    cell.classList.add('tile-merged');
                } else {
                    cell.classList.add('tile-new');
                }
            }
        }

        // Kaydet
        cell.dataset.prevValue = tileValue;
    });

    scoreDisplay.textContent = `Score: ${score}`;
}

// Function to start a new game
function startGame(boardSize = 4) {
    size = boardSize;
    score = 0; // Reset score
    isGameOver = false; // Reset game over status
    gameStatusOverlay.style.display = 'none'; // Hide game over/win message
    createBoard(size);
    initializeBoardArray(size);
    addRandomTile(); // Add first tile
    addRandomTile(); // Add second tile
    updateUI(); // Update the display
    console.log("Game started with board size:", size);
    console.table(board);
}

// Initialize the game on page load with the default size
startGame(size);

// --- Input Handling ---

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchend', handleTouchEnd, { passive: false });

// Fallback for pointer events for broader device support
document.addEventListener('pointerdown', handleTouchStart, { passive: false });
document.addEventListener('pointerup', handleTouchEnd, { passive: false });

function handleKeyDown(event) {
    if (isGameOver) return; // Ignore input if game is over
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault(); // Prevent scrolling
        move(event.key);
    }
}

function handleTouchStart(event) {
     if (isGameOver) return; // Ignore input if game is over
    // Use event.changedTouches[0] for touch events, event for pointer events
    const firstTouch = event.changedTouches ? event.changedTouches[0] : event;
    touchStartX = firstTouch.screenX;
    touchStartY = firstTouch.screenY;
    // Prevent default to avoid scrolling while swiping on the game board
    // Check if the touch started within the game area
    if (event.target.closest('.game-container, .game-cell')) {
        event.preventDefault();
    }
}

function handleTouchEnd(event) {
     if (isGameOver) return; // Ignore input if game is over

    // Check if the touch ended within the game area where it started
    if (!event.target.closest('.game-container, .game-cell')) {
         // If the touch ended outside the game area, it's not a game swipe
        return;
    }

    const firstTouch = event.changedTouches ? event.changedTouches[0] : event;
    const touchEndX = firstTouch.screenX;
    const touchEndY = firstTouch.screenY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    const threshold = 50; // Minimum distance for a swipe
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > threshold) { // Only process if a significant swipe occurred
        if (absDx > absDy) {
            // Horizontal swipe
            if (dx > 0) {
                move('ArrowRight');
            } else {
                move('ArrowLeft');
            }
        } else {
            // Vertical swipe
            if (dy > 0) {
                move('ArrowDown');
            } else {
                move('ArrowUp');
            }
        }
    }

    // Prevent default to avoid issues after swipe
    event.preventDefault();
}

// --- Core Game Logic: Slide and Merge ---

// Helper function to slide and merge a single line (row or column)
// Returns the new line and a boolean indicating if the line changed
function slideAndMergeLine(line) {
    let originalLine = [...line]; // Keep a copy to check for changes

    // 1. Slide: Remove zeros and create a new array with non-zero numbers
    let filteredLine = line.filter(num => num !== 0);

    // 2. Merge: Iterate through the filtered line and merge adjacent equal numbers
    for (let i = 0; i < filteredLine.length - 1; i++) {
        if (filteredLine[i] !== 0 && filteredLine[i] === filteredLine[i + 1]) {
            filteredLine[i] *= 2; // Merge: double the first tile
            score += filteredLine[i]; // Add merged value to score
            filteredLine[i + 1] = 0; // Set the second tile to zero
        }
    }

    // Filter out zeros again after merging
    let newLine = filteredLine.filter(num => num !== 0);

    // 3. Pad: Add zeros back to the end to match the original line length
    while (newLine.length < size) {
        newLine.push(0);
    }

    // Check if the line actually changed
    const lineChanged = JSON.stringify(originalLine) !== JSON.stringify(newLine);

    return { newLine, lineChanged };
}

// Function to transpose the board (swap rows and columns)
function transposeBoard(board) {
    // Create a new board with dimensions swapped
    let newBoard = Array(size).fill(null).map(() => Array(size).fill(0));
    for(let r = 0; r < size; r++) {
        for(let c = 0; c < size; c++) {
            newBoard[c][r] = board[r][c];
        }
    }
    return newBoard;
}

// Update the move function to use slideAndMergeLine for all directions
function move(direction) {
    if (isGameOver) return; // Don't allow moves if game is over

    console.log("Move attempted in direction:", direction);
    let boardChanged = false;

    // Create a deep copy of the board before the move to check for changes accurately
    const originalBoard = board.map(row => [...row]);

    if (direction === 'ArrowLeft') {
        for (let r = 0; r < size; r++) {
            const { newLine, lineChanged } = slideAndMergeLine(board[r]);
            board[r] = newLine;
            if (lineChanged) boardChanged = true;
        }
    } else if (direction === 'ArrowRight') {
        for (let r = 0; r < size; r++) {
            let row = [...board[r]].reverse(); // Get reversed row
            const { newLine, lineChanged } = slideAndMergeLine(row);
            board[r] = newLine.reverse(); // Reverse back and update board
            if (lineChanged) boardChanged = true;
        }
    } else if (direction === 'ArrowUp') {
        let transposedBoard = transposeBoard(board);
        for (let c = 0; c < size; c++) {
             const { newLine, lineChanged } = slideAndMergeLine(transposedBoard[c]);
            transposedBoard[c] = newLine;
            if (lineChanged) boardChanged = true;
        }
        board = transposeBoard(transposedBoard); // Transpose back
    } else if (direction === 'ArrowDown') {
        let transposedBoard = transposeBoard(board);
        for (let c = 0; c < size; c++) {
            let col = [...transposedBoard[c]].reverse(); // Get reversed column
            const { newLine, lineChanged } = slideAndMergeLine(col);
            transposedBoard[c] = newLine.reverse(); // Reverse back
            if (lineChanged) boardChanged = true;
        }
        board = transposeBoard(transposedBoard); // Transpose back
    }

    // Check if the board is actually different from the original board state
    boardChanged = JSON.stringify(originalBoard) !== JSON.stringify(board);

    // After a move, if the board changed, add a new tile and update the UI
    if (boardChanged) {
        addRandomTile();
        updateUI();

        // Check for win or game over after a successful move
        if (checkWin()) {
            gameStatusMessage.textContent = 'You Win!';
            gameStatusOverlay.style.display = 'flex'; // Show win message
            isGameOver = true;
        } else if (checkGameOver()) {
            gameStatusMessage.textContent = 'Game Over!';
            gameStatusOverlay.style.display = 'flex'; // Show game over message
             isGameOver = true;
        }
    } else {
        console.log("Board did not change.");
    }
     console.table(board);
}

// --- Game Over and Win Conditions ---

// Check if the player has reached the 2048 tile
function checkWin() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === 2048) {
                return true;
            }
        }
    }
    return false;
}

// Check if there are any possible moves left
function checkGameOver() {
    // Check if there are any empty cells
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === 0) {
                return false; // There are empty cells, not game over
            }
        }
    }

    // Check if there are any possible merges (horizontal or vertical)
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const currentValue = board[r][c];
            // Check right
            if (c < size - 1 && currentValue !== 0 && currentValue === board[r][c + 1]) {
                return false; // Can merge horizontally
            }
            // Check down
            if (r < size - 1 && currentValue !== 0 && currentValue === board[r + 1][c]) {
                return false; // Can merge vertically
            }
        }
    }

    // No empty cells and no possible merges, game over
    return true;
}


// --- UI Control --- 

const newGameBtn = document.getElementById('new-game-btn');
const sizeSelectBtns = document.querySelectorAll('.size-select-btn');

newGameBtn.addEventListener('click', () => {
    startGame(size); // Restart with the current size
});

sizeSelectBtns.forEach(button => {
    button.addEventListener('click', (event) => {
        const selectedSize = parseInt(event.target.dataset.size);
        startGame(selectedSize);
    });
});

tryAgainBtn.addEventListener('click', () => {
    startGame(size); // Restart with the current size
});

// --- Initial Setup ---
// Add span elements inside cells when creating the board
// This was added directly into the createBoard function above.

// Add some basic styling for the span in CSS if needed for centering
// This was added in the last CSS update.

// TODO: Implement tile animations (optional but improves feel)