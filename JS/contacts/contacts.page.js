'use strict';

window.ContactsApp = window.ContactsApp || {};

/** @namespace ContactsApp.page */
ContactsApp.page = {
  /**
   * Initialises the contacts page, loads data, renders the list, and binds controls.
   *
   * @returns {Promise<void>} Resolves when the initial page setup is complete.
   */
  async init() {
    if (ContactsApp.state.isInitialized) return;
    try {
      await this._loadAndRenderContacts();
      this._initPageControls();
    } catch (err) {
      this._showListError('Kontakte konnten nicht geladen werden.');
    }
  },

  /**
   * Loads contacts, ensures the current user is included, and renders the list.
   *
   * @returns {Promise<void>} Resolves after the contacts list has been rendered.
   */
  async _loadAndRenderContacts() {
    ContactsApp.state.contacts = await ContactsApp.firebase.loadContacts();
    await this._ensureCurrentUserContactInList();
    ContactsApp.uiList.renderContactsList(ContactsApp.state.contacts);
  },

  /**
   * Binds page controls and marks the page as ready.
   *
   * @returns {void}
   */
  _initPageControls() {
    this._bindButtons();
    ContactsApp.uiModal.initModalListeners();
    ContactsApp.state.isInitialized = true;
  },

  /**
   * Adds the logged-in user's own contact to the list if it is missing.
   *
   * @returns {Promise<void>} Resolves after the current user's contact has been checked.
   */
  async _ensureCurrentUserContactInList() {
    const isGuest = sessionStorage.getItem('isGuest') === 'true';
    const myId = sessionStorage.getItem('contactId');
    if (isGuest || !myId) return;
    if (ContactsApp.state.contacts.some(c => c.id === myId)) return;
    const me = await ContactsApp.firebase.loadContactById(myId);
    if (me) ContactsApp.state.contacts.unshift(me);
  },

  /**
   * Binds click listeners to add, edit, and delete buttons.
   *
   * @returns {void}
   */
  _bindButtons() {
    this._bindOnce('addContactBtn', () => ContactsApp.uiModal.open('add'));
    this._bindOnce('editBtn', () => this._openEdit());
    this._bindOnce('deleteBtn', () => this._deleteSelected());
  },

  /**
   * Binds a click handler once to a button by ID.
   *
   * @param {string} id Button ID to resolve in the DOM.
   * @param {EventListener} handler Click handler bound to the button.
   * @returns {void}
   */
  _bindOnce(id, handler) {
    const button = document.getElementById(id);
    if (!button || button.dataset.listenerAdded) return;
    button.addEventListener('click', handler);
    button.dataset.listenerAdded = 'true';
  },

  /**
   * Opens the edit modal for the currently selected contact.
   *
   * @returns {void}
   */
  _openEdit() {
    const id = ContactsApp.state.selectedContactId;
    if (!id) return this._showListError('Kein Kontakt ausgewählt.');

    const contact = ContactsApp.state.contacts.find(c => c.id === id);
    if (!contact) return this._showListError('Kontakt nicht gefunden.');

    ContactsApp.uiModal.open('edit', contact);
  },

  /**
   * Deletes the selected contact after confirmation and refreshes the list.
   *
   * @returns {Promise<void>} Resolves after the selected contact has been deleted.
   */
  async _deleteSelected() {
    const contact = this._getSelectedContact();
    if (!contact) return;
    const confirmed = await ContactsApp.uiModal._confirmDelete(contact.name);
    if (!confirmed) return;
    try {
      await this._deleteContactAndRefresh(contact.id);
    } catch (err) {
      alert('Kontakt konnte nicht gelöscht werden.');
    }
  },

  /**
   * Returns the selected contact or shows the matching list error.
   *
   * @returns {Object|undefined} The selected contact, or undefined when selection fails.
   */
  _getSelectedContact() {
    const id = ContactsApp.state.selectedContactId;
    if (!id) return this._showListError('Kein Kontakt ausgewählt.');
    const contact = ContactsApp.state.contacts.find(c => c.id === id);
    return contact || this._showListError('Kontakt nicht gefunden.');
  },

  /**
   * Deletes a contact and refreshes the visible list state.
   *
   * @param {string} id Contact ID to delete.
   * @returns {Promise<void>} Resolves after the list and details state have been refreshed.
   */
  async _deleteContactAndRefresh(id) {
    await ContactsApp.firebase.deleteContact(id);
    await ContactsApp.tasks.removeContactFromAllTasks(id);
    ContactsApp.state.contacts = await ContactsApp.firebase.loadContacts();
    ContactsApp.uiList.renderContactsList(ContactsApp.state.contacts);
    ContactsApp.state.selectedContactId = null;
    this._hideDetailsCard();
  },

  /**
   * Hides the contact details panel if it exists.
   *
   * @returns {void}
   */
  _hideDetailsCard() {
    const detailsCard = document.getElementById('detailsCard');
    if (detailsCard) detailsCard.classList.add('hidden');
  },

  /**
   * Displays an error message inside the contacts list container.
    *
    * @param {string} message The error text to show.
    * @returns {void}
   */
  _showListError(message) {
    const list = document.getElementById('contactsList');
    if (list) list.innerHTML = `<div class="error-message">${message}</div>`;
  },

  /**
   * Shows a brief "Contact created" success notification.
   *
   * @returns {void}
   */
  showContactCreatedNotification() {
    const n = document.getElementById('contactSuccessNotification');
    if (!n) return;

    n.classList.remove('show');
    n.offsetHeight;
    n.classList.add('show');

    setTimeout(() => n.classList.remove('show'), 2500);
  },
};

document.addEventListener('DOMContentLoaded', () => ContactsApp.page.init());
