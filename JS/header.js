document.addEventListener('DOMContentLoaded', async () => {
  await loadHeaderTemplate('./templates/header.html', '#header-slot');
  handleHeaderAuth();
});

/**
 * Applies or removes the guest-mode class on the body
 * depending on the user's login and guest status.
 */
function handleHeaderAuth() {
  const isLoggedInNow = !!sessionStorage.getItem("contactId");
  const isGuest = sessionStorage.getItem("isGuest") === "true";
  document.body.classList.toggle("guest-mode", !isLoggedInNow && !isGuest);
}

/**
 * Loads an HTML template file and injects it into the target element.
 * @param {string} url - Path to the HTML template file.
 * @param {string} targetSelector - CSS selector of the container element.
 */
async function loadHeaderTemplate(url, targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const res = await fetch(url);
  if (!res.ok) return;

  target.innerHTML = await res.text();
  setupSubmenu();
  initHeaderUser();
}

/**
 * Initializes the header submenu toggle, outside-click close,
 * and Escape key handling.
 */
function setupSubmenu() {
  const submenu = getSubmenuElements();
  if (!submenu || submenu.badge.dataset.submenuInitialized === "true") return;
  submenu.badge.dataset.submenuInitialized = "true";
  registerSubmenuHandlers(submenu);
}

/**
 * Returns the user-menu badge and submenu elements.
 * @returns {{badge: HTMLElement, menu: HTMLElement}|null} Menu elements or null.
 */
function getSubmenuElements() {
  const badge = document.getElementById("circleBadge");
  const menu = document.getElementById("submenu");
  return badge && menu ? { badge, menu } : null;
}

/**
 * Opens or closes the submenu and updates accessibility state.
 * @param {{badge: HTMLElement, menu: HTMLElement}} submenu - Header submenu elements.
 * @param {boolean} isOpen - Whether the submenu should be open.
 */
function setSubmenuState({ badge, menu }, isOpen) {
  menu.classList.toggle("hidden", !isOpen);
  badge.setAttribute("aria-expanded", String(isOpen));
}

/**
 * Toggles the header submenu.
 * @param {{badge: HTMLElement, menu: HTMLElement}} submenu - Header submenu elements.
 */
function toggleSubmenu(submenu) {
  setSubmenuState(submenu, submenu.menu.classList.contains("hidden"));
}

/**
 * Registers click and keyboard listeners for the submenu.
 * @param {{badge: HTMLElement, menu: HTMLElement}} submenu - Header submenu elements.
 */
function registerSubmenuHandlers(submenu) {
  submenu.badge.addEventListener("click", (e) => handleSubmenuBadgeClick(e, submenu));
  submenu.menu.addEventListener("click", stopSubmenuEventPropagation);
  document.addEventListener("click", (e) => closeSubmenuOnOutsideClick(e, submenu));
  document.addEventListener("keydown", (e) => closeSubmenuOnEscape(e, submenu));
}

/**
 * Handles a click on the user badge.
 * @param {MouseEvent} event - Click event from the badge.
 * @param {{badge: HTMLElement, menu: HTMLElement}} submenu - Header submenu elements.
 */
function handleSubmenuBadgeClick(event, submenu) {
  event.stopPropagation();
  toggleSubmenu(submenu);
}

/**
 * Prevents menu clicks from bubbling to the document close handler.
 * @param {Event} event - Menu click event.
 */
function stopSubmenuEventPropagation(event) {
  event.stopPropagation();
}

/**
 * Closes the submenu when the user clicks outside the menu.
 * @param {MouseEvent} event - Document click event.
 * @param {{badge: HTMLElement, menu: HTMLElement}} submenu - Header submenu elements.
 */
function closeSubmenuOnOutsideClick(event, submenu) {
  if (!submenu.menu.classList.contains("hidden") && !event.target.closest(".user-menu")) {
    setSubmenuState(submenu, false);
  }
}

/**
 * Closes the submenu when Escape is pressed.
 * @param {KeyboardEvent} event - Document keyboard event.
 * @param {{badge: HTMLElement, menu: HTMLElement}} submenu - Header submenu elements.
 */
function closeSubmenuOnEscape(event, submenu) {
  if (event.key === "Escape") setSubmenuState(submenu, false);
}

/**
 * Logs the user out by clearing session and local storage,
 * then redirects to the login page.
 */
function logout() {
  sessionStorage.clear();
  localStorage.clear();
  window.location.href = "./index.html";
}

/**
 * Sets the user's initials in the header badge from session storage.
 * Displays "G" for guest users.
 */
function initHeaderUser() {
  const badgeSpan = getHeaderBadgeSpan();
  if (!badgeSpan) return;
  badgeSpan.textContent = getHeaderBadgeText();
}

/**
 * Returns the text span inside the header user badge.
 * @returns {HTMLSpanElement|null} Badge text element or null.
 */
function getHeaderBadgeSpan() {
  return document.getElementById('circleBadge')?.querySelector('span') || null;
}

/**
 * Returns the badge text for a guest or logged-in user.
 * @returns {string} Badge initials.
 */
function getHeaderBadgeText() {
  if (sessionStorage.getItem('isGuest') === "true") return "G";
  return sessionStorage.getItem('userInitials') || "";
}
