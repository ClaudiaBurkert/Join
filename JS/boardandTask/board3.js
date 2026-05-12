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

