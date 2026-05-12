
/** @type {string} Firebase base URL for all board-related requests. */
const BOARDURLBASE = 'https://join-6f9cc-default-rtdb.europe-west1.firebasedatabase.app/';

/** @type {Array<Object>} Cached task payload loaded from Firebase. */
let TASK = [];

/** @type {Array<Array<string>>} Cached task keys grouped by the loaded task collection. */
let TASKKEYS = [];

/** @type {number} Shared board counter used by legacy rendering helpers. */
let count = 0;

/** @type {number} Counter reserved for highlighted task placeholders. */
let highlightTaskCount = 0;

/** @type {number|string|undefined} ID of the task currently being dragged. */
let curentTraggedElement;

/** @type {Object<string, Object>} Cached contact records keyed by Firebase contact ID. */
let allContactDetails = [];

/** @type {MediaQueryList} Media query used to switch between desktop and mobile board layouts. */
let myMediaQuery = window.matchMedia('(max-width: 1723px)');

/**
 * Initializes the board layout for the current viewport and renders all tasks.
 *
 * @returns {Promise<void>} Resolves after the board finished loading its task data.
 */
async function boardInit() {
    if (myMediaQuery.matches) {
        document.getElementById('taskTableContent').innerHTML = taskBoardTamplateMobile();
        startLoadingScreenMobile();
    } else {
        document.getElementById('taskTableContent').innerHTML = taskBoardTamplate();
        startLoadingScreen();
    }
    await render();
}

/**
 * Fetches JSON data from Firebase for the provided path.
 *
 * @param {string} [path=""] Relative Firebase path without the trailing `.json` segment.
 * @returns {Promise<Object|null>} Resolves with the parsed payload or `null` when the request fails.
 */
async function DataGET(path = "") {
    try {
        let response = await fetch(BOARDURLBASE + path + '.json');
        if (!response.ok) {
            return null;
        }
        let responseASJson = await response.json();
        return responseASJson;
    } catch (error) {
        return null;
    }
}

/**
 * Persists JSON data to Firebase with a PUT request.
 *
 * @param {string} [path=""] Relative Firebase path without the trailing `.json` segment.
 * @param {Object} [data={}] Payload written to the requested path.
 * @returns {Promise<void>} Resolves after the request completes.
 */
