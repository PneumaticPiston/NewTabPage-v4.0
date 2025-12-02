/**
 * Weather Condition Widget
 * Displays current weather conditions including temperature, humidity, wind speed, and more.
 * Requires API key and location via URL parameters: ?apiKey=YOUR_KEY&location=CITY
 * Get a free API key from: https://openweathermap.org/api
 */
debug.log("Weather condition widget loaded");
{
const parentDiv = document.currentScript.parentElement;
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);
const widgetId = url.searchParams.get('id') || 'weather-condition-default';
const apiKeyFromUrl = url.searchParams.get('apiKey') || '';
const location = url.searchParams.get('location') || 'London';
const units = url.searchParams.get('units') || 'metric';

let apiKey = apiKeyFromUrl;

// Create container
const container = document.createElement('div');
container.style.cssText = `
  font-family: Arial, sans-serif;
  max-width: 450px;
  margin: 20px;
  background-color: var(--s-col);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;

// Create title
const title = document.createElement('h3');
title.textContent = 'Weather Conditions';
title.style.cssText = `
  margin: 0 0 20px 0;
  color: var(--t-col);
  font-size: 22px;
  text-align: center;
`;

// Create main weather section
const mainSection = document.createElement('div');
mainSection.style.cssText = `
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
`;

// Left side - temperature
const tempSection = document.createElement('div');
tempSection.style.cssText = `
  flex: 1;
`;

const locationDisplay = document.createElement('div');
locationDisplay.textContent = location;
locationDisplay.style.cssText = `
  font-size: 18px;
  color: var(--t-col);
  font-weight: bold;
  margin-bottom: 10px;
`;

const tempDisplay = document.createElement('div');
tempDisplay.textContent = '--°';
tempDisplay.style.cssText = `
  font-size: 48px;
  font-weight: bold;
  color: var(--t-col);
`;

const descDisplay = document.createElement('div');
descDisplay.textContent = 'Loading...';
descDisplay.style.cssText = `
  font-size: 16px;
  color: var(--t-col);
  text-transform: capitalize;
  margin-top: 5px;
`;

tempSection.appendChild(locationDisplay);
tempSection.appendChild(tempDisplay);
tempSection.appendChild(descDisplay);

// Right side - icon
const iconDisplay = document.createElement('div');
iconDisplay.textContent = String.fromCodePoint(0x2601, 0xFE0F);
iconDisplay.style.cssText = `
  font-size: 64px;
`;

mainSection.appendChild(tempSection);
mainSection.appendChild(iconDisplay);

// Create details grid
const detailsGrid = document.createElement('div');
detailsGrid.style.cssText = `
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
`;

// Create detail items
function createDetailItem(label, value) {
  const item = document.createElement('div');
  item.style.cssText = `
    background-color: rgba(255,255,255,0.5);
    padding: 12px;
    border-radius: 8px;
  `;

  const labelEl = document.createElement('div');
  labelEl.textContent = label;
  labelEl.style.cssText = `
    font-size: 12px;
    color: #666;
    margin-bottom: 5px;
  `;

  const valueEl = document.createElement('div');
  valueEl.textContent = value;
  valueEl.style.cssText = `
    font-size: 18px;
    font-weight: bold;
    color: #333;
  `;

  item.appendChild(labelEl);
  item.appendChild(valueEl);
  return { container: item, valueElement: valueEl };
}

const feelsLike = createDetailItem('Feels Like', '--°');
const humidity = createDetailItem('Humidity', '--%');
const windSpeed = createDetailItem('Wind Speed', '-- m/s');
const pressure = createDetailItem('Pressure', '-- hPa');

detailsGrid.appendChild(feelsLike.container);
detailsGrid.appendChild(humidity.container);
detailsGrid.appendChild(windSpeed.container);
detailsGrid.appendChild(pressure.container);

// Create error display
const errorDisplay = document.createElement('div');
errorDisplay.style.cssText = `
  font-size: 14px;
  color: #f44336;
  margin-top: 10px;
  display: none;
  text-align: center;
`;

// Create last updated
const lastUpdated = document.createElement('div');
lastUpdated.style.cssText = `
  font-size: 11px;
  color: #999;
  text-align: center;
  margin-top: 15px;
`;

// Append elements
container.appendChild(title);
container.appendChild(mainSection);
container.appendChild(detailsGrid);
container.appendChild(errorDisplay);
container.appendChild(lastUpdated);
parentDiv.appendChild(container);

// Get unit symbol
function getUnitSymbol() {
  switch (units) {
    case 'imperial': return '\u00B0F';
    case 'standard': return 'K';
    default: return '\u00B0C';
  }
}

function getSpeedUnit() {
  return units === 'imperial' ? 'mph' : 'm/s';
}

// Weather icon mapping
function getWeatherIcon(iconCode) {
  const icons = {
    '01d': String.fromCodePoint(0x2600, 0xFE0F),
    '01n': String.fromCodePoint(0x1F319),
    '02d': String.fromCodePoint(0x26C5),
    '02n': String.fromCodePoint(0x2601, 0xFE0F),
    '03d': String.fromCodePoint(0x2601, 0xFE0F),
    '03n': String.fromCodePoint(0x2601, 0xFE0F),
    '04d': String.fromCodePoint(0x2601, 0xFE0F),
    '04n': String.fromCodePoint(0x2601, 0xFE0F),
    '09d': String.fromCodePoint(0x1F327, 0xFE0F),
    '09n': String.fromCodePoint(0x1F327, 0xFE0F),
    '10d': String.fromCodePoint(0x1F326, 0xFE0F),
    '10n': String.fromCodePoint(0x1F327, 0xFE0F),
    '11d': String.fromCodePoint(0x26C8, 0xFE0F),
    '11n': String.fromCodePoint(0x26C8, 0xFE0F),
    '13d': String.fromCodePoint(0x2744, 0xFE0F),
    '13n': String.fromCodePoint(0x2744, 0xFE0F),
    '50d': String.fromCodePoint(0x1F32B, 0xFE0F),
    '50n': String.fromCodePoint(0x1F32B, 0xFE0F)
  };
  return icons[iconCode] || String.fromCodePoint(0x2601, 0xFE0F);
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
    const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(location) + '&units=' + units + '&appid=' + apiKey;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('Weather API error: ' + response.status);
    }

    const data = await response.json();

    // Update displays
    tempDisplay.textContent = Math.round(data.main.temp) + getUnitSymbol();
    descDisplay.textContent = data.weather[0].description;
    locationDisplay.textContent = data.name + ', ' + data.sys.country;
    iconDisplay.textContent = getWeatherIcon(data.weather[0].icon);

    feelsLike.valueElement.textContent = Math.round(data.main.feels_like) + getUnitSymbol();
    humidity.valueElement.textContent = data.main.humidity + '%';
    windSpeed.valueElement.textContent = Math.round(data.wind.speed) + ' ' + getSpeedUnit();
    pressure.valueElement.textContent = data.main.pressure + ' hPa';

    errorDisplay.style.display = 'none';

    const now = new Date();
    lastUpdated.textContent = 'Updated: ' + now.toLocaleTimeString();

  } catch (error) {
    errorDisplay.textContent = 'Error: ' + error.message;
    errorDisplay.style.display = 'block';
    tempDisplay.textContent = '--°';
    descDisplay.textContent = 'Unable to load weather';
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
