// Hall of Shadows Script with Firebase Integration

// Import Firebase modules
import { db, auth } from '../scripts/firebase-config.js';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc,
  getDocs, 
  query, 
  orderBy,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// DOM Elements
const winForm = document.getElementById('win-form');
const winsList = document.getElementById('wins-list');
const imagePreview = document.getElementById('image-preview');
const winImageInput = document.getElementById('win-image');

// Store image data URL
let imageDataUrl = null;

// Check if user is authenticated
function checkAuth() {
    onAuthStateChanged(auth, user => {
        if (user) {
            console.log("User is signed in:", user);
            loadWins();
        } else {
            console.log("No user signed in");
            // Redirect to login or show login UI
        }
    });
}

// Load wins from Firestore
function loadWins() {
    const user = auth.currentUser;
    if (!user) return;
    
    const q = query(collection(db, "users", user.uid, "wins"), orderBy("date", "desc"));
    getDocs(q)
        .then(querySnapshot => {
            const wins = [];
            querySnapshot.forEach(doc => {
                wins.push({ id: doc.id, ...doc.data() });
            });
            renderWins(wins);
        })
        .catch(error => {
            console.error("Error loading wins:", error);
        });
}

// Create a new win
function createWin(title, description, image) {
    const user = auth.currentUser;
    if (!user) return;
    
    const win = {
        title: title,
        description: description,
        image: image,
        date: new Date()
    };
    
    addDoc(collection(db, "users", user.uid, "wins"), win)
        .then(docRef => {
            console.log("Win written with ID: ", docRef.id);
            // Reload wins to show the new one
            loadWins();
            
            // Reset form
            winForm.reset();
            imagePreview.innerHTML = '';
            imageDataUrl = null;
        })
        .catch(error => {
            console.error("Error adding win: ", error);
        });
}

// Delete a win
function deleteWin(id) {
    const user = auth.currentUser;
    if (!user) return;
    
    deleteDoc(doc(db, "users", user.uid, "wins", id))
        .then(() => {
            console.log("Win deleted with ID: ", id);
            // Reload wins to reflect the deletion
            loadWins();
        })
        .catch(error => {
            console.error("Error removing win: ", error);
        });
}

// Render wins in the gallery
function renderWins(wins) {
    winsList.innerHTML = '';
    
    if (!wins || wins.length === 0) {
        winsList.innerHTML = '<p class="no-wins">No victories recorded yet. Start achieving!</p>';
        return;
    }
    
    wins.forEach(win => {
        // Format date for display
        const formattedDate = win.date.toDate ? win.date.toDate().toLocaleDateString() : new Date(win.date).toLocaleDateString();
        
        const winElement = document.createElement('div');
        winElement.className = 'win-card';
        winElement.innerHTML = `
            <div class="win-header">
                <h4>${win.title}</h4>
                <span class="win-date">${formattedDate}</span>
            </div>
            <div class="win-content">
                <p>${win.description}</p>
                ${win.image ? `<img src="${win.image}" alt="${win.title}" class="win-image">` : ''}
            </div>
            <div class="win-actions">
                <button class="delete-btn" onclick="deleteWin('${win.id}')">Delete</button>
            </div>
        `;
        winsList.appendChild(winElement);
    });
}

// Handle image preview
winImageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            imageDataUrl = event.target.result;
            imagePreview.innerHTML = `<img src="${imageDataUrl}" alt="Preview" class="image-preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Handle form submission
winForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('win-title').value;
    const description = document.getElementById('win-description').value;
    
    if (title && description) {
        createWin(title, description, imageDataUrl);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});