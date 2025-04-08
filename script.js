document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const difficultyDisplay = document.getElementById('difficulty-display');
    const attemptsDisplay = document.getElementById('attempts-display');
    const messageDisplay = document.getElementById('message-display');
    const gameBoard = document.getElementById('game-board');
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    const gameControls = document.getElementById('game-controls');
    
    // Difficulty Buttons
    const easyBtn = document.getElementById('easy-btn');
    const mediumBtn = document.getElementById('medium-btn');
    const hardBtn = document.getElementById('hard-btn');
    
    // Game Control Buttons
    const playAgainBtn = document.getElementById('play-again-btn');
    const mainMenuBtn = document.getElementById('main-menu-btn');
    
    // Game Variables
    let gameState = 'start'; // start, playing, won, lost
    let difficulty = null;
    let currentGuess = '';
    let guesses = [];
    let targetWord = '';
    let keyboardStatus = {};
    
    // Word lists by difficulty
    const wordLists = {
        easy: ['कमल', 'नमक', 'बचत', 'मगर', 'जलन'],
        medium: ['आदमी', 'कमला', 'पहाड़', 'समझ', 'किताब'],
        hard: ['इमारत', 'विकास', 'प्रकाश', 'परिवार', 'स्वतंत्र']
    };
    
    const maxAttempts = 6;
    
    // Hindi keyboard layout
    const hindiKeyboard = [
        ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ'],
        ['ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न'],
        ['प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श'],
        ['ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ', 'अ', 'आ', 'इ', 'ई'],
        ['उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः', 'Backspace', 'Enter']
    ];
    
    // Select a random word based on difficulty
    function selectRandomWord(level) {
        const words = wordLists[level];
        return words[Math.floor(Math.random() * words.length)];
    }
    
    // Set up difficulty level buttons
    easyBtn.addEventListener('click', () => startGame('easy'));
    mediumBtn.addEventListener('click', () => startGame('medium'));
    hardBtn.addEventListener('click', () => startGame('hard'));
    
    // Set up game control buttons
    playAgainBtn.addEventListener('click', () => {
        startGame(difficulty);
    });
    
    mainMenuBtn.addEventListener('click', () => {
        setGameState('start');
    });
    
    // Start a new game with the selected difficulty
    function startGame(level) {
        const word = selectRandomWord(level);
        difficulty = level;
        targetWord = word;
        guesses = [];
        currentGuess = '';
        gameState = 'playing';
        keyboardStatus = {};
        
        difficultyDisplay.textContent = `कठिनाई: ${getDifficultyInHindi(level)}`;
        updateAttemptsDisplay();
        hideMessage();
        
        renderGameBoard();
        renderVirtualKeyboard();
        
        gameControls.classList.add('hidden');
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
    }
    
    // Convert difficulty level to Hindi
    function getDifficultyInHindi(level) {
        switch (level) {
            case 'easy': return 'आसान';
            case 'medium': return 'मध्यम';
            case 'hard': return 'कठिन';
            default: return '';
        }
    }
    
    // Update attempts display
    function updateAttemptsDisplay() {
        attemptsDisplay.textContent = `प्रयास: ${guesses.length}/${maxAttempts}`;
    }
    
    // Show a message to the user
    function showMessage(msg, type = 'info') {
        messageDisplay.textContent = msg;
        messageDisplay.className = 'message-display';
        if (type === 'error') {
            messageDisplay.classList.add('error');
        } else if (type === 'success') {
            messageDisplay.classList.add('success');
        }
        messageDisplay.classList.remove('hidden');
    }
    
    // Hide the message display
    function hideMessage() {
        messageDisplay.classList.add('hidden');
    }
    
    // Set the game state
    function setGameState(state) {
        gameState = state;
        
        if (state === 'start') {
            startScreen.classList.remove('hidden');
            gameScreen.classList.add('hidden');
        } else if (state === 'won' || state === 'lost') {
            gameControls.classList.remove('hidden');
            
            if (state === 'won') {
                showMessage('बधाई हो! आपने शब्द सही अनुमान लगाया!', 'success');
            } else {
                showMessage(`खेल समाप्त! सही शब्द था: ${targetWord}`, 'error');
            }
        }
    }
    
    // Check if a character is a Hindi character
    function isHindiCharacter(char) {
        return char.length === 1 && /[\u0900-\u097F]/.test(char);
    }
    
    // Handle keyboard input
    function handleKeyPress(key) {
        if (gameState !== 'playing') return;
        
        if (key === 'Enter') {
            submitGuess();
        } else if (key === 'Backspace') {
            if (currentGuess.length > 0) {
                currentGuess = currentGuess.slice(0, -1);
                renderCurrentGuess();
            }
        } else if (isHindiCharacter(key)) {
            if (currentGuess.length < targetWord.length) {
                currentGuess += key;
                renderCurrentGuess();
            }
        }
    }
    
    // Submit the current guess
    function submitGuess() {
        if (currentGuess.length !== targetWord.length) {
            showMessage(`शब्द ${targetWord.length} अक्षर का होना चाहिए!`, 'error');
            return;
        }
        
        guesses.push(currentGuess);
        updateAttemptsDisplay();
        
        // Update keyboard status
        for (let i = 0; i < currentGuess.length; i++) {
            const char = currentGuess[i];
            const status = getLetterStatus(char, i);
            
            if (status === 'correct') {
                keyboardStatus[char] = 'correct';
            } else if (status === 'present' && keyboardStatus[char] !== 'correct') {
                keyboardStatus[char] = 'present';
            } else if (!keyboardStatus[char]) {
                keyboardStatus[char] = 'absent';
            }
        }
        
        renderGameBoard();
        renderVirtualKeyboard();
        
        // Check if won
        if (currentGuess === targetWord) {
            setGameState('won');
            return;
        }
        
        // Check if lost
        if (guesses.length >= maxAttempts) {
            setGameState('lost');
            return;
        }
        
        // Reset current guess
        currentGuess = '';
        hideMessage();
    }
    
    // Get the status of a letter in a guess
    function getLetterStatus(letter, index) {
        if (letter === targetWord[index]) {
            return 'correct';
        } else if (targetWord.includes(letter)) {
            return 'present';
        } else {
            return 'absent';
        }
    }
    
    // Render the game board
    function renderGameBoard() {
        gameBoard.innerHTML = '';
        
        // Previous guesses
        for (let i = 0; i < guesses.length; i++) {
            const guessRow = document.createElement('div');
            guessRow.className = 'guess-row';
            
            const guess = guesses[i];
            for (let j = 0; j < guess.length; j++) {
                const letter = guess[j];
                const status = getLetterStatus(letter, j);
                
                const letterCell = document.createElement('div');
                letterCell.className = `letter-cell ${status}`;
                letterCell.textContent = letter;
                
                guessRow.appendChild(letterCell);
            }
            
            gameBoard.appendChild(guessRow);
        }
        
        // Current guess
        if (gameState === 'playing') {
            const currentRow = document.createElement('div');
            currentRow.className = 'guess-row';
            
            for (let i = 0; i < targetWord.length; i++) {
                const letterCell = document.createElement('div');
                letterCell.className = `letter-cell ${i < currentGuess.length ? 'current' : 'empty'}`;
                
                if (i < currentGuess.length) {
                    letterCell.textContent = currentGuess[i];
                }
                
                currentRow.appendChild(letterCell);
            }
            
            gameBoard.appendChild(currentRow);
        }
        
        // Empty rows
        const remainingRows = maxAttempts - guesses.length - (gameState === 'playing' ? 1 : 0);
        for (let i = 0; i < remainingRows; i++) {
            const emptyRow = document.createElement('div');
            emptyRow.className = 'guess-row';
            
            for (let j = 0; j < targetWord.length; j++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'letter-cell empty';
                emptyRow.appendChild(emptyCell);
            }
            
            gameBoard.appendChild(emptyRow);
        }
    }
    
    // Render the current guess
    function renderCurrentGuess() {
        const currentRowCells = gameBoard.children[guesses.length].children;
        
        for (let i = 0; i < targetWord.length; i++) {
            const cell = currentRowCells[i];
            
            if (i < currentGuess.length) {
                cell.textContent = currentGuess[i];
                cell.className = 'letter-cell current';
            } else {
                cell.textContent = '';
                cell.className = 'letter-cell empty';
            }
        }
    }
    
    // Render the virtual keyboard
    function renderVirtualKeyboard() {
        virtualKeyboard.innerHTML = '';
        
        for (const row of hindiKeyboard) {
            const keyboardRow = document.createElement('div');
            keyboardRow.className = 'keyboard-row';
            
            for (const key of row) {
                const keyBtn = document.createElement('button');
                keyBtn.textContent = key === 'Backspace' ? '←' : key;
                
                if (key === 'Backspace' || key === 'Enter') {
                    keyBtn.className = `key-btn wide ${keyboardStatus[key] || ''}`;
                } else {
                    keyBtn.className = `key-btn char ${keyboardStatus[key] || ''}`;
                }
                
                keyBtn.addEventListener('click', () => handleKeyPress(key));
                keyboardRow.appendChild(keyBtn);
            }
            
            virtualKeyboard.appendChild(keyboardRow);
        }
    }
    
    // Handle physical keyboard events
    document.addEventListener('keydown', (event) => {
        if (gameState !== 'playing') return;
        
        if (event.key === 'Enter') {
            handleKeyPress('Enter');
        } else if (event.key === 'Backspace') {
            handleKeyPress('Backspace');
        } else if (isHindiCharacter(event.key)) {
            handleKeyPress(event.key);
        }
    });
    
    // Initialize the game
    setGameState('start');
});