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

// Parse settings from URL parameters
const settings = {
  id: url.searchParams.get('id') || 'todo-detailed-default',
  title: url.searchParams.get('title') || 'Detailed Todo List',
  maxWidth: parseInt(url.searchParams.get('maxWidth')) || 550,
  maxHeight: parseInt(url.searchParams.get('maxHeight')) || 500,
  fontFamily: url.searchParams.get('fontFamily') || 'Arial, sans-serif',
  backgroundColor: url.searchParams.get('backgroundColor') || 'var(--s-col)',
  textColor: url.searchParams.get('textColor') || 'var(--t-col)',
  buttonColor: url.searchParams.get('buttonColor') || '#4CAF50',
  buttonHoverColor: url.searchParams.get('buttonHoverColor') || '#45a049',
  completedColor: url.searchParams.get('completedColor') || '#f0f0f0',
  overdueColor: url.searchParams.get('overdueColor') || '#f44336'
};

let todos = [];

// Create style element
const style = document.createElement('style');
style.textContent = `
  .todo-detailed-container {
    font-family: ${settings.fontFamily};
    max-width: ${settings.maxWidth}px;
    margin: 20px;
    background-color: ${settings.backgroundColor};
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }
  .todo-detailed-title {
    margin: 0 0 20px 0;
    color: ${settings.textColor};
    font-size: 24px;
    text-align: center;
  }
  .todo-detailed-form {
    background-color: rgba(255,255,255,0.5);
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 20px;
  }
  .todo-detailed-input {
    width: 100%;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    margin-bottom: 10px;
    box-sizing: border-box;
    background-color: #fff;
    color: #333;
  }
  .todo-detailed-textarea {
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
  }
  .todo-detailed-date-container {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }
  .todo-detailed-date-label {
    font-size: 14px;
    color: #333;
  }
  .todo-detailed-date-input {
    flex: 1;
    padding: 8px;
    border: 2px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    background-color: #fff;
    color: #333;
  }
  .todo-detailed-add-button {
    width: 100%;
    padding: 12px;
    background-color: ${settings.buttonColor};
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  .todo-detailed-add-button:hover {
    background-color: ${settings.buttonHoverColor};
  }
  .todo-detailed-list {
    max-height: ${settings.maxHeight}px;
    overflow-y: auto;
  }
  .todo-detailed-item {
    padding: 15px;
    margin-bottom: 12px;
    border-radius: 10px;
    border: 1px solid #ddd;
  }
  .todo-detailed-item.completed {
    background-color: ${settings.completedColor};
    border-color: #ccc;
  }
  .todo-detailed-item:not(.completed) {
    background-color: #fff;
  }
  .todo-detailed-header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 8px;
  }
  .todo-detailed-checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
    margin-top: 2px;
  }
  .todo-detailed-content {
    flex: 1;
  }
  .todo-detailed-item-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
  }
  .todo-detailed-item-title.completed {
    color: #999;
    text-decoration: line-through;
  }
  .todo-detailed-item-desc {
    font-size: 13px;
    color: #666;
    margin-bottom: 5px;
  }
  .todo-detailed-item-desc.completed {
    color: #aaa;
  }
  .todo-detailed-item-date {
    font-size: 12px;
    color: #666;
  }
  .todo-detailed-item-date.overdue {
    color: ${settings.overdueColor};
    font-weight: bold;
  }
  .todo-detailed-delete-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    opacity: 0.6;
    transition: opacity 0.2s;
  }
  .todo-detailed-delete-button:hover {
    opacity: 1;
  }
  .todo-detailed-empty {
    text-align: center;
    color: #999;
    padding: 20px;
    font-style: italic;
  }
`;
parentDiv.appendChild(style);

// Create container
const container = document.createElement('div');
container.className = 'todo-detailed-container';

// Create title
const title = document.createElement('h3');
title.textContent = settings.title;
title.className = 'todo-detailed-title';

// Create form
const form = document.createElement('div');
form.className = 'todo-detailed-form';

// Create title input
const titleInput = document.createElement('input');
titleInput.type = 'text';
titleInput.placeholder = 'Todo title...';
titleInput.className = 'todo-detailed-input';

// Create description input
const descInput = document.createElement('textarea');
descInput.placeholder = 'Description (optional)...';
descInput.className = 'todo-detailed-textarea';

// Create due date container
const dateContainer = document.createElement('div');
dateContainer.className = 'todo-detailed-date-container';

const dateLabel = document.createElement('label');
dateLabel.textContent = 'Due:';
dateLabel.className = 'todo-detailed-date-label';

const dateInput = document.createElement('input');
dateInput.type = 'date';
dateInput.className = 'todo-detailed-date-input';

dateContainer.appendChild(dateLabel);
dateContainer.appendChild(dateInput);

// Create add button
const addButton = document.createElement('button');
addButton.textContent = '+ Add Todo';
addButton.className = 'todo-detailed-add-button';

form.appendChild(titleInput);
form.appendChild(descInput);
form.appendChild(dateContainer);
form.appendChild(addButton);

// Create todos list
const todosList = document.createElement('div');
todosList.className = 'todo-detailed-list';

// Append elements
container.appendChild(title);
container.appendChild(form);
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
    emptyMsg.className = 'todo-detailed-empty';
    todosList.appendChild(emptyMsg);
    return;
  }

  todos.forEach((todo, index) => {
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-detailed-item';
    if (todo.completed) {
      todoItem.classList.add('completed');
    }

    // Header row
    const headerRow = document.createElement('div');
    headerRow.className = 'todo-detailed-header';

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.className = 'todo-detailed-checkbox';
    checkbox.addEventListener('change', () => toggleTodo(index));

    // Content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'todo-detailed-content';

    // Title
    const todoTitle = document.createElement('div');
    todoTitle.textContent = todo.title;
    todoTitle.className = 'todo-detailed-item-title';
    if (todo.completed) {
      todoTitle.classList.add('completed');
    }

    // Description
    if (todo.description) {
      const todoDesc = document.createElement('div');
      todoDesc.textContent = todo.description;
      todoDesc.className = 'todo-detailed-item-desc';
      if (todo.completed) {
        todoDesc.classList.add('completed');
      }
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
      dueDateDiv.className = 'todo-detailed-item-date';
      if (isOverdue) {
        dueDateDiv.classList.add('overdue');
      }
      contentContainer.appendChild(dueDateDiv);
    }

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '🗑️';
    deleteButton.className = 'todo-detailed-delete-button';
    deleteButton.addEventListener('click', () => deleteTodo(index));

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

// Load todos on init
loadTodos();

}
