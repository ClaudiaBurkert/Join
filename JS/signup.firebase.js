/** Firebase base URL */
const FIREBASE_URL = 'https://join-6f9cc-default-rtdb.europe-west1.firebasedatabase.app';

/** Available colors for new user avatars */
const COLORS = [
  '#FF7A00',
  '#9327FF',
  '#6E52FF',
  '#FC71FF',
  '#FFBB2B',
  '#1FD7C1',
  '#FF5EB3',
  '#00BEE8',
  '#1FC71F',
  '#FF745E',
  '#FFA35E',
  '#FC71FF',
];

/**
 * starts email check and returns logindata and email
 * @param {string} email - the entered email
 * @returns {boolean} True if email is already registered
 */
async function checkEmailExists(email) {
  let loginData = await fetchLoginData();
  return checkEmailData(loginData, email);
}

/**
 * collects all data from user
 * @param {string} name - entered value
 * @param {string} email - entered value
 * @param {string} password - entered value
 */
async function gatherUserInfo(name, email, password) {
  let id = await getNextContactId();
  let initials = generateInitials(name);
  let date = new Date().toISOString();
  let color = generateRandomColor();
  await createNewUserContact(id, color, date, email, initials, name);
  await createNewUserLogin(id, email, password);
}

/**
 * Creates new user contact in Firebase
 * @param {string} id - user id
 * @param {string} color - user color
 * @param {string} date - date of creation
 * @param {string} email - entered value in input
 * @param {string} initials - Created from user first and last name
 * @param {string} name - entered value in input
 */
async function createNewUserContact(id, color, date, email, initials, name) {
  await fetch(FIREBASE_URL + `/Contacts/${id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildUserContact(id, color, date, email, initials, name)),
  });
}

/**
 * Builds the user contact object to send to Firebase
 * @param {string} id - user id
 * @param {string} color - user color
 * @param {string} date - date of creation
 * @param {string} email - entered value in input
 * @param {string} initials - created from user first and last name
 * @param {string} name - entered value in input
 * @returns {Object} user contact object
 */
function buildUserContact(id, color, date, email, initials, name) {
  return {
    color: color,
    createdAt: date,
    email: email,
    id: id,
    initials: initials,
    name: name,
    phone: '',
    updatedAt: date,
  };
}

/**
 * creates new login data for user in logindata in firebase
 * @param {string} id - contact user id
 * @param {string} email - entered value in input
 * @param {string} password - entered value in input
 */
async function createNewUserLogin(id, email, password) {
  await fetch(FIREBASE_URL + `/LoginData/${id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });
}

/**
 * fetches complete database contacts and extracts next highest free number for new user id
 * @returns {string} new user id
 */
async function getNextContactId() {
  let response = await fetch(FIREBASE_URL + '/Contacts.json');
  let contacts = await response.json();
  if (!contacts) return 'c1';
  let keys = Object.keys(contacts);
  let maxNumber = 0;
  for (let i = 0; i < keys.length; i++) {
    let number = parseInt(keys[i].replace('c', ''));
    if (number > maxNumber) {
      maxNumber = number;
    }
  }
  return 'c' + (maxNumber + 1);
}

/**
 * generates initals from user first and last name
 * @param {string} name - user first and last name
 * @returns {string} Uppercase initials (e.g. 'SM')
 */
function generateInitials(name) {
  let parts = name.split(' ');
  let initials = parts[0][0] + parts[1][0];
  return initials.toUpperCase();
}

/**
 * Assigns random color to new user
 * @returns {string} user color
 */
function generateRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}
