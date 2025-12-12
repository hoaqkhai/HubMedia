// ==================== CALENDAR DATA ====================
let currentDate = new Date();
let selectedDate = null;
let currentTypeFilter = 'all';
let currentPlatformFilter = 'all';

let events = [
    {
        id: 1,
        title: 'Flash Sale Thịt Heo Sạch',
        date: '2024-12-16',
        time: '10:00',
        type: 'post',
        platforms: ['Facebook', 'Zalo', 'TikTok'],
        description: 'Khuyến mãi đặc biệt thịt heo sạch giảm 30%'
    },
    {
        id: 2,
        title: 'Livestream: Giới Thiệu Sản Phẩm Organic',
        date: '2024-12-18',
        time: '19:00',
        type: 'livestream',
        platforms: ['YouTube', 'Facebook'],
        description: 'Livestream giới thiệu dòng sản phẩm organic mới'
    },
    {
        id: 3,
        title: 'Video: Combo Gia Đình Cuối Tuần',
        date: '2024-12-20',
        time: '14:00',
        type: 'video',
        platforms: ['YouTube', 'TikTok'],
        description: 'Video quảng cáo combo gia đình tiết kiệm'
    },
    {
        id: 4,
        title: 'Livestream Bán Hàng: Rau Củ Giá Sốc',
        date: '2024-12-21',
        time: '20:00',
        type: 'livestream',
        platforms: ['Facebook', 'YouTube', 'TikTok'],
        description: 'Livestream bán hàng rau củ quả giá sốc'
    },
    {
        id: 5,
        title: 'Khuyến Mãi Hải Sản Tươi Sống',
        date: '2024-12-23',
        time: '09:00',
        type: 'post',
        platforms: ['Facebook', 'Zalo'],
        description: 'Đăng bài khuyến mãi hải sản tươi sống'
    },
    {
        id: 6,
        title: 'Video: Hướng Dẫn Nấu Món Giáng Sinh',
        date: '2024-12-25',
        time: '15:00',
        type: 'video',
        platforms: ['YouTube', 'TikTok'],
        description: 'Video hướng dẫn nấu các món ăn Giáng Sinh'
    },
    {
        id: 7,
        title: 'Livestream: Flash Sale Cuối Năm',
        date: '2024-12-27',
        time: '20:00',
        type: 'livestream',
        platforms: ['Facebook', 'YouTube'],
        description: 'Livestream flash sale lớn cuối năm'
    },
    {
        id: 8,
        title: 'Combo Tết - Ưu Đãi Đặc Biệt',
        date: '2024-12-30',
        time: '10:00',
        type: 'post',
        platforms: ['Facebook', 'Zalo'],
        description: 'Giới thiệu các combo Tết với ưu đãi hấp dẫn'
    }
];

// ==================== FILTER FUNCTIONS ====================
function getFilteredEvents() {
    return events.filter(event => {
        const typeMatch = currentTypeFilter === 'all' || event.type === currentTypeFilter;
        const platformMatch = currentPlatformFilter === 'all' || 
            event.platforms.some(p => p.toLowerCase() === currentPlatformFilter.toLowerCase());
        return typeMatch && platformMatch;
    });
}

function updateStatistics() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get start of current week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const monthTotal = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    }).length;
    
    const weekTotal = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
    }).length;
    
    document.getElementById('monthTotal').textContent = monthTotal;
    document.getElementById('weekTotal').textContent = weekTotal;
}

// ==================== CALENDAR RENDERING ====================
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                       'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, true, year, month - 1);
        calendarGrid.appendChild(dayElement);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, false, year, month);
        calendarGrid.appendChild(dayElement);
    }
    
    // Next month days
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6 weeks * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, year, month + 1);
        calendarGrid.appendChild(dayElement);
    }
    
    // Update statistics
    updateStatistics();
}

function createDayElement(day, isOtherMonth, year, month) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    // Calculate date string for comparison
    // Handle month overflow/underflow for correct date string generation
    const dateObj = new Date(year, month, day);
    const checkYear = dateObj.getFullYear();
    const checkMonth = dateObj.getMonth();
    const checkDay = dateObj.getDate();
    
    const dateStr = `${checkYear}-${String(checkMonth + 1).padStart(2, '0')}-${String(checkDay).padStart(2, '0')}`;
    
    // Check if today
    const today = new Date();
    if (checkYear === today.getFullYear() && 
        checkMonth === today.getMonth() && 
        checkDay === today.getDate()) {
        dayElement.classList.add('today');
    }
    
    // Day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    // Events for this day
    const dayEvents = document.createElement('div');
    dayEvents.className = 'day-events';
    
    const dayEventsData = events.filter(event => event.date === dateStr);
    dayEventsData.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = `event-item ${event.type}`;
        eventItem.innerHTML = `<span class="event-dot"></span>${event.title}`;
        eventItem.title = `${event.title} (${event.time})`; // Tooltip
        eventItem.addEventListener('click', (e) => {
            e.stopPropagation();
            showEventDetails(event);
        });
        dayEvents.appendChild(eventItem);
    });
    
    dayElement.appendChild(dayEvents);
    
    // Click to add event
    dayElement.addEventListener('click', () => {
        selectedDate = dateStr;
        openEventModal();
    });
    
    return dayElement;
}

