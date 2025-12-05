// ==================== NAVIGATION ====================
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        // Allow default navigation
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});

// ==================== STATS COUNTER ANIMATION ====================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format number
        if (target >= 1000000) {
            element.textContent = (current / 1000000).toFixed(1) + 'M';
        } else if (target >= 1000) {
            element.textContent = (current / 1000).toFixed(1) + 'K';
        } else if (target % 1 !== 0) {
            element.textContent = current.toFixed(1) + '%';
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ==================== INITIALIZATION ====================
window.addEventListener('load', () => {
    // 1. Animate Stats
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        const target = parseFloat(stat.dataset.target);
        animateCounter(stat, target);
    });

    // 2. Render Content Table
    renderContentTable();

    console.log('Hub Media Dashboard loaded successfully!');
});

// ==================== LOGOUT ====================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            showNotification('Logging out...', 'info');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    });
}

// ==================== DATE FILTER ====================
const dateFilter = document.getElementById('dateFilter');
if (dateFilter) {
    dateFilter.addEventListener('change', function() {
        const days = this.value;
        showNotification(`Showing data for last ${days} days`, 'info');
        // Simulate data refresh
        refreshStats(days);
    });
}

function refreshStats(days) {
    const statValues = document.querySelectorAll('.stat-value');
    const multipliers = { '1': 0.03, '7': 0.2, '30': 1, '90': 2.5 };
    const multiplier = multipliers[days] || 1;
    
    statValues.forEach(stat => {
        const baseTarget = parseFloat(stat.dataset.target);
        const newTarget = baseTarget * multiplier;
        animateCounter(stat, newTarget, 1000);
    });
}

// ==================== CONTENT MANAGEMENT ====================
// Mock Data
let contentData = [
    { id: 1, title: 'Top 10 Music Trends 2024', category: 'Article', status: 'Published', date: '2024-05-15', views: 12500 },
    { id: 2, title: 'Guitar Masterclass Review', category: 'Video', status: 'Published', date: '2024-05-14', views: 8200 },
    { id: 3, title: 'Live Session: Acoustic Night', category: 'Livestream', status: 'Scheduled', date: '2024-05-20', views: 0 },
    { id: 4, title: 'Best Synthesisers for Beginners', category: 'Article', status: 'Draft', date: '2024-05-16', views: 0 },
    { id: 5, title: 'Drum Kit Setup Guide', category: 'Video', status: 'Published', date: '2024-05-10', views: 5400 }
];

const contentTableBody = document.getElementById('contentTableBody');
const createContentBtn = document.getElementById('createContentBtn');
const contentModal = document.getElementById('contentModal');
const contentForm = document.getElementById('contentForm');
const saveContentBtn = document.getElementById('saveContentBtn');
const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
const contentSearch = document.getElementById('contentSearch');
const contentFilter = document.getElementById('contentFilter');

// Render Table
function renderContentTable(data = contentData) {
    if (!contentTableBody) return;
    contentTableBody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.title}</strong></td>
            <td>${item.category}</td>
            <td><span class="status-badge ${item.status.toLowerCase()}">${item.status}</span></td>
            <td>${item.date}</td>
            <td>${item.views.toLocaleString()}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon" onclick="editContent(${item.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteContent(${item.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        contentTableBody.appendChild(row);
    });
}

// Modal Functions
function openContentModal(title = 'Create New Content') {
    if (contentModal) {
        document.getElementById('modalTitle').textContent = title;
        contentModal.classList.add('active');
    }
}

function closeContentModal() {
    if (contentModal) {
        contentModal.classList.remove('active');
        contentForm.reset();
        document.getElementById('contentId').value = '';
    }
}

// Event Listeners
if (createContentBtn) {
    createContentBtn.addEventListener('click', () => openContentModal());
}

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', closeContentModal);
});

