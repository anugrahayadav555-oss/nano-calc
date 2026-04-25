const currentOperandTextElement = document.getElementById('currentOperand');
const previousOperandTextElement = document.getElementById('previousOperand');
const historyListElement = document.getElementById('historyList');
const historyPanelElement = document.getElementById('historyPanel');

const numberButtons = document.querySelectorAll('.btn-number');
const operatorButtons = document.querySelectorAll('.btn-operator');
const actionButtons = document.querySelectorAll('.btn-action');
const equalsButton = document.querySelector('.btn-equals');

let currentOperand = '0';
let previousOperand = '';
let operation = undefined;
let shouldResetScreen = false;
let isError = false;

let historyEntries = [];
const MAX_HISTORY = 10;

function updateDisplay() {
    if (isError) {
        currentOperandTextElement.innerText = 'Error';
        previousOperandTextElement.innerText = '';
        return;
    }
    
    // Auto-resize font to fit
    if (currentOperand.length > 9) {
        currentOperandTextElement.style.fontSize = '2.5rem';
    } else if (currentOperand.length > 6) {
        currentOperandTextElement.style.fontSize = '3.5rem';
    } else {
        currentOperandTextElement.style.fontSize = '4.5rem';
    }

    currentOperandTextElement.innerText = formatNumber(currentOperand);
    
    if (operation != null) {
        let opSymbol = getOperatorSymbol(operation);
        previousOperandTextElement.innerText = `${formatNumber(previousOperand)} ${opSymbol}`;
    } else {
        previousOperandTextElement.innerText = '';
    }

    updateActiveOperator();
}

