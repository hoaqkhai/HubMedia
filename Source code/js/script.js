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

// ==================== CUSTOM DROPDOWN ====================
const dateFilterDropdown = document.getElementById('dateFilterDropdown');
const dateFilterToggle = document.getElementById('dateFilterToggle');
const dateFilterMenu = document.getElementById('dateFilterMenu');
const dropdownItems = document.querySelectorAll('.dropdown-item');

if (dateFilterToggle && dateFilterMenu) {
    // Toggle dropdown
    dateFilterToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dateFilterDropdown.classList.toggle('active');
    });
    
    // Select item
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Remove active from all items
            dropdownItems.forEach(i => i.classList.remove('active'));
            
            // Add active to clicked item
            item.classList.add('active');
            
            // Update button text
            const text = item.querySelector('span').textContent;
            document.querySelector('.dropdown-text').textContent = text;
            
            // Close dropdown
            dateFilterDropdown.classList.remove('active');
            
            // Get value and refresh stats
            const days = item.dataset.value;
            showNotification(`Showing data for ${text}`, 'info');
            refreshStats(days);
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dateFilterDropdown.contains(e.target)) {
            dateFilterDropdown.classList.remove('active');
        }
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
// Mock Data - Supermarket Content
let contentData = [
    { id: 1, title: 'Khuyến Mãi Cuối Tuần - Giảm 50% Trái Cây Nhập Khẩu', category: 'Article', status: 'Published', date: '2024-12-12', views: 15200 },
    { id: 2, title: 'Livestream: Giới Thiệu Sản Phẩm Organic Mới', category: 'Livestream', status: 'Published', date: '2024-12-11', views: 8900 },
    { id: 3, title: 'Flash Sale Thịt Heo Sạch - Chỉ 3 Giờ', category: 'Article', status: 'Scheduled', date: '2024-12-15', views: 0 },
    { id: 4, title: 'Video: Hướng Dẫn Chọn Hải Sản Tươi Ngon', category: 'Video', status: 'Published', date: '2024-12-10', views: 6700 },
    { id: 5, title: 'Livestream Bán Hàng: Rau Củ Quả Giá Sốc', category: 'Livestream', status: 'Draft', date: '2024-12-13', views: 0 },
    { id: 6, title: 'Combo Gia Đình - Tiết Kiệm Đến 30%', category: 'Article', status: 'Published', date: '2024-12-09', views: 12100 },
    { id: 7, title: 'Livestream: Nấu Ăn Với Đầu Bếp Chuyên Nghiệp', category: 'Livestream', status: 'Scheduled', date: '2024-12-14', views: 0 },
    { id: 8, title: 'Sản Phẩm Mới: Thực Phẩm Hữu Cơ Cao Cấp', category: 'Article', status: 'Published', date: '2024-12-08', views: 9300 }
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
        // Reset specific new fields
        resetAdvancedFields();
    }
}

function closeContentModal() {
    if (contentModal) {
        contentModal.classList.remove('active');
        contentForm.reset();
        document.getElementById('contentId').value = '';
        resetAdvancedFields();
    }
}

function resetAdvancedFields() {
    // Reset Media
    document.getElementById('mediaPreview').classList.add('hidden');
    document.getElementById('uploadPlaceholder').classList.remove('hidden');
    document.getElementById('mediaUpload').value = '';
    
    // Reset Schedule
    document.getElementById('schedulePicker').classList.add('hidden');
    
    // Reset Char Count
    document.getElementById('titleCount').textContent = '0/100';
    
    // Reset Platforms
    document.querySelectorAll('input[name="platform"]').forEach(cb => cb.checked = false);
}

// Advanced Modal Logic
const uploadZone = document.getElementById('uploadZone');
const mediaUpload = document.getElementById('mediaUpload');
const mediaPreview = document.getElementById('mediaPreview');
const previewImage = document.getElementById('previewImage');
const removeMediaBtn = document.getElementById('removeMediaBtn');
const browseText = document.querySelector('.browse-text');

if (uploadZone) {
    // Drag & Drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    });

    // Browse Click
    uploadZone.addEventListener('click', (e) => {
        if(e.target !== removeMediaBtn) mediaUpload.click();
    });

    mediaUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    });

    removeMediaBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering upload click
        resetAdvancedFields();
    });
}

function handleFileSelect(file) {
    if (file && file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            document.getElementById('uploadPlaceholder').classList.add('hidden');
            mediaPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else if (file && file.type.match('video.*')) {
        // Simple video placeholder logic
        alert('Video upload simulation: Video selected');
        document.getElementById('uploadPlaceholder').classList.add('hidden');
        mediaPreview.classList.remove('hidden');
        previewImage.src = 'img/video-placeholder.png'; // Mock placeholder
    }
}

// Title Char Count
const contentTitle = document.getElementById('contentTitle');
const titleCount = document.getElementById('titleCount');
if (contentTitle) {
    contentTitle.addEventListener('input', (e) => {
        const len = e.target.value.length;
        titleCount.textContent = `${len}/100`;
    });
}

// Schedule Toggle
const publishOptions = document.querySelectorAll('input[name="publishType"]');
const schedulePicker = document.getElementById('schedulePicker');
publishOptions.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'schedule') {
            schedulePicker.classList.remove('hidden');
        } else {
            schedulePicker.classList.add('hidden');
        }
    });
});

