// Thanksgiving Strands Game Script

// Game settings
const gridSize = 7; // Grid size is 7x7
const winScore = 200; // Points required to win

// Thanksgiving-themed words to hide in the grid (7 letters or fewer)
const mainWords = [
    "THANKS",      //6
    "ALGOE",       //5
    "KELTNER",     //7
    "TURKEY",      //6
    "FAMILY",      //6
    "HEALTH",      //6
    "MARSH",       //5
    "NIK0",        //4 (Assuming typo and length corrected)
    "MORALES",     //7
    "HARVEST",     //7
    "FEAST",       //5
    "FRIEND",      //6
    "GIVING"       //6
];

// Assign a unique color to each word
const wordColors = [
    'word-color-1',
    'word-color-2',
    'word-color-3',
    'word-color-4',
    'word-color-5',
    'word-color-6',
    'word-color-7',
    'word-color-8',
    'word-color-9',
    'word-color-10',
    'word-color-11',
    'word-color-12',
    'word-color-13'
];

// Map words to their assigned colors
let wordColorMap = {};

// Variables to store game state
let grid = [];
let selectedCells = [];
let foundWords = [];
let score = 0;

// DOM Elements
const gridContainer = document.getElementById('grid-container');
const gridWrapper = document.getElementById('grid-wrapper');
const foundWordsList = document.getElementById('found-words');
const hintMessage = document.getElementById('hint-message');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const playAgainButton = document.getElementById('play-again-btn');
const scoreDisplay = document.getElementById('score-display');
const selectionCanvas = document.getElementById('selection-canvas');
const canvasContext = selectionCanvas.getContext('2d');

// Initialize the game
initializeGame();

// Event listener for Play Again button
playAgainButton.addEventListener('click', () => {
    location.reload();
});

// Functions

function initializeGame() {
    // Map words to colors
    mainWords.forEach((word, index) => {
        wordColorMap[word] = wordColors[index % wordColors.length];
    });

    // Generate empty grid
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = '';
        }
    }

    // Place main words in the grid without overlapping conflicting letters
    placeAllWords();

    // Render the grid
    renderGrid();

    // Adjust canvas size
    adjustCanvasSize();

    // Handle window resize to adjust canvas
    window.addEventListener('resize', adjustCanvasSize);
}

function placeAllWords() {
    const directions = ['horizontal', 'vertical']; // Removed diagonal directions

    for (let word of mainWords) {
        let placed = false;
        let attempts = 0;
        const maxAttempts = 1000;

        while (!placed && attempts < maxAttempts) {
            attempts++;
            const direction = directions[Math.floor(Math.random() * directions.length)];
            const positions = getAvailablePositions(word.length, direction, word);

            if (positions.length === 0) continue;

            const startPos = positions[Math.floor(Math.random() * positions.length)];
            placed = canPlaceWord(word, startPos.row, startPos.col, direction);

            if (placed) {
                let tempRow = startPos.row;
                let tempCol = startPos.col;
                for (let i = 0; i < word.length; i++) {
                    const letter = word[i];
                    if (grid[tempRow][tempCol] === '') {
                        grid[tempRow][tempCol] = { letter, word };
                    }
                    [tempRow, tempCol] = getNextCell(tempRow, tempCol, direction);
                }
            }
        }

        if (!placed) {
            console.error(`Failed to place the word: ${word}`);
            // Optionally, adjust the winScore or notify the user
        }
    }

    // Fill any remaining empty cells with random letters
    fillEmptyCells();
}

function getAvailablePositions(wordLength, direction, word) {
    let positions = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (canPlaceWordAt(i, j, wordLength, direction, word)) {
                positions.push({ row: i, col: j });
            }
        }
    }
    return positions;
}

function canPlaceWordAt(row, col, wordLength, direction, word) {
    let tempRow = row;
    let tempCol = col;

    for (let i = 0; i < wordLength; i++) {
        // Check bounds
        if (tempRow < 0 || tempRow >= gridSize || tempCol < 0 || tempCol >= gridSize) {
            return false;
        }

        const cell = grid[tempRow][tempCol];
        if (cell !== '') {
            // Allow overlapping only if the letters match
            if (cell.letter !== word[i]) {
                return false;
            }
        }

        [tempRow, tempCol] = getNextCell(tempRow, tempCol, direction);
    }

    return true;
}

function canPlaceWord(word, row, col, direction) {
    let tempRow = row;
    let tempCol = col;

    for (let i = 0; i < word.length; i++) {
        // Check bounds
        if (tempRow < 0 || tempRow >= gridSize || tempCol < 0 || tempCol >= gridSize) {
            return false;
        }

        const cell = grid[tempRow][tempCol];
        if (cell !== '') {
            // Allow overlapping only if the letters match
            if (cell.letter !== word[i]) {
                return false;
            }
        }

        [tempRow, tempCol] = getNextCell(tempRow, tempCol, direction);
    }

    return true;
}

function getNextCell(row, col, direction) {
    switch (direction) {
        case 'horizontal':
            return [row, col + 1];
        case 'vertical':
            return [row + 1, col];
        default:
            return [row, col];
    }
}

function fillEmptyCells() {
    // Fill empty cells with random letters from the alphabet
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === '') {
                // Choose a random letter from the alphabet
                const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
                grid[i][j] = { letter: randomLetter, word: null };
            }
        }
    }
}

