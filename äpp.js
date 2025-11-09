// === Koodiracer – mängu loogika ja rea numbrite süsteem ===

// --- Elementide viited HTML-ist ---
const textDisplay = document.getElementById("textDisplay"); // ala, kus kuvatakse tekst
const hiddenInput = document.getElementById("hiddenInput"); // kasutaja sisestus (nähtamatu)
const restartBtn = document.getElementById("restartBtn");
const wpmSpan = document.getElementById("wpm");
const accuracySpan = document.getElementById("accuracy");
const errorsSpan = document.getElementById("errors");
const lineNumbers = document.getElementById("lineNumbers"); // rea numbrite veerg

let startTime = null;
let correctChars = 0;
let totalTyped = 0;
let errors = 0;
let timerInterval = null;

const sampleCode = `for i in range(5):
    print("Tere maailm!")
print("Koodiracer!")`;

function loadText() {
  textDisplay.innerHTML = ""; // puhasta ala
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
  updateLineNumbers(); // kuvab õiged reanumbrid alguses
}

// --- kasutaja sisestuse funk ---
hiddenInput.addEventListener("input", () => {
  const input = hiddenInput.value;
  const characters = textDisplay.querySelectorAll("span");

  totalTyped = input.length;
  if (!startTime) startTime = new Date(); // taimeri käivitus esimesel klahvivajutusel

  correctChars = 0;
  errors = 0;

  // iga sisestatud tähemärgi kontroll
  characters.forEach((span, index) => {
    const typedChar = input[index];
    if (typedChar == null) {
      span.classList.remove("correct", "incorrect");
    } else if (typedChar === span.textContent) {
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

  if (input.length === sampleCode.length && errors === 0) {
    clearInterval(timerInterval);
  }
});

// --- uuendab WPM, täpsust ja vigade arvu ---
function updateStats() {
  const elapsed = startTime ? (new Date() - startTime) / 1000 / 60 : 0; // minutites
  const wpm = elapsed > 0 ? Math.round((correctChars / 5) / elapsed) : 0;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

  wpmSpan.textContent = `${wpm} WPM`;
  accuracySpan.textContent = `${accuracy}% täpsus`;
  errorsSpan.textContent = `${errors} viga`;
}

// === Rea numbrite süsteem ===

// Funktsioon: loendab, mitu reavahetust tekstis on, ja kuvab need vasakul
function updateLineNumbers() {
  // Kui tekst on tühi, kuvame vähemalt ühe rea
  const lines = textDisplay.textContent.split("\n").length || 1;
  let html = "";
  for (let i = 1; i <= lines; i++) html += i + "\n";
  lineNumbers.textContent = html;
}

const observer = new MutationObserver(updateLineNumbers);
observer.observe(textDisplay, { childList: true, subtree: true, characterData: true });

// --- Nupp “Taaskäivita” ---
restartBtn.addEventListener("click", loadText);

// --- Lehe avamisel ---
window.addEventListener("load", loadText);
updateLineNumbers();
