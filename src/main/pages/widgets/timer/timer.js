/**
 * Countdown Timer Widget
 * Allows users to set a countdown timer with hours, minutes, and seconds.
 */
debug.log("Timer widget loaded");
{
const parentDiv = document.currentScript.parentElement;
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);
const widgetId = url.searchParams.get('id') || 'timer-default';

let timerInterval = null;
let remainingSeconds = 0;
let isRunning = false;

// Create container
const container = document.createElement('div');
container.style.cssText = `
  font-family: Arial, sans-serif;
  max-width: 400px;
  margin: 20px;
  background-color: var(--s-col);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
`;

// Create title
const title = document.createElement('h3');
title.textContent = 'Countdown Timer';
title.style.cssText = `
  margin: 0 0 20px 0;
  color: var(--t-col);
  font-size: 24px;
`;

// Create time inputs container
const inputsContainer = document.createElement('div');
inputsContainer.style.cssText = `
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
`;

// Create time inputs
const createTimeInput = (placeholder, max) => {
  const input = document.createElement('input');
  input.type = 'number';
  input.placeholder = placeholder;
  input.min = '0';
  input.max = max;
  input.value = '0';
  input.style.cssText = `
    width: 70px;
    padding: 10px;
    font-size: 18px;
    text-align: center;
    border: 2px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
    color: #333;
  `;
  return input;
};

const hoursInput = createTimeInput('HH', '23');
const minutesInput = createTimeInput('MM', '59');
const secondsInput = createTimeInput('SS', '59');

inputsContainer.appendChild(hoursInput);
inputsContainer.appendChild(minutesInput);
inputsContainer.appendChild(secondsInput);

// Create display
const display = document.createElement('div');
display.textContent = '00:00:00';
display.style.cssText = `
  font-size: 48px;
  font-weight: bold;
  color: var(--t-col);
  margin: 20px 0;
  font-family: 'Courier New', monospace;
`;

// Create buttons container
const buttonsContainer = document.createElement('div');
buttonsContainer.style.cssText = `
  display: flex;
  gap: 10px;
  justify-content: center;
`;

// Create buttons
const startButton = document.createElement('button');
startButton.textContent = 'Start';
startButton.style.cssText = `
  padding: 12px 30px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
`;

const pauseButton = document.createElement('button');
pauseButton.textContent = 'Pause';
pauseButton.disabled = true;
pauseButton.style.cssText = `
  padding: 12px 30px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  opacity: 0.5;
`;

const resetButton = document.createElement('button');
resetButton.textContent = 'Reset';
resetButton.style.cssText = `
  padding: 12px 30px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
`;

buttonsContainer.appendChild(startButton);
buttonsContainer.appendChild(pauseButton);
buttonsContainer.appendChild(resetButton);

// Append elements
container.appendChild(title);
container.appendChild(inputsContainer);
container.appendChild(display);
container.appendChild(buttonsContainer);
parentDiv.appendChild(container);

// Format time display
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Update display
function updateDisplay() {
  display.textContent = formatTime(remainingSeconds);
}

// Start timer
function startTimer() {
  if (!isRunning) {
    if (remainingSeconds === 0) {
      const hours = parseInt(hoursInput.value) || 0;
      const minutes = parseInt(minutesInput.value) || 0;
      const seconds = parseInt(secondsInput.value) || 0;
      remainingSeconds = hours * 3600 + minutes * 60 + seconds;

      if (remainingSeconds === 0) return;
    }

    isRunning = true;
    startButton.disabled = true;
    startButton.style.opacity = '0.5';
    pauseButton.disabled = false;
    pauseButton.style.opacity = '1';
    hoursInput.disabled = true;
    minutesInput.disabled = true;
    secondsInput.disabled = true;

    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateDisplay();

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        startButton.disabled = false;
        startButton.style.opacity = '1';
        pauseButton.disabled = true;
        pauseButton.style.opacity = '0.5';
        display.style.color = '#f44336';

        // Play notification (visual only in extension)
        setTimeout(() => {
          display.style.color = 'var(--t-col)';
        }, 3000);
      }
    }, 1000);
  }
}

// Pause timer
function pauseTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  startButton.disabled = false;
  startButton.style.opacity = '1';
  pauseButton.disabled = true;
  pauseButton.style.opacity = '0.5';
}

// Reset timer
function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  remainingSeconds = 0;
  updateDisplay();
  startButton.disabled = false;
  startButton.style.opacity = '1';
  pauseButton.disabled = true;
  pauseButton.style.opacity = '0.5';
  hoursInput.disabled = false;
  minutesInput.disabled = false;
  secondsInput.disabled = false;
  hoursInput.value = '0';
  minutesInput.value = '0';
  secondsInput.value = '0';
  display.style.color = 'var(--t-col)';
}

// Event listeners
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

// Hover effects
startButton.addEventListener('mouseenter', () => {
  if (!startButton.disabled) startButton.style.backgroundColor = '#45a049';
});
startButton.addEventListener('mouseleave', () => {
  startButton.style.backgroundColor = '#4CAF50';
});

pauseButton.addEventListener('mouseenter', () => {
  if (!pauseButton.disabled) pauseButton.style.backgroundColor = '#e68900';
});
pauseButton.addEventListener('mouseleave', () => {
  pauseButton.style.backgroundColor = '#ff9800';
});

resetButton.addEventListener('mouseenter', () => {
  resetButton.style.backgroundColor = '#da190b';
});
resetButton.addEventListener('mouseleave', () => {
  resetButton.style.backgroundColor = '#f44336';
});

}
