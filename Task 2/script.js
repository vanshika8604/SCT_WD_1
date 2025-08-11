// Calculator Class - Handles all calculator functionality
class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    // Clear all values and reset calculator
    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetDisplay = false;
    }

    // Delete the last entered digit
    delete() {
        if (this.shouldResetDisplay) {
            this.currentOperand = '';
            this.shouldResetDisplay = false;
            return;
        }
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    // Add a number to the current operand
    appendNumber(number) {
        // Reset display if we just calculated a result
        if (this.shouldResetDisplay) {
            this.currentOperand = '';
            this.shouldResetDisplay = false;
        }
        
        // Prevent multiple decimal points
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // Handle leading zero
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    // Choose an operation (+, -, ×, ÷)
    chooseOperation(operation) {
        // If current operand is empty, just change the operation
        if (this.currentOperand === '') {
            if (this.previousOperand !== '') {
                this.operation = operation;
                return;
            }
            return;
        }

        // If there's a previous operand and operation, compute first
        if (this.previousOperand !== '' && this.operation != null) {
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    // Perform the calculation
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        // Check if both operands are valid numbers
        if (isNaN(prev) || isNaN(current)) return;

        // Perform calculation based on operation
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError('Cannot divide by zero');
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Handle very large or very small numbers
        if (!isFinite(computation)) {
            this.showError('Result too large');
            return;
        }

        // Round to prevent floating point errors
        computation = Math.round((computation + Number.EPSILON) * 100000000) / 100000000;

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetDisplay = true;
    }

    // Calculate percentage
    percentage() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        
        this.currentOperand = (current / 100).toString();
        this.shouldResetDisplay = true;
    }

    // Show error message
    showError(message) {
        this.currentOperand = message;
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetDisplay = true;
        
        // Add error styling
        this.currentOperandElement.parentElement.classList.add('error');
        setTimeout(() => {
            this.currentOperandElement.parentElement.classList.remove('error');
        }, 1000);
    }

    // Format number for display
    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;

        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    // Update the display
    updateDisplay() {
        if (this.currentOperand === '') {
            this.currentOperandElement.innerText = '0';
        } else {
            this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
        }

        if (this.operation != null) {
            this.previousOperandElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }
}

// DOM Elements
const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const equalsButton = document.querySelector('[data-action="equals"]');
const deleteButton = document.querySelector('[data-action="backspace"]');
const clearButton = document.querySelector('[data-action="clear"]');
const decimalButton = document.querySelector('[data-action="decimal"]');
const percentageButton = document.querySelector('[data-action="percentage"]');
const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');

// Initialize Calculator
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Button Event Listeners
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.number);
        calculator.updateDisplay();
        addRippleEffect(button);
    });
});

operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.operator);
        calculator.updateDisplay();
        addRippleEffect(button);
        highlightOperator(button);
    });
});

equalsButton.addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
    addRippleEffect(equalsButton);
    clearOperatorHighlight();
});

clearButton.addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
    addRippleEffect(clearButton);
    clearOperatorHighlight();
});

deleteButton.addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
    addRippleEffect(deleteButton);
});

decimalButton.addEventListener('click', () => {
    calculator.appendNumber('.');
    calculator.updateDisplay();
    addRippleEffect(decimalButton);
});

percentageButton.addEventListener('click', () => {
    calculator.percentage();
    calculator.updateDisplay();
    addRippleEffect(percentageButton);
});

// Keyboard Support
document.addEventListener('keydown', (e) => {
    // Prevent default behavior for calculator keys
    if (isCalculatorKey(e.key)) {
        e.preventDefault();
    }

    // Number keys (0-9)
    if (e.key >= '0' && e.key <= '9') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
        highlightButton(`[data-number="${e.key}"]`);
    }

    // Operator keys
    if (e.key === '+' || e.key === '-') {
        calculator.chooseOperation(e.key);
        calculator.updateDisplay();
        highlightButton(`[data-operator="${e.key}"]`);
        highlightOperator(document.querySelector(`[data-operator="${e.key}"]`));
    }

    if (e.key === '*') {
        calculator.chooseOperation('×');
        calculator.updateDisplay();
        highlightButton(`[data-operator="×"]`);
        highlightOperator(document.querySelector(`[data-operator="×"]`));
    }

    if (e.key === '/') {
        calculator.chooseOperation('÷');
        calculator.updateDisplay();
        highlightButton(`[data-operator="÷"]`);
        highlightOperator(document.querySelector(`[data-operator="÷"]`));
    }

    // Decimal point
    if (e.key === '.') {
        calculator.appendNumber('.');
        calculator.updateDisplay();
        highlightButton('[data-action="decimal"]');
    }

    // Equals (Enter or =)
    if (e.key === 'Enter' || e.key === '=') {
        calculator.compute();
        calculator.updateDisplay();
        highlightButton('[data-action="equals"]');
        clearOperatorHighlight();
    }

    // Clear (Escape or c)
    if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        calculator.clear();
        calculator.updateDisplay();
        highlightButton('[data-action="clear"]');
        clearOperatorHighlight();
    }

    // Backspace
    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
        highlightButton('[data-action="backspace"]');
    }

    // Percentage
    if (e.key === '%') {
        calculator.percentage();
        calculator.updateDisplay();
        highlightButton('[data-action="percentage"]');
    }
});

// Helper Functions

// Check if key is a calculator key
function isCalculatorKey(key) {
    const calculatorKeys = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '+', '-', '*', '/', '=', '.', 'Enter', 'Escape', 'Backspace', '%', 'c'
    ];
    return calculatorKeys.includes(key) || calculatorKeys.includes(key.toLowerCase());
}

// Add ripple effect to buttons
function addRippleEffect(button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = rect.width / 2 - size / 2;
    const y = rect.height / 2 - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Highlight button when pressed via keyboard
function highlightButton(selector) {
    const button = document.querySelector(selector);
    if (button) {
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 150);
    }
}

// Highlight active operator
function highlightOperator(operatorButton) {
    clearOperatorHighlight();
    if (operatorButton) {
        operatorButton.classList.add('active');
    }
}

// Clear operator highlight
function clearOperatorHighlight() {
    operatorButtons.forEach(button => {
        button.classList.remove('active');
    });
}

// Initialize display
calculator.updateDisplay();

// Add loading animation
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
});

// Handle window resize for responsive design
window.addEventListener('resize', () => {
    // Adjust font size for very small screens
    const calculator = document.querySelector('.calculator');
    const currentOperand = document.getElementById('current-operand');
    
    if (window.innerWidth < 320) {
        currentOperand.style.fontSize = '1.2rem';
    } else if (window.innerWidth < 480) {
        currentOperand.style.fontSize = '1.5rem';
    } else {
        currentOperand.style.fontSize = '2rem';
    }
});

// Prevent context menu on long press (mobile)
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('btn')) {
        e.preventDefault();
    }
});

// Add touch feedback for mobile
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('touchstart', () => {
        button.style.transform = 'scale(0.95)';
    });
    
    button.addEventListener('touchend', () => {
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    });
});

// Error handling for edge cases
window.addEventListener('error', (e) => {
    console.error('Calculator error:', e.error);
    calculator.showError('Error occurred');
});

// Performance optimization: Debounce rapid key presses
let keyPressTimeout;
document.addEventListener('keydown', (e) => {
    clearTimeout(keyPressTimeout);
    keyPressTimeout = setTimeout(() => {
        // Key press handling is already done above
    }, 10);
});