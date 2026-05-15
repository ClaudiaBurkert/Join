let selectedCategory = "";

/**
 * Loads all contacts from Firebase
 * and renders them into the assignment dropdown.
 *
 * @async
 * @function loadContacts
 * @returns {Promise<void>}
 */
async function loadContacts() {
  try {
    const response = await fetch(`${BASE_URL}Contacts.json`);
    const data = await response.json();

    if (!data) return;

    contacts = data;

    renderAssignedTo();
  } catch (error) {
    console.error("Fehler beim Laden der Contacts:", error);
  }
}

/**
 * Renders all contacts inside the assigned-to dropdown.
 *
 * @function renderAssignedTo
 * @returns {void}
 */
function renderAssignedTo() {
  const container = document.getElementById("assignedDropdown");

  if (!container) return;

  let html = "";

  for (let key in contacts) {
    const contact = contacts[key];

    html += contactInitialsCircleTemplate(contact, key);
  }

  container.innerHTML = html;
}

/**
 * Toggles the selected state of a contact.
 * Adds or removes the contact key from the task assignment list.
 *
 * @function updateContactSelection
 * @param {string} contactKey - Firebase contact key.
 * @returns {boolean} True if added, false if removed.
 */
function updateContactSelection(contactKey) {
  const index = task.assignedTo.indexOf(contactKey);

  if (index === -1) {
    task.assignedTo.push(contactKey);
    return true;
  } else {
    task.assignedTo.splice(index, 1);
    return false;
  }
}

/**
 * Updates the UI state of a selected contact.
 *
 * @function updateContactUI
 * @param {HTMLElement} element - Contact DOM element.
 * @param {boolean} isSelected - Whether the contact is selected.
 * @returns {void}
 */
function updateContactUI(element, isSelected) {
  const img = element.querySelector(".checkBox");

  if (isSelected) {
    element.classList.add("selected");
    img.src = "./assets/img/checkButton.svg";
  } else {
    element.classList.remove("selected");
    img.src = "./assets/img/Rectangle_5.svg";
  }
}

/**
 * Re-renders the selected contacts preview
 * when the dropdown is closed.
 *
 * @function handleDropdownRender
 * @returns {void}
 */
function handleDropdownRender() {
  const dropdown = document.getElementById("assignedDropdown");

  if (dropdown.classList.contains("hidden")) {
    renderSelectedContactsBelowInput();
  }
}

/**
 * Handles contact selection and UI updates.
 *
 * @function toggleContact
 * @param {string} contactKey - Firebase contact key.
 * @param {HTMLElement} element - Clicked contact element.
 * @returns {void}
 */
function toggleContact(contactKey, element) {
  const isSelected = updateContactSelection(contactKey);

  updateContactUI(element, isSelected);
  handleDropdownRender();
}

/**
 * Returns all required assigned-dropdown DOM elements.
 *
 * @function getAssignedElements
 * @returns {Object}
 */
function getAssignedElements() {
  return {
    dropdown: document.getElementById("assignedDropdown"),
    arrow: document.getElementById("assignedDropdownArrow"),
    label: document.getElementById("clearContact"),
    button: document.querySelector(".assignedToInput"),
  };
}

/**
 * Opens the assignment dropdown if currently closed.
 *
 * @function handleDropdownOpen
 * @param {Object} state - Dropdown state object.
 * @returns {boolean} True if opened.
 */
function handleDropdownOpen(state) {
  if (state.dropdown.classList.contains("hidden")) {
    openDropdown(state.dropdown, state.arrow, state.label);

    state.button.focus();

    return true;
  }

  return false;
}

/**
 * Opens preview mode for selected contacts.
 *
 * @function handlePreviewMode
 * @param {Object} state - Dropdown state object.
 * @returns {boolean} True if preview mode activated.
 */
function handlePreviewMode(state) {
  if (!assignedPreviewMode) {
    openPreview(state.dropdown, state.arrow, state.label);

    state.button.focus();

    return true;
  }

  return false;
}

/**
 * Closes the assignment dropdown.
 *
 * @function handleDropdownClose
 * @param {Object} state - Dropdown state object.
 * @returns {void}
 */
function handleDropdownClose(state) {
  closeDropdown(state.dropdown, state.arrow, state.label);

  state.button.focus();
}

