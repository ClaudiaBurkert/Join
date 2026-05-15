'use strict';
window.ContactsApp = window.ContactsApp || {};

/** @namespace ContactsApp.mobile */
ContactsApp.mobile = {
  /**
   * Initialises mobile-specific button bindings and resize handling.
   *
   * @returns {void}
   */
  init() {
    this._bindMobileButtons();
    this._handleMobileResize();
    window.addEventListener('resize', () => this._handleMobileResize());
  },

  /**
   * Binds listeners for back button, FABs, edit/delete, and outside-click dismiss.
   *
   * @returns {void}
   */
  _bindMobileButtons() {
    this._bindClick('mobileBackBtn', () => this.closeMobileDetails());
    this._bindClick('fabAdd', () => ContactsApp.uiModal.open('add'));
    this._bindClick('fabMenu', () => this.toggleMobileOptionsMenu());
    this._bindClick('mobileEditBtn', () => this._openSelectedContactForEdit());
    this._bindClick('mobileDeleteBtn', () => this._deleteSelectedFromMenu());
    document.addEventListener('click', e => this._closeMenuOnOutsideClick(e));
  },

  /**
   * Binds a click listener when the element exists.
   *
   * @param {string} id Element ID used to resolve the target button.
   * @param {EventListener} handler Click handler bound to the element.
   * @returns {void}
   */
  _bindClick(id, handler) {
    const element = document.getElementById(id);
    if (element) element.addEventListener('click', handler);
  },

  /**
   * Opens the selected contact in edit mode from the mobile menu.
   *
   * @returns {void}
   */
  _openSelectedContactForEdit() {
    this.closeMobileOptionsMenu();
    const id = ContactsApp.state.selectedContactId;
    const contact = ContactsApp.state.contacts.find(c => c.id === id);
    if (contact) ContactsApp.uiModal.open('edit', contact);
  },

  /**
   * Deletes the selected contact from the mobile menu.
   *
   * @returns {void}
   */
  _deleteSelectedFromMenu() {
    this.closeMobileOptionsMenu();
    ContactsApp.page._deleteSelected();
  },

  /**
   * Closes the mobile options menu when a click lands outside it.
   *
   * @param {MouseEvent} e Click event to evaluate against the menu bounds.
   * @returns {void}
   */
  _closeMenuOnOutsideClick(e) {
    const menu = document.getElementById('contactOptionsMenu');
    const fabMenu = document.getElementById('fabMenu');
    if (!menu || !fabMenu) return;
    if (!menu.contains(e.target) && !fabMenu.contains(e.target)) this.closeMobileOptionsMenu();
  },

  /**
   * Switches the mobile view to the contact details panel.
   *
   * @returns {void}
   */
  openMobileDetails() {
    const isMobile = window.innerWidth <= (ContactsApp.config?.COMPACT_BREAKPOINT || 1024);
    if (!isMobile) return;

    const content = document.querySelector('.content');
    const mobileBackBtn = document.getElementById('mobileBackBtn');

    if (content) content.classList.add('mobile-details-open');
    if (mobileBackBtn) mobileBackBtn.classList.remove('hidden');

    this._updateFabVisibility();
  },

  /**
   * Returns from the details panel to the contacts list on mobile.
   *
   * @returns {void}
   */
  closeMobileDetails() {
    const content = document.querySelector('.content');
    const mobileBackBtn = document.getElementById('mobileBackBtn');
    if (content) content.classList.remove('mobile-details-open');
    if (mobileBackBtn) mobileBackBtn.classList.add('hidden');
    this._clearActiveContactItems();
    ContactsApp.state.selectedContactId = null;
    this._updateFabVisibility();
  },

  /**
   * Clears selected state from all visible contact items.
   *
   * @returns {void}
   */
  _clearActiveContactItems() {
    document.querySelectorAll('.contact-item').forEach(i => {
      i.classList.remove('active');
      i.setAttribute('aria-selected', 'false');
    });
  },

  /**
   * Toggles the mobile options (edit/delete) popup menu.
   *
   * @returns {void}
   */
  toggleMobileOptionsMenu() {
    const menu = document.getElementById('contactOptionsMenu');
    if (menu) {
      menu.classList.toggle('active');
    }
  },

  /**
   * Closes the mobile options popup menu.
   *
   * @returns {void}
   */
  closeMobileOptionsMenu() {
    const menu = document.getElementById('contactOptionsMenu');
    if (menu) {
      menu.classList.remove('active');
    }
  },

  /**
   * Updates FAB visibility based on viewport width and current view state.
   *
   * @returns {void}
   */
  _updateFabVisibility() {
    const fabAdd = document.getElementById('fabAdd');
    const fabMenu = document.getElementById('fabMenu');
    if (!this._isMobile()) return this._setFabVisibility(fabAdd, fabMenu, true, true);
    const detailsOpen = this._isDetailsOpen();
    this._setFabVisibility(fabAdd, fabMenu, detailsOpen, !detailsOpen);
  },

  /**
   * Returns whether the compact contacts layout is active.
   *
   * @returns {boolean} True when the compact mobile layout is active.
   */
  _isMobile() {
    return window.innerWidth <= (ContactsApp.config?.COMPACT_BREAKPOINT || 1024);
  },

  /**
   * Returns whether the mobile details panel is currently open.
   *
   * @returns {boolean} True when the mobile details panel is open.
   */
  _isDetailsOpen() {
    return document.querySelector('.content')?.classList.contains('mobile-details-open');
  },

  /**
   * Applies hidden state to both mobile FABs.
   *
   * @param {HTMLElement|null} fabAdd Floating add button element.
   * @param {HTMLElement|null} fabMenu Floating menu button element.
   * @param {boolean} hideAdd Whether to hide the add button.
   * @param {boolean} hideMenu Whether to hide the menu button.
   * @returns {void}
   */
  _setFabVisibility(fabAdd, fabMenu, hideAdd, hideMenu) {
    if (fabAdd) fabAdd.classList.toggle('hidden', hideAdd);
    if (fabMenu) fabMenu.classList.toggle('hidden', hideMenu);
  },

  /**
   * Resets mobile-specific state when the viewport exceeds the mobile breakpoint.
   *
   * @returns {void}
   */
  _handleMobileResize() {
    const isMobile = window.innerWidth <= (ContactsApp.config?.COMPACT_BREAKPOINT || 1024);

    if (!isMobile) {
      this.closeMobileDetails();
      this.closeMobileOptionsMenu();
    }

    this._updateFabVisibility();
  }
};

/** @type {Function} Original contact selection handler before mobile augmentation. */
const originalSelectContact = ContactsApp.uiList.selectContact;

/**
 * Selects a contact and opens the mobile detail view on compact screens.
 *
 * @param {Object} contact The selected contact.
 * @param {HTMLElement} element The selected list element.
 * @returns {void}
 */
ContactsApp.uiList.selectContact = function(contact, element) {
  originalSelectContact.call(this, contact, element);

  if (window.innerWidth <= (ContactsApp.config?.COMPACT_BREAKPOINT || 1024)) {
    ContactsApp.mobile.openMobileDetails();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ContactsApp.mobile.init();
});
