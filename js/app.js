/* ==========================================
   GITHUB PROFILE CARD GENERATOR
   Main Application Logic
   Author: [Your Name]
   ========================================== */

import { fetchCompleteUserData } from './api.js';
import { 
    showLoading, 
    hideLoading, 
    showError, 
    clearError, 
    renderProfileCard,
    toggleTheme,
    loadThemePreference
} from './ui.js';

/* ==========================================
   STATE MANAGEMENT
   ========================================== */

let currentUser = null; // Track currently displayed user
let isLoading = false;  // Prevent double-clicks

/* ==========================================
   CORE FUNCTIONS
   ========================================== */

/**
 * Handle profile card generation
 * Main function triggered by user action
 */
async function handleGenerateCard() {
    // Get input element and username
    const input = document.getElementById('username-input');
    const username = input.value.trim();
    
    // Validation: Empty input check
    if (!username) {
        showError('Please enter a GitHub username');
        input.focus(); // Focus back to input for better UX
        return;
    }
    
    // Validation: Username format (basic check)
    if (!isValidUsername(username)) {
        showError('Invalid username format. Use only letters, numbers, and hyphens.');
        return;
    }
    
    // Prevent multiple simultaneous requests
    if (isLoading) {
        return;
    }
    
    // Clear previous error messages
    clearError();
    
    // Set loading state
    isLoading = true;
    showLoading();
    
    // Disable button during loading
    const generateBtn = document.getElementById('generate-btn');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Loading...';
    
    try {
        // Fetch user data from GitHub API
        const data = await fetchCompleteUserData(username);
        
        // Store current user
        currentUser = username;
        
        // Save to recent searches
        saveToRecentSearches(username);
        
        // Hide loading state
        hideLoading();
        
        // Render the profile card
        renderProfileCard(data);
        
        // Success feedback
        console.log(`✓ Successfully loaded profile for: ${username}`);
        
    } catch (error) {
        // Hide loading state
        hideLoading();
        
        // Display user-friendly error message
        showError(error.message);
        
        // Log error for debugging
        console.error('Error generating card:', error);
        
    } finally {
        // Always reset loading state and button
        isLoading = false;
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Card';
    }
}

/**
 * Validate GitHub username format
 * GitHub usernames can only contain alphanumeric characters and hyphens
 * @param {string} username - Username to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidUsername(username) {
    // GitHub username rules:
    // - May only contain alphanumeric characters or hyphens
    // - Cannot have multiple consecutive hyphens
    // - Cannot begin or end with a hyphen
    // - Maximum is 39 characters
    const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
    return usernameRegex.test(username);
}

/**
 * Save username to recent searches in localStorage
 * Maintains a list of last 5 searches
 * @param {string} username - Username to save
 */
function saveToRecentSearches(username) {
    try {
        // Get existing searches or create empty array
        let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        
        // Remove username if it already exists (to avoid duplicates)
        recentSearches = recentSearches.filter(u => u !== username);
        
        // Add username to beginning of array
        recentSearches.unshift(username);
        
        // Keep only last 5 searches
        recentSearches = recentSearches.slice(0, 5);
        
        // Save back to localStorage
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        
    } catch (error) {
        // Silently fail if localStorage is not available
        console.warn('Could not save to recent searches:', error);
    }
}

/**
 * Load recent searches from localStorage
 * @returns {Array} - Array of recent usernames
 */
function loadRecentSearches() {
    try {
        return JSON.parse(localStorage.getItem('recentSearches')) || [];
    } catch (error) {
        return [];
    }
}

/**
 * Clear input field
 */
function clearInput() {
    const input = document.getElementById('username-input');
    input.value = '';
    input.focus();
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K: Focus search input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('username-input');
        input.focus();
        input.select();
    }
    
    // Escape: Clear input
    if (e.key === 'Escape') {
        clearInput();
        clearError();
    }
}

/**
 * Setup all event listeners
 * Called once during initialization
 */
function setupEventListeners() {
    // Get DOM elements
    const generateBtn = document.getElementById('generate-btn');
    const usernameInput = document.getElementById('username-input');
    const themeBtn = document.getElementById('theme-btn');
    
    // Generate button click event
    generateBtn.addEventListener('click', handleGenerateCard);
    
    // Enter key in input field
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleGenerateCard();
        }
    });
    
    // Input field focus: Clear error on focus
    usernameInput.addEventListener('focus', () => {
        clearError();
    });
    
    // Input field validation on typing (real-time feedback)
    usernameInput.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        
        // Clear error when user starts typing after an error
        if (value.length > 0) {
            clearError();
        }
        
        // Optional: Show character count for long usernames
        if (value.length > 35) {
            showError('GitHub usernames cannot exceed 39 characters');
        }
    });
    
    // Theme toggle button
    themeBtn.addEventListener('click', toggleTheme);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Handle browser back/forward buttons (optional enhancement)
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.username) {
            usernameInput.value = e.state.username;
            handleGenerateCard();
        }
    });
}

/**
 * Display welcome message on first visit
 */
function showWelcomeMessage() {
    const hasVisited = localStorage.getItem('hasVisited');
    
    if (!hasVisited) {
        console.log('👋 Welcome to GitHub Profile Card Generator!');
        console.log('💡 Tip: Press Ctrl+K to focus search input');
        console.log('💡 Tip: Press Escape to clear input');
        localStorage.setItem('hasVisited', 'true');
    }
}

/**
 * Load a random popular GitHub user (optional demo feature)
 */
function loadRandomDemo() {
    const demoUsers = [
        'torvalds',
        'gaearon', 
        'tj',
        'sindresorhus',
        'addyosmani'
    ];
    
    const randomUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
    const input = document.getElementById('username-input');
    input.value = randomUser;
    
    // Auto-generate after a short delay (for demo effect)
    setTimeout(handleGenerateCard, 500);
}

/**
 * Initialize the application
 * Entry point - runs when DOM is ready
 */
function init() {
    console.log('🚀 Initializing GitHub Profile Card Generator...');
    
    // Load saved theme preference
    loadThemePreference();
    
    // Setup all event listeners
    setupEventListeners();
    
    // Show welcome message for first-time visitors
    showWelcomeMessage();
    
    // Load recent searches (optional: could display them in UI)
    const recentSearches = loadRecentSearches();
    if (recentSearches.length > 0) {
        console.log('📋 Recent searches:', recentSearches.join(', '));
    }
    
    // Auto-focus input field for better UX
    const input = document.getElementById('username-input');
    input.focus();
    
    // Optional: Load a demo profile on first visit
    // Uncomment the line below to auto-load a random profile
    // const hasVisited = localStorage.getItem('hasVisited');
    // if (!hasVisited) loadRandomDemo();
    
    console.log('✅ Application initialized successfully');
}

/* ==========================================
   APPLICATION START
   ========================================== */

// Wait for DOM to be fully loaded, then initialize
document.addEventListener('DOMContentLoaded', init);

// Optional: Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('👋 Page hidden');
    } else {
        console.log('👁️ Page visible');
    }
});

// Optional: Log app version
console.log('%c GitHub Profile Card Generator v1.0', 'color: #0366d6; font-size: 14px; font-weight: bold');

/* ==========================================
   EXPORT FOR TESTING (Optional)
   ========================================== */

// Export functions for unit testing if needed
export {
    handleGenerateCard,
    isValidUsername,
    saveToRecentSearches,
    loadRecentSearches
};