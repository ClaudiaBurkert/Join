'use strict';

window.ContactsApp = window.ContactsApp || {};

/** @type {Object} Application configuration constants */
ContactsApp.config = {
  /** @type {string} Firebase Realtime Database URL */
  DB_URL: 'https://join-6f9cc-default-rtdb.europe-west1.firebasedatabase.app',
  /** @type {string} Database path for contacts */
  CONTACTS_PATH: '/Contacts',
  /** @type {string} Database path for tasks */
  TASKS_PATH: '/Tasks',
  /** @type {number} Width at which contacts switch to the compact layout */
  COMPACT_BREAKPOINT: 1024,
};

/** @type {Object} Global application state */
ContactsApp.state = {
  /** @type {Array<Object>} Loaded contacts for the current page session. */
  contacts: [],
  /** @type {string|null} Currently selected contact ID. */
  selectedContactId: null,
  /** @type {boolean} Whether the contacts page has already been initialised. */
  isInitialized: false,
  /** @type {{mode: 'edit'|'add'|null, contactId: string|null}} Modal state for add/edit actions. */
  modal: {
    /** @type {'edit'|'add'|null} Current modal mode. */
    mode: null,
    /** @type {string|null} Contact ID currently opened in the modal. */
    contactId: null,
  },
};