/**
 * Toggles the assigned-to dropdown
 * between open, preview and closed states.
 *
 * @function toggleAssignedDropdown
 * @param {MouseEvent} event - Click event object.
 * @returns {void}
 */
function toggleAssignedDropdown(event) {
  event.stopPropagation();

  const state = getAssignedElements();

  if (handleDropdownOpen(state)) return;
  if (handlePreviewMode(state)) return;

  handleDropdownClose(state);
}

/**
 * Handles closing the dropdown
 * when the arrow icon is clicked.
 *
 * @function handleArrowClick
 * @param {MouseEvent} event - Click event object.
 * @returns {void}
 */
function handleArrowClick(event) {
  event.stopPropagation();

  const dropdown = document.getElementById("assignedDropdown");
  const arrow = document.getElementById("assignedDropdownArrow");
  const label = document.getElementById("clearContact");

  closeDropdown(dropdown, arrow, label);
}

/**
 * Builds the HTML for selected contacts only.
 *
 * @function buildSelectedContactsDropdownHTML
 * @returns {string} Generated HTML string.
 */
function buildSelectedContactsDropdownHTML() {
  let html = "";

  for (let key in contacts) {
    const contact = contacts[key];

    if (task.assignedTo.includes(key)) {
      html += contactInitialsCircleTemplate(contact, key);
    }
  }

  return html;
}

/**
 * Renders only selected contacts
 * inside the assignment dropdown.
 *
 * @function renderSelectedContactsInDropdown
 * @returns {void}
 */
function renderSelectedContactsInDropdown() {
  const container = document.getElementById("assignedDropdown");

  if (!container) return;

  const html = buildSelectedContactsDropdownHTML();

  container.innerHTML = html;

  if (task.assignedTo.length === 0) {
    container.innerHTML = "";
  }
}

/**
 * Renders selected contact initials
 * below the input field.
 *
 * @function renderSelectedContactsBelowInput
 * @returns {void}
 */
function renderSelectedContactsBelowInput() {
  const previewContainer = document.getElementById("assignedPreviewContainer");

  const dropdown = document.getElementById("assignedDropdown");
  const maxVisibleContacts = 5;

  if (!previewContainer) return;

  if (!dropdown.classList.contains("hidden") || task.assignedTo.length === 0) {
    previewContainer.innerHTML = "";
    return;
  }

  previewContainer.innerHTML = buildAssignedContactsHTML(maxVisibleContacts);
}

/**
 * Returns all currently selected contacts.
 *
 * @function getSelectedContacts
 * @returns {Array<Object>} Selected contact objects.
 */
function getSelectedContacts() {
  let selectedContacts = [];

  for (let i = 0; i < task.assignedTo.length; i++) {
    let key = task.assignedTo[i];

    if (contacts[key]) {
      selectedContacts.push(contacts[key]);
    }
  }

  return selectedContacts;
}

/**
 * Builds the HTML preview
 * for selected contact initials.
 *
 * @function buildAssignedContactsHTML
 * @param {number} maxVisibleContacts - Maximum visible contacts.
 * @returns {string} Generated HTML string.
 */
function buildAssignedContactsHTML(maxVisibleContacts) {
  const selectedContacts = getSelectedContacts();

  let html = "";

  for (let i = 0; i < selectedContacts.length && i < maxVisibleContacts; i++) {
    html += contactInitialsPreviewTemplate(selectedContacts[i]);
  }

  let hiddenContactsCount = selectedContacts.length - maxVisibleContacts;

  if (hiddenContactsCount > 0) {
    html += hiddenContactsTemplate(hiddenContactsCount);
  }

  return html;
}

/**
 * Opens the assignment dropdown
 * and displays all contacts.
 *
 * @function openDropdown
 * @param {HTMLElement} dropdown - Dropdown container.
 * @param {HTMLElement} arrow - Arrow icon element.
 * @param {HTMLElement} label - Label element.
 * @returns {void}
 */
function openDropdown(dropdown, arrow, label) {
  const button = document.querySelector(".assignedToInput");
  const preview = document.getElementById("assignedPreviewContainer");

  preview.style.display = "none";

  dropdown.classList.remove("hidden");
  arrow.classList.add("rotate");

  renderAssignedTo();

  label.textContent = "";
  assignedPreviewMode = false;

  button.classList.add("activeFocus");
}
