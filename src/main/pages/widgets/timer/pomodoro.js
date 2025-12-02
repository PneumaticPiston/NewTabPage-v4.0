/**
 * Pomodoro Timer Widget
 * Implements the Pomodoro Technique with work sessions and break periods.
 * Default: 25 min work, 5 min short break, 15 min long break after 4 sessions.
 */
debug.log("Pomodoro timer widget loaded");
{
const parentDiv = document.currentScript.parentElement;
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);
const widgetId = url.searchParams.get('id') || 'pomodoro-default';

let timerInterval = null;
let remainingSeconds = 0;
let isRunning = false;
let currentMode = 'work'; // 'work', 'shortBreak', 'longBreak'
let sessionsCompleted = 0;

// Default times in seconds
const WORK_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;
const SESSIONS_UNTIL_LONG_BREAK = 4;

// Create container
const container = document.createElement('div');
container.style.cssText = `
  font-family: Arial, sans-serif;
  max-width: 450px;
  margin: 20px;
  background-color: var(--s-col);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
`;

// Create title
const title = document.createElement('h3');
title.textContent = 'Pomodoro Timer';
title.style.cssText = `
  margin: 0 0 20px 0;
  color: var(--t-col);
  font-size: 24px;
`;

// Create mode indicator
const modeIndicator = document.createElement('div');
modeIndicator.textContent = 'Work Session';
modeIndicator.style.cssText = `
  font-size: 18px;
  color: var(--t-col);
  margin-bottom: 10px;
  font-weight: bold;
`;

// Create sessions counter
const sessionsCounter = document.createElement('div');
sessionsCounter.textContent = `Sessions: 0/${SESSIONS_UNTIL_LONG_BREAK}`;
sessionsCounter.style.cssText = `
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
`;

// Create display
const display = document.createElement('div');
display.textContent = '25:00';
display.style.cssText = `
  font-size: 64px;
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

const skipButton = document.createElement('button');
skipButton.textContent = 'Skip';
skipButton.style.cssText = `
  padding: 12px 30px;
  background-color: #9E9E9E;
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
buttonsContainer.appendChild(skipButton);

// Create progress bar
const progressBarContainer = document.createElement('div');
progressBarContainer.style.cssText = `
  width: 100%;
  height: 10px;
  background-color: #ddd;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 20px;
`;

const progressBar = document.createElement('div');
progressBar.style.cssText = `
  width: 0%;
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
`;

progressBarContainer.appendChild(progressBar);

// Append elements
container.appendChild(title);
container.appendChild(modeIndicator);
container.appendChild(sessionsCounter);
container.appendChild(display);
container.appendChild(buttonsContainer);
container.appendChild(progressBarContainer);
parentDiv.appendChild(container);

// Format time display
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Update display
function updateDisplay() {
  display.textContent = formatTime(remainingSeconds);

  // Update progress bar
  let totalTime;
  if (currentMode === 'work') {
    totalTime = WORK_TIME;
  } else if (currentMode === 'shortBreak') {
    totalTime = SHORT_BREAK_TIME;
  } else {
    totalTime = LONG_BREAK_TIME;
  }
  const progress = ((totalTime - remainingSeconds) / totalTime) * 100;
  progressBar.style.width = `${progress}%`;
}

// Set mode
function setMode(mode) {
  currentMode = mode;

  if (mode === 'work') {
    remainingSeconds = WORK_TIME;
    modeIndicator.textContent = 'Work Session';
    progressBar.style.backgroundColor = '#4CAF50';
  } else if (mode === 'shortBreak') {
    remainingSeconds = SHORT_BREAK_TIME;
    modeIndicator.textContent = 'Short Break';
    progressBar.style.backgroundColor = '#2196F3';
  } else if (mode === 'longBreak') {
    remainingSeconds = LONG_BREAK_TIME;
    modeIndicator.textContent = 'Long Break';
    progressBar.style.backgroundColor = '#9C27B0';
  }

  updateDisplay();
  sessionsCounter.textContent = `Sessions: ${sessionsCompleted % SESSIONS_UNTIL_LONG_BREAK}/${SESSIONS_UNTIL_LONG_BREAK}`;
}

// Start timer
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    startButton.disabled = true;
    startButton.style.opacity = '0.5';
    pauseButton.disabled = false;
    pauseButton.style.opacity = '1';

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

        // Complete session
        if (currentMode === 'work') {
          sessionsCompleted++;

          // Decide next mode
          if (sessionsCompleted % SESSIONS_UNTIL_LONG_BREAK === 0) {
            setMode('longBreak');
          } else {
            setMode('shortBreak');
          }
        } else {
          setMode('work');
        }
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
  sessionsCompleted = 0;
  setMode('work');
  startButton.disabled = false;
  startButton.style.opacity = '1';
  pauseButton.disabled = true;
  pauseButton.style.opacity = '0.5';
}

// Skip to next session
function skipSession() {
  clearInterval(timerInterval);
  isRunning = false;
  startButton.disabled = false;
  startButton.style.opacity = '1';
  pauseButton.disabled = true;
  pauseButton.style.opacity = '0.5';

  if (currentMode === 'work') {
    sessionsCompleted++;
    if (sessionsCompleted % SESSIONS_UNTIL_LONG_BREAK === 0) {
      setMode('longBreak');
    } else {
      setMode('shortBreak');
    }
  } else {
    setMode('work');
  }
}

// Event listeners
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
skipButton.addEventListener('click', skipSession);

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

skipButton.addEventListener('mouseenter', () => {
  skipButton.style.backgroundColor = '#757575';
});
skipButton.addEventListener('mouseleave', () => {
  skipButton.style.backgroundColor = '#9E9E9E';
});

// Initialize
setMode('work');

}
