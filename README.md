# Solo Leveling System

A gamified personal productivity web application inspired by the Solo Leveling series.

## Features

- **4 Core Stats System**: Track Strength, Intelligence, Charisma, and Wisdom with XP and leveling (100 XP = 1 level)
- **Task Management**: Create tasks and assign them to stats with XP rewards
- **Pomodoro Timer**: Built-in timer with progress bar and break tracking
- **Rewards System**: Unlock achievements as you level up
- **Personal Journal**: Reflect on your progress and document your journey
- **Progress Tracking**: View daily XP gains in a table and chart visualization
- **Hall of Shadows**: Record personal victories with title, description, and image upload
- **Cross-Device Sync**: All data synchronized across devices using Firebase

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- Firebase (Authentication and Firestore)
- Chart.js (for progress visualization)

## Setup Instructions

1. Clone the repository
2. Create a Firebase project at https://firebase.google.com/
3. Enable Authentication (Email/Password) and Firestore Database
4. Replace the Firebase configuration in `scripts/firebase-config.js` with your project settings
5. Deploy to any static hosting service (Netlify, Firebase Hosting, GitHub Pages, etc.)

## File Structure

```
.
├── pages/
│   ├── index.html          # Main dashboard
│   ├── login.html          # Authentication page
│   ├── timer.html          # Pomodoro timer
│   ├── rewards.html        # Rewards and achievements
│   ├── journal.html        # Personal journal
│   ├── progress.html       # Progress tracking
│   └── hall-of-shadows.html # Personal victories
├── scripts/
│   ├── firebase-config.js  # Firebase configuration
│   ├── auth.js            # Authentication handling
│   ├── script.js          # Main dashboard logic
│   ├── timer.js           # Pomodoro timer logic
│   ├── rewards.js         # Rewards system logic
│   ├── journal.js         # Journal functionality
│   ├── progress.js        # Progress tracking logic
│   └── hall-of-shadows.js # Hall of Shadows logic
├── styles/
│   └── styles.css         # All styling
└── assets/
    └── images/            # Image assets (if any)
```

## Firebase Configuration

To use this application with your own data:

1. Create a Firebase project at https://firebase.google.com/
2. Enable Authentication (Email/Password) and Firestore Database
3. Copy your Firebase configuration settings
4. Replace the placeholder values in `scripts/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Deployment

This application can be deployed to any static hosting service:

- **Netlify**: Connect your GitHub repository
- **Firebase Hosting**: Use `firebase init hosting` and `firebase deploy`
- **GitHub Pages**: Enable in repository settings
- **Vercel**: Import your Git repository

## Usage

1. Open the deployed application
2. Create an account or log in
3. Start creating tasks and tracking your progress
4. Use the Pomodoro timer for focused work sessions
5. Record your achievements in the Hall of Shadows
6. Track your progress over time in the Progress section

All data will automatically sync across all devices where you log in with the same account.