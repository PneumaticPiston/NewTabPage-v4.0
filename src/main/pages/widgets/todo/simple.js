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
const widgetId = url.searchParams.get('id') || 'todo-simple-default';

let todos = [];

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
title.textContent = 'Todo List';
title.style.cssText = `
  margin: 0 0 20px 0;
  color: var(--t-col);
  font-size: 24px;
  text-align: center;
`;

// Create input container
const inputContainer = document.createElement('div');
inputContainer.style.cssText = `
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

// Create input
const todoInput = document.createElement('input');
todoInput.type = 'text';
todoInput.placeholder = 'Add a new todo...';
todoInput.style.cssText = `
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: #fff;
  color: #333;
`;

// Create add button
const addButton = document.createElement('button');
addButton.textContent = '+ Add';
addButton.style.cssText = `
  padding: 12px 25px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
`;

inputContainer.appendChild(todoInput);
inputContainer.appendChild(addButton);

// Create todos list
const todosList = document.createElement('div');
todosList.style.cssText = `
  max-height: 400px;
  overflow-y: auto;
`;

// Append elements
container.appendChild(title);
container.appendChild(inputContainer);
container.appendChild(todosList);
parentDiv.appendChild(container);

// Load todos from storage
function loadTodos() {
  chrome.storage.local.get([widgetId], (result) => {
    if (result[widgetId]) {
      todos = result[widgetId];
      renderTodos();
    }
  });
}

// Save todos to storage
function saveTodos() {
  chrome.storage.local.set({ [widgetId]: todos });
}

// Render todos
function renderTodos() {
  todosList.innerHTML = '';

  if (todos.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.textContent = 'No todos yet. Add one above!';
    emptyMsg.style.cssText = `
      text-align: center;
      color: #999;
      padding: 20px;
      font-style: italic;
    `;
    todosList.appendChild(emptyMsg);
    return;
  }

  todos.forEach((todo, index) => {
    const todoItem = document.createElement('div');
    todoItem.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      margin-bottom: 10px;
      background-color: ${todo.completed ? '#f0f0f0' : '#fff'};
      border-radius: 8px;
      border: 1px solid ${todo.completed ? '#ccc' : '#ddd'};
    `;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.style.cssText = `
      width: 18px;
      height: 18px;
      cursor: pointer;
    `;
    checkbox.addEventListener('change', () => toggleTodo(index));

    // Todo text
    const todoText = document.createElement('span');
    todoText.textContent = todo.text;
    todoText.style.cssText = `
      flex: 1;
      font-size: 14px;
      color: ${todo.completed ? '#999' : '#333'};
      text-decoration: ${todo.completed ? 'line-through' : 'none'};
    `;

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '🗑️';
    deleteButton.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      opacity: 0.6;
    `;
    deleteButton.addEventListener('click', () => deleteTodo(index));
    deleteButton.addEventListener('mouseenter', () => {
      deleteButton.style.opacity = '1';
    });
    deleteButton.addEventListener('mouseleave', () => {
      deleteButton.style.opacity = '0.6';
    });

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

// Button hover effect
addButton.addEventListener('mouseenter', () => {
  addButton.style.backgroundColor = '#45a049';
});
addButton.addEventListener('mouseleave', () => {
  addButton.style.backgroundColor = '#4CAF50';
});

// Load todos on init
loadTodos();

}
