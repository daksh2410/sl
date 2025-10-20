// Rewards System Script with Firebase Integration

// Import Firebase modules
import { db, auth } from '/scripts/firebase-config.js';
import { 
  doc, 
  getDoc,
  collection, 
  getDocs, 
  query, 
  orderBy,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Check if user is authenticated
function checkAuth() {
    onAuthStateChanged(auth, user => {
        if (user) {
            console.log("User is signed in:", user);
            loadRewards();
        } else {
            console.log("No user signed in");
            // Redirect to login or show login UI
        }
    });
}

// Load stats and check for unlocked rewards
function loadRewards() {
    const user = auth.currentUser;
    if (!user) return;
    
    // Load stats
    getDoc(doc(db, "users", user.uid, "stats", "current"))
        .then(docSnap => {
            if (docSnap.exists()) {
                const stats = docSnap.data();
                updateRewardStatus(stats);
                
                // Load tasks to check achievements
                loadTasksForAchievements(user.uid, stats);
            }
        })
        .catch(error => {
            console.error("Error loading stats:", error);
        });
}

// Load tasks for achievement checking
function loadTasksForAchievements(userId, stats) {
    const q = query(collection(db, "users", userId, "tasks"), orderBy("createdAt", "desc"));
    getDocs(q)
        .then(querySnapshot => {
            const tasks = [];
            querySnapshot.forEach(doc => {
                tasks.push({ id: doc.id, ...doc.data() });
            });
            checkAchievements(stats, tasks);
        })
        .catch(error => {
            console.error("Error loading tasks:", error);
        });
}

// Update reward status based on current levels
function updateRewardStatus(stats) {
    // Update strength rewards
    const strengthRewards = document.querySelectorAll('#strength-rewards li');
    updateRewardList(strengthRewards, stats.strength.level);
    
    // Update intelligence rewards
    const intelligenceRewards = document.querySelectorAll('#intelligence-rewards li');
    updateRewardList(intelligenceRewards, stats.intelligence.level);
    
    // Update charisma rewards
    const charismaRewards = document.querySelectorAll('#charisma-rewards li');
    updateRewardList(charismaRewards, stats.charisma.level);
    
    // Update wisdom rewards
    const wisdomRewards = document.querySelectorAll('#wisdom-rewards li');
    updateRewardList(wisdomRewards, stats.wisdom.level);
}

// Update reward list based on level
function updateRewardList(rewards, level) {
    rewards.forEach((reward, index) => {
        const requiredLevel = (index + 1) * 5;
        if (level >= requiredLevel) {
            reward.style.color = '#66ff99';
            reward.style.fontWeight = 'bold';
        }
    });
}

// Check achievements
function checkAchievements(stats, tasks) {
    // Get achievement cards
    const achievementCards = document.querySelectorAll('.achievement-card');
    
    // First Steps: Check if any task has been completed
    const completedTasks = tasks.filter(task => task.completed);
    if (completedTasks.length > 0) {
        achievementCards[0].querySelector('.achievement-status').textContent = 'Unlocked!';
        achievementCards[0].querySelector('.achievement-status').style.color = '#66ff99';
    }
    
    // Daily Streak: Would need more complex tracking
    // For now, just show as locked
    
    // Balanced Development: All stats at level 5+
    const allStatsAtLeast5 = Object.values(stats).every(stat => stat.level >= 5);
    if (allStatsAtLeast5) {
        achievementCards[2].querySelector('.achievement-status').textContent = 'Unlocked!';
        achievementCards[2].querySelector('.achievement-status').style.color = '#66ff99';
    }
    
    // Master Achiever: Any stat at level 20+
    const anyStatAtLeast20 = Object.values(stats).some(stat => stat.level >= 20);
    if (anyStatAtLeast20) {
        achievementCards[3].querySelector('.achievement-status').textContent = 'Unlocked!';
        achievementCards[3].querySelector('.achievement-status').style.color = '#66ff99';
    }
}

// Initialize rewards page
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});