if (saveContentBtn) {
    saveContentBtn.addEventListener('click', () => {
        const id = document.getElementById('contentId').value;
        const title = document.getElementById('contentTitle').value;
        const category = document.getElementById('contentCategory').value;
        const status = document.getElementById('contentStatus').value;
        
        if (!title) {
            showNotification('Please enter a title', 'warning');
            return;
        }

        if (id) {
            // Edit
            const index = contentData.findIndex(item => item.id == id);
            if (index !== -1) {
                contentData[index] = { ...contentData[index], title, category, status };
                showNotification('Content updated successfully', 'success');
            }
        } else {
            // Create
            const newId = contentData.length > 0 ? Math.max(...contentData.map(i => i.id)) + 1 : 1;
            const newItem = {
                id: newId,
                title,
                category,
                status,
                date: new Date().toISOString().split('T')[0],
                views: 0
            };
            contentData.unshift(newItem);
            showNotification('Content created successfully', 'success');
        }
        
        renderContentTable();
        closeContentModal();
    });
}

// Search & Filter
if (contentSearch) {
    contentSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = contentData.filter(item => item.title.toLowerCase().includes(term));
        renderContentTable(filtered);
    });
}

if (contentFilter) {
    contentFilter.addEventListener('change', (e) => {
        const status = e.target.value;
        const filtered = status === 'all' 
            ? contentData 
            : contentData.filter(item => item.status.toLowerCase() == status);
        renderContentTable(filtered);
    });
}

// Global functions for inline onclick
window.editContent = function(id) {
    const item = contentData.find(i => i.id === id);
    if (item) {
        document.getElementById('contentId').value = item.id;
        document.getElementById('contentTitle').value = item.title;
        document.getElementById('contentCategory').value = item.category;
        document.getElementById('contentStatus').value = item.status;
        openContentModal('Edit Content');
    }
};

window.deleteContent = function(id) {
    if (confirm('Are you sure you want to delete this content?')) {
        contentData = contentData.filter(item => item.id !== id);
        renderContentTable();
        showNotification('Content deleted', 'info');
    }
};

// ==================== ACTIVITIES ====================
function addActivity(type, title, time, badge) {
    const activitiesList = document.getElementById('activitiesList');
    if (!activitiesList) return;
    
    const icons = {
        edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',
        livestream: '<circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon>',
        approved: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
        video: '<polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>'
    };
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <div class="activity-icon ${type}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${icons[type] || icons.edit}
            </svg>
        </div>
        <div class="activity-content">
            <h4>${title}</h4>
            <p class="activity-time">${time}</p>
        </div>
        <span class="activity-badge ${badge}">${badge}</span>
    `;
    
    activitiesList.insertBefore(activityItem, activitiesList.firstChild);
    if (activitiesList.children.length > 5) activitiesList.lastChild.remove();
}

// ==================== SCHEDULE & ACTIONS ====================
const schedulePostBtn = document.getElementById('schedulePostBtn');
if (schedulePostBtn) {
    schedulePostBtn.addEventListener('click', function() {
        showNotification('Navigating to Schedule...', 'info');
        setTimeout(() => window.location.href = 'schedule.html', 500);
    });
}

const startLivestreamBtn = document.getElementById('startLivestreamBtn');
if (startLivestreamBtn) {
    startLivestreamBtn.addEventListener('click', function() {
        showNotification('Navigating to Livestream Studio...', 'info');
        setTimeout(() => window.location.href = 'livestream.html', 500);
    });
}

const viewAnalyticsBtn = document.getElementById('viewAnalyticsBtn');
if (viewAnalyticsBtn) {
    viewAnalyticsBtn.addEventListener('click', function() {
        showNotification('Navigating to Analytics...', 'info');
        setTimeout(() => window.location.href = 'analytics.html', 500);
    });
}

// ==================== NOTIFICATIONS ====================
function showNotification(message, type = 'info') {
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
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 350px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== REAL-TIME SIMULATION ====================
setInterval(() => {
    const activities = [
        { type: 'edit', title: 'Article updated', time: 'Just now', badge: 'done' },
        { type: 'approved', title: 'Comment approved', time: 'Just now', badge: 'done' },
        { type: 'video', title: 'Video processed', time: 'Just now', badge: 'done' }
    ];
    
    if (Math.random() < 0.1) {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        addActivity(activity.type, activity.title, activity.time, activity.badge);
    }
}, 30000);

// CSS Animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Mobile Menu
if (window.innerWidth <= 768) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;
        mainContent.prepend(menuToggle);
        menuToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
}
