let curentTaskID = 0;
let isEditTaskMode = false;
let editSubTaskReview = [];

/**
 * Initializes edit mode for a task, fills the form with existing values, and wires all edit helpers.
 *
 * @param {number|string} taskID Task ID to load into the edit dialog.
 * @returns {Promise<void>} Resolves after the edit form is fully prepared.
 */
async function editPreparation(taskID) {
  let refTaskEditTask = TASK[0][`Task${taskID}`];
  isEditTaskMode = true;
  editSubTaskReview = [];
  document.getElementById("mainContent").innerHTML = createTaskTemplate(`${refTaskEditTask.title}`,`${refTaskEditTask.description}`, `${refTaskEditTask.dueDate}`);
  document.querySelector('.taskButton').remove();
  document.querySelector('.mainTitle').remove();
  createSaveDataEditTaskButton(taskID);
  createExitButtonEditTask();
   rewriteTaskFields(refTaskEditTask);
  document.getElementById("DueDate").value = task.dueDate;
  await setupFunctionEditTask( refTaskEditTask);
}

/**
 * Copies the selected task values into the shared edit state object.
 *
 * @param {Object} refTaskEditTask Task object currently edited.
 * @returns {void}
 */
function rewriteTaskFields(refTaskEditTask) {
  task.title = refTaskEditTask.title;
  task.description = refTaskEditTask.description;
  task.dueDate = refTaskEditTask.dueDate;
}

/**
 * Wires up all edit-form behaviors and preloads task data into the shared form state.
 *
 * @param {Object} refTaskEditTask Task object currently edited.
 * @returns {Promise<void>} Resolves after all edit helpers are initialized.
 */
async function setupFunctionEditTask( refTaskEditTask){
  setupSubtaskEnter();
  setupAssignedDropdownClose();
  setupLiveValidation();
  setupPriorityButtons();
  setDefaultPriority(`.priorityButton.${refTaskEditTask.priority.toLowerCase()}`);
  task.priority = refTaskEditTask.priority;
  setupDueDateInput();
  await loadContacts();
  prepareAssignedToEditTask(refTaskEditTask);
  selectCategory(refTaskEditTask.category);
  task.category = refTaskEditTask.category;
  prepareSubTasksEditTask(refTaskEditTask);
}

/**
 * Copies the task's assigned contacts into the current edit state and renders them below the assignee input.
 *
 * @param {Object} refTaskEditTask Task object currently edited.
 * @returns {void}
 */
function prepareAssignedToEditTask(refTaskEditTask) {
  if (refTaskEditTask.assignedTo == [] || refTaskEditTask.assignedTo == undefined || refTaskEditTask.assignedTo == null) {
    return;
  }
  task.assignedTo = [];
  for (let index = 0; index < refTaskEditTask.assignedTo.length; index++) {
    task.assignedTo.push(`${refTaskEditTask.assignedTo[index]}`);
    
  }
  renderSelectedContactsBelowInput();
}

/**
 * Loads existing subtasks and their review state, then renders the subtask list.
 *
 * @param {Object} refTaskEditTask Task object currently edited.
 * @returns {void}
 */
function prepareSubTasksEditTask(refTaskEditTask){
  let existingSubTasks = safeArray(refTaskEditTask.subTasks);
  let existingReview = safeText(refTaskEditTask?.subTasksReview?.[0], '').split(',');

  task.subTasks = [...existingSubTasks];
  editSubTaskReview = task.subTasks.map((_, index) => existingReview[index] === 'C' ? 'C' : 'U');
  renderSubTasks();
}

/**
 * Creates and appends the edit save button and stores the current task ID.
 *
 * @param {number|string} taskID Task ID that should be saved when the button is pressed.
 * @returns {void}
 */
function createSaveDataEditTaskButton(taskID) {
  curentTaskID = taskID;
  let refsaveButtonEditTask = document.createElement('div');
  refsaveButtonEditTask.className = `boardEditTaskButtonContainer`;
  refsaveButtonEditTask.innerHTML = `<div onclick ="getDataEditTask(); checkValidation(${taskID})" class ="ButtonBlueFilled boardEditTaskButton">OK <img src="./assets/img/check-2.svg" alt="OK"></div>`
  document.querySelector(".buttonRequiredField").appendChild(refsaveButtonEditTask);
}

/**
 * Checks whether the required edit fields are valid before saving.
 *
 * @param {number|string} taskID Task ID being validated for saving.
 * @returns {void}
 */
