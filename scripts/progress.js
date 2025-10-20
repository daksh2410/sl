// Progress Tracking Script with Firebase Integration

// Import Firebase modules
import { db, auth } from '/scripts/firebase-config.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// DOM Elements
const xpTableBody = document.getElementById('xp-table-body');
const progressChartCtx = document.getElementById('progressChart').getContext('2d');
const prevWeekBtn = document.getElementById('prev-week');
const nextWeekBtn = document.getElementById('next-week');
const weekRangeSpan = document.getElementById('week-range');

// Chart instance
let progressChart;

// Pagination variables
let currentPage = 0;
const itemsPerPage = 7;

// Check if user is authenticated
function checkAuth() {
    onAuthStateChanged(auth, user => {
        if (user) {
            console.log("User is signed in:", user);
            loadProgressData();
        } else {
            console.log("No user signed in");
            // Redirect to login or show login UI
        }
    });
}

// Load and display progress data
function loadProgressData() {
    // Load current stats
    loadCurrentStats();
    
    // Load daily XP data
    renderDailyXPData();
    renderProgressChart();
}

// Load current stats from Firestore
function loadCurrentStats() {
    const user = auth.currentUser;
    if (!user) return;
    
    getDoc(doc(db, "users", user.uid, "stats", "current"))
        .then(docSnap => {
            if (docSnap.exists()) {
                const stats = docSnap.data();
                updateStatsSummary(stats);
            }
        })
        .catch(error => {
            console.error("Error loading stats:", error);
        });
}

// Update stats summary
function updateStatsSummary(stats) {
    document.getElementById('summary-strength-level').textContent = stats.strength.level;
    document.getElementById('summary-strength-xp').textContent = stats.strength.xp;
    
    document.getElementById('summary-intelligence-level').textContent = stats.intelligence.level;
    document.getElementById('summary-intelligence-xp').textContent = stats.intelligence.xp;
    
    document.getElementById('summary-charisma-level').textContent = stats.charisma.level;
    document.getElementById('summary-charisma-xp').textContent = stats.charisma.xp;
    
    document.getElementById('summary-wisdom-level').textContent = stats.wisdom.level;
    document.getElementById('summary-wisdom-xp').textContent = stats.wisdom.xp;
}

// Get daily XP data (initialize with date range)
function getDailyXPData() {
    // Initialize with date range from Oct 19, 2025 to Jan 1, 2026 with zero XP
    const data = [];
    const startDate = new Date(2025, 9, 19); // October 19, 2025
    const endDate = new Date(2026, 0, 1);    // January 1, 2026
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        data.push({
            date: dateStr,
            strength: 0,
            intelligence: 0,
            charisma: 0,
            wisdom: 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
}

// Calculate XP from completed tasks for a specific date
function calculateXPForDate(dateStr, tasks) {
    const completedTasks = tasks.filter(task => 
        task.completed && 
        task.createdAt && 
        new Date(task.createdAt.toDate ? task.createdAt.toDate() : task.createdAt).toISOString().split('T')[0] === dateStr
    );
    
    const xp = {
        strength: 0,
        intelligence: 0,
        charisma: 0,
        wisdom: 0
    };
    
    completedTasks.forEach(task => {
        xp[task.category] += task.xp;
    });
    
    return xp;
}

// Load tasks from Firestore and update daily XP data
function loadTasksAndUpdateDailyXP() {
    const user = auth.currentUser;
    if (!user) return Promise.resolve([]);
    
    const data = getDailyXPData();
    
    const q = query(collection(db, "users", user.uid, "tasks"), orderBy("createdAt", "desc"));
    return getDocs(q)
        .then(querySnapshot => {
            const tasks = [];
            querySnapshot.forEach(doc => {
                tasks.push({ id: doc.id, ...doc.data() });
            });
            
            // Update daily XP from completed tasks
            data.forEach(day => {
                const calculatedXP = calculateXPForDate(day.date, tasks);
                day.strength = calculatedXP.strength;
                day.intelligence = calculatedXP.intelligence;
                day.charisma = calculatedXP.charisma;
                day.wisdom = calculatedXP.wisdom;
            });
            
            return data;
        })
        .catch(error => {
            console.error("Error loading tasks:", error);
            return data;
        });
}

// Render daily XP data in the table with pagination
function renderDailyXPData() {
    loadTasksAndUpdateDailyXP().then(data => {
        // Calculate total pages
        const totalPages = Math.ceil(data.length / itemsPerPage);
        
        // Ensure current page is within bounds
        if (currentPage < 0) currentPage = 0;
        if (currentPage >= totalPages) currentPage = totalPages - 1;
        
        // Get data for current page
        const startIndex = currentPage * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, data.length);
        const pageData = data.slice(startIndex, endIndex);
        
        // Update navigation buttons
        prevWeekBtn.disabled = currentPage === 0;
        nextWeekBtn.disabled = currentPage === totalPages - 1;
        
        // Update week range display
        const startDay = startIndex + 1;
        const endDay = endIndex;
        weekRangeSpan.textContent = `Days ${startDay}-${endDay} of ${data.length}`;
        
        // Render table
        xpTableBody.innerHTML = '';
        
        pageData.forEach((day, index) => {
            const totalXP = day.strength + day.intelligence + day.charisma + day.wisdom;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${startIndex + index + 1}</td>
                <td>${day.date}</td>
                <td>${day.strength}</td>
                <td>${day.intelligence}</td>
                <td>${day.charisma}</td>
                <td>${day.wisdom}</td>
                <td><strong>${totalXP}</strong></td>
            `;
            xpTableBody.appendChild(row);
        });
    });
}

// Render progress chart
function renderProgressChart() {
    loadTasksAndUpdateDailyXP().then(data => {
        // Sample data for chart (every 5 days to keep it readable)
        const sampledData = data.filter((_, index) => index % 5 === 0);
        
        const labels = sampledData.map(day => day.date);
        const strengthData = sampledData.map(day => day.strength);
        const intelligenceData = sampledData.map(day => day.intelligence);
        const charismaData = sampledData.map(day => day.charisma);
        const wisdomData = sampledData.map(day => day.wisdom);
        
        if (progressChart) {
            progressChart.destroy();
        }
        
        progressChart = new Chart(progressChartCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Strength',
                        data: strengthData,
                        borderColor: '#ff4d4d',
                        backgroundColor: 'rgba(255, 77, 77, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Intelligence',
                        data: intelligenceData,
                        borderColor: '#4d79ff',
                        backgroundColor: 'rgba(77, 121, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Charisma',
                        data: charismaData,
                        borderColor: '#9966ff',
                        backgroundColor: 'rgba(153, 102, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Wisdom',
                        data: wisdomData,
                        borderColor: '#66ff99',
                        backgroundColor: 'rgba(102, 255, 153, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#f0f0f0',
                            font: {
                                family: "'Orbitron', 'Roboto Mono', monospace"
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#b0b0b0',
                            maxTicksLimit: 10
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#b0b0b0'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    });
}

// Event listeners for pagination
prevWeekBtn.addEventListener('click', function() {
    currentPage--;
    renderDailyXPData();
    renderProgressChart();
});

nextWeekBtn.addEventListener('click', function() {
    currentPage++;
    renderDailyXPData();
    renderProgressChart();
});

// Initialize progress page
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});