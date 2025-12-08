debug.log("World clock widget loaded");
{
const parentDiv = document.currentScript.parentElement;
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);

// Parse settings from URL parameters
const settings = {
  cities: url.searchParams.get('cities') || 'New York:America/New_York,London:Europe/London,Tokyo:Asia/Tokyo,Sydney:Australia/Sydney,Dubai:Asia/Dubai,Los Angeles:America/Los_Angeles',
  format24Hour: url.searchParams.get('format24Hour') !== 'false', // default true
  fontFamily: url.searchParams.get('fontFamily') || 'Arial, sans-serif',
  backgroundColor: url.searchParams.get('backgroundColor') || '#f5f5f5',
  itemBackgroundColor: url.searchParams.get('itemBackgroundColor') || '#ffffff',
  textColor: url.searchParams.get('textColor') || '#333',
  timeColor: url.searchParams.get('timeColor') || '#2c3e50'
};

// Parse cities from settings
const cities = settings.cities.split(',').map(cityStr => {
  const [name, timezone] = cityStr.split(':');
  return { name: name.trim(), timezone: timezone.trim() };
});

// Create style element
const style = document.createElement('style');
style.textContent = `
  .world-clock-container {
    font-family: ${settings.fontFamily};
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background-color: ${settings.backgroundColor};
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .world-clock-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin: 10px 0;
    background-color: ${settings.itemBackgroundColor};
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .world-clock-city {
    font-size: 18px;
    font-weight: bold;
    color: ${settings.textColor};
    flex: 1;
  }
  .world-clock-time {
    font-size: 20px;
    color: ${settings.timeColor};
    font-family: monospace;
    min-width: 120px;
    text-align: right;
  }
`;
parentDiv.appendChild(style);

// Create container
const container = document.createElement('div');
container.className = 'world-clock-container';
parentDiv.appendChild(container);

// Create clock elements for each city
cities.forEach(city => {
  const clockDiv = document.createElement('div');
  clockDiv.className = 'world-clock-item';

  const cityName = document.createElement('div');
  cityName.textContent = city.name;
  cityName.className = 'world-clock-city';

  const timeDisplay = document.createElement('div');
  timeDisplay.className = 'world-clock-time';
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
        hour12: !settings.format24Hour
      };
      timeElement.textContent = now.toLocaleTimeString('en-US', options);
    }
  });
}

// Update clocks immediately and then every second
updateWorldClocks();
setInterval(updateWorldClocks, 1000);
}