// ==================== MONTH NAVIGATION ====================
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    renderUpcoming();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    renderUpcoming();
});

document.getElementById('todayBtn').addEventListener('click', () => {
    currentDate = new Date();
    renderCalendar();
    renderUpcoming();
    showNotification('Jumped to today', 'info');
});

// ==================== UPCOMING EVENTS ====================
function renderUpcoming() {
    const upcomingGrid = document.getElementById('upcomingGrid');
    upcomingGrid.innerHTML = '';
    
    // Get events for next 7 days
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (upcomingEvents.length === 0) {
        upcomingGrid.innerHTML = '<p style="color: #6C757D; grid-column: 1/-1; text-align: center; padding: 20px;">No upcoming events this week</p>';
        return;
    }
    
    upcomingEvents.forEach(event => {
        const card = document.createElement('div');
        card.className = `upcoming-card ${event.type}`;
        
        const eventDate = new Date(event.date);
        const dateStr = eventDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        card.innerHTML = `
            <div class="upcoming-header">
                <div class="upcoming-title">${event.title}</div>
                <div class="upcoming-type ${event.type}">${event.type}</div>
            </div>
            <div class="upcoming-datetime">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>${dateStr}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>${event.time}</span>
            </div>
            <div class="upcoming-platforms">
                ${event.platforms.map(p => `<span class="platform-tag">${p}</span>`).join('')}
            </div>
        `;
        
        card.addEventListener('click', () => showEventDetails(event));
        upcomingGrid.appendChild(card);
    });
}

// ==================== EVENT MODAL ====================
const eventModal = document.getElementById('eventModal');
const eventForm = document.getElementById('eventForm');
let editingEventId = null;

function openEventModal(event = null) {
    editingEventId = event ? event.id : null;
    
    if (event) {
        document.getElementById('modalTitle').textContent = 'Edit Event';
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventTime').value = event.time;
        document.getElementById('eventType').value = event.type;
        document.getElementById('eventDescription').value = event.description || '';
        
        // Set platforms
        document.querySelectorAll('input[name="platform"]').forEach(checkbox => {
            checkbox.checked = event.platforms.includes(checkbox.value.charAt(0).toUpperCase() + checkbox.value.slice(1));
        });
    } else {
        document.getElementById('modalTitle').textContent = 'Schedule New Post';
        eventForm.reset();
        if (selectedDate) {
            document.getElementById('eventDate').value = selectedDate;
        }
    }
    
    eventModal.classList.add('active');
}

function closeEventModal() {
    eventModal.classList.remove('active');
    editingEventId = null;
    selectedDate = null;
}

document.getElementById('closeModal').addEventListener('click', closeEventModal);
document.getElementById('cancelBtn').addEventListener('click', closeEventModal);

eventModal.addEventListener('click', (e) => {
    if (e.target === eventModal) {
        closeEventModal();
    }
});

// ==================== FORM SUBMISSION ====================
eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const type = document.getElementById('eventType').value;
    const description = document.getElementById('eventDescription').value;
    
    const platforms = Array.from(document.querySelectorAll('input[name="platform"]:checked'))
        .map(cb => cb.value.charAt(0).toUpperCase() + cb.value.slice(1));
    
    if (platforms.length === 0) {
        showNotification('Please select at least one platform', 'error');
        return;
    }
    
    const eventData = {
        id: editingEventId || Date.now(),
        title,
        date,
        time,
        type,
        platforms,
        description
    };
    
    if (editingEventId) {
        // Update existing event
        const index = events.findIndex(e => e.id === editingEventId);
        events[index] = eventData;
        showNotification('Event updated successfully', 'success');
    } else {
        // Add new event
        events.push(eventData);
        // showNotification('Schedule Successful', 'success'); // Replaced by popup
        showSuccessPopup();
    }
    
    closeEventModal();
    renderCalendar();
    renderUpcoming();
});

