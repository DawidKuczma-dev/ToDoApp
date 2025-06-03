// Get DOM elements
const taskForm = document.querySelector('.task-form');
const taskInput = document.querySelector('.task-form__input');
const taskList = document.querySelector('.task-list');
const filterButtons = document.querySelectorAll('.task-footer__filter-btn');
const clearButton = document.querySelector('.container-list__clear-btn');
const counterEl = document.querySelector('.container-list__counter');
const themeToggle = document.getElementById('theme-toggle');

// Toggle theme
themeToggle.addEventListener('change', () => {
   document.body.classList.toggle('lightmode');
});

let tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Array of tasks
renderTasks(); // Render array from localStorage
let filteredTasks = []; // Filtered array of tasks
let filterStatus = 'all'; // Type of filter

// Function to create a new task
function createTask(taskText) {
   const task = {
      id: Date.now(),
      text: taskText,
      completed: false,
   };
   tasks.push(task);
   saveTasks();
   renderTasks();
}

// Function to create the entire task element
function createTaskElement(task, id) {
   const taskElement = document.createElement('li');
   taskElement.classList.add('task-item');

   const checkButton = document.createElement('button');
   checkButton.classList.add('task-item__check-btn');
   checkButton.classList.toggle('completed', task.completed);
   checkButton.innerHTML = '<img src="assets/images/icon-check.svg" alt="check-button" />';
   checkButton.addEventListener('click', () => toggleTaskCompletion(id));

   const taskText = document.createElement('span');
   taskText.classList.add('task-item__text');
   taskText.classList.toggle('completed', task.completed);
   taskText.innerHTML = `<span draggable=true>${task.text}</span>`;

   const deleteButton = document.createElement('button');
   deleteButton.classList.add('task-item__delete-btn');
   deleteButton.innerHTML = '<img src="assets/images/icon-cross.svg" alt="delete-button" />';
   deleteButton.addEventListener('click', () => deleteTask(id));

   taskElement.appendChild(checkButton);
   taskElement.appendChild(taskText);
   taskElement.appendChild(deleteButton);

   // Drag and drop
   const innerText = taskText.querySelector('span');
   innerText.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', task.id);
   });
   taskElement.addEventListener('dragover', (e) => {
      e.preventDefault();
   });
   taskElement.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggedTaskId = e.dataTransfer.getData('text/plain');
      moveTask(draggedTaskId, task.id);
   });

   return taskElement;
}

// Function to delete a task
function deleteTask(id) {
   tasks = tasks.filter((task) => task.id !== id);
   saveTasks();
   renderTasks();
}

// Function to change the task status
function toggleTaskCompletion(id) {
   const task = tasks.find((task) => task.id === id);
   if (task) task.completed = !task.completed;
   saveTasks();
   filterTasks(filterStatus);
}

// Function to filter tasks
function filterTasks(status) {
   if (status === 'active') {
      filteredTasks = tasks.filter((task) => !task.completed);
   } else if (status === 'completed') {
      filteredTasks = tasks.filter((task) => task.completed);
   } else {
      filteredTasks = tasks;
   }
   renderTasks(filteredTasks);
}

// Function to render tasks on the page
function renderTasks(list = tasks) {
   taskList.innerHTML = '';
   list.forEach((task) => {
      const taskElement = createTaskElement(task, task.id);
      taskList.appendChild(taskElement);
   });
   counterTasks(list.length);
}

// Function to count the number of tasks
function counterTasks(count) {
   const itemText = count === 1 ? 'item' : 'items';
   counterEl.textContent = `${count} ${itemText} left`;
}

// Form handling (adding a new task)
taskForm.addEventListener('submit', (event) => {
   event.preventDefault();
   const taskText = taskInput.value.trim();
   if (taskText) createTask(taskText);
   taskInput.value = '';
   filterStatus = 'all';
   filterButtons.forEach((btn) => btn.classList.remove('active'));
   filterButtons[0].classList.add('active');
});

// Filter handling
filterButtons.forEach((button) => {
   button.addEventListener('click', () => {
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      filterStatus = button.textContent.toLowerCase();
      filterTasks(filterStatus);
   });
});

// Handling the "Clear Completed" button
clearButton.addEventListener('click', () => {
   tasks = tasks.filter((task) => !task.completed);
   filterStatus = 'all';
   filterButtons.forEach((btn) => btn.classList.remove('active'));
   filterButtons[0].classList.add('active');
   saveTasks();
   renderTasks();
});

// Saving to localStorage
function saveTasks() {
   localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Drag and drop function
function moveTask(draggedId, targetID) {
   const draggedIndex = tasks.findIndex((task) => task.id == draggedId);
   const targetIndex = tasks.findIndex((task) => task.id == targetID);

   if (draggedId === -1 || targetID === -1) return;

   const [draggedTask] = tasks.splice(draggedIndex, 1);

   tasks.splice(targetIndex, 0, draggedTask);
   saveTasks();
   renderTasks();
}
