/* ==========================================
   UI MODULE
   Handles all DOM manipulation and UI updates
   ========================================== */

/**
 * Show loading spinner
 */
export function showLoading() {
    const loading = document.getElementById('loading');
    const profileCard = document.getElementById('profile-card');
    
    loading.classList.add('active');
    profileCard.classList.remove('active');
}

/**
 * Hide loading spinner
 */
export function hideLoading() {
    const loading = document.getElementById('loading');
    loading.classList.remove('active');
}

/**
 * Display error message to user
 * @param {string} message - Error message to display
 */
export function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    
    // Auto-clear error after 5 seconds
    setTimeout(() => {
        clearError();
    }, 5000);
}

/**
 * Clear error message
 */
export function clearError() {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = '';
}

/**
 * Render profile card with GitHub user data
 * @param {Object} data - User profile and repos data
 */
export function renderProfileCard(data) {
    const { profile, repos } = data;
    const profileCard = document.getElementById('profile-card');
    
    // Build HTML using template literals
    profileCard.innerHTML = `
        <div class="profile-header">
            <img 
                src="${profile.avatar_url}" 
                alt="${profile.name || profile.login}'s avatar"
                class="profile-avatar"
            >
            <div class="profile-info">
                <h2>${profile.name || profile.login}</h2>
                <p class="profile-username">@${profile.login}</p>
            </div>
        </div>
        
        ${profile.bio ? `<p class="profile-bio">${escapeHtml(profile.bio)}</p>` : ''}
        
        ${profile.location ? `<p class="profile-location">📍 ${escapeHtml(profile.location)}</p>` : ''}
        
        <div class="profile-stats">
            <div class="stat-card">
                <div class="stat-value">${profile.public_repos}</div>
                <div class="stat-label">Repositories</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatNumber(profile.followers)}</div>
                <div class="stat-label">Followers</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${profile.following}</div>
                <div class="stat-label">Following</div>
            </div>
        </div>
        
        ${repos.length > 0 ? `
            <div class="repos-section">
                <h3>Top Repositories</h3>
                ${repos.map(repo => `
                    <div class="repo-item">
                        <div class="repo-name">${escapeHtml(repo.name)}</div>
                        <div class="repo-stars">⭐ ${formatNumber(repo.stargazers_count)} stars</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <a href="${profile.html_url}" target="_blank" class="btn-primary" style="display: inline-block; margin-top: 1rem; text-decoration: none;">
            View Full Profile on GitHub
        </a>
    `;
    
    // Show card with fade-in animation
    profileCard.classList.add('active');
}

/**
 * Format large numbers with K/M suffix
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Apply new theme
    html.setAttribute('data-theme', newTheme);
    
    // Save preference to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update button text and icon
    updateThemeButton(newTheme);
}

/**
 * Update theme button text and icon
 * @param {string} theme - Current theme ('light' or 'dark')
 */
function updateThemeButton(theme) {
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    if (theme === 'dark') {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
    }
}

/**
 * Load saved theme preference from localStorage
 */
export function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update button to match saved theme
    updateThemeButton(savedTheme);
}