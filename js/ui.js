/* ==========================================
   UI MODULE (V3 - PRODUCTION READY)
   ========================================== */

/* ==========================================
   LOADING
   ========================================== */
export function showLoading() {
  toggleElement("loading", true);
  toggleElement("profile-card", false);
}

export function hideLoading() {
  toggleElement("loading", false);
}

function toggleElement(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("active", show);
}

/* ==========================================
   ERROR HANDLING
   ========================================== */
export function showError(message) {
  const el = document.getElementById("error-message");
  if (!el) return;

  el.textContent = message;

  setTimeout(clearError, 4000);
}

export function clearError() {
  const el = document.getElementById("error-message");
  if (el) el.textContent = "";
}

/* ==========================================
   PROFILE CARD
   ========================================== */
export function renderProfileCard(data) {
  const { profile, repos } = data;
  const card = document.getElementById("profile-card");

  if (!card) return;

  card.innerHTML = `
    <div class="profile-header">
        <img src="${profile.avatar_url}" alt="${profile.login}" class="profile-avatar">

        <div class="profile-info">
            <h2>${escapeHtml(profile.name || profile.login)}</h2>
            <p class="profile-username">@${profile.login}</p>
        </div>
    </div>

    ${profile.bio ? `<p class="profile-bio">${escapeHtml(profile.bio)}</p>` : ""}

    ${profile.location ? `<p class="profile-location">📍 ${escapeHtml(profile.location)}</p>` : ""}

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

    ${
      repos.length > 0
        ? `
        <div class="repos-section">
            <h3>Top Repositories</h3>
            ${repos
              .map(
                (repo) => `
                <div class="repo-item">
                    <div class="repo-name">${escapeHtml(repo.name)}</div>
                    <div class="repo-stars">⭐ ${formatNumber(
                      repo.stargazers_count
                    )}</div>
                </div>
            `
              )
              .join("")}
        </div>
      `
        : `<p class="empty-state">No public repositories found</p>`
    }

    <a href="${profile.html_url}" target="_blank" class="btn-primary">
        View Full Profile
    </a>
  `;

  card.classList.add("active");
}

/* ==========================================
   NUMBER FORMAT
   ========================================== */
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num;
}

/* ==========================================
   SECURITY (XSS SAFE)
   ========================================== */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* ==========================================
   THEME (WITH LOGO SWITCH 🔥)
   ========================================== */
export function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");

  const newTheme = current === "dark" ? "light" : "dark";

  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  updateThemeUI(newTheme);
}

export function loadThemePreference() {
  const saved = localStorage.getItem("theme") || "light";

  document.documentElement.setAttribute("data-theme", saved);
  updateThemeUI(saved);
}

function updateThemeUI(theme) {
  const icon = document.getElementById("theme-icon");
  const text = document.getElementById("theme-text");
  const logo = document.getElementById("github-logo");

  if (theme === "dark") {
    icon.textContent = "☀️";
    text.textContent = "Light Mode";

    if (logo) logo.src = "assets/GitHub_Invertocat_White.png";
  } else {
    icon.textContent = "🌙";
    text.textContent = "Dark Mode";

    if (logo) logo.src = "assets/GitHub_Invertocat_Black.png";
  }
}

/* ==========================================
   COMPARE USERS (IMPROVED UI)
   ========================================== */
export function renderComparison(user1, user2) {
  const box = document.getElementById("compare-result");
  if (!box) return;

  const winner =
    user1.followers > user2.followers
      ? user1.login
      : user2.followers > user1.followers
      ? user2.login
      : "Tie";

  box.innerHTML = `
    <div class="compare-card">
        <h4>Comparison Result</h4>

        <p><b>${user1.login}</b> vs <b>${user2.login}</b></p>

        <div class="compare-stats">
            <p>👥 Followers: ${formatNumber(user1.followers)} vs ${formatNumber(
    user2.followers
  )}</p>
            <p>📦 Repos: ${user1.public_repos} vs ${user2.public_repos}</p>
            <p>➡️ Following: ${user1.following} vs ${user2.following}</p>
        </div>

        <p class="winner">🏆 Winner: ${winner}</p>
    </div>
  `;
}