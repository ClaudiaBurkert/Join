/** Shows error if the email is already registered */
function showSignupError() {
  document.getElementById('signupEmail').classList.add('InputFieldError');
  document.getElementById('signupError').textContent = 'This email is already registered.';
}

/**
 * loops through login data and checks if email is already there
 * @param {Object} loginData - all login entries from firebase
 * @param {string} email - the entered email
 * @returns {boolean} true if email already exists
 */
function checkEmailData(loginData, email) {
  let users = Object.values(loginData);
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      return true;
    }
  }
  return false;
}

/**
 * runs all input checks for signup form
 * @param {HTMLInputElement} name - name input
 * @param {HTMLInputElement} email - email input
 * @param {HTMLInputElement} password - password input
 * @param {HTMLInputElement} confirm - confirm password input
 * @returns {boolean} true if all inputs are valid
 */
function checkSignupInputs(name, email, password, confirm) {
  let isValid = validateName(name);
  if (!validateEmail(email)) {
    isValid = false;
  }
  if (!validatePasswordLength(password)) {
    isValid = false;
  }
  if (!validatePasswordMatch(password, confirm)) {
    isValid = false;
  }
  return isValid;
}

/**
 * checks email input and shows error if not valid
 * @param {HTMLInputElement} email - entered email input
 * @returns {boolean} true if email is valid
 */
function validateEmail(email) {
  if (!isValidEmail(email.value)) {
    showInputError(email, 'Please enter a valid email address.');
    return false;
  }
  return true;
}

/**
 * checks if a password was entered
 * @param {HTMLInputElement} password - password input
 * @returns {boolean} false if input is empty
 */
function validatePasswordLength(password) {
  if (password.value.length < 1) {
    showInputError(password, 'Please enter a password.');
    return false;
  }
  return true;
}

/**
 * checks if password and confirm password are the same
 * @param {HTMLInputElement} password - password input
 * @param {HTMLInputElement} confirm - confirm input
 * @returns {boolean} true if both match
 */
function validatePasswordMatch(password, confirm) {
  if (confirm.value !== password.value) {
    showInputError(confirm, "Your passwords don't match. Please try again.");
    return false;
  }
  return true;
}

/**
 * checks inputs and trims name, if first and last name are entered, shows error messages, and returns true if correct
 * @param {HTMLInputElement} name - entered name from input
 * @returns {boolean} return false if only one name or nothing is entered
 */
function validateName(name) {
  if (name.value.trim() === '') {
    showInputError(name, 'Please enter your name.');
    return false;
  }
  if (!name.value.trim().includes(' ')) {
    showInputError(name, 'Please enter your first and last name.');
    return false;
  }
  return true;
}

/**
 * tests email string against email pattern
 * @param {string} email - email to check
 * @returns {boolean} true if pattern matches
 */
function isValidEmail(email) {
  let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * renders error messages and adds red borders at inputs
 * @param {HTMLInputElement} input - value of input
 * @param {string} message - message recived from function validate name
 */
function showInputError(input, message) {
  input.classList.add('InputFieldError');
  let errorSpan = document.getElementById('signupError');
  if (errorSpan.textContent === '') {
    errorSpan.textContent = message;
  }
}

/** clears the error messages and removes error css for all inputs */
function clearSignupErrors() {
  document.getElementById('signupError').textContent = '';
  let inputs = document.querySelectorAll('.InputField');
  inputs.forEach(function (input) {
    input.classList.remove('InputFieldError');
  });
}
