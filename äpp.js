// === Koodiracer – Monkeytype stiilis koodimäng ===

// DOM elemendid
const textDisplay = document.getElementById("textDisplay");
const hiddenInput = document.getElementById("hiddenInput");
const restartBtn = document.getElementById("restartBtn");
const wpmSpan = document.getElementById("wpm");
const accuracySpan = document.getElementById("accuracy");
const errorsSpan = document.getElementById("errors");
const lineNumbers = document.getElementById("lineNumbers");
const languageTag = document.getElementById("languageTag");
const snippetInfo = document.getElementById("snippetInfo");
const snippetTitle = document.getElementById("snippetTitle");
const timeSpan = document.getElementById("time");

// start-ekraan + mängukast
const gameStart = document.getElementById("gameStart");
const gameContainer = document.getElementById("gameContainer");
const startGameBtn = document.getElementById("startGameBtn");

// finiši overlay elemendid
const resultOverlay = document.getElementById("resultOverlay");
const finalTimeSpan = document.getElementById("finalTime");
const finalWpmSpan = document.getElementById("finalWpm");
const finalAccuracySpan = document.getElementById("finalAccuracy");
const finalErrorsSpan = document.getElementById("finalErrors");
const playAgainBtn = document.getElementById("playAgainBtn");

// mängu olek
let startTime = null;
let correctChars = 0;
let totalTyped = 0;
let errors = 0;
let currentSnippet = null;
let caretSpan = null;
let isFinished = false;
let timerInterval = null;

// 6 koodijuppi (3x Python, 3x JS)
const snippets = [
  {
    id: "py-greet",
    language: "Python",
    title: "Tervituste funktsioon",
    code: `def greet(name):
    print("Tere,", name)

for user in ["Anna", "Mark"]:
    greet(user)`
  },
  {
    id: "py-squared",
    language: "Python",
    title: "Ruudud listist",
    code: `numbers = [1, 2, 3, 4]
squared = []

for n in numbers:
    squared.append(n * n)

print(squared)`
  },
  {
    id: "py-factorial",
    language: "Python",
    title: "Faktoriaali arvutamine",
    code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))`
  },
  {
    id: "js-users",
    language: "JavaScript",
    title: "Massiivi itereerimine",
    code: `const users = ["Anna", "Mark"];

users.forEach((user) => {
  console.log("Tere,", user);
});`
  },
  {
    id: "js-sum",
    language: "JavaScript",
    title: "Liitmise funktsioon",
    code: `function sum(a, b) {
  return a + b;
}

console.log(sum(2, 5));`
  },
  {
    id: "js-todos",
    language: "JavaScript",
    title: "Lihtne to-do tsükkel",
    code: `const todos = ["koodi", "katseta", "korda"];

