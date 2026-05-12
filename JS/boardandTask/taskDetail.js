let currentTaskId;
let subtaskStatusList = [];

/**
 * Opens a dialog and applies the open animation state.
 *
 * @param {string} ID Dialog element ID.
 * @returns {void}
 */
function opendialog(ID) {
    const refdialog = document.getElementById(ID);
    refdialog.showModal();
    refdialog.classList.remove('closed');
    refdialog.classList.add('opend');
}

/**
 * Closes a dialog and applies the close animation state.
 *
 * @param {string} ID Dialog element ID.
 * @returns {void}
 */
function closedialog(ID) {
    const refdialog = document.getElementById(ID);
    refdialog.classList.add('closed');
    refdialog.classList.remove('opend');
    setTimeout(() => {
        refdialog.close();
    }, 200)
}

/**
 * Opens the task details dialog and loads all task-specific data.
 *
 * @param {number|string} taskID Task ID to show in the details dialog.
 * @returns {void}
 */
function openTaskDetails(taskID) {
    let reftaskDetails = document.getElementById('allTaskDetails');
    reftaskDetails.innerHTML = taskDetailsTamplate(taskID);
    taskCatagory(taskID, document.getElementById('taskDetailsCatagory'));
    renderSubtasksTaskDetails(taskID);
    getTaskDetailsContacts(taskID, 1);
    taskCheckPriority(taskID, document.getElementById(`taskDetailsPriorityContainer${taskID}`));
}

/**
 * Hides one element and shows another.
 *
 * @param {string} ID1 Element ID that should be hidden.
 * @param {string} ID2 Element ID that should be shown.
 * @returns {void}
 */
function displayNone(ID1, ID2) {
    document.getElementById(ID1).classList.add('displayNone');
    document.getElementById(ID2).classList.remove('displayNone');
}

/**
 * Shows the first element and hides the second.
 *
 * @param {string} ID1 Element ID that should be shown.
 * @param {string} ID2 Element ID that should be hidden.
 * @returns {void}
 */
function removeDisplayNone(ID1, ID2) {
    document.getElementById(ID1).classList.remove('displayNone');
    document.getElementById(ID2).classList.add('displayNone');
}

/**
 * Deletes a task from the DOM and backend.
 *
 * @param {number|string} ID Task ID to remove.
 * @returns {void}
 */
function deleteTask(ID) {
    let taskElement = document.getElementById(ID);
    if (taskElement) {
        taskElement.remove();
    }
    checkFieldIsEmpty();
    DataDELETE(`Tasks/Task${ID}`);
}

/**
 * Sends a DELETE request to remove data at the given path.
 *
 * @param {string} [path=""] Relative Firebase path without the trailing `.json` segment.
 * @returns {Promise<void>} Resolves after the delete request completes.
 */
async function DataDELETE(path = "") {
    let response = await fetch(BOARDURLBASE + path + '.json', {
        method: "DELETE"
    });

}

/**
 * Renders one loaded contact entry into the task-details container.
 *
 * @param {Object} contactDetails Contact object containing initials, name, and color.
 * @returns {void}
 */
function renderTaskDetailsContacts(contactDetails) {
    let reftaskDetailsATContainer = document.getElementById('taskDetailsAT');
    if (!reftaskDetailsATContainer || !contactDetails) {
        return;
    }
    reftaskDetailsATContainer.innerHTML += taskDetailContactsTamplate(contactDetails.initials, contactDetails.name, contactDetails.color);

}

/**
 * Toggles visibility between unchecked and checked subtask icons.
 *
 * @param {string} uncheckedCheckboxId Element ID of the unchecked checkbox icon.
 * @param {string} checkedCheckboxId Element ID of the checked checkbox icon.
 * @returns {void}
 */
function toggleSubtaskCheckboxVisibility(uncheckedCheckboxId, checkedCheckboxId) {
    document.getElementById(uncheckedCheckboxId).classList.toggle('displayNone');
    document.getElementById(checkedCheckboxId).classList.toggle('displayNone');
}

/**
 * Renders all subtasks for a task and initializes their status.
 *
 * @param {number|string} taskID Task ID whose subtasks should be rendered.
 * @returns {void}
 */
function renderSubtasksTaskDetails(taskID) {
    let task = getTaskById(taskID);
    let subTasks = safeArray(task.subTasks);
    let subTaskReviewStatus = safeText(task?.subTasksReview?.[0], '').split(',');
    subtaskStatusList = [];
    let subTasksString = safeArray(task.subTasks);
    let subTasksContainer = document.getElementById('subTasks');

    if (hasNoSubtasks(subTasks) || !subTasksContainer) {
        return;
    }
    renderSubtasksIntoContainer(subTasksContainer, subTasksString, subTaskReviewStatus);
    setCurrentTaskId(taskID);
}

/**
 * Hides the subtasks heading when the current task has no subtasks.
 *
 * @param {Array<string>} subTasks List of subtasks for the current task.
 * @returns {boolean} `true` when the task contains no subtasks.
 */
function hasNoSubtasks(subTasks) {
    if (subTasks.length === 0) {
        document.getElementById('subTasksHeadline').classList.add('displayNone');
        return true;
    }
    return false;
}

/**
 * Renders every subtask entry into the task details container.
 *
 * @param {HTMLElement} subTasksContainer Container element for all subtasks.
 * @param {Array<string>} subTasksString List of subtask labels.
 * @param {Array<string>} subTaskReviewStatus Review flags for the subtasks.
 * @returns {void}
 */
