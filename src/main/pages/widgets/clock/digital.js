console.log("Digital clock widget loaded");
{

const parentDiv = document.currentScript.parentElement;
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);
const searchParam = url.searchParams.get('log');
console.log(searchParam);

console.log(url.searchParams.get('url'));

// Create clock container
const clockContainer = document.createElement('div');
clockContainer.style.cssText = `
  font-family: 'Courier New', monospace;
  font-size: 48px;
  font-weight: bold;
  color: var(--t-col);;
  background-color: var(--s-col);
  padding: 30px 50px;
  border-radius: 15px;
  display: inline-block;
  text-align: center;
  letter-spacing: 5px;
`;

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
  
  // Add leading zeros
  hours = hours.toString().padStart(2, '0');
  minutes = minutes.toString().padStart(2, '0');
  seconds = seconds.toString().padStart(2, '0');
  
  // Update time display
  timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

// Update clock immediately
updateClock();

// Update clock every second
setInterval(updateClock, 1000);

}