/**
 * Simple TODO Widget
 * Allows users to create a TODO item by pressing a button. The TODO items are saved in local storage.
 * Allows users to mark items as completed or delete them.
 */
debug.log("Simple TODO widget loaded");
{
const parentDiv = document.currentScript.parentElement;
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);

// Parse settings from URL parameters
const settings = {
  id: url.searchParams.get('id') || 'todo-simple-default',
  title: url.searchParams.get('title') || 'Todo List',
  maxWidth: parseInt(url.searchParams.get('maxWidth')) || 450,
  maxHeight: parseInt(url.searchParams.get('maxHeight')) || 400,
  fontFamily: url.searchParams.get('fontFamily') || 'Arial, sans-serif',
  backgroundColor: url.searchParams.get('backgroundColor') || 'var(--s-col)',
  textColor: url.searchParams.get('textColor') || 'var(--t-col)',
  buttonColor: url.searchParams.get('buttonColor') || '#4CAF50',
  buttonHoverColor: url.searchParams.get('buttonHoverColor') || '#45a049',
  completedColor: url.searchParams.get('completedColor') || '#f0f0f0'
};

let todos = [];

// Create style element
const style = document.createElement('style');
style.textContent = `
  .todo-simple-container {
    font-family: ${settings.fontFamily};
    max-width: ${settings.maxWidth}px;
    margin: 20px;
    background-color: ${settings.backgroundColor};
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
  .todo-simple-title {
    margin: 0 0 20px 0;
    color: ${settings.textColor};
    font-size: 24px;
    text-align: center;
  }
  .todo-simple-input-container {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  .todo-simple-input {
    flex: 1;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    background-color: #fff;
    color: #333;
  }
  .todo-simple-add-button {
    padding: 12px 25px;
    background-color: ${settings.buttonColor};
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  .todo-simple-add-button:hover {
    background-color: ${settings.buttonHoverColor};
  }
  .todo-simple-list {
    max-height: ${settings.maxHeight}px;
    overflow-y: auto;
  }
  .todo-simple-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    margin-bottom: 10px;
    border-radius: 8px;
    border: 1px solid #ddd;
  }
  .todo-simple-item.completed {
    background-color: ${settings.completedColor};
    border-color: #ccc;
  }
  .todo-simple-item:not(.completed) {
    background-color: #fff;
  }
  .todo-simple-checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  .todo-simple-text {
    flex: 1;
    font-size: 14px;
    color: #333;
  }
  .todo-simple-text.completed {
    color: #999;
    text-decoration: line-through;
  }
  .todo-simple-delete-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    opacity: 0.6;
    transition: opacity 0.2s;
  }
  .todo-simple-delete-button:hover {
    opacity: 1;
  }
  .todo-simple-empty {
    text-align: center;
    color: #999;
    padding: 20px;
    font-style: italic;
  }
`;
parentDiv.appendChild(style);

// Create container
const container = document.createElement('div');
container.className = 'todo-simple-container';

// Create title
const title = document.createElement('h3');
title.textContent = settings.title;
title.className = 'todo-simple-title';

// Create input container
const inputContainer = document.createElement('div');
inputContainer.className = 'todo-simple-input-container';

// Create input
const todoInput = document.createElement('input');
todoInput.type = 'text';
todoInput.placeholder = 'Add a new todo...';
todoInput.className = 'todo-simple-input';

// Create add button
const addButton = document.createElement('button');
addButton.textContent = '+ Add';
addButton.className = 'todo-simple-add-button';

inputContainer.appendChild(todoInput);
inputContainer.appendChild(addButton);

// Create todos list
const todosList = document.createElement('div');
todosList.className = 'todo-simple-list';

// Append elements
container.appendChild(title);
container.appendChild(inputContainer);
container.appendChild(todosList);
parentDiv.appendChild(container);

// Load todos from storage
function loadTodos() {
  chrome.storage.local.get([settings.id], (result) => {
    if (result[settings.id]) {
      todos = result[settings.id];
      renderTodos();
    }
  });
}

// Save todos to storage
function saveTodos() {
  chrome.storage.local.set({ [settings.id]: todos });
}

// Render todos
function renderTodos() {
  todosList.innerHTML = '';

  if (todos.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.textContent = 'No todos yet. Add one above!';
    emptyMsg.className = 'todo-simple-empty';
    todosList.appendChild(emptyMsg);
    return;
  }

  todos.forEach((todo, index) => {
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-simple-item';
    if (todo.completed) {
      todoItem.classList.add('completed');
    }

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.className = 'todo-simple-checkbox';
    checkbox.addEventListener('change', () => toggleTodo(index));

    // Todo text
    const todoText = document.createElement('span');
    todoText.textContent = todo.text;
    todoText.className = 'todo-simple-text';
    if (todo.completed) {
      todoText.classList.add('completed');
    }

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '🗑️';
    deleteButton.className = 'todo-simple-delete-button';
    deleteButton.addEventListener('click', () => deleteTodo(index));

    todoItem.appendChild(checkbox);
    todoItem.appendChild(todoText);
    todoItem.appendChild(deleteButton);
    todosList.appendChild(todoItem);
  });
}

// Add todo
function addTodo() {
  const text = todoInput.value.trim();
  if (text) {
    todos.push({ text, completed: false });
    todoInput.value = '';
    saveTodos();
    renderTodos();
  }
}

// Toggle todo completion
function toggleTodo(index) {
  todos[index].completed = !todos[index].completed;
  saveTodos();
  renderTodos();
}

// Delete todo
function deleteTodo(index) {
  todos.splice(index, 1);
  saveTodos();
  renderTodos();
}

// Event listeners
addButton.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTodo();
  }
});

// Load todos on init
loadTodos();

}