function updateActiveOperator() {
    operatorButtons.forEach(btn => {
        if (btn.dataset.operator === operation && !shouldResetScreen) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Keep active if we have previous operand and operator but waiting for current
    if (operation && shouldResetScreen && !isError) {
        const activeBtn = document.querySelector(`.btn-operator[data-operator="${operation}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }
}

function formatNumber(number) {
    if (number === '-' || number === '') return number;
    if (number.toString().includes('.')) {
        let parts = number.toString().split('.');
        // Limit decimal places logic could go here, but JS handles string representation mostly fine.
        return parseFloat(parts[0]).toLocaleString('en-US') + '.' + parts[1];
    }
    const floatNumber = parseFloat(number);
    if (isNaN(floatNumber)) return '';
    return floatNumber.toLocaleString('en-US');
}

function getOperatorSymbol(op) {
    switch (op) {
        case 'add': return '+';
        case 'subtract': return '−';
        case 'multiply': return '×';
        case 'divide': return '÷';
        default: return '';
    }
}

function clear() {
    currentOperand = '0';
    previousOperand = '';
    operation = undefined;
    isError = false;
    shouldResetScreen = false;
}

function appendNumber(number) {
    if (isError) clear();
    if (currentOperand === '0' && number !== '.') {
        currentOperand = '';
    }
    if (number === '.' && currentOperand.includes('.')) return;
    if (shouldResetScreen) {
        currentOperand = number.toString();
        shouldResetScreen = false;
    } else {
        // Prevent extremely long numbers
        if (currentOperand.length >= 15) return;
        currentOperand = currentOperand.toString() + number.toString();
    }
    if (currentOperand === '.') currentOperand = '0.';
}

function chooseOperation(op) {
    if (isError) clear();
    if (currentOperand === '' && previousOperand === '') return;
    if (previousOperand !== '' && currentOperand !== '' && !shouldResetScreen) {
        compute();
    }
    operation = op;
    if (currentOperand !== '') {
        previousOperand = currentOperand;
    }
    shouldResetScreen = true;
}

function safeFloat(str) {
    if (str === '' || str === undefined) return 0;
    return parseFloat(str);
}

function compute() {
    let computation;
    const prev = safeFloat(previousOperand);
    const current = safeFloat(currentOperand);
    if (isNaN(prev) || isNaN(current)) return;

    if (operation === 'divide' && current === 0) {
        isError = true;
        operation = undefined;
        previousOperand = '';
        return;
    }

    switch (operation) {
        case 'add':
            computation = prev + current;
            break;
        case 'subtract':
            computation = prev - current;
            break;
        case 'multiply':
            computation = prev * current;
            break;
        case 'divide':
            computation = prev / current;
            break;
        default:
            return;
    }

    // Fix floating point issues
    computation = Math.round(computation * 1e10) / 1e10;

    let opSymbol = getOperatorSymbol(operation);
    let expr = `${formatNumber(prev)} ${opSymbol} ${formatNumber(current)}`;
    let res = formatNumber(computation.toString());
    
    addToHistory(expr, res);

    currentOperand = computation.toString();
    operation = undefined;
    previousOperand = '';
    shouldResetScreen = true;
}

function handleAction(action) {
    if (isError && action !== 'clear') return;

    let current = safeFloat(currentOperand);

    if (action === 'clear') {
        clear();
    } else if (action === 'percent') {
        currentOperand = (current / 100).toString();
        shouldResetScreen = true;
    } else if (action === 'sqrt') {
        if (current < 0) {
            isError = true;
        } else {
            currentOperand = Math.sqrt(current).toString();
            // Fix long floats limit
            currentOperand = (Math.round(parseFloat(currentOperand) * 1e10) / 1e10).toString();
            shouldResetScreen = true;
        }
    } else if (action === 'fraction') {
        if (current === 0) {
            isError = true;
        } else {
            currentOperand = (1 / current).toString();
            currentOperand = (Math.round(parseFloat(currentOperand) * 1e10) / 1e10).toString();
            shouldResetScreen = true;
        }
    }
}

function addToHistory(expr, res) {
    if (historyEntries.length >= MAX_HISTORY) {
        // Reset history completely on 11th entry
        historyEntries = [];
        historyListElement.innerHTML = '';
    }
    
    historyEntries.push({ expr, res });
    
    const div = document.createElement('div');
    div.classList.add('history-item');
    div.innerHTML = `
        <div class="history-expr">${expr} =</div>
        <div class="history-res">${res}</div>
    `;
    historyListElement.appendChild(div);
    
    // Auto scroll to bottom
    historyListElement.scrollTop = historyListElement.scrollHeight;
}

// Event Listeners
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        appendNumber(button.dataset.number);
        updateDisplay();
    });
});

operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        chooseOperation(button.dataset.operator);
        updateDisplay();
    });
});

actionButtons.forEach(button => {
    button.addEventListener('click', () => {
        handleAction(button.dataset.action);
        updateDisplay();
    });
});

equalsButton.addEventListener('click', () => {
    compute();
    updateDisplay();
});

// Keyboard Support
document.addEventListener('keydown', e => {
    // Prevent default actions for keys we map (except F5 etc)
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === 'BUTTON') {
        activeElement.blur(); // Remove focus so Enter doesn't trigger last clicked button
    }

    if (e.key >= '0' && e.key <= '9') {
        appendNumber(e.key);
        updateDisplay();
    }
    if (e.key === '.') {
        appendNumber('.');
        updateDisplay();
    }
    if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault();
        compute();
        updateDisplay();
    }
    if (e.key === 'Backspace') {
        e.preventDefault();
        if (isError) {
            clear();
        } else {
            currentOperand = currentOperand.toString().slice(0, -1);
            if (currentOperand === '') currentOperand = '0';
        }
        updateDisplay();
    }
    if (e.key === 'Escape') {
        clear();
        updateDisplay();
    }
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        e.preventDefault();
        let opMap = {
            '+': 'add',
            '-': 'subtract',
            '*': 'multiply',
            '/': 'divide'
        };
        chooseOperation(opMap[e.key]);
        updateDisplay();
    }
});

// Initial Setup
updateDisplay();
// Register PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.error('Service Worker registration failed', err));
    });
}
