/**
 * Temperature Weather Widget
 * Displays current temperature for a specified location.
 * Requires API key and location via URL parameters: ?apiKey=YOUR_KEY&location=CITY
 * Get a free API key from: https://openweathermap.org/api
 */
debug.log("Temperature weather widget loaded");
{
const parentDiv = document.currentScript.parentElement;
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);

// Parse settings from URL parameters
const settings = {
  id: url.searchParams.get('id') || 'weather-temp-default',
  apiKey: url.searchParams.get('apiKey') || '',
  location: url.searchParams.get('location') || 'London',
  units: url.searchParams.get('units') || 'metric', // metric, imperial, or standard
  title: url.searchParams.get('title') || 'Temperature',
  showFeelsLike: url.searchParams.get('showFeelsLike') !== 'false', // default true
  maxWidth: parseInt(url.searchParams.get('maxWidth')) || 350,
  fontFamily: url.searchParams.get('fontFamily') || 'Arial, sans-serif',
  backgroundColor: url.searchParams.get('backgroundColor') || 'var(--s-col)',
  textColor: url.searchParams.get('textColor') || 'var(--t-col)',
  errorColor: url.searchParams.get('errorColor') || '#f44336',
  tempFontSize: parseInt(url.searchParams.get('tempFontSize')) || 64
};

let apiKey = settings.apiKey; // Will be updated from storage if available

// Create style element
const style = document.createElement('style');
style.textContent = `
  .weather-temp-container {
    font-family: ${settings.fontFamily};
    max-width: ${settings.maxWidth}px;
    margin: 20px;
    background-color: ${settings.backgroundColor};
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    text-align: center;
  }
  .weather-temp-title {
    margin: 0 0 10px 0;
    color: ${settings.textColor};
    font-size: 20px;
  }
  .weather-temp-location {
    font-size: 16px;
    color: ${settings.textColor};
    margin-bottom: 20px;
    opacity: 0.8;
  }
  .weather-temp-display {
    font-size: ${settings.tempFontSize}px;
    font-weight: bold;
    color: ${settings.textColor};
    margin: 20px 0;
    font-family: ${settings.fontFamily};
  }
  .weather-temp-desc {
    font-size: 18px;
    color: ${settings.textColor};
    margin-bottom: 10px;
    text-transform: capitalize;
  }
  .weather-temp-feels {
    font-size: 14px;
    color: ${settings.textColor};
    opacity: 0.7;
  }
  .weather-temp-error {
    font-size: 14px;
    color: ${settings.errorColor};
    margin-top: 10px;
    display: none;
  }
  .weather-temp-updated {
    font-size: 11px;
    color: #999;
    margin-top: 15px;
  }
`;
parentDiv.appendChild(style);

// Create container
const container = document.createElement('div');
container.className = 'weather-temp-container';

// Create title
const title = document.createElement('h3');
title.textContent = settings.title;
title.className = 'weather-temp-title';

// Create location display
const locationDisplay = document.createElement('div');
locationDisplay.textContent = settings.location;
locationDisplay.className = 'weather-temp-location';

// Create temperature display
const tempDisplay = document.createElement('div');
tempDisplay.textContent = '--°';
tempDisplay.className = 'weather-temp-display';

// Create description display
const descDisplay = document.createElement('div');
descDisplay.textContent = 'Loading...';
descDisplay.className = 'weather-temp-desc';

// Create feels like display
const feelsLikeDisplay = document.createElement('div');
feelsLikeDisplay.textContent = '';
feelsLikeDisplay.className = 'weather-temp-feels';

// Create error display
const errorDisplay = document.createElement('div');
errorDisplay.className = 'weather-temp-error';

// Create last updated
const lastUpdated = document.createElement('div');
lastUpdated.className = 'weather-temp-updated';

// Append elements
container.appendChild(title);
container.appendChild(locationDisplay);
container.appendChild(tempDisplay);
container.appendChild(descDisplay);
container.appendChild(feelsLikeDisplay);
container.appendChild(errorDisplay);
container.appendChild(lastUpdated);
parentDiv.appendChild(container);

// Get unit symbol
function getUnitSymbol() {
  switch (settings.units) {
    case 'imperial': return '°F';
    case 'standard': return 'K';
    default: return '°C';
  }
}

// Fetch weather data
async function fetchWeather() {
  if (!apiKey) {
    errorDisplay.textContent = 'API key required. Configure in Settings or add ?apiKey=YOUR_KEY to widget URL';
    errorDisplay.style.display = 'block';
    descDisplay.textContent = '';
    return;
  }

  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(settings.location)}&units=${settings.units}&appid=${apiKey}`;
    debug.log('Fetching weather with API key:', apiKey ? 'Key present (length: ' + apiKey.length + ')' : 'No key');
    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your API key in Settings.');
      }
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // Update displays
    tempDisplay.textContent = `${Math.round(data.main.temp)}${getUnitSymbol()}`;
    descDisplay.textContent = data.weather[0].description;
    if (settings.showFeelsLike) {
      feelsLikeDisplay.textContent = `Feels like ${Math.round(data.main.feels_like)}${getUnitSymbol()}`;
    }
    locationDisplay.textContent = `${data.name}, ${data.sys.country}`;
    errorDisplay.style.display = 'none';

    const now = new Date();
    lastUpdated.textContent = `Updated: ${now.toLocaleTimeString()}`;

  } catch (error) {
    errorDisplay.textContent = `Error: ${error.message}`;
    errorDisplay.style.display = 'block';
    tempDisplay.textContent = '--°';
    descDisplay.textContent = 'Unable to load weather';
    feelsLikeDisplay.textContent = '';
  }
}

// Load API key from storage if not provided in URL, then fetch weather
chrome.storage.local.get(['openWeatherApiKey'], (result) => {
  if (!apiKey && result.openWeatherApiKey) {
    apiKey = result.openWeatherApiKey;
    debug.log('Using API key from settings');
  }
  fetchWeather();

  // Refresh every 10 minutes
  setInterval(fetchWeather, 10 * 60 * 1000);
});

}
