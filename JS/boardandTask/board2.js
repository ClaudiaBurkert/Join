
/**
 * Loads and renders all contacts assigned to the given task.
 *
 * @param {number|string} taskID Task ID whose assigned contacts should be rendered.
 * @param {number} renderFunctionSelector Selects board-card rendering (`0`) or task-details rendering (`1`).
 * @returns {void}
 */
function getTaskDetailsContacts(taskID, renderFunctionSelector) {
    let refAssignedTo = safeArray(getTaskById(taskID).assignedTo);
    renderAssignedContacts(refAssignedTo, taskID, renderFunctionSelector);
    if (shouldHideAssignedHeadline(refAssignedTo) && refAssignedTo.length == 0 && document.getElementById("taskDetailsAT").childElementCount == 0) {
        document.getElementById('taskDetailsATHeadline').classList.add('displayNone');
    }
}

/**
 * Iterates over assigned contacts and renders each available contact entry.
 *
 * @param {Array<string>} refAssignedTo List of assigned contact keys.
 * @param {number|string} taskID Task ID whose contacts are being rendered.
 * @param {number} renderFunctionSelector Selects the render target.
 * @returns {void}
 */
function renderAssignedContacts(refAssignedTo, taskID, renderFunctionSelector) {
    for (let index = 0; index < refAssignedTo.length; index++) {
        let contact = refAssignedTo[`${index}`];
        let contactDetails = getContactDetailsByKey(contact);
        if (!contactDetails) {
            continue;
        }
        renderSingleAssignedContact(contactDetails, taskID, renderFunctionSelector, refAssignedTo);
        
    }
}

/**
 * Routes contact rendering either to the board card or the task details dialog.
 *
 * @param {Object} contactDetails Full contact object.
 * @param {number|string} taskID Task ID whose contact should be rendered.
 * @param {number} renderFunctionSelector Selects the render target.
 * @param {Array<string>} refAssignedTo List of assigned contact keys.
 * @returns {void}
 */
function renderSingleAssignedContact(contactDetails, taskID, renderFunctionSelector, refAssignedTo) {
    if (renderFunctionSelector == 0) {
        renderTaskContacts(contactDetails, taskID, refAssignedTo);
        return;
    }
    renderTaskDetailsContacts(contactDetails);
}

/**
 * Returns the full contact object for a stored contact key.
 *
 * @param {string} contactKey Firebase key of the contact.
 * @returns {Object|undefined} Matching contact object.
 */
function getContactDetailsByKey(contactKey) {
    return allContactDetails?.[`${contactKey}`];
}

/**
 * Decides whether the assigned-to headline should be hidden in task details.
 *
 * @param {Array<string>} refAssignedTo List of assigned contact keys.
 * @returns {boolean} `true` when the assigned headline should be hidden.
 */
function shouldHideAssignedHeadline(refAssignedTo) {
    return (refAssignedTo.length == 0 || refAssignedTo.length == undefined || refAssignedTo.length == null) && document.getElementById('taskDetailsATHeadline') != undefined;
}

/**
 * Renders assigned contact badges on a board task card.
 *
 * @param {Object} contactDetails Contact object containing initials and color.
 * @param {number|string} taskID Task ID whose card should be updated.
 * @param {Array<string>} refAssignedTo List of assigned contact keys.
 * @returns {void}
 */
function renderTaskContacts(contactDetails, taskID, refAssignedTo) {
    let refContactsContainer = document.getElementById(`taskContactsContainer${taskID}`);
    if (!refContactsContainer || !contactDetails) {
        return;
    }
    if (refContactsContainer.childElementCount <=3) {
        refContactsContainer.insertAdjacentHTML('beforeend', taskContactsTamplate(contactDetails.initials, contactDetails.color));
    }else if(refAssignedTo.length >= 4 && refContactsContainer.childElementCount <=4){
     refContactsContainer.insertAdjacentHTML('beforeend', taskContactsFillerTamplate(refAssignedTo.length));
   }
}

/**
 * Renders the matching priority icon for a task.
 *
 * @param {number|string} taskID Task ID whose priority should be displayed.
 * @param {HTMLElement|null} refTaskPriorityContainer Target element for the priority icon.
 * @returns {void}
 */
function taskCheckPriority(taskID, refTaskPriorityContainer) {
    if (!refTaskPriorityContainer) {
        return;
    }

    let priority = normalizePriority(getTaskById(taskID).priority);
    refTaskPriorityContainer.innerHTML = getPriorityIcon(priority);
}

/**
 * Returns the matching priority icon markup for a normalized priority label.
 *
 * @param {string} priority Normalized priority label.
 * @returns {string} HTML markup for the matching priority icon.
 */
