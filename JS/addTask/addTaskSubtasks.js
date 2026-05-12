/**
 * Renders all current subtasks
 * into the subtask list container.
 *
 * @function renderSubTasks
 * @returns {void}
 */
function renderSubTasks() {
  const list = document.getElementById("subtaskList");

  list.innerHTML = "";

  for (let i = 0; i < task.subTasks.length; i++) {
    list.innerHTML += subTaskTemplate(task.subTasks[i], i);
  }
}

/**
 * Adds a new subtask from the input field,
 * resets edit mode and re-renders the list.
 *
 * @function confirmSubtask
 * @returns {void}
 */
function confirmSubtask() {
  const input = document.getElementById("subtaskInput");
  const value = input.value.trim();

  if (!value) return;

  task.subTasks.push(value);

  if (typeof handleSubtaskAddedInEditMode === "function") {
    handleSubtaskAddedInEditMode();
  }

  editingSubtaskIndex = null;

  renderSubTasks();

  input.value = "";
  input.focus();
}

/**
 * Clears the subtask input field
 * and restores focus to the input.
 *
 * @function cancelSubtask
 * @returns {void}
 */
function cancelSubtask() {
  const input = document.getElementById("subtaskInput");

  input.value = "";
  input.focus();
}

/**
 * Deletes a subtask by its index
 * and refreshes the rendered list.
 *
 * @function deleteSubtask
 * @param {number} index - Index of the subtask to remove.
 * @returns {void}
 */
function deleteSubtask(index) {
  if (typeof handleSubtaskDeletedInEditMode === "function") {
    handleSubtaskDeletedInEditMode(index);
  }

  task.subTasks.splice(index, 1);

  renderSubTasks();
}

/**
 * Enables edit mode
 * for a specific subtask.
 *
 * @function startEditSubtask
 * @param {number} index - Index of the subtask to edit.
 * @returns {void}
 */
function startEditSubtask(index) {
  editingSubtaskIndex = index;

  renderSubTasks();
}

/**
 * Saves the edited subtask value.
 * Cancels edit mode if the input is empty.
 *
 * @function saveEditedSubtask
 * @param {number} index - Index of the edited subtask.
 * @returns {void}
 */
function saveEditedSubtask(index) {
  const inputs = document.querySelectorAll(".subTaskEditInput");
  const input = inputs[0];

  const value = input.value.trim();

  if (!value) {
    editingSubtaskIndex = null;
    renderSubTasks();
    return;
  }

  task.subTasks[index] = value;

  editingSubtaskIndex = null;

  renderSubTasks();
}

/**
 * Handles keyboard shortcuts
 * for editing subtasks.
 *
 * Enter = save subtask
 * Escape = cancel editing
 *
 * @function handleEditKey
 * @param {KeyboardEvent} event - Keyboard event object.
 * @param {number} index - Index of the edited subtask.
 * @param {string} value - Current input value.
 * @returns {void}
 */
function handleEditKey(event, index, value) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();

    saveEditedSubtask(index);
  }

  if (event.key === "Escape") {
    editingSubtaskIndex = null;

    renderSubTasks();
  }
}

/**
 * Handles Enter key submission
 * for creating a new subtask.
 *
 * @function handleSubtaskKeydown
 * @param {KeyboardEvent} event - Keyboard event object.
 * @returns {void}
 */
function handleSubtaskKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();

    confirmSubtask();
  }
}

/**
 * Registers Enter-key behavior
 * for the subtask input field.
 *
 * @function setupSubtaskEnter
 * @returns {void}
 */
function setupSubtaskEnter() {
  const input = document.getElementById("subtaskInput");

  if (!input) return;

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      confirmSubtask();
    }
  });
}

/**
 * Closes the assignment dropdown
 * and restores the preview view.
 *
 * @function closeDropdown
 * @param {HTMLElement} dropdown - Dropdown container.
 * @param {HTMLElement} arrow - Arrow icon element.
 * @param {HTMLElement} label - Label element.
 * @returns {void}
 */
