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
const widgetId = url.searchParams.get('id') || 'weather-temp-default';
const apiKeyFromUrl = url.searchParams.get('apiKey') || '';
const location = url.searchParams.get('location') || 'London';
const units = url.searchParams.get('units') || 'metric'; // metric, imperial, or standard

let apiKey = apiKeyFromUrl; // Will be updated from storage if available

// Create container
const container = document.createElement('div');
container.style.cssText = `
  font-family: Arial, sans-serif;
  max-width: 350px;
  margin: 20px;
  background-color: var(--s-col);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
`;

// Create title
const title = document.createElement('h3');
title.textContent = 'Temperature';
title.style.cssText = `
  margin: 0 0 10px 0;
  color: var(--t-col);
  font-size: 20px;
`;

// Create location display
const locationDisplay = document.createElement('div');
locationDisplay.textContent = location;
locationDisplay.style.cssText = `
  font-size: 16px;
  color: var(--t-col);
  margin-bottom: 20px;
  opacity: 0.8;
`;

// Create temperature display
const tempDisplay = document.createElement('div');
tempDisplay.textContent = '--°';
tempDisplay.style.cssText = `
  font-size: 64px;
  font-weight: bold;
  color: var(--t-col);
  margin: 20px 0;
  font-family: 'Arial', sans-serif;
`;

// Create description display
const descDisplay = document.createElement('div');
descDisplay.textContent = 'Loading...';
descDisplay.style.cssText = `
  font-size: 18px;
  color: var(--t-col);
  margin-bottom: 10px;
  text-transform: capitalize;
`;

// Create feels like display
const feelsLikeDisplay = document.createElement('div');
feelsLikeDisplay.textContent = '';
feelsLikeDisplay.style.cssText = `
  font-size: 14px;
  color: var(--t-col);
  opacity: 0.7;
`;

// Create error display
const errorDisplay = document.createElement('div');
errorDisplay.style.cssText = `
  font-size: 14px;
  color: #f44336;
  margin-top: 10px;
  display: none;
`;

// Create last updated
const lastUpdated = document.createElement('div');
lastUpdated.style.cssText = `
  font-size: 11px;
  color: #999;
  margin-top: 15px;
`;

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
  switch (units) {
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
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=${units}&appid=${apiKey}`;
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
    feelsLikeDisplay.textContent = `Feels like ${Math.round(data.main.feels_like)}${getUnitSymbol()}`;
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