async function DataPUT(path = "", data = {}) {
    await fetch(BOARDURLBASE + path + '.json', {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
}

/**
 * Reloads tasks and contacts from Firebase, then renders every board column.
 *
 * @returns {Promise<void>} Resolves after all task cards are rendered.
 */
async function render() {
    TASK = [];
    TASK.push(await DataGET('Tasks') || {});
    allContactDetails = await DataGET(`Contacts`) || {};
    emtyFieldContent();
    TASKKEYS = [];
    TASKKEYS.push(Object.keys(TASK[0] || {}));
    TASKKEYS[0].forEach(task => {
        loadTaskTamplate(TASK[0][`${task}`]);
    });
    checkFieldIsEmpty();
}

/**
 * Renders one task card into its target board column.
 *
 * @param {Object} refTask Task object loaded from Firebase.
 * @returns {Promise<void>} Resolves once the task card has been inserted and populated.
 */
async function loadTaskTamplate(refTask) {
    if (!refTask || refTask.id === undefined || refTask.id === null) {
        return;
    }

    let targetField = refTask?.field?.field;
    appendTaskToField(targetField, refTask.id);
    renderTaskCardDetails(refTask.id);
}

/**
 * Appends a task card to the requested board column or falls back to the first column.
 *
 * @param {string} targetField Preferred board column ID.
 * @param {number|string} taskID Task ID used to render the card markup.
 * @returns {void}
 */
function appendTaskToField(targetField, taskID) {
    let allFields = ['field1', 'field2', 'field3', 'field4'];
    if (allFields.includes(targetField)) {
        insertTaskIntoField(targetField, taskID);
        return;
    }
    insertTaskIntoField('field1', taskID);
}

/**
 * Inserts a task card template into the given board column.
 *
 * @param {string} fieldID Board column element ID.
 * @param {number|string} taskID Task ID used by the template helper.
 * @returns {void}
 */
function insertTaskIntoField(fieldID, taskID) {
    document.getElementById(fieldID).insertAdjacentHTML('beforeend', taskTamplate(taskID));
}

/**
 * Populates all dynamic details for a rendered task card.
 *
 * @param {number|string} taskID Task ID whose card should be hydrated.
 * @returns {void}
 */
function renderTaskCardDetails(taskID) {
    taskCatagory(taskID, document.getElementById(`boardTaskCatagory${taskID}`));
    updateSubtaskProgressbar(taskID);
    getTaskDetailsContacts(taskID, 0);
    taskCheckPriority(taskID, document.getElementById(`taskPriorityContainer${taskID}`));
}

/**
 * Clears the content of all board columns.
 *
 * @returns {void}
 */
function emtyFieldContent() {
    ['field1', 'field2', 'field3', 'field4'].forEach(fieldId => {
        let field = document.getElementById(fieldId);
        if (field) {
            field.innerHTML = "";
        }
    });
}

/**
 * Re-renders a moved task card in its new column.
 *
 * @param {string} field Target board column ID.
 * @param {number|string} [taskID=curentTraggedElement] Task ID that should be moved.
 * @returns {void}
 */
function renderMovedTask(field, taskID = curentTraggedElement) {
    let task = getTaskById(taskID);
    if (task.id === undefined || task.id === null) {
        return;
    }
    removeExistingTaskElement(task.id);

    document.getElementById(`${field}`).insertAdjacentHTML('beforeend', taskTamplate(task.id));
    removeHighlightBoardTaskFields();
    renderTaskCardDetails(taskID);
    checkFieldIsEmpty();
}

/**
 * Removes an already rendered task card from the DOM before it is reinserted.
 *
 * @param {number|string} taskID Task ID whose DOM node should be removed.
 * @returns {void}
 */
function removeExistingTaskElement(taskID) {
    let refMovedTask = document.getElementById(`${taskID}`);
    if (refMovedTask && refMovedTask.parentNode) {
        refMovedTask.parentNode.removeChild(refMovedTask);
    }
}

/**
 * Stores the currently dragged task and starts its drag animation.
 *
 * @param {number|string} taskID Task ID currently being dragged.
 * @returns {void}
 */
function draggedTask(taskID) {
    curentTraggedElement = taskID;
    highlightBoardTaskFields();
    transormTask();
}

/**
 * Enables dropping by preventing the browser's default drag-over behavior.
 *
 * @param {DragEvent} ev Native drag-over event.
 * @returns {void}
 */
function dragoverHandler(ev) {
    ev.preventDefault();
}

/**
 * Moves the currently dragged task to a new board column and persists the change.
 *
 * @param {string} field Target board column ID.
 * @returns {Promise<void>} Resolves after the task field is updated remotely.
 */
async function moveTo(field) {
    let task = getTaskById(curentTraggedElement);
    if (Object.keys(task).length === 0) {
        return;
    }

    updateTaskFieldForMove(task, field);
    document.getElementById(`${field}`).classList.remove("highlight");
    renderMovedTask(field);
    await persistMovedTaskField(field);
}

/**
 * Updates the in-memory field object of a moved task.
 *
 * @param {Object} task Task object that should receive the new field value.
 * @param {string} field Target board column ID.
 * @returns {void}
 */
function updateTaskFieldForMove(task, field) {
    task.field = task.field || {};
    task.field.field = `${field}`;
}

/**
 * Persists the new board column of the currently dragged task.
 *
 * @param {string} field Target board column ID.
 * @returns {Promise<void>} Resolves after Firebase stores the new field.
 */
async function persistMovedTaskField(field) {
    await DataPUT(`Tasks/Task${curentTraggedElement}/field`, {
        'field': `${field}`,
    });
}

/**
 * Shows or hides empty-column placeholders for all board columns.
 *
 * @returns {void}
 */
function checkFieldIsEmpty() {
    updateEmptyHintForField('field1', 'noTaskField1', 'No Tasks to do');
    updateEmptyHintForField('field2', 'noTaskField2', 'No Tasks in progress');
    updateEmptyHintForField('field3', 'noTaskField3', 'No Tasks await feedback');
    updateEmptyHintForField('field4', 'noTaskField4', 'No Tasks done');
}

/**
 * Adds or removes a single empty-state placeholder depending on the field content.
 *
 * @param {string} fieldId Board column element ID.
 * @param {string} placeholderId Placeholder element ID.
 * @param {string} placeholderText Placeholder text shown for an empty column.
 * @returns {void}
 */
function updateEmptyHintForField(fieldId, placeholderId, placeholderText) {
    let field = document.getElementById(fieldId);
    let hasTasks = field.querySelector('.task') !== null;
    let placeholder = document.getElementById(placeholderId);

    if (!hasTasks) {
        addEmptyFieldPlaceholder(field, placeholder, placeholderId, placeholderText);
        return;
    }
    removeExistingPlaceholder(placeholder);
}

/**
 * Creates an empty-state placeholder inside a board column.
 *
 * @param {HTMLElement} field Board column element.
 * @param {HTMLElement|null} placeholder Existing placeholder element, if present.
 * @param {string} placeholderId ID assigned to the placeholder element.
 * @param {string} placeholderText Text shown inside the placeholder.
 * @returns {void}
 */
function addEmptyFieldPlaceholder(field, placeholder, placeholderId, placeholderText) {
    if (!placeholder) {
        field.innerHTML = `<div id="${placeholderId}" class="taskContainer noTaskField">${placeholderText}</div>`;
    }
}

/**
 * Removes an existing empty-state placeholder from a board column.
 *
 * @param {HTMLElement|null} placeholder Placeholder element to remove.
 * @returns {void}
 */
function removeExistingPlaceholder(placeholder) {
    if (placeholder) {
        placeholder.remove();
    }
}

/**
 * Starts the rotation animation for the currently dragged task.
 *
 * @returns {void}
 */
function transormTask() {
    document.getElementById(`${curentTraggedElement}`).classList.add('rotate5deg');
}

/**
 * Stops the drag animation for the currently dragged task after a short delay.
 *
 * @returns {void}
 */
function endTransformTask() {
    removeHighlightBoardTaskFields();
    setTimeout(() => {
        document.getElementById(`${curentTraggedElement}`).classList.remove('rotate5deg');
    }, 100);
}

/**
 * Closes the add-task dialog and reinitializes the board when needed.
 *
 * @returns {void}
 */
function createTaskBoard() {
    const dialog = document.getElementById("boardAddTask");
    if (!!dialog?.open) {
        closedialog('boardAddTask');
        setTimeout(() => {
            boardInit();
        }, 200);
    }
}

/**
 * Returns the active board search input for the current viewport.
 *
 * @returns {HTMLElement|undefined} The focused desktop or mobile search input.
 */
function getActiveSearchInput() {
    let activeElement = document.activeElement;
    if (activeElement?.id === 'searchInput' || activeElement?.id === 'searchInputMobile') {
        return activeElement;
    }
}

/**
 * Runs a board search or restores the default board view when the input is cleared.
 *
 * @returns {Promise<void>} Resolves after the board view is updated.
 */
async function searchTask() {
    let refSearchInput = getActiveSearchInput();
    if (!refSearchInput) {
        return;
    }
    if (refSearchInput.value.length >= 1) {
        startTheSearch(refSearchInput);
        return;
    }
    if (refSearchInput.value.length == 0) {
        setTaskTableTemplateByViewport();
        await resetTaskDataAndRender();
    }
}

/**
 * Switches the board table markup to the current desktop or mobile variant.
 *
 * @returns {void}
 */
function setTaskTableTemplateByViewport() {
    if (myMediaQuery.matches) {
        document.getElementById('taskTableContent').innerHTML = taskBoardTamplateMobile();
        return;
    }
    document.getElementById('taskTableContent').innerHTML = taskBoardTamplate();
}

/**
 * Clears cached board data and renders the board again from the backend.
 *
 * @returns {Promise<void>} Resolves after the board is rendered again.
 */
async function resetTaskDataAndRender() {
    TASK = [];
    TASKKEYS = [];
    count = 0;
    await render();
}

/**
 * Filters tasks by title and description and renders the matches.
 *
 * @param {HTMLInputElement} refSearchInput Active search input element.
 * @returns {void}
 */
function startTheSearch(refSearchInput) {
    setTaskTableTemplateByViewport();
    let filter = refSearchInput.value.toUpperCase();
    let searchCount = 0;
    emtyFieldContent();
    safeArray(TASKKEYS[0]).forEach(task => {
        searchCount = addMatchingTaskToSearchResults(task, filter, searchCount);
    });
    if (searchCount == 0) {
        showNoTaskFoundHint();
    }
}

/**
 * Adds one matching task to the current search result view.
 *
 * @param {string} task Firebase task key.
 * @param {string} filter Uppercase search string.
 * @param {number} searchCount Current number of rendered matches.
 * @returns {number} Updated count of rendered search matches.
 */
function addMatchingTaskToSearchResults(task, filter, searchCount) {
    let taskRef = TASK[0][`${task}`] || {};
    if (!isTaskMatchingSearch(taskRef, filter)) {
        return searchCount;
    }
    loadTaskTamplate(taskRef);
    checkFieldIsEmpty();
    return searchCount + 1;
}

/**
 * Checks whether a task title or description matches the search text.
 *
 * @param {Object} taskRef Task object to inspect.
 * @param {string} filter Uppercase search string.
 * @returns {boolean} `true` when the task should be included in the search result.
 */
function isTaskMatchingSearch(taskRef, filter) {
    let refTaskTitle = safeText(taskRef.title, '');
    let refTaskDescription = safeText(taskRef.description, '');
    return refTaskTitle.toUpperCase().indexOf(filter) > -1 || refTaskDescription.toUpperCase().indexOf(filter) > -1;
}

/**
 * Replaces the board columns with a no-results hint after an unsuccessful search.
 *
 * @returns {void}
 */
function showNoTaskFoundHint() {
    document.getElementById('taskTableContent').innerHTML = `<tr><td class="noTaskFound">No Tasks Found</td></tr>`;
}

/**
 * Updates the animated progress bar width based on completed subtasks.
 *
 * @param {number|string} taskID Task ID whose progress bar should be updated.
 * @returns {void}
 */
function updateSubtaskProgressbar(taskID) {
    let completedPercentage = calculateSubtaskCompletionPercentage(taskID);
    let progressbarElement = document.getElementById(`subtaskProgressbar${taskID}`);
    if (!progressbarElement) {
        return;
    }

    animateProgressbar(progressbarElement, completedPercentage);
}

/**
 * Animates a subtask progress bar up to the computed completion percentage.
 *
 * @param {HTMLElement} progressbarElement Progress bar element to animate.
 * @param {number} completedPercentage Target percentage value.
 * @returns {void}
 */
function animateProgressbar(progressbarElement, completedPercentage) {
    let width = 0;
    let intervalId = setInterval(() => {
        width = updateProgressbarFrame(intervalId, width, completedPercentage, progressbarElement);
    }, 2);
    progressbarElement.style.width = width + "%";
}

/**
 * Advances the animated progress bar one frame.
 *
 * @param {number} intervalId Interval ID returned by `setInterval`.
 * @param {number} width Current progress width.
 * @param {number} completedPercentage Target completion percentage.
 * @param {HTMLElement} progressbarElement Progress bar element being animated.
 * @returns {number} The next width value.
 */
function updateProgressbarFrame(intervalId, width, completedPercentage, progressbarElement) {
    if (width > completedPercentage) {
        clearInterval(intervalId);
        return width;
    }
    let nextWidth = width + 1;
    progressbarElement.style.width = nextWidth + "%";
    return nextWidth;
}

/**
 * Calculates the completion percentage for all subtasks of a task.
 *
 * @param {number|string} taskID Task ID whose subtasks should be evaluated.
 * @returns {number} Completion percentage between `0` and `100`.
 */
function calculateSubtaskCompletionPercentage(taskID) {
    let task = getTaskById(taskID);
    let subTasks = safeArray(task.subTasks);
    let subtaskCheckedCountElement = document.getElementById(`subtaskCheckedCount${taskID}`);

    if (subTasks.length === 0) {
        hideSubtaskProgressbar(taskID);
        return 0;
    }

    return calculateAndRenderSubtaskCompletion(task, subTasks, subtaskCheckedCountElement);
}

/**
 * Hides the subtask progress display when a task has no subtasks.
 *
 * @param {number|string} taskID Task ID whose progress block should be hidden.
 * @returns {void}
 */
function hideSubtaskProgressbar(taskID) {
    document.getElementById(`allsubtaskProgressbar${taskID}`).classList.add("displayNone");
}

/**
 * Calculates completed subtasks, updates the counter, and returns the completion percentage.
 *
 * @param {Object} task Task object containing subtask review data.
 * @param {Array<string>} subTasks List of subtask labels.
 * @param {HTMLElement|null} subtaskCheckedCountElement Counter element for completed subtasks.
 * @returns {number} Completion percentage between `0` and `100`.
 */
function calculateAndRenderSubtaskCompletion(task, subTasks, subtaskCheckedCountElement) {
    let subTaskReviewList = getSubTaskReviewList(task);
    let completedSubtaskCount = countCompletedSubtasks(subTasks, subTaskReviewList);
    renderCompletedSubtaskCount(subtaskCheckedCountElement, completedSubtaskCount);
    return Math.round((completedSubtaskCount / subTasks.length) * 100);
}

/**
 * Writes the number of completed subtasks into the matching counter element.
 *
 * @param {HTMLElement|null} subtaskCheckedCountElement Counter element inside the task card.
 * @param {number} completedSubtaskCount Number of completed subtasks.
 * @returns {void}
 */
function renderCompletedSubtaskCount(subtaskCheckedCountElement, completedSubtaskCount) {
    if (subtaskCheckedCountElement) {
        subtaskCheckedCountElement.innerHTML = completedSubtaskCount;
    }
}

/**
 * Reads the saved subtask review states and returns them as an array.
 *
 * @param {Object} task Task object containing the persisted subtask review string.
 * @returns {Array<string>} List of review flags such as `C` and `U`.
 */
function getSubTaskReviewList(task) {
    let subTasksReviewString = safeText(task?.subTasksReview?.[0], '');
    return subTasksReviewString.length ? subTasksReviewString.split(',') : [];
}

/**
 * Counts how many subtasks are marked as completed in the review list.
 *
 * @param {Array<string>} subTasks List of subtask labels.
 * @param {Array<string>} subTaskReviewList Persisted subtask review flags.
 * @returns {number} Number of completed subtasks.
 */
function countCompletedSubtasks(subTasks, subTaskReviewList) {
    let completedSubtaskCount = 0;
    for (let index = 0; index < subTasks.length; index++) {
        let subTaskStatus = subTaskReviewList[index];
        if (subTaskStatus === 'C') {
            completedSubtaskCount++;
        }
    }
    return completedSubtaskCount;
}