function checkValidation(taskID) {
  if (task.title == "" || task.dueDate == "" || task.category == "") {
      return;
  }else{
    closedialog('boardEditTask');
    saveDataEditTask();
    return;
  }
  
}

/**
 * Shows the existing close button in edit mode by removing the hidden state class.
 *
 * @returns {void}
 */
function showExitButtonEditTask() {
  document.getElementById('boardTaskcloseDialogX').classList.remove('displayNone');
}

/**
 * Creates the edit dialog close button and appends it to the add-task header area.
 *
 * @returns {void}
 */
function createExitButtonEditTask() {
  let refExitButtonEditTask = document.createElement('div');
  refExitButtonEditTask.innerHTML = `<div class= "closeDialogX" onclick = "closedialog('boardEditTask')">X</div>`;
  document.getElementById("addTaskHeaderContent").appendChild(refExitButtonEditTask);
}

/**
 * Reads the current form inputs and writes them into the shared task state object.
 *
 * @returns {void}
 */
function getDataEditTask() {
  const editDialog = document.getElementById("boardEditTask");
  const titleInput = editDialog?.querySelector("#taskName") || document.getElementById("taskName");
  const descInput = editDialog?.querySelector("#taskDesc") || document.getElementById("taskDesc");
  const dateInput = editDialog?.querySelector("#DueDate") || document.getElementById("DueDate");

  task.title = titleInput?.value ?? "";
  task.description = descInput?.value ?? "";
  task.dueDate = dateInput?.value ?? "";
  task.category = selectedCategory;
}

/**
 * Builds the updated task payload, saves it via API, and reinitializes the board.
 *
 * @returns {Promise<void>} Resolves after the updated task was stored.
 */
async function saveDataEditTask(){
  let refTaskEditTask = TASK[0][`Task${curentTaskID}`];
  let checkboxString = getEditTaskSubtaskReviewString(task.subTasks, refTaskEditTask);
  await DataPUT(`/Tasks/Task${curentTaskID}`, {
    'title': task.title, 'id': curentTaskID, 'dueDate':  task.dueDate, 'priority': task.priority,
    'category': task.category,'description': task.description,'field': refTaskEditTask.field,
    'assignedTo': task.assignedTo, 'subTasks': task.subTasks,
    'subTasksReview': {
      0: checkboxString,
    }})
    boardInit();
    task.subTasks = [];
}

/**
 * Produces a normalized comma-separated review string for all current subtasks.
 *
 * @param {Array<string>} subTasks Current subtask list.
 * @param {Object} refTaskEditTask Original task object from Firebase.
 * @returns {string} Comma-separated review state string.
 */
function getEditTaskSubtaskReviewString(subTasks, refTaskEditTask) {
  if (!Array.isArray(subTasks) || subTasks.length === 0) {
    return '';
  }
  let fallbackReview = safeText(refTaskEditTask?.subTasksReview?.[0], '').split(',');
  let normalizedReview = [];
  prepareEditSubTaskReview(fallbackReview, normalizedReview, subTasks);
  return normalizedReview.toString();
}

/**
 * Resolves each subtask review value by preferring edit-state values and falling back to stored ones.
 *
 * @param {Array<string>} fallbackReview Persisted review values from Firebase.
 * @param {Array<string>} normalizedReview Mutable list that receives the normalized review values.
 * @param {Array<string>} subTasks Current subtask list.
 * @returns {void}
 */
function prepareEditSubTaskReview(fallbackReview, normalizedReview, subTasks){
  for (let index = 0; index < subTasks.length; index++) {
    if (editSubTaskReview[index] === 'C') {
      normalizedReview.push('C');
    } else if (editSubTaskReview[index] === 'U') {
      normalizedReview.push('U');
    } else {
      normalizedReview.push(fallbackReview[index] === 'C' ? 'C' : 'U');
    }
  }
}

/**
 * Appends an unchecked review state when a new subtask is added in edit mode.
 *
 * @returns {void}
 */
function handleSubtaskAddedInEditMode() {
  if (!isEditTaskMode) {
    return;
  }

  editSubTaskReview.push('U');
}

/**
 * Removes the matching review state entry when a subtask is deleted in edit mode.
 *
 * @param {number} index Index of the deleted subtask.
 * @returns {void}
 */
function handleSubtaskDeletedInEditMode(index) {
  if (!isEditTaskMode) {
    return;
  }

  editSubTaskReview.splice(index, 1);
}