/**
 * Validates all required form fields
 * and updates their error states.
 *
 * @function errorMessage
 * @returns {void}
 */
function errorMessage() {
  toggleRequired(document.getElementById("taskName"));
  toggleRequired(document.getElementById("DueDate"));
  validateCategory();
}

/**
 * Shows or hides required-field styling
 * depending on whether the input has a value.
 *
 * @function toggleRequired
 * @param {HTMLInputElement|HTMLTextAreaElement} inputElement - Form input element.
 * @returns {void}
 */
function toggleRequired(inputElement) {
  if (!inputElement) return;

  const label = inputElement.closest("label");
  const requiredText = label?.querySelector(".requiredField");

  if (!requiredText) return;

  if (!inputElement.value) {
    requiredText.classList.add("visible");
    inputElement.classList.add("input-error");
  } else {
    requiredText.classList.remove("visible");
    inputElement.classList.remove("input-error");
  }
}

/**
 * Attaches live validation listeners
 * to all form inputs inside the task form.
 *
 * @function setupLiveValidation
 * @returns {void}
 */
function setupLiveValidation() {
  const inputs = document.querySelectorAll(
    "#taskForm textarea, #taskForm input, #taskForm select",
  );

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      toggleRequired(input);
    });
  });
}

/**
 * Initializes priority button behavior
 * and updates the task priority state.
 *
 * @function setupPriorityButtons
 * @returns {void}
 */
function setupPriorityButtons() {
  const buttons = document.querySelectorAll(".priorityButton");

  buttons.forEach((btn) => {
    btn.onclick = () => {
      if (btn.classList.contains("active")) {
        btn.classList.remove("active");
        task.priority = "";
        return;
      }

      buttons.forEach((b) => b.classList.remove("active"));

      btn.classList.add("active");

      if (btn.classList.contains("urgent")) {
        task.priority = "Urgent";
      }

      if (btn.classList.contains("medium")) {
        task.priority = "Medium";
      }

      if (btn.classList.contains("low")) {
        task.priority = "Low";
      }
    };
  });
}

/**
 * Sets the default selected priority button.
 *
 * @function setDefaultPriority
 * @param {string} [standartSelect=".priorityButton.medium"] - CSS selector for the default button.
 * @returns {void}
 */
function setDefaultPriority(standartSelect = ".priorityButton.medium") {
  const defaultBtn = document.querySelector(standartSelect);

  defaultBtn.classList.add("active");

  task.priority = "Medium";
}

/**
 * Configures the due date input field.
 * Prevents selecting dates in the past.
 *
 * @function setupDueDateInput
 * @returns {void}
 */
function setupDueDateInput() {
  const input = document.getElementById("DueDate");

  if (!input) return;

  const today = getTodayLocal();

  input.min = today;

  input.addEventListener("blur", () => {
    if (!input.value) return;

    if (input.value < today) {
      input.value = "";
    }
  });
}

/**
 * Returns today's local date
 * formatted as YYYY-MM-DD.
 *
 * @function getTodayLocal
 * @returns {string} Formatted current date.
 */
function getTodayLocal() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Toggles the category dropdown
 * and rotates the dropdown arrow.
 *
 * @function toggleCategoryDropdown
 * @param {MouseEvent} event - Click event object.
 * @returns {void}
 */
function toggleCategoryDropdown(event) {
  event.stopPropagation();

  const dropdown = document.getElementById("categoryDropdown");
  const arrow = document.getElementById("categoryDropdownArrow");

  dropdown.classList.toggle("hidden");
  arrow.classList.toggle("rotate");
}

/**
 * Validates whether a category is selected
 * and updates the error UI.
 *
 * @function validateCategory
 * @returns {void}
 */
function validateCategory() {
  const categoryLabel = document.getElementById("categoryLabel");
  const error = document.getElementById("categoryError");
  const button = document.querySelector(".TaskCategoryInput");

  if (!categoryLabel || !error || !button) return;

  const isEmpty = categoryLabel.textContent === "Select task category";

  if (isEmpty) {
    error.classList.add("visible");
    button.classList.add("input-error");
  } else {
    error.classList.remove("visible");
    button.classList.remove("input-error");
  }
}

/**
 * Closes the category dropdown
 * when clicking outside of it.
 *
 * @function closeCategoryDropdown
 * @param {MouseEvent} event - Click event object.
 * @returns {void}
 */
function closeCategoryDropdown(event) {
  const dropdown = document.getElementById("categoryDropdown");
  const button = document.querySelector(".TaskCategoryInput");
  const arrow = document.getElementById("categoryDropdownArrow");

  if (!dropdown || !button) return;

  if (!button.contains(event.target) && !dropdown.contains(event.target)) {
    dropdown.classList.add("hidden");
    arrow.classList.remove("rotate");
  }
}

/**
 * Resets all validation states
 * and removes visible error styles.
 *
 * @function resetValidation
 * @returns {void}
 */
function resetValidation() {
  document.querySelectorAll(".requiredField").forEach((el) => {
    el.classList.remove("visible");
  });

  document.querySelectorAll(".input-error").forEach((el) => {
    el.classList.remove("input-error");
  });
}

/**
 * Closes and resets the category dropdown.
 *
 * @function resetCategoryDropdown
 * @returns {void}
 */
function resetCategoryDropdown() {
  const dropdown = document.getElementById("categoryDropdown");
  const arrow = document.getElementById("categoryDropdownArrow");

  if (dropdown) dropdown.classList.add("hidden");
  if (arrow) arrow.classList.remove("rotate");
}

/**
 * Resets the selected category.
 *
 * @function resetCategory
 * @returns {void}
 */
function resetCategory() {
  selectedCategory = "";
  resetCategoryUI();
  resetCategoryDropdown();
}

/**
 * Resets subtasks and category selection.
 *
 * @function resetSubTasksAndCategory
 * @returns {void}
 */
function resetSubTasksAndCategory() {
  resetSubTasks();
  resetCategory();
}

/**
 * Clears assigned contacts preview
 * and restores default priority selection.
 *
 * @function resetAssignedContactsAndPriority
 * @returns {void}
 */
function resetAssignedContactsAndPriority() {
  document.getElementById("assignedPreviewContainer").innerHTML = "";
  renderSelectedContactsBelowInput();

  document
    .querySelectorAll(".priorityButton")
    .forEach((b) => b.classList.remove("active"));

  setDefaultPriority();
}

/**
 * Clears the complete add-task form
 * and restores all default UI states.
 *
 * @function clearForm
 * @returns {void}
 */
function clearForm() {
  resetTaskData();
  resetSubTasksAndCategory();
  resetAssignedContactsAndPriority();

  const assignedArrow = document.getElementById("assignedDropdownArrow");
  const categoryArrow = document.getElementById("categoryDropdownArrow");

  if (assignedArrow) assignedArrow.classList.remove("rotate");
  if (categoryArrow) categoryArrow.classList.remove("rotate");
}

/**
 * Displays a temporary success toast notification.
 *
 * @function showToast
 * @returns {void}
 */
function showToast() {
  const toast = document.getElementById("toast");

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}
