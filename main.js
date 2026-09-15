const WORDS = {
  Names: ["Mohammed", "Yasser", "Omar", "Salama", "Youssef"],
  "Movies and Series": ["Friends", "The Godfather", "Harry Potter", "Batman"],
  Countries: ["Egypt", "Syria", "Palestine", "Yemen", "Oman", "Libya", "Qatar"],
};

const MAX_WRONG_GUESSES = 6;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const drawing = document.querySelector(".drawing");
const categoryElement = document.querySelector(".category");
const wordElement = document.querySelector(".word");
const attemptsElement = document.querySelector(".attempts");
const keyboard = document.querySelector(".keyboard");
const result = document.querySelector(".result");
const resultTitle = document.querySelector("#result-title");
const resultMessage = document.querySelector(".result__message");
const status = document.querySelector(".status");
const newGameButton = document.querySelector(".new-game");
const playAgainButton = document.querySelector(".play-again");

let answer = "";
let guessedLetters = new Set();
let wrongGuesses = 0;
let gameOver = false;

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function chooseWord() {
  const category = randomItem(Object.keys(WORDS));
  return { category, word: randomItem(WORDS[category]).toUpperCase() };
}

function playSound(id) {
  const sound = document.querySelector(id);
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function renderKeyboard() {
  keyboard.replaceChildren(
    ...alphabet.map((letter) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "key";
      button.textContent = letter;
      button.dataset.letter = letter;
      button.disabled = guessedLetters.has(letter) || gameOver;
      button.setAttribute("aria-label", `Guess letter ${letter}`);
      return button;
    })
  );
}

function renderWord() {
  wordElement.replaceChildren(
    ...[...answer].map((character) => {
      const cell = document.createElement("span");
      if (character === " ") {
        cell.className = "word__space";
        cell.setAttribute("aria-hidden", "true");
      } else {
        cell.className = "word__letter";
        cell.textContent = guessedLetters.has(character) ? character : "";
        cell.setAttribute("aria-label", guessedLetters.has(character) ? character : "hidden letter");
      }
      return cell;
    })
  );
}

function renderProgress() {
  drawing.dataset.wrong = wrongGuesses;
  const remaining = MAX_WRONG_GUESSES - wrongGuesses;
  attemptsElement.textContent = `${remaining} incorrect ${remaining === 1 ? "guess" : "guesses"} remaining`;
}

function hasWon() {
  return [...answer].every((character) => character === " " || guessedLetters.has(character));
}

function finishGame(won) {
  gameOver = true;
  result.hidden = false;
  resultTitle.textContent = won ? "You won!" : "Game over";
  resultMessage.textContent = won
    ? `You discovered “${answer}”.`
    : `The word was “${answer}”.`;
  playSound(won ? "#win-sound" : "#lose-sound");
  renderKeyboard();
  playAgainButton.focus();
}

function guess(letter) {
  if (gameOver || guessedLetters.has(letter) || !alphabet.includes(letter)) return;

  guessedLetters.add(letter);

  if (answer.includes(letter)) {
    playSound("#success-sound");
    status.textContent = `${letter} is correct.`;
  } else {
    wrongGuesses += 1;
    playSound("#fail-sound");
    status.textContent = `${letter} is not in the word.`;
  }

  renderWord();
  renderKeyboard();
  renderProgress();

  if (hasWon()) finishGame(true);
  else if (wrongGuesses >= MAX_WRONG_GUESSES) finishGame(false);
}

function startGame() {
  const selection = chooseWord();
  answer = selection.word;
  categoryElement.textContent = selection.category;
  guessedLetters = new Set();
  wrongGuesses = 0;
  gameOver = false;
  result.hidden = true;
  status.textContent = "A new game has started.";
  renderWord();
  renderKeyboard();
  renderProgress();
}

keyboard.addEventListener("click", (event) => {
  const button = event.target.closest(".key");
  if (button) guess(button.dataset.letter);
});

document.addEventListener("keydown", (event) => {
  if (/^[a-z]$/i.test(event.key)) guess(event.key.toUpperCase());
});

newGameButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", startGame);

startGame();