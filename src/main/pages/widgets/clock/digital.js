debug.log("Digital clock widget loaded");
{

const parentDiv = document.currentScript.parentElement;
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);

// Parse settings from URL parameters
const settings = {
  timezone: url.searchParams.get('timezone') || 'local',
  format24Hour: url.searchParams.get('format24Hour') !== 'false', // default true (24-hour format)
  showSeconds: url.searchParams.get('showSeconds') !== 'false', // default true
  fontSize: parseInt(url.searchParams.get('fontSize')) || 48,
  fontFamily: url.searchParams.get('fontFamily') || 'Courier New, monospace',
  textColor: url.searchParams.get('textColor') || 'var(--t-col)',
  backgroundColor: url.searchParams.get('backgroundColor') || 'var(--s-col)',
  padding: url.searchParams.get('padding') || '30px 50px',
  borderRadius: url.searchParams.get('borderRadius') || '15px',
  letterSpacing: url.searchParams.get('letterSpacing') || '5px'
};

// Create style element
const style = document.createElement('style');
style.textContent = `
  .digital-clock-container {
    font-family: ${settings.fontFamily};
    font-size: ${settings.fontSize}px;
    font-weight: bold;
    color: ${settings.textColor};
    background-color: ${settings.backgroundColor};
    padding: ${settings.padding};
    border-radius: ${settings.borderRadius};
    display: inline-block;
    text-align: center;
    letter-spacing: ${settings.letterSpacing};
  }
`;
parentDiv.appendChild(style);

// Create clock container
const clockContainer = document.createElement('div');
clockContainer.className = 'digital-clock-container';

// Create time display element
const timeDisplay = document.createElement('div');
timeDisplay.id = 'clock-time';
clockContainer.appendChild(timeDisplay);

// Add clock to parent div
parentDiv.appendChild(clockContainer);

// Function to update the clock
function updateClock() {
  const now = new Date();

  // Get time components
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  // Convert to 12-hour format if needed
  let period = '';
  if (!settings.format24Hour) {
    period = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12 || 12;
  }

  // Add leading zeros
  hours = hours.toString().padStart(2, '0');
  minutes = minutes.toString().padStart(2, '0');
  seconds = seconds.toString().padStart(2, '0');

  // Update time display
  if (settings.showSeconds) {
    timeDisplay.textContent = `${hours}:${minutes}:${seconds}${period}`;
  } else {
    timeDisplay.textContent = `${hours}:${minutes}${period}`;
  }
}

// Update clock immediately
updateClock();

// Update clock every second
setInterval(updateClock, 1000);

}