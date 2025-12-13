// script.js - Hub Media (backend-aware, complete rewrite)
// - Uses fetch(..., { credentials: 'include' }) to work with session cookies.
// - Tries backend endpoints and gracefully falls back to local demo data.
// - Does NOT auto-login a demo user; if not authenticated UI will show Sign In link.
// - Contains content CRUD via /api/contents and auth checks (/auth/me, /auth/check, /auth/logout).
// - Attempts to find correct login redirect path (handles /login.html vs /html/login.html).
//
// Place this file in public/js/script.js and include in index.html

/* ============================
   Helper utilities
   ============================ */

function showNotification(message, type = 'info', timeout = 2500) {
    const colors = {
        success: '#00C853',
        info: '#5B5FED',
        warning: '#FF9800',
        error: '#FF4444'
    };
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 18px;
        border-radius: 10px;
        z-index: 10000;
        box-shadow: 0 6px 18px rgba(0,0,0,0.15);
        font-weight: 600;
        max-width: 360px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, timeout);
}

async function safeJson(res) {
    try { return await res.json(); } catch (e) { return null; }
}

// Try a list of candidate auth profile endpoints; return profile or null
async function tryGetAuthProfile() {
    const candidates = ['/auth/me', '/auth/check', '/api/auth/me', '/auth/session', '/auth/profile'];
    for (const url of candidates) {
        try {
            const res = await fetch(url, { method: 'GET', credentials: 'include' });
            // Accept 200 with JSON containing at least email or user_id
            if (res.ok) {
                const body = await safeJson(res);
                if (body && (body.user || body.email || body.user_id || body.user_id === 0 || body.user_id)) {
                    return body.user || body;
                }
                // Some implementations return {ok:true, profile: {...}}
                if (body && body.profile) return body.profile;
            } else if (res.status === 401) {
                // explicit unauthenticated
                return null;
            }
        } catch (err) {
            // ignore - try next
        }
    }
    return null;
}

// Try to find best login path - attempts HEAD requests and picks first OK
async function findLoginPath() {
    const candidates = ['/login.html', '/html/login.html', '/public/login.html', '/auth/login'];
    for (const url of candidates) {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            if (res.ok) return url;
        } catch (e) {
            // ignore
        }
    }
    // fallback to root login path
    return '/login.html';
}

/* ============================
   DOM element refs
   ============================ */

const contentTableBody = document.getElementById('contentTableBody');
const createContentBtn = document.getElementById('createContentBtn');
const contentModal = document.getElementById('contentModal');
const contentForm = document.getElementById('contentForm');
const saveContentBtn = document.getElementById('saveContentBtn');
const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
const contentSearch = document.getElementById('contentSearch');
const contentFilter = document.getElementById('contentFilter');
const logoutBtn = document.getElementById('logoutBtn');
const userProfileArea = document.querySelector('.sidebar-footer .user-profile'); // may exist
const dateFilter = document.getElementById('dateFilter');
const navItems = document.querySelectorAll('.nav-item');

/* ============================
   Local fallback content (demo)
   ============================ */

let contentData = [
    { id: 1, title: 'Top 10 Music Trends 2024', category: 'Article', status: 'Published', date: '2024-05-15', views: 12500 },
    { id: 2, title: 'Guitar Masterclass Review', category: 'Video', status: 'Published', date: '2024-05-14', views: 8200 },
    { id: 3, title: 'Live Session: Acoustic Night', category: 'Livestream', status: 'Scheduled', date: '2024-05-20', views: 0 },
    { id: 4, title: 'Best Synthesisers for Beginners', category: 'Article', status: 'Draft', date: '2024-05-16', views: 0 },
    { id: 5, title: 'Drum Kit Setup Guide', category: 'Video', status: 'Published', date: '2024-05-10', views: 5400 }
];

/* ============================
   API helpers (use credentials to send cookies)
   ============================ */

