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
const widgetId = url.searchParams.get('id') || 'search-box-default';
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
  max-width: 350px;
  margin: 20px;
  padding: 10px;
`;

// Create search form
const form = document.createElement('form');
form.style.cssText = `
  display: flex;
  flex-direction: column;
  background-color: var(--s-col);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

// Create title
const title = document.createElement('h4');
title.textContent = 'Quick Search';
title.style.cssText = `
  margin: 0 0 12px 0;
  color: var(--t-col);
  font-size: 16px;
  text-align: center;
`;

// Create search input
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = 'Search...';
searchInput.style.cssText = `
  border: 1px solid #ddd;
  outline: none;
  font-size: 14px;
  padding: 10px 12px;
  border-radius: 5px;
  margin-bottom: 10px;
  background-color: #fff;
  color: #333;
`;

// Create submit button
const submitButton = document.createElement('button');
submitButton.type = 'submit';
submitButton.textContent = '🔍 Search';
submitButton.style.cssText = `
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
`;

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
  searchInput.style.borderColor = '#4285f4';
  searchInput.style.boxShadow = '0 0 5px rgba(66, 133, 244, 0.3)';
});

searchInput.addEventListener('blur', () => {
  searchInput.style.borderColor = '#ddd';
  searchInput.style.boxShadow = 'none';
});

}