// Event Listeners
if (createContentBtn) {
    createContentBtn.addEventListener('click', () => openContentModal());
}

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', closeContentModal);
});

if (saveContentBtn) {
    saveContentBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent accidental form submit
        
        const id = document.getElementById('contentId').value;
        const title = document.getElementById('contentTitle').value;
        const category = document.getElementById('contentCategory').value;
        const description = document.getElementById('contentDescription').value;
        
        // Get Publish Status
        const publishType = document.querySelector('input[name="publishType"]:checked').value;
        let status = 'Draft';
        if (publishType === 'now') status = 'Published';
        if (publishType === 'schedule') status = 'Scheduled';
        
        // Get Platforms
        const platforms = Array.from(document.querySelectorAll('input[name="platform"]:checked')).map(cb => cb.value);
        
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
                views: 0,
                // New fields would normally go here
                platforms: platforms
            };
            contentData.unshift(newItem);
            
            // Show more detailed notification based on action
            if (platforms.length > 0) {
                showNotification(`Content created & shared to ${platforms.length} platform(s)!`, 'success');
            } else {
                showNotification('Content created successfully', 'success');
            }
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

// ==================== ALL ACTIVITIES MODAL ====================
const viewAllActivities = document.getElementById('viewAllActivities');
const activitiesModal = document.getElementById('activitiesModal');
const closeActivitiesModal = document.getElementById('closeActivitiesModal');
const activityFilterTabs = document.querySelectorAll('.activity-filters .filter-tab');

// Extended activities data
const allActivities = [
    { type: 'edit', title: 'Đăng bài "Khuyến Mãi Cuối Tuần"', time: '2 giờ trước', badge: 'FB/Zalo' },
    { type: 'livestream', title: 'Livestream "Flash Sale Rau Củ"', time: 'Lên lịch lúc 19:00', badge: 'Sắp diễn ra' },
    { type: 'approved', title: 'Duyệt bình luận khách hàng', time: '1 ngày trước • "Trái Cây Nhập Khẩu"', badge: 'Hoàn thành' },
    { type: 'video', title: 'Video "Hướng Dẫn Chọn Hải Sản"', time: '2 ngày trước', badge: 'Hoàn thành' },
    { type: 'analytics', title: 'Báo cáo doanh số tháng 12', time: '3 ngày trước', badge: 'Hoàn thành' },
    { type: 'edit', title: 'Đăng bài "Combo Gia Đình"', time: '4 ngày trước', badge: 'FB/Zalo/TikTok' },
    { type: 'livestream', title: 'Livestream "Giới Thiệu Sản Phẩm Organic"', time: '5 ngày trước', badge: 'Hoàn thành' },
    { type: 'approved', title: 'Duyệt 15 bình luận mới', time: '6 ngày trước', badge: 'Hoàn thành' },
    { type: 'video', title: 'Video "Hướng Dẫn Bảo Quản Thực Phẩm"', time: '1 tuần trước', badge: 'Hoàn thành' },
    { type: 'edit', title: 'Đăng bài "Flash Sale Thịt Heo"', time: '1 tuần trước', badge: 'FB/Zalo' }
];

let currentActivityFilter = 'all';

function getActivityIcon(type) {
    const icons = {
        edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',
        livestream: '<circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon>',
        approved: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
        video: '<polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>',
        analytics: '<line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line>'
    };
    return icons[type] || icons.edit;
}

function filterActivities() {
    if (currentActivityFilter === 'all') {
        return allActivities;
    }
    return allActivities.filter(activity => activity.type === currentActivityFilter);
}

