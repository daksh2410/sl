// Authentication Script with Firebase Modular SDK

// Import Firebase modules
import { auth } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const userInfo = document.getElementById('user-info');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const userEmailSpan = document.getElementById('user-email');

// Show signup form
showSignupLink.addEventListener('click', function(e) {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
});

// Show login form
showLoginLink.addEventListener('click', function(e) {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
});

// Login function
loginBtn.addEventListener('click', function() {
    const email = loginEmail.value;
    const password = loginPassword.value;
    
    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            // Signed in
            const user = userCredential.user;
            console.log('Logged in as:', user.email);
            showUserInfo(user);
        })
        .catch(error => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert('Login error: ' + errorMessage);
        });
});

// Signup function
signupBtn.addEventListener('click', function() {
    const email = signupEmail.value;
    const password = signupPassword.value;
    
    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            // Signed up
            const user = userCredential.user;
            console.log('Signed up as:', user.email);
            showUserInfo(user);
        })
        .catch(error => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert('Signup error: ' + errorMessage);
        });
});

// Logout function
logoutBtn.addEventListener('click', function() {
    signOut(auth)
        .then(() => {
            // Sign-out successful
            console.log('Logged out');
            userInfo.style.display = 'none';
            loginForm.style.display = 'block';
        })
        .catch(error => {
            // An error happened
            console.error('Logout error:', error);
        });
});

// Show user info
function showUserInfo(user) {
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    userInfo.style.display = 'block';
    userEmailSpan.textContent = user.email;
}

// Check auth state
onAuthStateChanged(auth, user => {
    if (user) {
        // User is signed in
        showUserInfo(user);
    } else {
        // User is signed out
        userInfo.style.display = 'none';
        loginForm.style.display = 'block';
    }
});