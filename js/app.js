/* ==========================================
   MAIN APPLICATION (V2 + STATS + COMPARISON)
   ========================================== */

import { fetchCompleteUserData } from "./api.js";
import {
  showLoading,
  hideLoading,
  showError,
  clearError,
  renderProfileCard,
  toggleTheme,
  loadThemePreference,
} from "./ui.js";

/* ==========================================
   STATE
   ========================================== */
let isLoading = false;

/* ==========================================
   RECENT SEARCHES
   ========================================== */

function getRecentSearches() {
  return JSON.parse(localStorage.getItem("recentSearches")) || [];
}

function saveSearch(username) {
  let searches = getRecentSearches();

  searches = searches.filter((u) => u !== username);
  searches.unshift(username);
  searches = searches.slice(0, 5);

  localStorage.setItem("recentSearches", JSON.stringify(searches));
}

function renderRecentSearches() {
  const list = document.getElementById("recent-list");
  const searches = getRecentSearches();

  list.innerHTML = "";

  searches.forEach((username) => {
    const li = document.createElement("li");
    li.textContent = username;

    li.addEventListener("click", () => {
      document.getElementById("username-input").value = username;
      handleGenerateCard();
    });

    list.appendChild(li);
  });
}

/* ==========================================
   STATS ANALYZER
   ========================================== */

function calculateStats(repos) {
  let totalStars = 0;
  let languageCount = {};

  repos.forEach((repo) => {
    totalStars += repo.stargazers_count;

    if (repo.language) {
      languageCount[repo.language] =
        (languageCount[repo.language] || 0) + 1;
    }
  });

  let topLanguage = "N/A";
  let max = 0;

  for (let lang in languageCount) {
    if (languageCount[lang] > max) {
      max = languageCount[lang];
      topLanguage = lang;
    }
  }

  return { totalStars, topLanguage };
}

/* ==========================================
   MAIN GENERATE FUNCTION
   ========================================== */

async function handleGenerateCard() {
  const input = document.getElementById("username-input");
  const username = input.value.trim();

  if (!username) {
    showError("Please enter a GitHub username");
    return;
  }

  if (!isValidUsername(username)) {
    showError("Invalid username format");
    return;
  }

  if (isLoading) return;

  clearError();
  isLoading = true;
  showLoading();

  const btn = document.getElementById("generate-btn");
  btn.disabled = true;
  btn.textContent = "Loading...";

  try {
    const data = await fetchCompleteUserData(username);

    // ✅ calculate stats
    const stats = calculateStats(data.repos);

    // ✅ save + render history
    saveSearch(username);
    renderRecentSearches();

    hideLoading();

    // ✅ pass stats to UI
    renderProfileCard(data, stats);
  } catch (error) {
    hideLoading();
    showError(error.message);
  } finally {
    isLoading = false;
    btn.disabled = false;
    btn.textContent = "Generate Card";
  }
}

/* ==========================================
   PROFILE COMPARISON
   ========================================== */

async function handleCompare() {
  const user1 = document.getElementById("user1").value.trim();
  const user2 = document.getElementById("user2").value.trim();

  if (!user1 || !user2) {
    showError("Enter both usernames");
    return;
  }

  try {
    const [data1, data2] = await Promise.all([
      fetchCompleteUserData(user1),
      fetchCompleteUserData(user2),
    ]);

    renderComparison(data1.profile, data2.profile);
  } catch (error) {
    showError(error.message);
  }
}

function renderComparison(p1, p2) {
  const container = document.getElementById("compare-result");

  const winner =
    p1.followers > p2.followers ? p1.login : p2.login;

  container.innerHTML = `
    <h4>Comparison Result</h4>
    <p><strong>${p1.login}</strong> vs <strong>${p2.login}</strong></p>
    <p>Followers: ${p1.followers} vs ${p2.followers} → 🏆 ${winner}</p>
    <p>Repositories: ${p1.public_repos} vs ${p2.public_repos}</p>
    <p>Following: ${p1.following} vs ${p2.following}</p>
  `;
}

/* ==========================================
   VALIDATION
   ========================================== */

function isValidUsername(username) {
  const regex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
  return regex.test(username);
}

/* ==========================================
   INIT
   ========================================== */

function init() {
  loadThemePreference();

  const btn = document.getElementById("generate-btn");
  const input = document.getElementById("username-input");
  const themeBtn = document.getElementById("theme-btn");
  const compareBtn = document.getElementById("compare-btn");

  btn.addEventListener("click", handleGenerateCard);

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleGenerateCard();
  });

  themeBtn.addEventListener("click", toggleTheme);

  compareBtn.addEventListener("click", handleCompare);

  renderRecentSearches();

  input.focus();
}

document.addEventListener("DOMContentLoaded", init);