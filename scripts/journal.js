// Journal System Script with Firebase Integration

// Import Firebase modules
import { db, auth } from '/scripts/firebase-config.js';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Initialize journal entries
let journalEntries = [];

// DOM Elements
const journalEntry = document.getElementById('journal-entry');
const saveJournalBtn = document.getElementById('save-journal');
const journalEntriesList = document.getElementById('journal-entries-list');

// Check if user is authenticated
function checkAuth() {
    onAuthStateChanged(auth, user => {
        if (user) {
            console.log("User is signed in:", user);
            loadJournalEntries();
        } else {
            console.log("No user signed in");
            // Redirect to login or show login UI
        }
    });
}

// Load journal entries from Firestore
function loadJournalEntries() {
    const user = auth.currentUser;
    if (!user) return;
    
    const q = query(collection(db, "users", user.uid, "journalEntries"), orderBy("date", "desc"));
    getDocs(q)
        .then(querySnapshot => {
            journalEntries = [];
            querySnapshot.forEach(doc => {
                journalEntries.push({ id: doc.id, ...doc.data() });
            });
            renderJournalEntries();
        })
        .catch(error => {
            console.error("Error loading journal entries:", error);
        });
}

// Save a journal entry to Firestore
function saveJournalEntry(entry) {
    const user = auth.currentUser;
    if (!user) return;
    
    addDoc(collection(db, "users", user.uid, "journalEntries"), entry)
        .then(docRef => {
            console.log("Journal entry written with ID: ", docRef.id);
            entry.id = docRef.id;
            journalEntries.unshift(entry); // Add to beginning of array
            renderJournalEntries();
            journalEntry.value = ''; // Clear textarea
        })
        .catch(error => {
            console.error("Error adding journal entry: ", error);
        });
}

// Create a new journal entry
function createJournalEntry(content) {
    const entry = {
        content: content,
        date: new Date()
    };
    
    saveJournalEntry(entry);
}

// Delete a journal entry
function deleteJournalEntry(id) {
    const user = auth.currentUser;
    if (!user) return;
    
    deleteDoc(doc(db, "users", user.uid, "journalEntries", id))
        .then(() => {
            journalEntries = journalEntries.filter(entry => entry.id !== id);
            renderJournalEntries();
        })
        .catch(error => {
            console.error("Error removing journal entry: ", error);
        });
}

// Render journal entries
function renderJournalEntries() {
    journalEntriesList.innerHTML = '';
    
    if (journalEntries.length === 0) {
        journalEntriesList.innerHTML = '<p>No journal entries yet. Start writing your journey!</p>';
        return;
    }
    
    journalEntries.forEach(entry => {
        // Format date for display
        const formattedDate = entry.date.toDate ? entry.date.toDate().toLocaleString() : new Date(entry.date).toLocaleString();
        
        const entryDiv = document.createElement('div');
        entryDiv.className = 'journal-entry';
        entryDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <p><strong>${formattedDate}</strong></p>
                    <p>${entry.content}</p>
                </div>
                <button class="delete-btn" onclick="deleteJournalEntry('${entry.id}')" style="margin-left: 1rem;">Delete</button>
            </div>
        `;
        journalEntriesList.appendChild(entryDiv);
    });
}

// Event listeners
saveJournalBtn.addEventListener('click', function() {
    const content = journalEntry.value.trim();
    if (content) {
        createJournalEntry(content);
    }
});

// Initialize journal page
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});