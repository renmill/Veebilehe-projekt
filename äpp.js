const textDisplay = document.getElementById('textDisplay');
const hiddenInput = document.getElementById('hiddenInput');
const restartBtn = document.getElementById('restartBtn');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const errorsEl = document.getElementById('errors');
let caret = document.createElement('span');

caret.className = 'caret';

const text = "See siin on ainult test tekst, päris teksti(kood) tuleb siis kui see näide töötab 100%.";

let startTime = null;
let finished = false;

function renderText() {
    textDisplay.innerHTML = '';
    for (const ch of text) {
        const span = document.createElement('span');
        span.textContent = ch;
        textDisplay.appendChild(span);
    }
}

function reset() {
    startTime = null;
    finished = false;
    hiddenInput.value = '';
    renderText();
    wpmEl.textContent = '0 WPM';
    accuracyEl.textContent = '100% täpsus';
    errorsEl.textContent = '0 viga';
}

let x = 0;

function updateTyping() {
    const input = hiddenInput.value;
    const chars = textDisplay.querySelectorAll('span');

    let correct = 0;
    let wrong = 0;

    // console.log(input.length, Array.from(textDisplay.querySelectorAll('span.correct, span.incorrect')).length);

    if (startTime === null && `input.length` > 0) {console.log("here");startTime = Date.now()};
    // remove old caret before inserting again
    caret.remove();
    // console.log("caret asukoht", input.length)
    if (input.length >= Array.from(textDisplay.querySelectorAll('span.correct, span.incorrect')).length) {
        // place caret at end
        textDisplay.insertBefore(caret, textDisplay.children[input.length+1]);

    } else {
        // place caret before the char at index
        textDisplay.insertBefore(caret, textDisplay.children[input.length-1]);
    }
     
    console.log(input);
    console.log("typedChar", input[input.length - 1]);
    chars.forEach((span, i) => {
        const typedChar = input[i];
        
        span.classList.remove('correct', 'incorrect');
        console.log(span)
        if (typedChar == null) { return };
        if (typedChar === span.textContent) {
            span.classList.add('correct');
            correct++;
        } else {
            span.classList.add('incorrect');
            wrong++;
        }

    });
    



    const elapsed = Math.floor((Date.now() - startTime) / 1000 );
    const wpm = correct ? Math.round((input.length / 5) / elapsed) : 0;
    const accuracy = input.length ? Math.round((correct / input.length) * 100) : 100;

    wpmEl.textContent = `${wpm} WPM`;
    accuracyEl.textContent = `${accuracy}% täpsus`;
    errorsEl.textContent = `${wrong} viga`;

    if (input.length === text.length && !finished) {
        finished = true;
        hiddenInput.blur();
        caret.remove();
        textDisplay.insertAdjacentHTML('beforeend', `<div style="margin-top:10px;color:var(--muted)">Valmis!</div>`);
    }
}

// hoiame textDisplay fookuses
textDisplay.addEventListener('click', () => hiddenInput.focus());
hiddenInput.addEventListener('input', updateTyping);
restartBtn.addEventListener('click', reset);

reset();
