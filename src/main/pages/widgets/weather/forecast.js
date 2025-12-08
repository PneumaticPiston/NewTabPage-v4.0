/**
 * Forecast Weather Widget
 * Displays a configurable number of days of weather forecast information including temperature, conditions, and chance of rain/snow.
 * Requires API key and location via URL parameters: ?apiKey=YOUR_KEY&location=CITY&days=5
 * Get a free API key from: https://openweathermap.org/api
 */
debug.log("Weather forecast widget loaded");
{
const parentDiv = document.currentScript.parentElement;
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);

// Parse settings from URL parameters
const settings = {
  id: url.searchParams.get('id') || 'weather-forecast-default',
  apiKey: url.searchParams.get('apiKey') || '',
  location: url.searchParams.get('location') || 'London',
  units: url.searchParams.get('units') || 'metric', // metric, imperial, or standard
  days: parseInt(url.searchParams.get('days')) || 5, // Max 5 for free tier
  title: url.searchParams.get('title') || 'Weather Forecast',
  maxWidth: parseInt(url.searchParams.get('maxWidth')) || 650,
  fontFamily: url.searchParams.get('fontFamily') || 'Arial, sans-serif',
  backgroundColor: url.searchParams.get('backgroundColor') || 'var(--s-col)',
  textColor: url.searchParams.get('textColor') || 'var(--t-col)',
  errorColor: url.searchParams.get('errorColor') || '#f44336'
};

let apiKey = settings.apiKey; // Will be updated from storage if available

// Create style element
const style = document.createElement('style');
style.textContent = `
  .weather-forecast-container {
    font-family: ${settings.fontFamily};
    max-width: ${settings.maxWidth}px;
    margin: 20px;
    background-color: ${settings.backgroundColor};
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
  .weather-forecast-title {
    margin: 0 0 10px 0;
    color: ${settings.textColor};
    font-size: 22px;
    text-align: center;
  }
  .weather-forecast-location {
    font-size: 16px;
    color: ${settings.textColor};
    text-align: center;
    margin-bottom: 20px;
    opacity: 0.8;
  }
  .weather-forecast-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 12px;
  }
  .weather-forecast-card {
    background-color: rgba(255,255,255,0.5);
    border-radius: 10px;
    padding: 15px;
    text-align: center;
  }
  .weather-forecast-day {
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
  }
  .weather-forecast-icon {
    font-size: 40px;
    margin: 10px 0;
  }
  .weather-forecast-temp {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
  }
  .weather-forecast-desc {
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
  }
  .weather-forecast-pop {
    font-size: 11px;
    color: #2196F3;
  }
  .weather-forecast-error {
    font-size: 14px;
    color: ${settings.errorColor};
    margin-top: 10px;
    display: none;
    text-align: center;
  }
  .weather-forecast-updated {
    font-size: 11px;
    color: #999;
    text-align: center;
    margin-top: 15px;
  }
`;
parentDiv.appendChild(style);

// Create container
const container = document.createElement('div');
container.className = 'weather-forecast-container';

// Create title
const title = document.createElement('h3');
title.textContent = settings.title;
title.className = 'weather-forecast-title';

// Create location display
const locationDisplay = document.createElement('div');
locationDisplay.textContent = settings.location;
locationDisplay.className = 'weather-forecast-location';

// Create forecast container
const forecastContainer = document.createElement('div');
forecastContainer.className = 'weather-forecast-grid';

// Create error display
const errorDisplay = document.createElement('div');
errorDisplay.className = 'weather-forecast-error';

// Create last updated
const lastUpdated = document.createElement('div');
lastUpdated.className = 'weather-forecast-updated';

// Append elements
container.appendChild(title);
container.appendChild(locationDisplay);
container.appendChild(forecastContainer);
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

// Weather icon mapping
function getWeatherIcon(iconCode) {
  const iconMap = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
  };
  return iconMap[iconCode] || '☁️';
}