function renderGrid() {
    gridContainer.innerHTML = '';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-letter');
            cell.setAttribute('data-row', i);
            cell.setAttribute('data-col', j);
            cell.textContent = grid[i][j].letter;
            gridContainer.appendChild(cell);
        }
    }

    // Add event listeners for selecting letters
    const gridLetters = document.querySelectorAll('.grid-letter');
    gridLetters.forEach(letter => {
        letter.addEventListener('mousedown', startSelection);
        letter.addEventListener('mouseenter', continueSelection);
        letter.addEventListener('mouseup', endSelection);
    });

    // Prevent default dragging behavior
    gridContainer.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });
}

function adjustCanvasSize() {
    // Set the canvas size to match the grid container
    selectionCanvas.width = gridContainer.offsetWidth;
    selectionCanvas.height = gridContainer.offsetHeight;
}

function startSelection(e) {
    resetSelection();
    selectCell(e.target);
    gridContainer.addEventListener('mouseover', continueSelection);
    // Initialize canvas drawing
    clearCanvas();
}

function continueSelection(e) {
    if (e.buttons !== 1) return; // Only proceed if the mouse button is pressed
    if (e.target.classList.contains('grid-letter') && !selectedCells.includes(e.target)) {
        // Ensure the selected cell is adjacent to the last selected cell
        if (selectedCells.length > 0) {
            const lastCell = selectedCells[selectedCells.length - 1];
            if (isAdjacent(lastCell, e.target)) {
                selectCell(e.target);
                drawConnection();
            }
            // Removed backtracking to previous cell to simplify selection
        } else {
            selectCell(e.target);
            drawConnection();
        }
    }
}

function endSelection() {
    gridContainer.removeEventListener('mouseover', continueSelection);
    checkSelectedWord();
    resetSelection();
    clearCanvas();
}

function selectCell(cell) {
    cell.classList.add('selected');
    selectedCells.push(cell);
}

function deselectCell(cell) {
    cell.classList.remove('selected');
    selectedCells.pop();
}

function resetSelection() {
    selectedCells.forEach(cell => cell.classList.remove('selected'));
    selectedCells = [];
    clearCanvas();
}

function isAdjacent(cell1, cell2) {
    const row1 = parseInt(cell1.getAttribute('data-row'));
    const col1 = parseInt(cell1.getAttribute('data-col'));
    const row2 = parseInt(cell2.getAttribute('data-row'));
    const col2 = parseInt(cell2.getAttribute('data-col'));

    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);

    // Allow only horizontal or vertical adjacency
    return (
        (rowDiff === 1 && colDiff === 0) || // Vertical adjacency
        (rowDiff === 0 && colDiff === 1)    // Horizontal adjacency
    );
}

function checkSelectedWord() {
    const word = selectedCells.map(cell => cell.textContent).join('');
    const reversedWord = word.split('').reverse().join('');
    if (foundWords.includes(word) || foundWords.includes(reversedWord)) {
        showHintMessage('Word already found.');
        return;
    }

    if (mainWords.includes(word)) {
        foundWords.push(word);
        addWordToList(word);
        highlightWord(selectedCells, wordColorMap[word]);
        updateScore(word);
        checkGameCompletion();
    } else if (mainWords.includes(reversedWord)) {
        foundWords.push(reversedWord);
        addWordToList(reversedWord);
        highlightWord(selectedCells, wordColorMap[reversedWord]);
        updateScore(reversedWord);
        checkGameCompletion();
    } else {
        showHintMessage('Invalid word.');
    }
}

function addWordToList(word) {
    const listItem = document.createElement('li');
    listItem.textContent = word;
    listItem.classList.add(wordColorMap[word]);
    foundWordsList.appendChild(listItem);
}

function highlightWord(cells, colorClass) {
    cells.forEach(cell => {
        cell.classList.add('highlighted', colorClass);
        cell.classList.remove('selected');
        // Remove event listeners to prevent re-selection
        cell.removeEventListener('mousedown', startSelection);
        cell.removeEventListener('mouseenter', continueSelection);
        cell.removeEventListener('mouseup', endSelection);
    });
}

function showHintMessage(message) {
    hintMessage.textContent = message;
    setTimeout(() => {
        hintMessage.textContent = 'Find all the words!';
    }, 2000);
}

function checkGameCompletion() {
    if (score >= winScore) {
        showModal();
    }
}

function showModal() {
    modalMessage.innerHTML = `You've reached ${winScore} points!<br>You've found all the words!`;
    modal.style.display = 'block';
}

function updateScore(word) {
    const points = getWordPoints(word);
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
}

function getWordPoints(word) {
    // Points based on word length
    return word.length * 5;
}

function clearCanvas() {
    canvasContext.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
}

function drawConnection() {
    clearCanvas();
    if (selectedCells.length < 2) return;
    canvasContext.strokeStyle = '#FF4500'; // OrangeRed
    canvasContext.lineWidth = 4;
    canvasContext.beginPath();
    for (let i = 0; i < selectedCells.length - 1; i++) {
        const cell1 = selectedCells[i];
        const cell2 = selectedCells[i + 1];

        const rect1 = cell1.getBoundingClientRect();
        const rect2 = cell2.getBoundingClientRect();

        const gridRect = gridContainer.getBoundingClientRect();

        const x1 = rect1.left + rect1.width / 2 - gridRect.left;
        const y1 = rect1.top + rect1.height / 2 - gridRect.top;

        const x2 = rect2.left + rect2.width / 2 - gridRect.left;
        const y2 = rect2.top + rect2.height / 2 - gridRect.top;

        canvasContext.moveTo(x1, y1);
        canvasContext.lineTo(x2, y2);
    }
    canvasContext.stroke();
}