// Pomodoro Timer Script with Firebase Integration

// Import Firebase modules
import { db, auth } from '/scripts/firebase-config.js';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Timer variables
let timerInterval;
let timeLeft = 25 * 60; // 25 minutes in seconds
let totalTime = 25 * 60;
let isRunning = false;
let isBreak = false;

// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const pomodoroTimeInput = document.getElementById('pomodoro-time');
const breakTimeInput = document.getElementById('break-time');
const progressFill = document.getElementById('progress-fill');
const timerTasksList = document.getElementById('timer-tasks-list');

// Check if user is authenticated
function checkAuth() {
    onAuthStateChanged(auth, user => {
        if (user) {
            console.log("User is signed in:", user);
            loadTasks();
        } else {
            console.log("No user signed in");
            // Redirect to login or show login UI
        }
    });
}

// Load tasks from Firestore
function loadTasks() {
    const user = auth.currentUser;
    if (!user) return;
    
    // Load tasks
    const q = query(collection(db, "users", user.uid, "tasks"), orderBy("createdAt", "desc"));
    getDocs(q)
        .then(querySnapshot => {
            const tasks = [];
            querySnapshot.forEach(doc => {
                tasks.push({ id: doc.id, ...doc.data() });
            });
            renderTimerTasks(tasks);
        })
        .catch(error => {
            console.error("Error loading tasks:", error);
        });
}

// Render tasks for timer
function renderTimerTasks(tasks) {
    timerTasksList.innerHTML = '';
    
    // Filter out completed tasks
    const incompleteTasks = tasks.filter(task => !task.completed);
    
    incompleteTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <div class="task-info">
                <h3>${task.name}</h3>
                <p>Category: ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</p>
            </div>
        `;
        timerTasksList.appendChild(li);
    });
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update progress bar
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    progressFill.style.width = `${progress}%`;
}

// Start timer
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            
            // Play notification sound
            alert(isBreak ? 'Break time is over! Start working!' : 'Pomodoro completed! Time for a break!');
            
            // Toggle between work and break
            isBreak = !isBreak;
            const nextTime = isBreak ? parseInt(breakTimeInput.value) * 60 : parseInt(pomodoroTimeInput.value) * 60;
            timeLeft = nextTime;
            totalTime = nextTime;
            updateTimerDisplay();
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
}

// Reset timer
function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    isBreak = false;
    timeLeft = parseInt(pomodoroTimeInput.value) * 60;
    totalTime = timeLeft;
    updateTimerDisplay();
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateTimerDisplay();
    
    // Update timer when settings change
    pomodoroTimeInput.addEventListener('change', function() {
        if (!isRunning && !isBreak) {
            timeLeft = parseInt(this.value) * 60;
            totalTime = timeLeft;
            updateTimerDisplay();
        }
    });
    
    breakTimeInput.addEventListener('change', function() {
        if (!isRunning && isBreak) {
            timeLeft = parseInt(this.value) * 60;
            totalTime = timeLeft;
            updateTimerDisplay();
        }
    });
});