function renderSubtasksIntoContainer(subTasksContainer, subTasksString, subTaskReviewStatus) {
    subTasksContainer.innerHTML = "";
    for (let subtaskID = 0; subtaskID < subTasksString.length; subtaskID++) {
        renderSingleSubtask(subtaskID, subTasksString[`${subtaskID}`], subTaskReviewStatus);
    }
}

/**
 * Renders one subtask row and stores its current completion status.
 *
 * @param {number} subtaskID Index of the subtask.
 * @param {string} subTask Subtask label.
 * @param {Array<string>} subTaskReviewStatus Review flags for the subtasks.
 * @returns {void}
 */
function renderSingleSubtask(subtaskID, subTask, subTaskReviewStatus) {
    subtaskStatusList.push(subTaskReviewStatus[subtaskID] === 'C' ? 'C' : 'U');
    document.getElementById('subTasks').innerHTML += subtaskTamplate(subtaskID, subTask);
    updateSubtaskCheckboxDisplay(subtaskID);
}

/**
 * Stores the currently opened task ID for later subtask updates.
 *
 * @param {number|string} taskID Task ID currently open in the dialog.
 * @returns {void}
 */
function setCurrentTaskId(taskID) {
    currentTaskId = taskID;
}

/**
 * Updates checkbox icons for a subtask based on its status.
 *
 * @param {number} subtaskID Index of the subtask.
 * @returns {void}
 */
function updateSubtaskCheckboxDisplay(subtaskID) {
    let checkedCheckbox = document.getElementById(`stCheckboxC${subtaskID}`);
    let uncheckedCheckbox = document.getElementById(`stCheckboxU${subtaskID}`);
    if (!checkedCheckbox || !uncheckedCheckbox) {
        return;
    }

    let isUnchecked = subtaskStatusList[subtaskID] === 'U';
    toggleSubtaskCheckboxClasses(checkedCheckbox, uncheckedCheckbox, isUnchecked);
}

/**
 * Applies the correct visible state to the checked and unchecked subtask icons.
 *
 * @param {HTMLElement} checkedCheckbox Checked checkbox element.
 * @param {HTMLElement} uncheckedCheckbox Unchecked checkbox element.
 * @param {boolean} isUnchecked Indicates whether the subtask is still unchecked.
 * @returns {void}
 */
function toggleSubtaskCheckboxClasses(checkedCheckbox, uncheckedCheckbox, isUnchecked) {
    checkedCheckbox.classList.toggle("displayNone", isUnchecked);
    uncheckedCheckbox.classList.toggle("displayNone", !isUnchecked);
}

/**
 * Toggles the completion status of a subtask.
 *
 * @param {string} checkboxId Element ID used to determine the new checkbox state.
 * @param {number} subtaskId Index of the subtask whose state should change.
 * @returns {void}
 */
function toggleSubtaskStatus(checkboxId, subtaskId) {
    let firstClassOfElement = document.getElementById(checkboxId).classList.item(0);
    if (firstClassOfElement != 'displayNone') {
        subtaskStatusList[subtaskId] = 'C';
    } else {
        subtaskStatusList[subtaskId] = 'U';
    }
}

/**
 * Saves the current subtask status list and updates the progress bar.
 *
 * @returns {Promise<void>} Resolves after the current subtask state was stored.
 */
async function storeSubtask() {
    if (!hasValidCurrentTaskId()) {
        return;
    }

    let checkboxString = subtaskStatusList.toString();
    let refTaskStoreSubtask = getTaskById(currentTaskId);
    if (Object.keys(refTaskStoreSubtask).length === 0) {
        return;
    }

    await saveSubtaskReviewAndUpdateProgress(refTaskStoreSubtask, checkboxString);
}

/**
 * Checks whether a valid task is currently selected in the task details dialog.
 *
 * @returns {boolean} `true` when a task details dialog is bound to a task ID.
 */
function hasValidCurrentTaskId() {
    return currentTaskId !== undefined && currentTaskId !== null;
}

/**
 * Updates in-memory and persisted subtask states and refreshes the progress bar.
 *
 * @param {Object} refTaskStoreSubtask Task object that should receive the updated review state.
 * @param {string} checkboxString Comma-separated review state string.
 * @returns {Promise<void>} Resolves after the review state was stored remotely.
 */
async function saveSubtaskReviewAndUpdateProgress(refTaskStoreSubtask, checkboxString) {
    updateStoredSubtaskReview(refTaskStoreSubtask, checkboxString);
    await persistSubtaskReview(checkboxString);
    updateSubtaskProgressbar(currentTaskId);
}

/**
 * Writes the current subtask review string into the loaded task object.
 *
 * @param {Object} refTaskStoreSubtask Task object that should be updated in memory.
 * @param {string} checkboxString Comma-separated review state string.
 * @returns {void}
 */
function updateStoredSubtaskReview(refTaskStoreSubtask, checkboxString) {
    refTaskStoreSubtask.subTasksReview = { 0: checkboxString };
}

/**
 * Persists the current subtask review string for the opened task.
 *
 * @param {string} checkboxString Comma-separated review state string.
 * @returns {Promise<void>} Resolves after Firebase stores the updated review string.
 */
async function persistSubtaskReview(checkboxString) {
    await DataPUT(`Tasks/Task${currentTaskId}/subTasksReview`, {
        0: `${checkboxString}`
    });
}

