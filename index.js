const words = [
    "Marsh", "Keltner", "Algoe", "Desteno",            // Gratitude Researchers
    "self-control", "sleep", "diet", "depression",     // Health Benefits
    "possessions", "capitalism", "satisfaction", "greed", // Materialism
    "social glue", "relationships", "marriage", "pay it forward" // Community
];

// Define the groups
const groups = {
    "Gratitude Researchers": ["Marsh", "Keltner", "Algoe", "Desteno"],
    "Health Benefits": ["self-control", "sleep", "diet", "depression"],
    "Materialism": ["possessions", "capitalism", "satisfaction", "greed"],
    "Community": ["social glue", "relationships", "marriage", "pay it forward"]
};

let selectedWords = [];
let foundGroups = [];
let mistakes = 0;
let points = 0;
const maxMistakes = 4;
const maxSelections = 4;

const gameBoard = document.getElementById('game-board');
const messageDiv = document.getElementById('message');
const submitBtn = document.getElementById('submit-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const deselectBtn = document.getElementById('deselect-btn');
const foundGroupsDiv = document.getElementById('found-groups');
const mistakesContainer = document.getElementById('mistakes-remaining');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const closeModal = document.getElementById('close-modal');
const playAgainBtn = document.getElementById('play-again-btn');

function initializeGame() {
    gameBoard.innerHTML = '';
    foundGroupsDiv.innerHTML = '';
    messageDiv.textContent = '';
    selectedWords = [];
    foundGroups = [];
    mistakes = 0;
    points = 0;
    submitBtn.disabled = true;
    shuffleBtn.disabled = false;
    deselectBtn.disabled = false;
    updateMistakesDisplay();

    // Shuffle the words array
    shuffle(words);

    // Create the word cards
    words.forEach(word => {
        if (!foundGroups.flat().includes(word)) {
            const card = document.createElement('div');
            card.classList.add('word-card');
            card.textContent = word;
            card.addEventListener('click', () => selectWord(card, word));
            gameBoard.appendChild(card);
        }
    });
}

initializeGame();

submitBtn.addEventListener('click', checkSelection);
shuffleBtn.addEventListener('click', shuffleWords);
deselectBtn.addEventListener('click', deselectAll);
closeModal.addEventListener('click', closeModalDialog);
playAgainBtn.addEventListener('click', () => {
    closeModalDialog();
    initializeGame();
});

// Shuffle the words array
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

// Shuffle words but keep found groups
function shuffleWords() {
    const remainingWords = words.filter(word => !foundGroups.flat().includes(word));
    shuffle(remainingWords);
    gameBoard.innerHTML = '';
    remainingWords.forEach(word => {
        const card = document.createElement('div');
        card.classList.add('word-card');
        card.textContent = word;
        card.addEventListener('click', () => selectWord(card, word));
        gameBoard.appendChild(card);
    });
}

function selectWord(card, word) {
    if (foundGroups.flat().includes(word)) {
        return; // Ignore if word is already found
    }

    if (selectedWords.includes(word)) {
        selectedWords = selectedWords.filter(w => w !== word);
        card.classList.remove('selected');
    } else {
        if (selectedWords.length < maxSelections) {
            selectedWords.push(word);
            card.classList.add('selected');
        }
    }

    submitBtn.disabled = selectedWords.length !== maxSelections;
}

function deselectAll() {
    selectedWords = [];
    const cards = document.querySelectorAll('.word-card');
    cards.forEach(card => {
        card.classList.remove('selected');
    });
    submitBtn.disabled = true;
}

function checkSelection() {
    let isCorrect = false;
    let groupName = '';

    for (let [name, groupWords] of Object.entries(groups)) {
        if (selectedWords.every(word => groupWords.includes(word)) && !foundGroups.some(group => group.includes(selectedWords[0]))) {
            isCorrect = true;
            groupName = name;
            break;
        }
    }

    const cards = document.querySelectorAll('.word-card');
    let selectedCards = [];

    cards.forEach(card => {
        if (selectedWords.includes(card.textContent)) {
            selectedCards.push(card);
            if (isCorrect) {
                card.classList.add('moving');
            } else {
                card.classList.add('incorrect');
                setTimeout(() => {
                    card.classList.remove('incorrect');
                }, 500);
            }
        }
    });

    if (isCorrect) {
        foundGroups.push([...selectedWords]);

        // Add points and show animation
        points += 100; // Assigning 100 points per correct group
        showPointsAnimation("+100 Points! 🦃"); // Added turkey emoji

        // Wait for animation to finish before updating DOM
        setTimeout(() => {
            // Remove the moving cards from the game board
            selectedCards.forEach(card => {
                card.remove();
            });

            // Create a group container in the foundGroupsDiv
            const groupContainer = document.createElement('div');
            groupContainer.classList.add('group-container', 'full-row');

            // Create a merged card representing the group
            const groupCard = document.createElement('div');
            groupCard.classList.add('word-card');
            groupCard.textContent = `${groupName} 🦃`; // Added turkey emoji
            groupCard.style.backgroundColor = '#D2691E'; // Thanksgiving-themed color
            groupCard.style.borderColor = '#8B4513';
            groupCard.style.cursor = 'default';
            groupCard.style.borderRadius = '15px';
            groupCard.removeEventListener('click', selectWord);

            groupContainer.appendChild(groupCard);

            // Add group explanation (optional)
            // const groupExplanation = document.createElement('span');
            // groupExplanation.textContent = `(${groupName})`;
            // groupContainer.appendChild(groupExplanation);

            foundGroupsDiv.appendChild(groupContainer);

            messageDiv.textContent = `You found a group: ${groupName}! 🦃`;

            if (foundGroups.length === 4) {
                setTimeout(() => {
                    showModal("🎉 Congratulations! You found all groups! 🦃");
                }, 500);
            }
        }, 1000); // Wait for the animation duration

    } else {
        mistakes++;
        updateMistakesDisplay();
        messageDiv.textContent = "❌ Incorrect group. Try again.";

        if (mistakes >= maxMistakes) {
            setTimeout(() => {
                showModal("Game Over! You've used all your tries.", true);
            }, 500);
        }
    }

    // Deselect all selected cards
    selectedWords.forEach(word => {
        const card = [...cards].find(c => c.textContent === word);
        if (card && !card.classList.contains('correct') && !card.classList.contains('moving')) {
            card.classList.remove('selected');
        }
    });

    selectedWords = [];
    submitBtn.disabled = true;
}

function updateMistakesDisplay() {
    mistakesContainer.innerHTML = '';
    for (let i = 0; i < maxMistakes; i++) {
        const dot = document.createElement('div');
        dot.classList.add('mistake-dot');
        if (i < mistakes) {
            dot.classList.add('used');
        }
        mistakesContainer.appendChild(dot);
    }
}

function showModal(message, isGameOver = false) {
    modalMessage.innerHTML = message;
    if (isGameOver) {
        // Show the correct answers the user missed
        const missedGroups = Object.keys(groups).filter(groupName =>
            !foundGroups.some(group => groups[groupName].some(word => group.includes(word)))
        );
        const missedGroupsList = missedGroups
            .map(groupName => `<p><strong>${groupName}</strong>: ${groups[groupName].join(', ')}</p>`)
            .join('');
        modalMessage.innerHTML += `<p>You missed the following groups:</p>${missedGroupsList}`;

        // Change "Play Again" button text to "Try Again"
        playAgainBtn.textContent = "Try Again";
    } else {
        // Reset button text to "Play Again" if the user wins
        playAgainBtn.textContent = "Play Again";
    }
    // Show total points
    modalMessage.innerHTML += `<p>Your Total Points: <strong>${points}</strong></p>`;
    modal.style.display = 'block';
}

function closeModalDialog() {
    modal.style.display = 'none';
}

// Function to show points animation
function showPointsAnimation(text) {
    const pointsDiv = document.createElement('div');
    pointsDiv.classList.add('points-animation');
    pointsDiv.textContent = text;
    document.body.appendChild(pointsDiv);

    setTimeout(() => {
        pointsDiv.remove();
    }, 2000);
}

// Responsive Navbar Toggle
const navbarToggler = document.getElementById('navbar-toggler');
const navbarLinks = document.getElementById('navbar-links');

navbarToggler.addEventListener('click', () => {
    navbarLinks.classList.toggle('active');
});