function renderAllActivities() {
    const container = document.getElementById('allActivitiesList');
    if (!container) return;
    
    const filtered = filterActivities();
    
    container.innerHTML = filtered.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${getActivityIcon(activity.type)}
                </svg>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p class="activity-time">${activity.time}</p>
            </div>
            <span class="activity-badge ${activity.badge.toLowerCase().replace(/\//g, '-')}">${activity.badge}</span>
        </div>
    `).join('');
}

// Open activities modal
if (viewAllActivities) {
    viewAllActivities.addEventListener('click', function(e) {
        e.preventDefault();
        currentActivityFilter = 'all';
        activityFilterTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === 'all');
        });
        renderAllActivities();
        activitiesModal.classList.add('active');
    });
}

// Close activities modal
if (closeActivitiesModal) {
    closeActivitiesModal.addEventListener('click', function() {
        activitiesModal.classList.remove('active');
    });
}

// Activity filter tabs
activityFilterTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        activityFilterTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentActivityFilter = this.dataset.filter;
        renderAllActivities();
    });
});

// Close modal when clicking outside
if (activitiesModal) {
    activitiesModal.addEventListener('click', function(e) {
        if (e.target === activitiesModal) {
            activitiesModal.classList.remove('active');
        }
    });
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

const uploadVideoBtn = document.getElementById('uploadVideoBtn');
if (uploadVideoBtn) {
    uploadVideoBtn.addEventListener('click', function() {
        openContentModal('Upload New Video');
        // Simulate video tab selection
        const categorySelect = document.getElementById('contentCategory');
        if(categorySelect) categorySelect.value = 'Video';
    });
}

const viewAnalyticsBtn = document.getElementById('viewAnalyticsBtn');
if (viewAnalyticsBtn) {
    viewAnalyticsBtn.addEventListener('click', function() {
        showNotification('Navigating to Analytics...', 'info');
        setTimeout(() => window.location.href = 'analytics.html', 500);
    });
}

// ==================== SCHEDULED POSTS MODAL ====================
const viewCalendarBtn = document.getElementById('viewCalendarBtn');
const scheduleModal = document.getElementById('scheduleModal');
const closeScheduleModal = document.getElementById('closeScheduleModal');
const scheduleSearch = document.getElementById('scheduleSearch');
const filterTabs = document.querySelectorAll('.filter-tab');

// Enhanced scheduled posts data with types
const scheduledPosts = [
    { date: '2024-12-16', dayName: 'T2', title: 'Flash Sale Thịt Heo Sạch', time: '10:00', platforms: 'FB, Zalo, TikTok', type: 'article' },
    { date: '2024-12-18', dayName: 'T4', title: 'Livestream: Giới Thiệu Sản Phẩm Organic', time: '19:00', platforms: 'YouTube, Facebook', type: 'livestream' },
    { date: '2024-12-20', dayName: 'T6', title: 'Video: Combo Gia Đình Cuối Tuần', time: '14:00', platforms: 'YouTube, TikTok', type: 'video' },
    { date: '2024-12-21', dayName: 'T7', title: 'Livestream Bán Hàng: Rau Củ Giá Sốc', time: '20:00', platforms: 'Tất cả nền tảng', type: 'livestream' },
    { date: '2024-12-23', dayName: 'T2', title: 'Khuyến Mãi Hải Sản Tươi Sống', time: '09:00', platforms: 'FB, Zalo', type: 'article' },
    { date: '2024-12-25', dayName: 'T4', title: 'Video: Hướng Dẫn Nấu Món Giáng Sinh', time: '15:00', platforms: 'YouTube, TikTok', type: 'video' },
    { date: '2024-12-27', dayName: 'T6', title: 'Livestream: Flash Sale Cuối Năm', time: '20:00', platforms: 'Tất cả nền tảng', type: 'livestream' }
];

let currentFilter = 'all';
let currentSearch = '';

function getTypeLabel(type) {
    const labels = {
        'article': 'Bài viết',
        'livestream': 'Livestream',
        'video': 'Video'
    };
    return labels[type] || type;
}

function filterPosts() {
    let filtered = scheduledPosts;
    
    // Filter by type
    if (currentFilter !== 'all') {
        filtered = filtered.filter(post => post.type === currentFilter);
    }
    
    // Filter by search
    if (currentSearch) {
        filtered = filtered.filter(post => 
            post.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
            post.platforms.toLowerCase().includes(currentSearch.toLowerCase())
        );
    }
    
    return filtered;
}

function renderScheduledPosts() {
    const container = document.getElementById('scheduledPostsList');
    const emptyState = document.getElementById('scheduleEmpty');
    if (!container) return;
    
    const filtered = filterPosts();
    
    if (filtered.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    container.innerHTML = filtered.map(post => `
        <div class="scheduled-post-item">
            <div class="scheduled-post-date">
                <span class="day-name">${post.dayName}</span>
                <span class="day-number">${post.date.split('-')[2]}</span>
            </div>
            <div class="scheduled-post-content">
                <h4>${post.title}</h4>
                <div class="scheduled-post-meta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${post.time} • ${post.platforms}
                </div>
                <span class="post-type-badge ${post.type}">${getTypeLabel(post.type)}</span>
            </div>
        </div>
    `).join('');
}

// Open modal
if (viewCalendarBtn) {
    viewCalendarBtn.addEventListener('click', function() {
        currentFilter = 'all';
        currentSearch = '';
        if (scheduleSearch) scheduleSearch.value = '';
        filterTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === 'all');
        });
        renderScheduledPosts();
        scheduleModal.classList.add('active');
    });
}

// Close modal
if (closeScheduleModal) {
    closeScheduleModal.addEventListener('click', function() {
        scheduleModal.classList.remove('active');
    });
}

// Filter tabs
filterTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        filterTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderScheduledPosts();
    });
});

// Search
if (scheduleSearch) {
    scheduleSearch.addEventListener('input', function(e) {
        currentSearch = e.target.value;
        renderScheduledPosts();
    });
}

// Close modal when clicking outside
if (scheduleModal) {
    scheduleModal.addEventListener('click', function(e) {
        if (e.target === scheduleModal) {
            scheduleModal.classList.remove('active');
        }
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
