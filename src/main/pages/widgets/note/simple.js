/**
 * Simple Note Widget
 * Allows users to create a note by pressing a button. The note is saved in local storage.
 */
debug.log("Simple note widget loaded");
{
const parentDiv = document.currentScript.parentElement;
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);
const widgetId = url.searchParams.get('id') || 'note-simple-default';

// Create container
const container = document.createElement('div');
container.style.cssText = `
  font-family: Arial, sans-serif;
  max-width: 400px;
  margin: 20px;
  background-color: var(--s-col);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

// Create title
const title = document.createElement('h3');
title.textContent = 'Note';
title.style.cssText = `
  margin: 0 0 15px 0;
  color: var(--t-col);
  font-size: 20px;
`;

// Create textarea
const textarea = document.createElement('textarea');
textarea.placeholder = 'Write your note here...';
textarea.style.cssText = `
  width: 100%;
  min-height: 150px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
  background-color: #fff;
  color: #333;
`;

// Create save button
const saveButton = document.createElement('button');
saveButton.textContent = 'Save Note';
saveButton.style.cssText = `
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
`;

// Create status message
const statusMsg = document.createElement('div');
statusMsg.style.cssText = `
  margin-top: 10px;
  font-size: 12px;
  color: #666;
  min-height: 18px;
`;

// Append elements
container.appendChild(title);
container.appendChild(textarea);
container.appendChild(saveButton);
container.appendChild(statusMsg);
parentDiv.appendChild(container);

// Load saved note
chrome.storage.local.get([widgetId], (result) => {
  if (result[widgetId]) {
    textarea.value = result[widgetId];
  }
});

// Save note function
function saveNote() {
  const noteContent = textarea.value;
  chrome.storage.local.set({ [widgetId]: noteContent }, () => {
    statusMsg.textContent = 'Note saved!';
    statusMsg.style.color = '#4CAF50';
    setTimeout(() => {
      statusMsg.textContent = '';
    }, 2000);
  });
}

// Auto-save on input with debounce
let saveTimeout;
textarea.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveNote, 1000);
});

// Save button click
saveButton.addEventListener('click', saveNote);

// Hover effect for button
saveButton.addEventListener('mouseenter', () => {
  saveButton.style.backgroundColor = '#45a049';
});

saveButton.addEventListener('mouseleave', () => {
  saveButton.style.backgroundColor = '#4CAF50';
});

}
