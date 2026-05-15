
const BASE_URL = "https://join-6f9cc-default-rtdb.europe-west1.firebasedatabase.app/";
let contacts = [];
let editingSubtaskIndex = null;
let assignedPreviewMode = false;
const mediumBtn = document.querySelector(".importanceLevel:nth-child(2)");
const lowBtn = document.querySelector(".importanceLevel:nth-child(3)");
let task = {
  title: "",
  description: "",
  dueDate: "",
  priority: "",
  assignedTo: [],
  category: "",
  subTasks: [],
  field: "1",
};

/**
 * Initializes the add-task page.
 * Loads all required data, event listeners,
 * UI interactions and default settings.
 *
 * @async
 * @function init
 * @returns {Promise<void>}
 */
async function init() {
  setupBoardDialog();
  renderTemplate();
  setupSubtaskEnter();
  setupAssignedDropdownClose();
  setupLiveValidation();
  setupPriorityButtons();
  setDefaultPriority();
  setupDueDateInput();
  await loadContacts();

  document.addEventListener("click", closeCategoryDropdown);
}

/**
 * Configures the board dialog for add-task mode.
 * Disables edit-task mode if available.
 *
 * @function setupBoardDialog
 * @returns {void}
 */
function setupBoardDialog() {
  // const boardDialog = document.getElementById("boardAddTask");
  // if (boardDialog) {
  //   boardDialog.classList.remove("edit-task-dialog");
  // }

  if (typeof isEditTaskMode !== "undefined") {
    isEditTaskMode = false;
  }
}

/**
 * Renders the add-task template
 * into the main content container.
 *
 * @function renderTemplate
 * @returns {void}
 */
function renderTemplate() {
  document.getElementById("mainContent").innerHTML = createTaskTemplate();
}

/**
 * Saves a task to Firebase.
 * Generates a unique task key beforehand.
 *
 * @async
 * @function saveTask
 * @param {Object} task - Task object to save.
 * @returns {Promise<string|null>} Firebase task key or null on failure.
 */
async function saveTask(task) {
  try {
    const existingTasks = (await DataGET("Tasks")) || {};
    const { taskID, taskKey } = generateTaskKey(existingTasks);

    return await saveTaskToFirebase(task, taskID, taskKey);
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    return null;
  }
}

/**
 * Creates the payload object for Firebase storage.
 * Includes default subtask review values.
 *
 * @function createTaskPayload
 * @param {Object} task - Task object.
 * @param {number} taskID - Generated task ID.
 * @returns {Object} Firebase-ready task payload.
 */
function createTaskPayload(task, taskID) {
  let checkboxString = task.subTasks.map(() => "U").toString();

  return {
    ...task,
    id: taskID,
    field: { field: "field1" },
    assignedTo: task.assignedTo,
    subTasks: task.subTasks,
    subTasksReview: {
      0: checkboxString,
    },
  };
}

/**
 * Saves the prepared task payload to Firebase.
 *
 * @async
 * @function saveTaskToFirebase
 * @param {Object} task - Task object.
 * @param {number} taskID - Generated task ID.
 * @param {string} taskKey - Firebase task key.
 * @returns {Promise<string>} Saved task key.
 */
async function saveTaskToFirebase(task, taskID, taskKey) {
  const payload = createTaskPayload(task, taskID);

  await DataPUT(`Tasks/${taskKey}`, payload);

  console.log("Task saved:", taskKey);
  count++;
  return taskKey;
}

/**
 * Generates the next available task ID and Firebase key.
 *
 * @function generateTaskKey
 * @param {Object} existingTasks - Existing Firebase tasks.
 * @returns {{taskID: number, taskKey: string}}
 */
function generateTaskKey(existingTasks) {
  const keys = Object.keys(existingTasks || {});
  const lastIndex =
    keys.length > 0
      ? Math.max(...keys.map((k) => parseInt(k.replace("Task", ""))))
      : 0;

  const taskID = lastIndex + 1;
  const taskKey = "Task" + taskID;

  return { taskID, taskKey };
}

/**
 * Collects form values, validates the task,
 * and starts the save process.
 *
 * @async
 * @function createTask
 * @returns {Promise<string|null>} Saved task key or null.
 */
async function createTask() {
  assignTaskValues();

  let selectedCategory = "";

  if (!handleTaskValidation()) return null;

  return await handleTaskSaving();
}

/**
 * Assigns form input values
 * to the global task object.
 *
 * @function assignTaskValues
 * @returns {void}
 */
function assignTaskValues() {
  const titleInput = document.getElementById("taskName");
  const descInput = document.getElementById("taskDesc");
  const dateInput = document.getElementById("DueDate");

  task.title = titleInput.value;
  task.description = descInput.value;
  task.dueDate = dateInput.value;
}

/**
 * Validates the current task data.
 *
 * @function handleTaskValidation
 * @returns {boolean} True if valid, otherwise false.
 */
function handleTaskValidation() {
  errorMessage();

  if (!task.title || !task.dueDate || !task.category) {
    return false;
  }

  return true;
}

/**
 * Saves the task and handles success UI.
 *
 * @async
 * @function handleTaskSaving
 * @returns {Promise<string|null>} Saved task key or null.
 */
async function handleTaskSaving() {
  const taskKey = await saveTask(task);

  if (taskKey) {
    showToast();
    clearForm();
    return taskKey;
  }

  return null;
}

/**
 * Creates a simplified task object
 * from current form input values.
 *
 * @function getTaskFromInput
 * @returns {Object|null} Task object or null if invalid.
 */
function getTaskFromInput() {
  const task = {
    title: document.getElementById("taskName").value,
    dueDate: document.getElementById("DueDate").value,
    category: selectedCategory,
  };

  if (!task.title || !task.dueDate || !task.category) {
    return null;
  }

  return task;
}

/**
 * Creates a task and redirects
 * to the board page after success.
 *
 * @async
 * @function createTaskAndRefreshBoard
 * @returns {Promise<void>}
 */
async function createTaskAndRefreshBoard() {
  errorMessage();

  const task = getTaskFromInput();
  if (!task) return;

  await createTask();

  showToast();

  setTimeout(() => {
    window.location.href = "board.html";
  }, 800);
}

/**
 * Resets the task form and
 * restores the default task object.
 *
 * @function resetTaskData
 * @returns {void}
 */
function resetTaskData() {
  document.getElementById("taskForm").reset();

  task = {
    title: "",
    description: "",
    dueDate: "",
    priority: "",
    assignedTo: [],
    category: "",
    subTasks: [],
    field: "1",
    createdAt: null,
  };

  resetValidation();
}

/**
 * Clears all subtasks
 * and re-renders the subtask list.
 *
 * @function resetSubTasks
 * @returns {void}
 */
function resetSubTasks() {
  document.getElementById("subtaskInput").value = "";
  renderSubTasks();
}

/**
 * Resets the category UI elements.
 *
 * @function resetCategoryUI
 * @returns {void}
 */
function resetCategoryUI() {
  document.getElementById("categoryLabel").textContent = "Select task category";

  const button = document.querySelector(".TaskCategoryInput");
  if (button) button.classList.remove("input-error");

  const error = document.getElementById("categoryError");
  if (error) error.classList.remove("visible");
}
