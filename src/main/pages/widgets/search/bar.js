/**
 * A search bar widget
 * Settings allows the user to chose the search engine.
 * When the user types a query and presses enter, they are redirected to the search results page of the chosen search engine.
 */
debug.log("Search bar widget loaded");
{
const parentDiv = document.currentScript.parentElement;
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);

// Parse settings from URL parameters
const settings = {
  id: url.searchParams.get('id') || 'search-bar-default',
  engine: url.searchParams.get('engine') || 'google',
  placeholder: url.searchParams.get('placeholder') || 'Search the web...',
  showIcon: url.searchParams.get('showIcon') !== 'false', // default true
  maxWidth: parseInt(url.searchParams.get('maxWidth')) || 700,
  backgroundColor: url.searchParams.get('backgroundColor') || 'var(--s-col)',
  textColor: url.searchParams.get('textColor') || 'var(--t-col)',
  buttonColor: url.searchParams.get('buttonColor') || '#4285f4',
  buttonHoverColor: url.searchParams.get('buttonHoverColor') || '#357ae8',
  fontSize: parseInt(url.searchParams.get('fontSize')) || 16
};

// Search engine URLs
const searchEngines = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  yahoo: 'https://search.yahoo.com/search?p=',
  brave: 'https://search.brave.com/search?q='
};

// Create style element
const style = document.createElement('style');
style.textContent = `
  .search-bar-container {
    max-width: ${settings.maxWidth}px;
    margin: 0;
    padding: 0;
  }
  .search-bar-form {
    display: flex;
    align-items: center;
    background-color: ${settings.backgroundColor};
    border-radius: 50px;
    padding: 5px 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: box-shadow 0.2s;
  }
  .search-bar-form.focused {
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  }
  .search-bar-icon {
    font-size: 20px;
    margin: 0 10px;
  }
  .search-bar-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: ${settings.fontSize}px;
    padding: 15px 10px;
    background: transparent;
    color: ${settings.textColor};
  }
  .search-bar-button {
    padding: 10px 25px;
    background-color: ${settings.buttonColor};
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    margin-left: 10px;
    transition: background-color 0.2s;
  }
  .search-bar-button:hover {
    background-color: ${settings.buttonHoverColor};
  }
`;
parentDiv.appendChild(style);

// Create container
const container = document.createElement('div');
container.className = 'search-bar-container';

// Create search form
const form = document.createElement('form');
form.className = 'search-bar-form';

// Create search icon
const searchIcon = document.createElement('span');
searchIcon.textContent = '🔍';
searchIcon.className = 'search-bar-icon';
if (!settings.showIcon) {
  searchIcon.style.display = 'none';
}

// Create search input
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = settings.placeholder;
searchInput.className = 'search-bar-input';

// Create submit button
const submitButton = document.createElement('button');
submitButton.type = 'submit';
submitButton.textContent = 'Search';
submitButton.className = 'search-bar-button';

// Append elements
form.appendChild(searchIcon);
form.appendChild(searchInput);
form.appendChild(submitButton);
container.appendChild(form);
parentDiv.appendChild(container);

// Handle search
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    const baseUrl = searchEngines[settings.engine] || searchEngines.google;
    window.location.href = baseUrl + encodeURIComponent(query);
  }
});

// Focus effect
searchInput.addEventListener('focus', () => {
  form.classList.add('focused');
});

searchInput.addEventListener('blur', () => {
  form.classList.remove('focused');
});

}