function getPriorityIcon(priority) {
    switch (priority) {
        case 'Low':
            return '<img src="./assets/img/low_priority.svg" alt="Low Priority"></img>';
        case 'Medium':
            return '<img src="./assets/img/medium_priority.svg" alt="Medium Priority"></img>';
        case 'Urgent':
            return '<img src="./assets/img/high_priority.svg" alt="High Priority"></img>';
        default:
            return '';
    }
}

/**
 * Applies the category color style based on the task category.
 *
 * @param {number|string} taskID Task ID whose category should be styled.
 * @param {HTMLElement|null} refTaskCatagory Category badge element.
 * @returns {void}
 */
function taskCatagory(taskID, refTaskCatagory) {
    if (!refTaskCatagory) {
        return;
    }

    clearCategoryClasses(refTaskCatagory);
    applyCategoryClass(taskID, refTaskCatagory);
}

/**
 * Removes all category-specific color classes from a task category badge.
 *
 * @param {HTMLElement} refTaskCatagory Category badge element.
 * @returns {void}
 */
function clearCategoryClasses(refTaskCatagory) {
    refTaskCatagory.classList.remove("boardTaskCatagoryBlue");
    refTaskCatagory.classList.remove("boardTaskCatagoryGreen");
}

/**
 * Applies the correct category color class to a task category badge.
 *
 * @param {number|string} taskID Task ID whose category should be styled.
 * @param {HTMLElement} refTaskCatagory Category badge element.
 * @returns {void}
 */
function applyCategoryClass(taskID, refTaskCatagory) {
    switch (normalizeCategory(getTaskById(taskID).category)) {
        case 'User Story':
            refTaskCatagory.classList.add("boardTaskCatagoryBlue");
            return;
        case 'Technical Task':
            refTaskCatagory.classList.add("boardTaskCatagoryGreen");
            return;
    }
}

/**
 * Shows valid drop target highlights for the currently dragged task.
 *
 * @returns {void}
 */
function highlightBoardTaskFields() {
    let currentField = getTaskById(curentTraggedElement)?.field?.field;
    if (curentTraggedElement == null || curentTraggedElement == undefined) {
        return;
    }

    appendHighlightToFields(getTargetHighlightFields(currentField));

}

/**
 * Returns the board columns that should be highlighted as valid drop targets.
 *
 * @param {string} currentField Current board column ID of the dragged task.
 * @returns {Array<number>} List of column numbers that accept the drop.
 */
function getTargetHighlightFields(currentField) {
    let fieldMap = {
        field1: [2, 3, 4],
        field2: [1, 3, 4],
        field3: [1, 2, 4],
        field4: [1, 2, 3],
    };
    return fieldMap[currentField] || [];
}

/**
 * Inserts highlight placeholders into every allowed drop target column.
 *
 * @param {Array<number>} targetFields Column numbers that should receive a highlight placeholder.
 * @returns {void}
 */
function appendHighlightToFields(targetFields) {
    for (let index = 0; index < targetFields.length; index++) {
        let fieldNumber = targetFields[index];
        document.getElementById(`field${fieldNumber}`).insertAdjacentHTML('beforeend', highlightTaskTamplate(fieldNumber));
    }
}

/**
 * Removes all drag-and-drop highlight placeholders from the board.
 *
 * @returns {void}
 */
function removeHighlightBoardTaskFields() {
    if (document.getElementById('highlightTask1') != null) {
        document.getElementById('highlightTask1').remove();
    }
    if (document.getElementById('highlightTask2') != null) {
        document.getElementById('highlightTask2').remove();
    }
    if (document.getElementById('highlightTask3') != null) {
        document.getElementById('highlightTask3').remove();
    }
    if (document.getElementById('highlightTask4') != null) {
        document.getElementById('highlightTask4').remove();
    }
}

/**
 * Truncates long task descriptions for compact display on board cards.
 *
 * @param {string} description Full task description.
 * @returns {string} Shortened description for the board card.
 */
function shortenDescription(description) {
    if (description.length >= 40) {
        let refdescription = description.slice(0, 40);
        return refdescription + "..."
    }
    return description;
}

/**
 * Mounts a shared content container into either the edit-task or add-task dialog.
 *
 * @param {number} selector Target dialog selector where `1` means edit mode.
 * @returns {void}
 */
function selectEditOrAdd(selector) {
    if (document.getElementById('mainContent')) {
        document.getElementById('mainContent').remove();
    }
    if (selector == 1) {
        document.getElementById('boardEditTaskMain').innerHTML = '<div id="mainContent"></div>';
    }else{
        document.getElementById('boardAddTaskMain').innerHTML = '<div id="mainContent"></div>';
    }
}