// ==================== EVENT DETAILS ====================
function showEventDetails(event) {
    const detailModal = document.createElement('div');
    detailModal.className = 'modal-overlay active';
    detailModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${event.title}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 16px;">
                    <strong style="color: #6C757D; font-size: 12px; text-transform: uppercase;">Type</strong>
                    <div class="upcoming-type ${event.type}" style="display: inline-block; margin-top: 4px;">${event.type}</div>
                </div>
                <div style="margin-bottom: 16px;">
                    <strong style="color: #6C757D; font-size: 12px; text-transform: uppercase;">Date & Time</strong>
                    <p style="margin-top: 4px; font-size: 14px;">${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${event.time}</p>
                </div>
                <div style="margin-bottom: 16px;">
                    <strong style="color: #6C757D; font-size: 12px; text-transform: uppercase;">Platforms</strong>
                    <div style="display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
                        ${event.platforms.map(p => `<span class="platform-tag">${p}</span>`).join('')}
                    </div>
                </div>
                ${event.description ? `
                    <div style="margin-bottom: 16px;">
                        <strong style="color: #6C757D; font-size: 12px; text-transform: uppercase;">Description</strong>
                        <p style="margin-top: 4px; font-size: 14px; color: #495057;">${event.description}</p>
                    </div>
                ` : ''}
                <div class="form-actions">
                    <button class="btn-secondary" onclick="deleteEvent(${event.id})">Delete</button>
                    <button class="btn-primary" onclick="editEvent(${event.id})">Edit</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(detailModal);
}

function editEvent(eventId) {
    document.querySelector('.modal-overlay:last-child').remove();
    const event = events.find(e => e.id === eventId);
    openEventModal(event);
}

function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        events = events.filter(e => e.id !== eventId);
        document.querySelector('.modal-overlay:last-child').remove();
        renderCalendar();
        renderUpcoming();
        showNotification('Event deleted successfully', 'success');
    }
}

// ==================== SCHEDULE POST BUTTON ====================
document.getElementById('schedulePostBtn').addEventListener('click', () => {
    openEventModal();
});

// ==================== NOTIFICATION SYSTEM ====================
// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.centered-notification');
    if (existing) existing.remove();

    const colors = {
        success: '#00C853',
        error: '#FF5252',
        info: '#00BCD4',
        warning: '#FFB84D'
    };
    
    const notification = document.createElement('div');
    notification.className = 'centered-notification';
    
    // Icon based on type
    let icon = '';
    if (type === 'success') {
        icon = `<div style="
            width: 50px; 
            height: 50px; 
            background: white; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin-bottom: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        ">
            <svg viewBox="0 0 24 24" fill="none" stroke="${colors[type]}" stroke-width="3" width="30" height="30">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </div>`;
    }

    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${type === 'success' ? 'rgba(255, 255, 255, 0.95)' : colors[type]};
        color: ${type === 'success' ? '#333' : 'white'};
        padding: 32px 48px;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        font-size: 18px;
        font-weight: 600;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 300px;
        backdrop-filter: blur(8px);
        animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    
    notification.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Add animation styles if not present
    if (!document.getElementById('notification-anim-style')) {
        const style = document.createElement('style');
        style.id = 'notification-anim-style';
        style.textContent = `
            @keyframes popIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
    // N - New event
    if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
            openEventModal();
        }
    }
    
    // Escape - Close modal
    if (e.key === 'Escape') {
        if (eventModal.classList.contains('active')) {
            closeEventModal();
        }
    }
    
    // Arrow keys - Navigate months
    if (e.key === 'ArrowLeft' && e.ctrlKey) {
        document.getElementById('prevMonth').click();
    }
    if (e.key === 'ArrowRight' && e.ctrlKey) {
        document.getElementById('nextMonth').click();
    }
});

// ==================== ANIMATIONS ====================
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

// ==================== FILTER EVENT LISTENERS ====================
const typeFilter = document.getElementById('typeFilter');
const platformFilter = document.getElementById('platformFilter');

if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
        currentTypeFilter = e.target.value;
        renderCalendar();
        renderUpcoming();
    });
}

if (platformFilter) {
    platformFilter.addEventListener('change', (e) => {
        currentPlatformFilter = e.target.value;
        renderCalendar();
        renderUpcoming();
    });
}

// ==================== INITIALIZATION ====================
window.addEventListener('load', () => {
    renderCalendar();
    renderUpcoming();
});

// ==================== LOGOUT ====================
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        showNotification('Logging out...', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
});

// ==================== SUCCESS POPUP ====================
function showSuccessPopup() {
    const popup = document.getElementById('successPopup');
    popup.classList.add('active');
    
    // Play checkmark animation by re-inserting SVG
    const checkmark = popup.querySelector('.success-checkmark');
    const svg = checkmark.innerHTML;
    checkmark.innerHTML = '';
    setTimeout(() => {
        checkmark.innerHTML = svg;
    }, 10);
}

function closeSuccessPopup() {
    const popup = document.getElementById('successPopup');
    popup.classList.remove('active');
}

document.getElementById('successPopupBtn').addEventListener('click', closeSuccessPopup);
document.getElementById('successPopup').addEventListener('click', (e) => {
    if (e.target.id === 'successPopup') {
        closeSuccessPopup();
    }
});
