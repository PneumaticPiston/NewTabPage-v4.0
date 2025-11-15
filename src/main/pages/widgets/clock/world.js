console.log("World clock widget loaded");
{
const parentDiv = document.currentScript.parentElement;

// Create container
const container = document.createElement('div');
container.style.fontFamily = 'Arial, sans-serif';
container.style.maxWidth = '600px';
container.style.margin = '20px auto';
container.style.padding = '20px';
container.style.backgroundColor = '#f5f5f5';
container.style.borderRadius = '10px';
container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
parentDiv.appendChild(container);

// World clock cities with their timezone offsets
const cities = [
  { name: 'New York', timezone: 'America/New_York' },
  { name: 'London', timezone: 'Europe/London' },
  { name: 'Tokyo', timezone: 'Asia/Tokyo' },
  { name: 'Sydney', timezone: 'Australia/Sydney' },
  { name: 'Dubai', timezone: 'Asia/Dubai' },
  { name: 'Los Angeles', timezone: 'America/Los_Angeles' }
];

// Create clock elements for each city
cities.forEach(city => {
  const clockDiv = document.createElement('div');
  clockDiv.style.display = 'flex';
  clockDiv.style.justifyContent = 'space-between';
  clockDiv.style.alignItems = 'center';
  clockDiv.style.padding = '15px';
  clockDiv.style.margin = '10px 0';
  clockDiv.style.backgroundColor = '#ffffff';
  clockDiv.style.borderRadius = '8px';
  clockDiv.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
  
  const cityName = document.createElement('div');
  cityName.textContent = city.name;
  cityName.style.fontSize = '18px';
  cityName.style.fontWeight = 'bold';
  cityName.style.color = '#333';
  cityName.style.flex = '1';
  
  const timeDisplay = document.createElement('div');
  timeDisplay.style.fontSize = '20px';
  timeDisplay.style.color = '#2c3e50';
  timeDisplay.style.fontFamily = 'monospace';
  timeDisplay.style.minWidth = '120px';
  timeDisplay.style.textAlign = 'right';
  timeDisplay.id = `time-${city.timezone}`;
  
  clockDiv.appendChild(cityName);
  clockDiv.appendChild(timeDisplay);
  container.appendChild(clockDiv);
});

function updateWorldClocks() {
  cities.forEach(city => {
    const timeElement = document.getElementById(`time-${city.timezone}`);
    if (timeElement) {
      const now = new Date();
      const options = {
        timeZone: city.timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      timeElement.textContent = now.toLocaleTimeString('en-US', options);
    }
  });
}

// Update clocks immediately and then every second
updateWorldClocks();
setInterval(updateWorldClocks, 1000);
}