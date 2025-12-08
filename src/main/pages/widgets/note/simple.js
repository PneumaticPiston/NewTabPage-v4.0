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

// Parse settings from URL parameters
const settings = {
  id: url.searchParams.get('id') || 'note-simple-default',
  title: url.searchParams.get('title') || 'Note',
  placeholder: url.searchParams.get('placeholder') || 'Write your note here...',
  autoSaveDelay: parseInt(url.searchParams.get('autoSaveDelay')) || 1000,
  minHeight: parseInt(url.searchParams.get('minHeight')) || 150,
  maxWidth: parseInt(url.searchParams.get('maxWidth')) || 400,
  fontFamily: url.searchParams.get('fontFamily') || 'Arial, sans-serif',
  fontSize: parseInt(url.searchParams.get('fontSize')) || 14,
  backgroundColor: url.searchParams.get('backgroundColor') || 'var(--s-col)',
  textColor: url.searchParams.get('textColor') || 'var(--t-col)',
  buttonColor: url.searchParams.get('buttonColor') || '#4CAF50',
  buttonHoverColor: url.searchParams.get('buttonHoverColor') || '#45a049'
};

// Create style element
const style = document.createElement('style');
style.textContent = `
  .note-container {
    font-family: ${settings.fontFamily};
    max-width: ${settings.maxWidth}px;
    margin: 20px;
    background-color: ${settings.backgroundColor};
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .note-title {
    margin: 0 0 15px 0;
    color: ${settings.textColor};
    font-size: 20px;
  }
  .note-textarea {
    width: 100%;
    min-height: ${settings.minHeight}px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-family: inherit;
    font-size: ${settings.fontSize}px;
    resize: vertical;
    box-sizing: border-box;
    background-color: #fff;
    color: #333;
  }
  .note-save-button {
    margin-top: 10px;
    padding: 10px 20px;
    background-color: ${settings.buttonColor};
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  .note-save-button:hover {
    background-color: ${settings.buttonHoverColor};
  }
  .note-status {
    margin-top: 10px;
    font-size: 12px;
    color: #666;
    min-height: 18px;
  }
`;
parentDiv.appendChild(style);

// Create container
const container = document.createElement('div');
container.className = 'note-container';

// Create title
const title = document.createElement('h3');
title.textContent = settings.title;
title.className = 'note-title';

// Create textarea
const textarea = document.createElement('textarea');
textarea.placeholder = settings.placeholder;
textarea.className = 'note-textarea';

// Create save button
const saveButton = document.createElement('button');
saveButton.textContent = 'Save Note';
saveButton.className = 'note-save-button';

// Create status message
const statusMsg = document.createElement('div');
statusMsg.className = 'note-status';

// Append elements
container.appendChild(title);
container.appendChild(textarea);
container.appendChild(saveButton);
container.appendChild(statusMsg);
parentDiv.appendChild(container);

// Load saved note
chrome.storage.local.get([settings.id], (result) => {
  if (result[settings.id]) {
    textarea.value = result[settings.id];
  }
});

// Save note function
function saveNote() {
  const noteContent = textarea.value;
  chrome.storage.local.set({ [settings.id]: noteContent }, () => {
    statusMsg.textContent = 'Note saved!';
    statusMsg.style.color = settings.buttonColor;
    setTimeout(() => {
      statusMsg.textContent = '';
    }, 2000);
  });
}

// Auto-save on input with debounce
let saveTimeout;
textarea.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveNote, settings.autoSaveDelay);
});

// Save button click
saveButton.addEventListener('click', saveNote);

}