function closeDropdown(dropdown, arrow, label) {
  const button = document.querySelector(".assignedToInput");
  const preview = document.getElementById("assignedPreviewContainer");

  dropdown.classList.add("hidden");
  arrow.classList.remove("rotate");

  assignedPreviewMode = false;

  label.textContent = "Select contacts to assign";

  preview.style.display = "flex";

  renderSelectedContactsBelowInput();

  button.classList.remove("activeFocus");
}

/**
 * Opens preview mode
 * for already selected contacts.
 *
 * @function openPreview
 * @param {HTMLElement} dropdown - Dropdown container.
 * @param {HTMLElement} arrow - Arrow icon element.
 * @param {HTMLElement} label - Label element.
 * @returns {void}
 */
function openPreview(dropdown, arrow, label) {
  if (task.assignedTo.length > 0) {
    renderSelectedContactsInDropdown();

    label.textContent = "An:";
    assignedPreviewMode = true;
  } else {
    dropdown.classList.add("hidden");
    arrow.classList.remove("rotate");
    assignedPreviewMode = false;
  }
}

/**
 * Resets the assigned-to label
 * to the default placeholder text.
 *
 * @function updateAssignedLabel
 * @returns {void}
 */
function updateAssignedLabel() {
  const label = document.getElementById("clearContact");

  label.textContent = "Select contacts to assign";
}

/**
 * Returns all dropdown-related DOM elements.
 *
 * @function getAssignedDropdownElements
 * @returns {Object}
 */
function getAssignedDropdownElements() {
  return {
    dropdown: document.getElementById("assignedDropdown"),
    button: document.querySelector(".assignedToInput"),
    arrow: document.getElementById("assignedDropdownArrow"),
    label: document.getElementById("clearContact"),
  };
}

/**
 * Checks whether the assigned dropdown
 * should be closed.
 *
 * @function shouldCloseAssignedDropdown
 * @param {HTMLElement} dropdown - Dropdown container.
 * @param {HTMLElement} button - Toggle button element.
 * @param {HTMLElement} target - Click target element.
 * @returns {boolean} True if dropdown should close.
 */
function shouldCloseAssignedDropdown(dropdown, button, target) {
  if (!dropdown || !button) return false;

  if (dropdown.classList.contains("hidden")) return false;

  if (dropdown.contains(target) || button.contains(target)) {
    return false;
  }

  return true;
}

/**
 * Registers outside-click handling
 * for closing the assigned dropdown.
 *
 * @function setupAssignedDropdownClose
 * @returns {void}
 */
function setupAssignedDropdownClose() {
  document.addEventListener("click", (event) => {
    const { dropdown, button, arrow, label } = getAssignedDropdownElements();

    if (shouldCloseAssignedDropdown(dropdown, button, event.target)) {
      closeDropdown(dropdown, arrow, label);
    }
  });
}

/**
 * Toggles the visibility
 * of the category dropdown.
 *
 * @function toggleCategoryDropdown
 * @param {MouseEvent} event - Click event object.
 * @returns {void}
 */
function toggleCategoryDropdown(event) {
  event.stopPropagation();

  const dropdown = document.getElementById("categoryDropdown");

  dropdown.classList.toggle("hidden");
}

/**
 * Selects a task category
 * and updates the category UI.
 *
 * @function selectCategory
 * @param {string} category - Selected category name.
 * @returns {void}
 */
function selectCategory(category) {
  selectedCategory = category;
  task.category = category;

  document.getElementById("categoryLabel").textContent = category;

  const error = document.getElementById("categoryError");
  const button = document.querySelector(".TaskCategoryInput");
  const dropdown = document.getElementById("categoryDropdown");
  const arrow = document.getElementById("categoryDropdownArrow");

  if (error) error.classList.remove("visible");
  if (button) button.classList.remove("input-error");
  if (dropdown) dropdown.classList.add("hidden");
  if (arrow) arrow.classList.remove("rotate");
}
