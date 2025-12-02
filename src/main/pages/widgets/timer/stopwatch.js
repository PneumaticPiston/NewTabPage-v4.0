/**
 * Stopwatch Widget
 * Allows users to track elapsed time with lap functionality.
 */
debug.log("Stopwatch widget loaded");
{
const parentDiv = document.currentScript.parentElement;
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);
const widgetId = url.searchParams.get('id') || 'stopwatch-default';

let stopwatchInterval = null;
let elapsedMilliseconds = 0;
let isRunning = false;
let laps = [];

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
title.textContent = 'Stopwatch';
title.style.cssText = `
  margin: 0 0 20px 0;
  color: var(--t-col);
  font-size: 24px;
`;

// Create display
const display = document.createElement('div');
display.textContent = '00:00:00.000';
display.style.cssText = `
  font-size: 42px;
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
  margin-bottom: 20px;
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

const stopButton = document.createElement('button');
stopButton.textContent = 'Stop';
stopButton.disabled = true;
stopButton.style.cssText = `
  padding: 12px 30px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  opacity: 0.5;
`;

const lapButton = document.createElement('button');
lapButton.textContent = 'Lap';
lapButton.disabled = true;
lapButton.style.cssText = `
  padding: 12px 30px;
  background-color: #2196F3;
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
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
`;

buttonsContainer.appendChild(startButton);
buttonsContainer.appendChild(stopButton);
buttonsContainer.appendChild(lapButton);
buttonsContainer.appendChild(resetButton);

// Create laps container
const lapsContainer = document.createElement('div');
lapsContainer.style.cssText = `
  max-height: 200px;
  overflow-y: auto;
  margin-top: 20px;
  text-align: left;
`;

const lapsTitle = document.createElement('h4');
lapsTitle.textContent = 'Laps';
lapsTitle.style.cssText = `
  color: var(--t-col);
  font-size: 16px;
  margin: 0 0 10px 0;
  text-align: center;
`;

const lapsList = document.createElement('div');

lapsContainer.appendChild(lapsTitle);
lapsContainer.appendChild(lapsList);

// Append elements
container.appendChild(title);
container.appendChild(display);
container.appendChild(buttonsContainer);
container.appendChild(lapsContainer);
parentDiv.appendChild(container);

// Format time display
function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const ms = milliseconds % 1000;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

// Update display
function updateDisplay() {
  display.textContent = formatTime(elapsedMilliseconds);
}

// Start stopwatch
function startStopwatch() {
  if (!isRunning) {
    isRunning = true;
    const startTime = Date.now() - elapsedMilliseconds;

    stopwatchInterval = setInterval(() => {
      elapsedMilliseconds = Date.now() - startTime;
      updateDisplay();
    }, 10);

    startButton.disabled = true;
    startButton.style.opacity = '0.5';
    stopButton.disabled = false;
    stopButton.style.opacity = '1';
    lapButton.disabled = false;
    lapButton.style.opacity = '1';
  }
}

// Stop stopwatch
function stopStopwatch() {
  if (isRunning) {
    clearInterval(stopwatchInterval);
    isRunning = false;
    startButton.disabled = false;
    startButton.style.opacity = '1';
    stopButton.disabled = true;
    stopButton.style.opacity = '0.5';
    lapButton.disabled = true;
    lapButton.style.opacity = '0.5';
  }
}

// Record lap
function recordLap() {
  if (isRunning) {
    laps.push(elapsedMilliseconds);
    updateLapsList();
  }
}

// Update laps list
function updateLapsList() {
  lapsList.innerHTML = '';
  laps.forEach((lapTime, index) => {
    const lapItem = document.createElement('div');
    lapItem.textContent = `Lap ${index + 1}: ${formatTime(lapTime)}`;
    lapItem.style.cssText = `
      padding: 8px;
      margin: 5px 0;
      background-color: rgba(255,255,255,0.5);
      border-radius: 5px;
      font-family: 'Courier New', monospace;
      color: #333;
    `;
    lapsList.appendChild(lapItem);
  });
}

// Reset stopwatch
function resetStopwatch() {
  clearInterval(stopwatchInterval);
  isRunning = false;
  elapsedMilliseconds = 0;
  laps = [];
  updateDisplay();
  updateLapsList();
  startButton.disabled = false;
  startButton.style.opacity = '1';
  stopButton.disabled = true;
  stopButton.style.opacity = '0.5';
  lapButton.disabled = true;
  lapButton.style.opacity = '0.5';
}

// Event listeners
startButton.addEventListener('click', startStopwatch);
stopButton.addEventListener('click', stopStopwatch);
lapButton.addEventListener('click', recordLap);
resetButton.addEventListener('click', resetStopwatch);

// Hover effects
startButton.addEventListener('mouseenter', () => {
  if (!startButton.disabled) startButton.style.backgroundColor = '#45a049';
});
startButton.addEventListener('mouseleave', () => {
  startButton.style.backgroundColor = '#4CAF50';
});

stopButton.addEventListener('mouseenter', () => {
  if (!stopButton.disabled) stopButton.style.backgroundColor = '#da190b';
});
stopButton.addEventListener('mouseleave', () => {
  stopButton.style.backgroundColor = '#f44336';
});

lapButton.addEventListener('mouseenter', () => {
  if (!lapButton.disabled) lapButton.style.backgroundColor = '#0b7dda';
});
lapButton.addEventListener('mouseleave', () => {
  lapButton.style.backgroundColor = '#2196F3';
});

resetButton.addEventListener('mouseenter', () => {
  resetButton.style.backgroundColor = '#e68900';
});
resetButton.addEventListener('mouseleave', () => {
  resetButton.style.backgroundColor = '#ff9800';
});

}
