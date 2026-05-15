/**
 * Rebuilds the board layout when the viewport changes between desktop and mobile.
 *
 * @param {MediaQueryListEvent|MediaQueryList} myMediaQuery Media query state for the board viewport.
 * @returns {Promise<void>} Resolves after the board was rerendered for the new layout.
 */
async function widthChangeCallback(myMediaQuery) {
    if (myMediaQuery.matches) {
        document.getElementById('taskTableContent').innerHTML = taskBoardTamplateMobile();
        startLoadingScreenMobile();
        resetArrays();
        await render();
    } else {
        document.getElementById('taskTableContent').innerHTML = taskBoardTamplate();
        startLoadingScreen();
        resetArrays();
        await render();
    }
}
myMediaQuery.addEventListener('change', widthChangeCallback);

/**
 * Resets cached board task arrays and counters before a rerender.
 *
 * @returns {void}
 */
function resetArrays() {
    TASK = [];
    TASKKEYS = [];
    count = 0;
}

/**
 * Opens the mobile move menu next to the selected task card.
 *
 * @param {string} mobileArrowsMoveTaskID Element ID of the tapped mobile move trigger.
 * @param {number|string} taskID Task ID that should be moved.
 * @returns {void}
 */
function addMobileMoveTask(mobileArrowsMoveTaskID, taskID) {
    let refMobileArrowsMoveTaskID = document.getElementById(mobileArrowsMoveTaskID);
    let mobileArrowsMoveTaskPosition = refMobileArrowsMoveTaskID.getBoundingClientRect();
    let refDiv = document.createElement("div");
    refDiv.id = "taskMobileMove";
    checkFieldTaskMobile(taskID, refDiv, mobileArrowsMoveTaskPosition);
    document.getElementById('app-canvas').appendChild(refDiv);
}

/**
 * Returns the horizontal offset used to keep the mobile move menu in view.
 *
 * @returns {number} Horizontal offset in pixels.
 */
function chanchePositionMoveTaskMobile() {
    let moveTaskPositionOffset = 0;
    let mediaQuerymoveTaskMobile = window.matchMedia('(max-width: 670px)')
    if (mediaQuerymoveTaskMobile.matches) {
        return moveTaskPositionOffset = 100;
    } else {
        return moveTaskPositionOffset = 0;
    }
}

/**
 * Chooses the correct mobile move menu template for the task's current column.
 *
 * @param {number|string} taskID Task ID whose move menu should be created.
 * @param {HTMLElement} refDiv Wrapper element that receives the move menu markup.
 * @param {DOMRect} mobileArrowsMoveTaskPosition Bounding rectangle of the tapped move trigger.
 * @returns {void}
 */
function checkFieldTaskMobile(taskID, refDiv, mobileArrowsMoveTaskPosition) {
    let moveTaskPositionCheckedOffset = chanchePositionMoveTaskMobile();
    switch (TASK[0][`Task${taskID}`].field.field) {
        case 'field1':
            refDiv.innerHTML = moveTamplateTaskMobileField1(taskID, mobileArrowsMoveTaskPosition, moveTaskPositionCheckedOffset);
            break;
        case 'field4':
            refDiv.innerHTML = moveTamplateTaskMobileField4(taskID, mobileArrowsMoveTaskPosition, moveTaskPositionCheckedOffset);
            break;
        default:
            refDiv.innerHTML = moveTamplateTaskMobileField2_3(taskID, mobileArrowsMoveTaskPosition, moveTaskPositionCheckedOffset);
            break; }
}

/**
 * Removes the temporary mobile move menu from the DOM.
 *
 * @returns {void}
 */
function removeMobileMoveTask() {
    document.getElementById("taskMobileMove").remove();
}

/**
 * Moves a task one column upward in the mobile board flow when possible.
 *
 * @param {number|string} taskID Task ID to move upward.
 * @returns {void}
 */
function taskMoveUpMobile(taskID) {
    let refField = TASK[0][`Task${taskID}`].field.field.slice(-1) * 1;
    if (refField > 1) {
        moveToMobile(`field${refField - 1}`, taskID);
    }
}

/**
 * Moves a task one column downward in the mobile board flow when possible.
 *
 * @param {number|string} taskID Task ID to move downward.
 * @returns {void}
 */
function taskMoveDownMobile(taskID) {
    let refField = TASK[0][`Task${taskID}`].field.field.slice(-1) * 1;
    if (refField < 4) {
        moveToMobile(`field${refField + 1}`, taskID);
    }
}

/**
 * Updates a task's column from the mobile menu and persists the change.
 *
 * @param {string} field Target board column ID.
 * @param {number|string} taskID Task ID to move.
 * @returns {Promise<void>} Resolves after the new field was stored remotely.
 */
async function moveToMobile(field, taskID) {
    TASK[0][`Task${taskID}`].field.field = `${field}`;
    renderMovedTask(field, taskID);
    await DataPUT(`Tasks/Task${taskID}/field`, {
        'field': `${field}`,
    });
}
