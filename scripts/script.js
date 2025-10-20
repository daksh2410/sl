// Solo Leveling System - Main Script with Firebase Integration

// Import Firebase modules
import { db, auth } from '/scripts/firebase-config.js';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Initialize stats
let stats = {
    strength: { level: 1, xp: 0 },
    intelligence: { level: 1, xp: 0 },
    charisma: { level: 1, xp: 0 },
    wisdom: { level: 1, xp: 0 }
};

// Initialize tasks
let tasks = [];

// DOM Elements
const taskForm = document.getElementById('task-form');
const tasksList = document.getElementById('tasks-list');

// Check if user is authenticated
function checkAuth() {
    onAuthStateChanged(auth, user => {
        if (user) {
            console.log("User is signed in:", user);
            loadData();
        } else {
            console.log("No user signed in");
            // Redirect to login or show login UI
        }
    });
}

// Load data from Firestore
function loadData() {
    const user = auth.currentUser;
    if (!user) return;
    
    // Load stats
    getDoc(doc(db, "users", user.uid, "stats", "current"))
        .then(docSnap => {
            if (docSnap.exists()) {
                stats = docSnap.data();
                updateStatsDisplay();
            } else {
                // Create initial stats if they don't exist
                saveStats();
                updateStatsDisplay();
            }
        })
        .catch(error => {
            console.error("Error loading stats:", error);
        });
    
    // Load tasks
    const q = query(collection(db, "users", user.uid, "tasks"), orderBy("createdAt", "desc"));
    getDocs(q)
        .then(querySnapshot => {
            tasks = [];
            querySnapshot.forEach(doc => {
                tasks.push({ id: doc.id, ...doc.data() });
            });
            renderTasks();
        })
        .catch(error => {
            console.error("Error loading tasks:", error);
        });
}

// Save stats to Firestore
function saveStats() {
    const user = auth.currentUser;
    if (!user) return;
    
    setDoc(doc(db, "users", user.uid, "stats", "current"), stats)
        .catch(error => {
            console.error("Error saving stats:", error);
        });
}

// Save data to Firestore
function saveTask(task) {
    const user = auth.currentUser;
    if (!user) return;
    
    addDoc(collection(db, "users", user.uid, "tasks"), task)
        .then(docRef => {
            console.log("Task written with ID: ", docRef.id);
            task.id = docRef.id;
        })
        .catch(error => {
            console.error("Error adding task: ", error);
        });
}

// Update stats display
function updateStatsDisplay() {
    document.getElementById('strength-level').textContent = stats.strength.level;
    document.getElementById('strength-xp').textContent = stats.strength.xp;
    document.getElementById('strength-bar').style.width = `${stats.strength.xp}%`;
    
    document.getElementById('intelligence-level').textContent = stats.intelligence.level;
    document.getElementById('intelligence-xp').textContent = stats.intelligence.xp;
    document.getElementById('intelligence-bar').style.width = `${stats.intelligence.xp}%`;
    
    document.getElementById('charisma-level').textContent = stats.charisma.level;
    document.getElementById('charisma-xp').textContent = stats.charisma.xp;
    document.getElementById('charisma-bar').style.width = `${stats.charisma.xp}%`;
    
    document.getElementById('wisdom-level').textContent = stats.wisdom.level;
    document.getElementById('wisdom-xp').textContent = stats.wisdom.xp;
    document.getElementById('wisdom-bar').style.width = `${stats.wisdom.xp}%`;
}

// Add XP to a stat
function addXP(stat, amount) {
    stats[stat].xp += amount;
    
    // Level up if XP reaches 100
    if (stats[stat].xp >= 100) {
        stats[stat].level++;
        stats[stat].xp = stats[stat].xp - 100;
    }
    
    updateStatsDisplay();
    saveStats();
}

// Create a new task
function createTask(name, category, xp) {
    const user = auth.currentUser;
    if (!user) return;
    
    const task = {
        name: name,
        category: category,
        xp: xp,
        completed: false,
        createdAt: serverTimestamp()
    };
    
    addDoc(collection(db, "users", user.uid, "tasks"), task)
        .then(docRef => {
            task.id = docRef.id;
            tasks.unshift(task);
            renderTasks();
        })
        .catch(error => {
            console.error("Error adding task: ", error);
        });
}

// Complete a task
function completeTask(id) {
    const user = auth.currentUser;
    if (!user) return;
    
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
        task.completed = true;
        addXP(task.category, task.xp);
        
        updateDoc(doc(db, "users", user.uid, "tasks", id), { completed: true })
            .then(() => {
                renderTasks();
            })
            .catch(error => {
                console.error("Error updating task: ", error);
            });
    }
}

// Delete a task
function deleteTask(id) {
    const user = auth.currentUser;
    if (!user) return;
    
    deleteDoc(doc(db, "users", user.uid, "tasks", id))
        .then(() => {
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        })
        .catch(error => {
            console.error("Error removing task: ", error);
        });
}

// Render tasks list
function renderTasks() {
    tasksList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (task.completed) {
            li.style.opacity = '0.7';
            li.style.borderLeftColor = '#66ff99';
        }
        
        li.innerHTML = `
            <div class="task-info">
                <h3>${task.name}</h3>
                <p>Category: ${task.category.charAt(0).toUpperCase() + task.category.slice(1)} | XP: ${task.xp}</p>
            </div>
            <div class="task-actions">
                ${!task.completed ? 
                    `<button class="complete-btn" onclick="completeTask('${task.id}')">Complete</button>` : 
                    '<span>Completed</span>'}
                <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        `;
        
        tasksList.appendChild(li);
    });
}

// Handle form submission
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('task-name').value;
    const category = document.getElementById('task-category').value;
    const xp = parseInt(document.getElementById('task-xp').value);
    
    if (name && category && xp) {
        createTask(name, category, xp);
        taskForm.reset();
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateStatsDisplay();
});

// Timer functionality
let timerInterval;
let timeLeft;
let totalTime;
let isBreak = false;
let pomodoroTime = 25; // minutes
let breakTime = 5; // minutes

function startTimer(minutes) {
    totalTime = minutes * 60;
    timeLeft = totalTime;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Play sound or notification
            alert(isBreak ? 'Break time is over! Start working!' : 'Pomodoro completed! Time for a break!');
            
            // Toggle between work and break
            isBreak = !isBreak;
            const nextTime = isBreak ? breakTime : pomodoroTime;
            startTimer(nextTime);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer-display').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update progress bar
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    clearInterval(timerInterval);
    isBreak = false;
    startTimer(pomodoroTime);
}