// ==================== NAVIGATION ====================
const navItems = document.querySelectorAll('.nav-item');

// ==================== NAVIGATION ====================
// Navigation is handled by standard HTML links
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        // Allow default navigation
        // Optional: Add active class for visual feedback before unload
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
```javascript
// ==================== NAVIGATION ====================
const navItems = document.querySelectorAll('.nav-item');

// ==================== NAVIGATION ====================
// Navigation is handled by standard HTML links
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        // Allow default navigation
        // Optional: Add active class for visual feedback before unload
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

    // 2. Dynamic Greeting
    updateGreeting();
    
    // 3. Scroll Animations
    initScrollAnimations();

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

dateFilter.addEventListener('change', function() {
    const days = this.value;
    showNotification(`Showing data for last ${days} days`, 'info');
    
    // Simulate data refresh
    refreshStats(days);
});

function refreshStats(days) {
    const statValues = document.querySelectorAll('.stat-value');
    
    // Simulate different values based on time period
    const multipliers = {
        '1': 0.03,
        '7': 0.2,
        '30': 1,
        '90': 2.5
    };
    
    const multiplier = multipliers[days] || 1;
    
    statValues.forEach(stat => {
        const baseTarget = parseFloat(stat.dataset.target);
        const newTarget = baseTarget * multiplier;
        animateCounter(stat, newTarget, 1000);
    });
}

// ==================== CREATE CONTENT ====================
const createContentBtn = document.getElementById('createContentBtn');

createContentBtn.addEventListener('click', function() {
    showCreateContentModal();
});

function showCreateContentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create New Content</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="content-type-grid">
                    <button class="content-type-btn" onclick="createContent('post')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>New Post</span>
                    </button>
                    <button class="content-type-btn" onclick="createContent('video')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                        <span>Upload Video</span>
                    </button>
                    <button class="content-type-btn" onclick="createContent('livestream')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polygon points="10 8 16 12 10 16 10 8"></polygon>
                        </svg>
                        <span>Start Livestream</span>
                    </button>
                    <button class="content-type-btn" onclick="createContent('story')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                            <polyline points="17 2 12 7 7 2"></polyline>
                        </svg>
                        <span>Create Story</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate modal
    setTimeout(() => modal.classList.add('active'), 10);
}

function createContent(type) {
    document.querySelector('.modal-overlay').remove();
    showNotification(`Creating ${type}...`, 'success');
}

// ==================== ACTIVITIES ====================
function addActivity(type, title, time, badge) {
    const activitiesList = document.getElementById('activitiesList');
    
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
    
    // Add with animation
    activityItem.style.opacity = '0';
    activityItem.style.transform = 'translateY(-10px)';
    activitiesList.insertBefore(activityItem, activitiesList.firstChild);
    
    setTimeout(() => {
        activityItem.style.transition = 'all 0.3s ease';
        activityItem.style.opacity = '1';
        activityItem.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove last item if more than 5
    if (activitiesList.children.length > 5) {
        activitiesList.lastChild.remove();
    }
}

// ==================== SCHEDULE ====================
function addScheduleItem(day, date, title, time) {
    const scheduleList = document.getElementById('scheduleList');
    
    const scheduleItem = document.createElement('div');
    scheduleItem.className = 'schedule-item';
    scheduleItem.innerHTML = `
        <div class="schedule-date">
            <span class="day-name">${day}</span>
            <span class="day-number">${date}</span>
        </div>
        <div class="schedule-content">
            <h4>${title}</h4>
            <p class="schedule-time">${time}</p>
        </div>
    `;
    
    scheduleList.appendChild(scheduleItem);
}

// ==================== QUICK ACTIONS ====================
document.getElementById('schedulePostBtn').addEventListener('click', function() {
    showNotification('Navigating to Schedule...', 'info');
    setTimeout(() => {
        window.location.href = 'schedule.html';
    }, 500);
});

document.getElementById('startLivestreamBtn').addEventListener('click', function() {
    showNotification('Navigating to Livestream Studio...', 'info');
    setTimeout(() => {
        window.location.href = 'livestream.html';
    }, 500);
});

document.getElementById('uploadVideoBtn').addEventListener('click', function() {
    showNotification('Opening video upload...', 'info');
});

document.getElementById('viewAnalyticsBtn').addEventListener('click', function() {
    showNotification('Navigating to Analytics...', 'info');
    setTimeout(() => {
        window.location.href = 'analytics.html';
    }, 500);
});

document.getElementById('viewCalendarBtn').addEventListener('click', function() {
    showNotification('Navigating to Calendar...', 'info');
        warning: '#FF9800'
    };
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
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

// ==================== REAL-TIME UPDATES ====================
// Simulate real-time activity updates
setInterval(() => {
    const activities = [
        { type: 'edit', title: 'Article updated', time: 'Just now', badge: 'done' },
        { type: 'approved', title: 'Comment approved', time: 'Just now', badge: 'done' },
        { type: 'video', title: 'Video processed', time: 'Just now', badge: 'done' }
    ];
    
    // Random chance to add activity (10%)
    if (Math.random() < 0.1) {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        addActivity(activity.type, activity.title, activity.time, activity.badge);
    }
}, 30000); // Every 30 seconds

// ==================== LIVE VIEWERS UPDATE ====================
// Simulate live viewers count update
setInterval(() => {
    const liveViewersStat = document.querySelector('.stat-card:nth-child(4) .stat-value');
    if (liveViewersStat) {
        const currentValue = parseFloat(liveViewersStat.textContent.replace('K', '')) * 1000;
        const change = Math.floor(Math.random() * 200) - 100; // Random change -100 to +100
        const newValue = Math.max(2000, currentValue + change);
        
        liveViewersStat.textContent = (newValue / 1000).toFixed(1) + 'K';
    }
}, 5000); // Every 5 seconds

// ==================== ANIMATIONS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .modal-overlay.active {
        opacity: 1;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }
    
    .modal-overlay.active .modal-content {
        transform: scale(1);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .modal-header h3 {
        font-size: 20px;
        font-weight: 600;
        color: #212529;
    }
    
    .modal-close {
        width: 32px;
        height: 32px;
        border: none;
        background: #F1F3F5;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    
    .modal-close:hover {
        background: #E9ECEF;
    }
    
    .modal-close svg {
        width: 18px;
        height: 18px;
        color: #6C757D;
    }
    
    .content-type-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }
    
    .content-type-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 24px;
        background: #F8F9FA;
        border: 2px solid #E9ECEF;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .content-type-btn:hover {
        background: white;
        border-color: #5B5FED;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(91, 95, 237, 0.15);
    }
    
    .content-type-btn svg {
        width: 32px;
        height: 32px;
        color: #5B5FED;
    }
    
    .content-type-btn span {
        font-size: 14px;
        font-weight: 600;
        color: #212529;
    }
`;
document.head.appendChild(style);

// ==================== MOBILE MENU ====================
// Add mobile menu toggle if needed
if (window.innerWidth <= 768) {
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    `;
    
    document.querySelector('.main-content').prepend(menuToggle);
    
    menuToggle.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });
}
```
