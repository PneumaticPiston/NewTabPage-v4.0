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
const widgetId = url.searchParams.get('id') || 'search-bar-default';
const searchEngine = url.searchParams.get('engine') || 'google';

// Search engine URLs
const searchEngines = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  yahoo: 'https://search.yahoo.com/search?p=',
  brave: 'https://search.brave.com/search?q='
};

// Create container
const container = document.createElement('div');
container.style.cssText = `
  max-width: 700px;
  margin: 20px auto;
  padding: 10px;
`;

// Create search form
const form = document.createElement('form');
form.style.cssText = `
  display: flex;
  align-items: center;
  background-color: var(--s-col);
  border-radius: 50px;
  padding: 5px 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

// Create search icon
const searchIcon = document.createElement('span');
searchIcon.textContent = '🔍';
searchIcon.style.cssText = `
  font-size: 20px;
  margin: 0 10px;
`;

// Create search input
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = 'Search the web...';
searchInput.style.cssText = `
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 15px 10px;
  background: transparent;
  color: var(--t-col);
`;

// Create submit button
const submitButton = document.createElement('button');
submitButton.type = 'submit';
submitButton.textContent = 'Search';
submitButton.style.cssText = `
  padding: 10px 25px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  margin-left: 10px;
`;

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
    const baseUrl = searchEngines[searchEngine] || searchEngines.google;
    window.location.href = baseUrl + encodeURIComponent(query);
  }
});

// Button hover effects
submitButton.addEventListener('mouseenter', () => {
  submitButton.style.backgroundColor = '#357ae8';
});

submitButton.addEventListener('mouseleave', () => {
  submitButton.style.backgroundColor = '#4285f4';
});

// Focus effect
searchInput.addEventListener('focus', () => {
  form.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
});

searchInput.addEventListener('blur', () => {
  form.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
});

}