for (const item of todos) {
  console.log("- " + item);
}`
  }
];

// --- stopperi abifunktsioonid ---
function formatTime(ms) {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  const secString = seconds.toFixed(2).padStart(5, "0"); // nt "03.45"
  const minString = String(minutes).padStart(2, "0");
  return `${minString}:${secString}`;
}

function updateTimer() {
  if (!startTime || !timeSpan) return;
  const elapsedMs = new Date() - startTime;
  timeSpan.textContent = formatTime(elapsedMs);
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 50);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// --- snippet'i valik ja kuvamine ---
function pickRandomSnippet() {
  const index = Math.floor(Math.random() * snippets.length);
  currentSnippet = snippets[index];
}

function updateCaretPosition(position) {
  if (!caretSpan) {
    caretSpan = document.createElement("span");
    caretSpan.classList.add("caret");
  }

  if (caretSpan.parentNode) {
    caretSpan.parentNode.removeChild(caretSpan);
  }

  const codeSpans = textDisplay.querySelectorAll("span.code-char");
  const maxPos = codeSpans.length;

  if (maxPos === 0) {
    textDisplay.appendChild(caretSpan);
    return;
  }

  if (position <= 0) {
    textDisplay.insertBefore(caretSpan, codeSpans[0]);
  } else if (position >= maxPos) {
    textDisplay.appendChild(caretSpan);
  } else {
    textDisplay.insertBefore(caretSpan, codeSpans[position]);
  }
}

function renderSnippet() {
  textDisplay.innerHTML = "";
  const code = currentSnippet.code;

  code.split("").forEach((char) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.classList.add("code-char");
    textDisplay.appendChild(span);
  });

  updateLineNumbers();
  updateSnippetMeta();
  updateCaretPosition(0);
}

function updateSnippetMeta() {
  if (!currentSnippet) return;

  const lines = currentSnippet.code.split("\n").length;

  if (languageTag) languageTag.textContent = currentSnippet.language;
  if (snippetInfo) snippetInfo.textContent = `${lines} rida`;
  if (snippetTitle) snippetTitle.textContent = currentSnippet.title;
}

// --- statistika (WPM loogika) ---
function computeStats() {
  const elapsedMinutes = startTime
    ? (new Date() - startTime) / 1000 / 60
    : 0;

  // WPM = õigesti kirjutatud tähemärgid / 5 / minutites
  const words = correctChars / 5;
  const wpm = elapsedMinutes > 0 ? Math.round(words / elapsedMinutes) : 0;

  const accuracy =
    totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

  return { wpm, accuracy };
}

function updateStats() {
  const { wpm, accuracy } = computeStats();
  if (wpmSpan) wpmSpan.textContent = `${wpm} WPM`;
  if (accuracySpan) accuracySpan.textContent = `${accuracy}% täpsus`;
  if (errorsSpan) errorsSpan.textContent = `${errors} viga`;
}

// --- finiši overlay ---
function hideResultOverlay() {
  if (!resultOverlay) return;
  resultOverlay.classList.add("hidden");
  resultOverlay.setAttribute("aria-hidden", "true");
  textDisplay.classList.remove("finished");
}

function finishGame() {
  if (isFinished) return;
  isFinished = true;

  stopTimer();

  if (startTime && timeSpan) {
    const elapsedMs = new Date() - startTime;
    timeSpan.textContent = formatTime(elapsedMs);
  }

  const { wpm, accuracy } = computeStats();

  if (finalWpmSpan) finalWpmSpan.textContent = String(wpm);
  if (finalAccuracySpan) finalAccuracySpan.textContent = String(accuracy);
  if (finalErrorsSpan) finalErrorsSpan.textContent = String(errors);
  if (finalTimeSpan && timeSpan) finalTimeSpan.textContent = timeSpan.textContent;

  if (resultOverlay) {
    resultOverlay.classList.remove("hidden");
    resultOverlay.setAttribute("aria-hidden", "false");
  }

  textDisplay.classList.add("finished");
  hiddenInput.blur();
}

// --- mängu reset / algus ---
function loadText() {
  pickRandomSnippet();
  renderSnippet();

  hiddenInput.value = "";
  startTime = null;
  correctChars = 0;
  totalTyped = 0;
  errors = 0;
  isFinished = false;

  stopTimer();
  if (timeSpan) timeSpan.textContent = "00:00.00";
  updateStats();
  hideResultOverlay();
  hiddenInput.focus();
}

function showGame() {
  if (gameStart) gameStart.classList.add("hidden");
  if (gameContainer) gameContainer.classList.remove("hidden");
  loadText();
}

// --- sisestus ---
hiddenInput.addEventListener("input", () => {
  if (!currentSnippet || isFinished) return;

  const input = hiddenInput.value;
  const characters = textDisplay.querySelectorAll("span.code-char");
  const target = currentSnippet.code;

  totalTyped = input.length;

  if (!startTime && totalTyped > 0) {
    startTime = new Date();
    startTimer();
  }

  correctChars = 0;
  errors = 0;

  characters.forEach((span, index) => {
    const expectedChar = target[index];
    const typedChar = input[index];

    if (typedChar == null) {
      span.classList.remove("correct", "incorrect");
    } else if (typedChar === expectedChar) {
      span.classList.add("correct");
      span.classList.remove("incorrect");
      correctChars++;
    } else {
      span.classList.add("incorrect");
      span.classList.remove("correct");
      errors++;
    }
  });

  updateStats();
  updateCaretPosition(totalTyped);

  if (input.length === target.length && errors === 0) {
    finishGame();
  }
});

// Tab: viib indent'i täpselt rea esimese sümbolini
hiddenInput.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();

    if (!currentSnippet || isFinished) return;

    const value = hiddenInput.value;
    const cursor = hiddenInput.selectionStart;

    const beforeCursor = value.slice(0, cursor);
    const currentLineIndex = beforeCursor.split("\n").length - 1;

    const snippetLines = currentSnippet.code.split("\n");
    const snippetLine = snippetLines[currentLineIndex] || "";

    const targetIndentMatch = snippetLine.match(/^(\s*)/);
    const targetIndent = targetIndentMatch ? targetIndentMatch[1].length : 0;

    const lineStartIndex = beforeCursor.lastIndexOf("\n") + 1;
    const lineSoFar = value.slice(lineStartIndex, cursor);
    const currentIndentMatch = lineSoFar.match(/^(\s*)/);
    const currentIndent = currentIndentMatch ? currentIndentMatch[1].length : 0;

    const remaining = targetIndent - currentIndent;
    if (remaining <= 0) return;

    const indentStr = " ".repeat(remaining);

    hiddenInput.value =
      value.slice(0, cursor) + indentStr + value.slice(cursor);

    const newPos = cursor + indentStr.length;
    hiddenInput.selectionStart = hiddenInput.selectionEnd = newPos;

    hiddenInput.dispatchEvent(new Event("input"));
  }
});

// klikk tekstialale → fookus textarea peale
textDisplay.addEventListener("click", () => {
  hiddenInput.focus();
});

// reanumbrid
function updateLineNumbers() {
  const lines = textDisplay.textContent.split("\n").length || 1;
  let html = "";
  for (let i = 1; i <= lines; i++) {
    html += i + "\n";
  }
  lineNumbers.textContent = html;
}

const observer = new MutationObserver(updateLineNumbers);
observer.observe(textDisplay, {
  childList: true,
  subtree: true,
  characterData: true
});

// nupud
if (restartBtn) restartBtn.addEventListener("click", loadText);
if (playAgainBtn) playAgainBtn.addEventListener("click", loadText);
if (startGameBtn) startGameBtn.addEventListener("click", showGame);

// lehe laadimisel – vaid overlay peitmine ja reanumbrid algseisus
window.addEventListener("load", () => {
  hideResultOverlay();
  updateLineNumbers();
});
