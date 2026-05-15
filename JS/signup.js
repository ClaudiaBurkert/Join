/** Validates form and creates user account */
async function signUp() {
  clearSignupErrors();
  let signupObj = getSignupData();
  if (!await validateForm(signupObj)) return;
  await showSuccess(signupObj);
}

/**
 * runs the input checks and looks if email is already taken
 * @param {Object} signupObj - signup form fields (name, email, password, confirm)
 * @returns {Promise<boolean>} true if everything is okay
 */
async function validateForm(signupObj) {
  if (!checkSignupInputs(signupObj.name, signupObj.email, signupObj.password, signupObj.confirm)) return false;
  if (await checkEmailExists(signupObj.email.value)) {
    showSignupError();
    return false;
  }
  return true;
}

/**
 * disables the button, saves the user and shows the toast
 * @param {Object} signupObj - signup form fields
 */
async function showSuccess(signupObj) {
  document.getElementById('signupButton').disabled = true;
  await gatherUserInfo(signupObj.name.value, signupObj.email.value, signupObj.password.value);
  showToast('You Signed Up successfully');
  setTimeout(function () {
    window.location.href = 'index.html';
  }, 1500);
}

/**
 * returns the DOM Elements from the signup Form
 * @returns {Object} signup object
 */
function getSignupData() {
  return {
    name: document.getElementById('signupName'),
    email: document.getElementById('signupEmail'),
    password: document.getElementById('signupPassword'),
    confirm: document.getElementById('signupConfirm'),
  };
}

/**
 * Creates toast element with success message after successful signup
 * @param {string} message - the success message
 */
function showToast(message) {
  let toast = document.createElement('div');
  toast.className = 'Toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(function () {
    toast.classList.add('ToastVisible');
  }, 50);
}

/** Toggles the signup button by checking all inputs */
function toggleSignupButton() {
  let name = getSignupUserName();
  let email = getSignupEmail();
  let password = getSignupPassword();
  let confirm = document.getElementById('signupConfirm').value;
  let checkbox = document.getElementById('signupPrivacy').checked;
  let button = document.getElementById('signupButton');
  button.disabled = !(name && email && password && confirm && checkbox);
}

/**
 * Gets trimmed signup name
 * @returns {string} Trimmed name
 */
function getSignupUserName() {
  let name = document.getElementById('signupName').value.trim();
  return name;
}

/**
 * Gets trimmed email from signup
 * @returns {string} Trimmed email
 */
function getSignupEmail() {
  let email = document.getElementById('signupEmail').value.trim();
  return email;
}

/**
 * gets password from signup
 * @returns {string} returns password
 */
function getSignupPassword() {
  let password = document.getElementById('signupPassword').value;
  return password;
}

/** Initializes signup: form submit, input listeners and privacy checkbox */
function initSignup() {
  initSignupForm();
  initSignupInputs();
  initSignupCheckbox();
}

/** Prevents default submit and triggers signUp() */
function initSignupForm() {
  let form = document.querySelector('form');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    signUp();
  });
}

/** Wires input listeners that clear errors and toggle the signup button */
function initSignupInputs() {
  let fields = document.querySelectorAll('.InputField');
  fields.forEach(function (field) {
    field.addEventListener('input', function () {
      field.classList.remove('InputFieldError');
      toggleSignupButton();
    });
  });
}

/** Wires the privacy checkbox change listener to toggle the signup button */
function initSignupCheckbox() {
  let checkbox = document.getElementById('signupPrivacy');
  checkbox.addEventListener('change', toggleSignupButton);
}

initSignup();
initPasswordToggles();
