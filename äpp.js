// === Koodiracer – mängu loogika + rea numbrid ===

// Elementide viited
const textDisplay = document.getElementById("textDisplay");
const hiddenInput = document.getElementById("hiddenInput");
const restartBtn = document.getElementById("restartBtn");
const wpmSpan = document.getElementById("wpm");
const accuracySpan = document.getElementById("accuracy");
const errorsSpan = document.getElementById("errors");
const lineNumbers = document.getElementById("lineNumbers");

let startTime = null;
let correctChars = 0;
let totalTyped = 0;
let errors = 0;
let timerInterval = null;

// --- Näidis tekst, kuni lisad dünaamilise sõnade valiku ---
const sampleCode = `for i in range(5):
    print("Tere maailm!")
print("Koodiracer!")`;

// Teksti kuvamine mängualal
function loadText() {
  textDisplay.innerHTML = "";
  sampleCode.split("").forEach(char => {
    const span = document.createElement("span");
    span.textContent = char;
    textDisplay.appendChild(span);
  });
  hiddenInput.value = "";
  startTime = null;
  correctChars = 0;
  totalTyped = 0;
  errors = 0;
  updateStats();
  updateLineNumbers();
}

// Reaalne mänguloogika
hiddenInput.addEventListener("input", () => {
  const input = hiddenInput.value;
  const characters = textDisplay.querySelectorAll("span");

  totalTyped = input.length;
  if (!startTime) startTime = new Date();

  let allCorrect = true;
  correctChars = 0;
  errors = 0;

  characters.forEach((span, index) => {
    const typedChar = input[index];
    if (typedChar == null) {
      span.classList.remove("correct", "incorrect");
      allCorrect = false;
    } else if (typedChar === span.textContent) {
      span.classList.add("correct");
      span.classList.remove("incorrect");
      correctChars++;
    } else {
      span.classList.add("incorrect");
      span.classList.remove("correct");
      errors++;
      allCorrect = false;
    }
  });

  updateStats();

  if (allCorrect && input.length === sampleCode.length) {
    clearInterval(timerInterval);
  }
});

// WPM ja täpsus
function updateStats() {
  const elapsed = startTime ? (new Date() - startTime) / 1000 / 60 : 0;
  const wpm = elapsed > 0 ? Math.round((correctChars / 5) / elapsed) : 0;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
  wpmSpan.textContent = `${wpm} WPM`;
  accuracySpan.textContent = `${accuracy}% täpsus`;
  errorsSpan.textContent = `${errors} viga`;
}

// --- Reanumbrite uuendamine ---
function updateLineNumbers() {
  const lines = textDisplay.textContent.split("\n").length || 1;
  let html = "";
  for (let i = 1; i <= lines; i++) html += i + "\n";
  lineNumbers.textContent = html;
}

const observer = new MutationObserver(updateLineNumbers);
observer.observe(textDisplay, { childList: true, subtree: true, characterData: true });

// --- Restart ---
restartBtn.addEventListener("click", loadText);

// --- Algkäivitus ---
window.addEventListener("load", loadText);
updateLineNumbers();