// Create forecast day card
function createDayCard(dayData) {
  const card = document.createElement('div');
  card.className = 'weather-forecast-card';

  // Day name
  const date = new Date(dayData.dt * 1000);
  const dayName = document.createElement('div');
  dayName.textContent = date.toLocaleDateString('en-US', { weekday: 'short' });
  dayName.className = 'weather-forecast-day';

  // Icon
  const icon = document.createElement('div');
  icon.textContent = getWeatherIcon(dayData.weather[0].icon);
  icon.className = 'weather-forecast-icon';

  // Temperature
  const temp = document.createElement('div');
  temp.textContent = `${Math.round(dayData.main.temp)}${getUnitSymbol()}`;
  temp.className = 'weather-forecast-temp';

  // Description
  const desc = document.createElement('div');
  desc.textContent = dayData.weather[0].main;
  desc.className = 'weather-forecast-desc';

  card.appendChild(dayName);
  card.appendChild(icon);
  card.appendChild(temp);
  card.appendChild(desc);

  // Rain/Snow probability
  if (dayData.pop !== undefined) {
    const pop = document.createElement('div');
    pop.textContent = `💧 ${Math.round(dayData.pop * 100)}%`;
    pop.className = 'weather-forecast-pop';
    card.appendChild(pop);
  }

  return card;
}

// Fetch weather forecast
async function fetchForecast() {
  if (!apiKey) {
    errorDisplay.textContent = 'API key required. Configure in Settings or add ?apiKey=YOUR_KEY to widget URL';
    errorDisplay.style.display = 'block';
    return;
  }

  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(settings.location)}&units=${settings.units}&appid=${apiKey}`;
    debug.log('Fetching forecast with API key:', apiKey ? 'Key present (length: ' + apiKey.length + ')' : 'No key');
    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your API key in Settings.');
      }
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // Clear existing forecast
    forecastContainer.innerHTML = '';

    // Update location
    locationDisplay.textContent = `${data.city.name}, ${data.city.country}`;

    // Group forecasts by day and get one per day (around noon)
    const dailyForecasts = [];
    const seenDays = new Set();

    for (const forecast of data.list) {
      const date = new Date(forecast.dt * 1000);
      const dayKey = date.toDateString();

      if (!seenDays.has(dayKey) && dailyForecasts.length < settings.days) {
        // Prefer forecasts around noon (12:00)
        const hour = date.getHours();
        if (hour >= 11 && hour <= 14) {
          seenDays.add(dayKey);
          dailyForecasts.push(forecast);
        }
      }
    }

    // If we don't have enough noon forecasts, add any other forecast
    if (dailyForecasts.length < settings.days) {
      for (const forecast of data.list) {
        const date = new Date(forecast.dt * 1000);
        const dayKey = date.toDateString();

        if (!seenDays.has(dayKey) && dailyForecasts.length < settings.days) {
          seenDays.add(dayKey);
          dailyForecasts.push(forecast);
        }
      }
    }

    // Create cards for each day
    dailyForecasts.forEach(dayData => {
      const card = createDayCard(dayData);
      forecastContainer.appendChild(card);
    });

    errorDisplay.style.display = 'none';

    const now = new Date();
    lastUpdated.textContent = `Updated: ${now.toLocaleTimeString()}`;

  } catch (error) {
    errorDisplay.textContent = `Error: ${error.message}`;
    errorDisplay.style.display = 'block';
    forecastContainer.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">Unable to load forecast</div>';
  }
}

// Load API key from storage if not provided in URL, then fetch forecast
chrome.storage.local.get(['openWeatherApiKey'], (result) => {
  if (!apiKey && result.openWeatherApiKey) {
    apiKey = result.openWeatherApiKey;
    debug.log('Using API key from settings');
  }
  fetchForecast();

  // Refresh every 30 minutes
  setInterval(fetchForecast, 30 * 60 * 1000);
});

}