async function apiGetContents() {
    try {
        const res = await fetch('/api/contents', { method: 'GET', credentials: 'include' });
        if (!res.ok) throw new Error('Fetch /api/contents failed');
        const body = await res.json();
        // body expected: { error:0, data: [...] } or [...]
        if (Array.isArray(body)) return body;
        if (body && body.data && Array.isArray(body.data)) return body.data;
        return null;
    } catch (err) {
        console.warn('apiGetContents failed:', err);
        return null;
    }
}

async function apiCreateContent(payload) {
    const res = await fetch('/api/contents', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Create content failed');
    return await res.json();
}

async function apiUpdateContent(id, payload) {
    const res = await fetch(`/api/contents/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Update content failed');
    return await res.json();
}

async function apiDeleteContent(id) {
    const res = await fetch(`/api/contents/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error('Delete content failed');
    return await res.json();
}

/* ============================
   Utilities for UI & rendering
   ============================ */

function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderContentTable(data = contentData) {
    if (!contentTableBody) return;
    contentTableBody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(item.title)}</strong></td>
            <td>${escapeHtml(item.category || '')}</td>
            <td><span class="status-badge ${String(item.status || '').toLowerCase()}">${escapeHtml(item.status || '')}</span></td>
            <td>${escapeHtml(item.date || '')}</td>
            <td>${(item.views || 0).toLocaleString()}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon" data-id="${item.content_id || item.id || ''}" data-action="edit" title="Edit">
                        ✏️
                    </button>
                    <button class="btn-icon delete" data-id="${item.content_id || item.id || ''}" data-action="delete" title="Delete">
                        🗑️
                    </button>
                </div>
            </td>
        `;
        contentTableBody.appendChild(row);
    });
}

/* ============================
   Modal handlers
   ============================ */

function openContentModal(title = 'Create New Content') {
    if (!contentModal) return;
    const titleEl = document.getElementById('modalTitle');
    if (titleEl) titleEl.textContent = title;
    contentModal.classList.add('active');
}

function closeContentModal() {
    if (!contentModal) return;
    contentModal.classList.remove('active');
    if (contentForm) contentForm.reset();
    const idEl = document.getElementById('contentId');
    if (idEl) idEl.value = '';
}

/* ============================
   Event wiring
   ============================ */

// nav active highlight
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
    });
});

// create content
if (createContentBtn) {
    createContentBtn.addEventListener('click', () => openContentModal('Create New Content'));
}

// close modal buttons
closeModalBtns.forEach(btn => btn.addEventListener('click', closeContentModal));

// delegate in content table (edit/delete)
if (contentTableBody) {
    contentTableBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;

        if (action === 'edit') {
            const item = contentData.find(i => String(i.content_id || i.id) === String(id));
            if (!item) { showNotification('Item not found', 'error'); return; }
            document.getElementById('contentId').value = item.content_id || item.id;
            document.getElementById('contentTitle').value = item.title || '';
            document.getElementById('contentCategory').value = item.category || 'Article';
            document.getElementById('contentStatus').value = item.status || 'Draft';
            openContentModal('Edit Content');
        } else if (action === 'delete') {
            if (!confirm('Are you sure you want to delete this content?')) return;
            try {
                await apiDeleteContent(id);
                contentData = contentData.filter(i => String(i.content_id || i.id) !== String(id));
                renderContentTable(contentData);
                showNotification('Content deleted', 'success');
            } catch (err) {
                // fallback local removal
                contentData = contentData.filter(i => String(i.content_id || i.id) !== String(id));
                renderContentTable(contentData);
                showNotification('Deleted locally (API failed)', 'warning');
            }
        }
    });
}

// save content (create/update)
if (saveContentBtn) {
    saveContentBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = document.getElementById('contentId').value;
        const title = document.getElementById('contentTitle').value.trim();
        const category = document.getElementById('contentCategory').value;
        const status = document.getElementById('contentStatus').value;

        if (!title) { showNotification('Please enter a title', 'warning'); return; }

        const payload = { title, category, status };

        if (id) {
            // update
            try {
                await apiUpdateContent(id, payload);
                // update local copy where possible
                const idx = contentData.findIndex(i => String(i.content_id || i.id) === String(id));
                if (idx !== -1) contentData[idx] = { ...contentData[idx], title, category, status, updated_at: new Date().toISOString() };
                showNotification('Content updated', 'success');
            } catch (err) {
                // fallback local
                const idx = contentData.findIndex(i => String(i.content_id || i.id) === String(id));
                if (idx !== -1) contentData[idx] = { ...contentData[idx], title, category, status, updated_at: new Date().toISOString() };
                showNotification('Updated locally (API failed)', 'info');
            }
        } else {
            // create
            try {
                const created = await apiCreateContent(payload);
                // if API returns created object in body.data or data, use it; else push normalized
                let newItem = null;
                if (created && created.data && Array.isArray(created.data)) {
                    newItem = created.data[0];
                } else if (created && created.content_id) {
                    newItem = created;
                }
                if (newItem) {
                    // normalize fields
                    contentData.unshift({
                        id: newItem.content_id || newItem.id,
                        title: newItem.title,
                        category: newItem.type || newItem.category,
                        status: newItem.status,
                        date: newItem.created_at ? newItem.created_at.split('T')[0] : (newItem.date || ''),
                        views: newItem.views || 0,
                        ...newItem
                    });
                } else {
                    // fallback local
                    const newId = contentData.length ? Math.max(...contentData.map(i => i.id || i.content_id)) + 1 : 1;
                    contentData.unshift({ id: newId, title, category, status, date: new Date().toISOString().split('T')[0], views: 0 });
                }
                showNotification('Content created', 'success');
            } catch (err) {
                // fallback local create
                const newId = contentData.length ? Math.max(...contentData.map(i => i.id || i.content_id)) + 1 : 1;
                contentData.unshift({ id: newId, title, category, status, date: new Date().toISOString().split('T')[0], views: 0 });
                showNotification('Created locally (API failed)', 'info');
            }
        }

        renderContentTable(contentData);
        closeContentModal();
    });
}

// search & filter
if (contentSearch) {
    contentSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = contentData.filter(item => (item.title || '').toLowerCase().includes(term));
        renderContentTable(filtered);
    });
}
if (contentFilter) {
    contentFilter.addEventListener('change', (e) => {
        const status = e.target.value;
        const filtered = status === 'all' ? contentData : contentData.filter(item => String(item.status).toLowerCase() === status.toLowerCase());
        renderContentTable(filtered);
    });
}

/* ============================
   Activities / realtime (client-side)
   ============================ */

function addActivity(type, title, time, badge) {
    const activitiesList = document.getElementById('activitiesList');
    if (!activitiesList) return;
    const icons = {
        edit: '✏️',
        livestream: '🔴',
        approved: '✅',
        video: '🎬'
    };
    const el = document.createElement('div');
    el.className = 'activity-item';
    el.innerHTML = `
        <div class="activity-icon ${type}">${icons[type] || 'ℹ️'}</div>
        <div class="activity-content">
            <h4>${escapeHtml(title)}</h4>
            <p class="activity-time">${escapeHtml(time)}</p>
        </div>
        <span class="activity-badge ${escapeHtml(badge)}">${escapeHtml(badge)}</span>
    `;
    activitiesList.insertBefore(el, activitiesList.firstChild);
    if (activitiesList.children.length > 6) activitiesList.lastChild.remove();
}
setInterval(() => {
    if (Math.random() < 0.08) {
        const activities = [
            { type: 'edit', title: 'Article updated', time: 'Just now', badge: 'done' },
            { type: 'approved', title: 'Comment approved', time: 'Just now', badge: 'done' },
            { type: 'video', title: 'Video processed', time: 'Just now', badge: 'done' }
        ];
        const a = activities[Math.floor(Math.random() * activities.length)];
        addActivity(a.type, a.title, a.time, a.badge);
    }
}, 30000);

/* ============================
   Action buttons (navigation)
   ============================ */

const schedulePostBtn = document.getElementById('schedulePostBtn');
if (schedulePostBtn) schedulePostBtn.addEventListener('click', () => { showNotification('Opening schedule...', 'info'); setTimeout(()=> window.location.href = 'schedule.html', 350); });
const startLivestreamBtn = document.getElementById('startLivestreamBtn');
if (startLivestreamBtn) startLivestreamBtn.addEventListener('click', () => { showNotification('Opening livestream...', 'info'); setTimeout(()=> window.location.href = 'livestream.html', 350); });
const viewAnalyticsBtn = document.getElementById('viewAnalyticsBtn');
if (viewAnalyticsBtn) viewAnalyticsBtn.addEventListener('click', () => { showNotification('Opening analytics...', 'info'); setTimeout(()=> window.location.href = 'analytics.html', 350); });

/* ============================
   Logout: uses backend /auth/logout (POST preferred) and resolves correct login redirect
   ============================ */

async function doLogout() {
    const loginPath = await findLoginPath();
    try {
        // prefer POST
        let res = await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
        if (!res.ok) {
            // try GET fallback
            res = await fetch('/auth/logout', { method: 'GET', credentials: 'include' });
        }
        // Destroy local UI after logout
        showNotification('Logged out', 'success');
        setTimeout(() => { window.location.href = loginPath; }, 600);
    } catch (err) {
        // If network fails, redirect locally
        showNotification('Logged out (local)', 'info');
        setTimeout(() => { window.location.href = loginPath; }, 600);
    }
}
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!confirm('Are you sure you want to logout?')) return;
        doLogout();
    });
}

/* ============================
   Date filter
   ============================ */

if (dateFilter) {
    dateFilter.addEventListener('change', function() {
        const days = this.value;
        showNotification(`Showing last ${days} days`, 'info');
        refreshStats(days);
    });
}

function animateCounter(element, target, duration = 1200) {
    const start = 0;
    const frames = Math.max(10, Math.round(duration / 16));
    const step = (target - start) / frames;
    let current = start;
    const t = setInterval(() => {
        current += step;
        if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
            current = target;
            clearInterval(t);
        }
        if (target >= 1000000) element.textContent = (current / 1000000).toFixed(1) + 'M';
        else if (target >= 1000) element.textContent = (current / 1000).toFixed(1) + 'K';
        else element.textContent = Math.floor(current);
    }, 16);
}

function refreshStats(days) {
    const statValues = document.querySelectorAll('.stat-value');
    const multipliers = { '1': 0.03, '7': 0.2, '30': 1, '90': 2.5 };
    const multiplier = multipliers[days] || 1;
    statValues.forEach(stat => {
        const base = parseFloat(stat.dataset.target) || 0;
        const v = Math.max(0, Math.round(base * multiplier));
        animateCounter(stat, v, 900);
    });
}

/* ============================
   Auth & UI initialization
   ============================ */

async function updateUserUI(profile) {
    // profile may be null => not authenticated
    // Find sidebar user area and update
    const sidebarFooter = document.querySelector('.sidebar-footer');
    if (!sidebarFooter) return;

    // If not logged in: show Sign in link
    if (!profile) {
        sidebarFooter.innerHTML = `
            <div style="padding:16px;">
                <a href="#" id="signInLink" style="display:inline-block; padding:8px 12px; background:#5B5FED;color:white;border-radius:8px;text-decoration:none;font-weight:600;">Sign in</a>
            </div>
        `;
        const signInLink = document.getElementById('signInLink');
        if (signInLink) {
            signInLink.addEventListener('click', async (e) => {
                e.preventDefault();
                const loginPath = await findLoginPath();
                window.location.href = loginPath;
            });
        }
        // hide logout button if exists
        const lb = document.getElementById('logoutBtn');
        if (lb) lb.style.display = 'none';
        return;
    }

    // If authenticated: show user info + logout
    const name = profile.full_name || profile.email || profile.username || 'User';
    sidebarFooter.innerHTML = `
        <div class="user-profile" style="display:flex;align-items:center;gap:12px;padding:12px;">
            <div class="user-avatar" style="width:40px;height:40px;border-radius:10px;background:#5B5FED;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;">
                ${escapeHtml((name[0]||'U').toUpperCase())}
            </div>
            <div style="flex:1">
                <strong style="display:block">${escapeHtml(name)}</strong>
                <button id="logoutBtnInline" style="background:none;border:none;color:#666;cursor:pointer;padding:0;margin-top:4px">Logout</button>
            </div>
        </div>
    `;
    const logoutBtnInline = document.getElementById('logoutBtnInline');
    if (logoutBtnInline) {
        logoutBtnInline.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Logout?')) doLogout();
        });
    }
}

// Main load flow: check auth, load contents, init page
window.addEventListener('load', async () => {
    // 1) Check for authenticated profile (try multiple endpoints)
    let profile = null;
    try {
        profile = await tryGetAuthProfile();
    } catch (e) {
        console.warn('Auth check error', e);
    }

    // Update UI accordingly (if not authenticated, will show sign-in)
    await updateUserUI(profile);

    // 2) Animate stat counters
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        const t = parseFloat(stat.dataset.target) || 0;
        animateCounter(stat, t);
    });

    // 3) Load contents from backend (if authenticated or public endpoint)
    const remote = await apiGetContents();
    if (Array.isArray(remote) && remote.length) {
        // normalize
        contentData = remote.map(item => ({
            id: item.content_id || item.id,
            content_id: item.content_id || item.id,
            title: item.title || item.name || 'Untitled',
            category: item.type || item.category || 'Article',
            status: item.status || 'Draft',
            date: item.created_at ? item.created_at.split('T')[0] : (item.date || ''),
            views: item.views || item.views_count || 0,
            ...item
        }));
        showNotification('Loaded content from server', 'success', 1200);
    } else {
        // keep mock but inform user
        showNotification('Using local demo data (no backend or failed)', 'warning', 2000);
    }

    renderContentTable(contentData);
});
/* ============================
   SETTINGS PAGE (OPTION B)
   ============================ */

document.addEventListener("DOMContentLoaded", () => {
    if (!window.location.pathname.includes("settings.html")) return;

    console.log("Settings page detected. Initializing...");

    const saveBtn = document.getElementById("btnSave");
    const inputs = document.querySelectorAll("[data-setting]");
    const statusBox = document.getElementById("saveStatus");
    const loading = document.getElementById("settingsLoading");

    if (!saveBtn || !inputs.length) {
        console.warn("Settings UI not found on page.");
        return;
    }

    /* ---- Helper: Show Status ---- */
    function showStatus(msg, type = "info") {
        if (!statusBox) return;
        statusBox.textContent = msg;
        statusBox.className = "";
        statusBox.classList.add(type);
        statusBox.style.display = "block";
        setTimeout(() => (statusBox.style.display = "none"), 2500);
    }

    /* ---- Load settings ---- */
    async function loadSettings() {
        loading.style.display = "block";
        try {
            const res = await fetch("/api/settings", {
                method: "GET",
                credentials: "include"
            });
            const data = await res.json();

            if (!res.ok) {
                showStatus(data.message || "Failed to load settings", "error");
                return;
            }

            // Gán dữ liệu lên input
            inputs.forEach(input => {
                const key = input.dataset.setting;
                input.value = data[key] || "";
            });

            showStatus("Settings loaded", "success");
        } catch (err) {
            showStatus("Network error when loading settings", "error");
        } finally {
            loading.style.display = "none";
        }
    }

    /* ---- Auto Update On Input ---- */
    inputs.forEach(input => {
        input.addEventListener("input", async () => {
            const key = input.dataset.setting;
            const value = input.value;

            try {
                const res = await fetch("/api/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ [key]: value })
                });

                const result = await res.json();

                if (!res.ok) {
                    showStatus(result.message || "Failed to update", "error");
                } else {
                    showStatus("Updated", "success");
                }
            } catch (err) {
                showStatus("Network error", "error");
            }
        });
    });

    /* ---- Manual Save Button ---- */
    saveBtn.addEventListener("click", async () => {
        const payload = {};
        inputs.forEach(i => (payload[i.dataset.setting] = i.value));

        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (!res.ok) return showStatus(result.message || "Failed to save", "error");

            showStatus("All settings saved!", "success");
        } catch (err) {
            showStatus("Network error", "error");
        }
    });

    // Load settings when page opens
    loadSettings();
});
