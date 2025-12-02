/**
 * Detailed TODO Widget
 * Allows users to create, edit, and delete detailed TODO items with descriptions and due dates. The TODO items are saved in local storage.
 */
debug.log("Detailed TODO widget loaded");
{
const parentDiv = document.currentScript.parentElement;
const currentScript = document.currentScript;
const scriptSrc = currentScript.src;
const url = new URL(scriptSrc);
const widgetId = url.searchParams.get('id') || 'todo-detailed-default';

let todos = [];

// Create container
const container = document.createElement('div');
container.style.cssText = `
  font-family: Arial, sans-serif;
  max-width: 550px;
  margin: 20px;
  background-color: var(--s-col);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;

// Create title
const title = document.createElement('h3');
title.textContent = 'Detailed Todo List';
title.style.cssText = `
  margin: 0 0 20px 0;
  color: var(--t-col);
  font-size: 24px;
  text-align: center;
`;

// Create form
const form = document.createElement('div');
form.style.cssText = `
  background-color: rgba(255,255,255,0.5);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
`;

// Create title input
const titleInput = document.createElement('input');
titleInput.type = 'text';
titleInput.placeholder = 'Todo title...';
titleInput.style.cssText = `
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  margin-bottom: 10px;
  box-sizing: border-box;
  background-color: #fff;
  color: #333;
`;

// Create description input
const descInput = document.createElement('textarea');
descInput.placeholder = 'Description (optional)...';
descInput.style.cssText = `
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  margin-bottom: 10px;
  resize: vertical;
  min-height: 60px;
  box-sizing: border-box;
  font-family: inherit;
  background-color: #fff;
  color: #333;
`;

// Create due date container
const dateContainer = document.createElement('div');
dateContainer.style.cssText = `
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
`;

const dateLabel = document.createElement('label');
dateLabel.textContent = 'Due:';
dateLabel.style.cssText = `
  font-size: 14px;
  color: #333;
`;

const dateInput = document.createElement('input');
dateInput.type = 'date';
dateInput.style.cssText = `
  flex: 1;
  padding: 8px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  background-color: #fff;
  color: #333;
`;

dateContainer.appendChild(dateLabel);
dateContainer.appendChild(dateInput);

// Create add button
const addButton = document.createElement('button');
addButton.textContent = '+ Add Todo';
addButton.style.cssText = `
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
`;

form.appendChild(titleInput);
form.appendChild(descInput);
form.appendChild(dateContainer);
form.appendChild(addButton);

// Create todos list
const todosList = document.createElement('div');
todosList.style.cssText = `
  max-height: 500px;
  overflow-y: auto;
`;

// Append elements
container.appendChild(title);
container.appendChild(form);
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
      padding: 15px;
      margin-bottom: 12px;
      background-color: ${todo.completed ? '#f0f0f0' : '#fff'};
      border-radius: 10px;
      border: 1px solid ${todo.completed ? '#ccc' : '#ddd'};
    `;

    // Header row
    const headerRow = document.createElement('div');
    headerRow.style.cssText = `
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 8px;
    `;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.style.cssText = `
      width: 18px;
      height: 18px;
      cursor: pointer;
      margin-top: 2px;
    `;
    checkbox.addEventListener('change', () => toggleTodo(index));

    // Content container
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
      flex: 1;
    `;

    // Title
    const todoTitle = document.createElement('div');
    todoTitle.textContent = todo.title;
    todoTitle.style.cssText = `
      font-size: 16px;
      font-weight: bold;
      color: ${todo.completed ? '#999' : '#333'};
      text-decoration: ${todo.completed ? 'line-through' : 'none'};
      margin-bottom: 5px;
    `;

    // Description
    if (todo.description) {
      const todoDesc = document.createElement('div');
      todoDesc.textContent = todo.description;
      todoDesc.style.cssText = `
        font-size: 13px;
        color: ${todo.completed ? '#aaa' : '#666'};
        margin-bottom: 5px;
      `;
      contentContainer.appendChild(todoTitle);
      contentContainer.appendChild(todoDesc);
    } else {
      contentContainer.appendChild(todoTitle);
    }

    // Due date
    if (todo.dueDate) {
      const dueDateDiv = document.createElement('div');
      const dueDate = new Date(todo.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isOverdue = dueDate < today && !todo.completed;

      dueDateDiv.textContent = `Due: ${dueDate.toLocaleDateString()}`;
      dueDateDiv.style.cssText = `
        font-size: 12px;
        color: ${isOverdue ? '#f44336' : '#666'};
        font-weight: ${isOverdue ? 'bold' : 'normal'};
      `;
      contentContainer.appendChild(dueDateDiv);
    }

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

    headerRow.appendChild(checkbox);
    headerRow.appendChild(contentContainer);
    headerRow.appendChild(deleteButton);
    todoItem.appendChild(headerRow);
    todosList.appendChild(todoItem);
  });
}

// Add todo
function addTodo() {
  const todoTitle = titleInput.value.trim();
  if (todoTitle) {
    const newTodo = {
      title: todoTitle,
      description: descInput.value.trim(),
      dueDate: dateInput.value,
      completed: false
    };
    todos.push(newTodo);
    titleInput.value = '';
    descInput.value = '';
    dateInput.value = '';
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
titleInput.addEventListener('keypress', (e) => {
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
