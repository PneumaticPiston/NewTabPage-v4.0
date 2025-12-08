/**
 * Simple search box widget
 * Allows users to enter a search query and redirects them to a search engine results page.
 * Should be a smaller box compared to the search bar widget.
 */
debug.log("Search box widget loaded");
{
const parentDiv = document.currentScript.parentElement;
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);

// Parse settings from URL parameters
const settings = {
  id: url.searchParams.get('id') || 'search-box-default',
  engine: url.searchParams.get('engine') || 'google',
  title: url.searchParams.get('title') || 'Quick Search',
  placeholder: url.searchParams.get('placeholder') || 'Search...',
  maxWidth: parseInt(url.searchParams.get('maxWidth')) || 350,
  backgroundColor: url.searchParams.get('backgroundColor') || 'var(--s-col)',
  textColor: url.searchParams.get('textColor') || 'var(--t-col)',
  buttonColor: url.searchParams.get('buttonColor') || '#4285f4',
  buttonHoverColor: url.searchParams.get('buttonHoverColor') || '#357ae8',
  fontSize: parseInt(url.searchParams.get('fontSize')) || 14
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
  .search-box-container {
    max-width: ${settings.maxWidth}px;
    margin: 20px;
    padding: 10px;
  }
  .search-box-form {
    display: flex;
    flex-direction: column;
    background-color: ${settings.backgroundColor};
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .search-box-title {
    margin: 0 0 12px 0;
    color: ${settings.textColor};
    font-size: 16px;
    text-align: center;
  }
  .search-box-input {
    border: 1px solid #ddd;
    outline: none;
    font-size: ${settings.fontSize}px;
    padding: 10px 12px;
    border-radius: 5px;
    margin-bottom: 10px;
    background-color: #fff;
    color: #333;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-box-input:focus {
    border-color: ${settings.buttonColor};
    box-shadow: 0 0 5px rgba(66, 133, 244, 0.3);
  }
  .search-box-button {
    padding: 10px 20px;
    background-color: ${settings.buttonColor};
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: ${settings.fontSize}px;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  .search-box-button:hover {
    background-color: ${settings.buttonHoverColor};
  }
`;
parentDiv.appendChild(style);

// Create container
const container = document.createElement('div');
container.className = 'search-box-container';

// Create search form
const form = document.createElement('form');
form.className = 'search-box-form';

// Create title
const title = document.createElement('h4');
title.textContent = settings.title;
title.className = 'search-box-title';

// Create search input
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = settings.placeholder;
searchInput.className = 'search-box-input';

// Create submit button
const submitButton = document.createElement('button');
submitButton.type = 'submit';
submitButton.textContent = '🔍 Search';
submitButton.className = 'search-box-button';

// Append elements
form.appendChild(title);
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

}
