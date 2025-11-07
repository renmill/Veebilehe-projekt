const textDisplay = document.getElementById('textDisplay');
const hiddenInput = document.getElementById('hiddenInput');
const restartBtn = document.getElementById('restartBtn');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const errorsEl = document.getElementById('errors');
let caret = document.createElement('span');

caret.className = 'caret';

const text = `\nfunction randomGreeting() {\n\tconst index = Math.floor(Math.random() * greetings.length);\n\treturn greetings[index];\n}\n\nconsole.log(randomGreeting());\n";`;

let startTime = null;
let finished = false;

function renderText() {
    textDisplay.innerHTML = '';
    for (const ch of text) {
        const span = document.createElement('span');

        if (ch === '\n') {
            span.className = 'newline';
            span.textContent = '\n';
        } else if (ch === '\t') {
            span.textContent = '\t';
        } else {
            span.textContent = ch;
        }

        textDisplay.appendChild(span);
    }
    // after rendering text, try to adjust font size to fit the container
    adjustFontSizeToFit();
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


function updateTyping() {
    const input = hiddenInput.value;
    const chars = textDisplay.querySelectorAll('span:not(.caret)'); // mine putsi kui kaua aega mul läks et aru saada, et see ongi kurja juur.

    let correct = 0;
    let wrong = 0;

    chars.forEach((span, i) => {
        const typedChar = input[i];

        span.classList.remove('correct', 'incorrect');
        if (typedChar == null) { return }
        else if (typedChar === span.textContent) {
            span.classList.add('correct');
            correct++;
        } else {
            span.classList.add('incorrect');
            wrong++;
        }

    });

    if (startTime === null && input.length > 0) {
        startTime = Date.now();
    }

    caret.remove();
    const caretIndex = Math.min(input.length, chars.length);
    if (chars[caretIndex]) {
        textDisplay.insertBefore(caret, chars[caretIndex]);
    } else {
        textDisplay.appendChild(caret);
    }




    console.log(input);
    console.log("typedChar", input[input.length - 1]);



    const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const wpm = elapsed > 0 ? Math.round((input.length / 5) / elapsed) : 0;
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

function adjustFontSizeToFit() {
    const el = textDisplay;
    const cs = window.getComputedStyle(el);
    let fontSize = parseFloat(cs.fontSize);
    const minFont = 10; // don't go smaller than 10px
    el.style.fontSize = fontSize + 'px';

    let attempts = 0;
    while ((el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) && fontSize > minFont && attempts < 40) {
        fontSize -= 1;
        el.style.fontSize = fontSize + 'px';
        attempts++;
    }
}

hiddenInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const start = hiddenInput.selectionStart;
        const end = hiddenInput.selectionEnd;
        hiddenInput.value = hiddenInput.value.slice(0, start) + '\n' + hiddenInput.value.slice(end);
        hiddenInput.selectionStart = hiddenInput.selectionEnd = start + 1;
        updateTyping();
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const start = hiddenInput.selectionStart;
        const end = hiddenInput.selectionEnd;
        hiddenInput.value = hiddenInput.value.slice(0, start) + '\t' + hiddenInput.value.slice(end);
        hiddenInput.selectionStart = hiddenInput.selectionEnd = start + 1;
        updateTyping();
    }
});


window.addEventListener('resize', () => adjustFontSizeToFit());

// hoiame textDisplay fookuses
textDisplay.addEventListener('click', () => hiddenInput.focus());
hiddenInput.addEventListener('input', updateTyping);
restartBtn.addEventListener('click', reset);

reset();
