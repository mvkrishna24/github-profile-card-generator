/* ==========================================
   GITHUB API MODULE
   Handles all API calls to GitHub
   ========================================== */

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Fetch user profile data from GitHub API
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} User data object
 */
export async function fetchUserProfile(username) {
    try {
        const response = await fetch(`${GITHUB_API_BASE}/users/${username}`);
        
        // Handle HTTP errors
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('User not found. Please check the username.');
            }
            if (response.status === 403) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            throw new Error('Failed to fetch user data. Please try again.');
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        // Network errors
        if (error.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
    }
}

/**
 * Fetch user's repositories
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} Array of repository objects
 */
export async function fetchUserRepos(username) {
    try {
        const response = await fetch(
            `${GITHUB_API_BASE}/users/${username}/repos?sort=stars&per_page=3`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }
        
        const repos = await response.json();
        return repos;
        
    } catch (error) {
        console.error('Error fetching repos:', error);
        return []; // Return empty array if repos fail (non-critical)
    }
}

/**
 * Fetch complete user data (profile + repos)
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} Combined user data
 */
export async function fetchCompleteUserData(username) {
    // Fetch both in parallel for speed
    const [profile, repos] = await Promise.all([
        fetchUserProfile(username),
        fetchUserRepos(username)
    ]);
    
    return {
        profile,
        repos
    };
}