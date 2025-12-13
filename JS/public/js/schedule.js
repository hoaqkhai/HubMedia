// ==================== CALENDAR DATA ====================
let currentDate = new Date();
let selectedDate = null;
let events = [];
let editingEventId = null;

// ==================== LOAD EVENTS FROM BACKEND ====================
async function loadEvents() {
    try {
        const res = await fetch('/api/events'); // GET tất cả events
        if (!res.ok) throw new Error('Failed to fetch events');
        events = await res.json();
        renderCalendar();
        renderUpcoming();
    } catch (err) {
        showNotification('Failed to load events from server', 'error');
        console.error(err);
    }
}

// ==================== CALENDAR RENDERING ====================
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
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
    const remainingCells = 42 - totalCells; 
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, year, month + 1);
        calendarGrid.appendChild(dayElement);
    }
}

function createDayElement(day, isOtherMonth, year, month) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) dayElement.classList.add('other-month');
    
    const dateObj = new Date(year, month, day);
    const checkYear = dateObj.getFullYear();
    const checkMonth = dateObj.getMonth();
    const checkDay = dateObj.getDate();
    
    const dateStr = `${checkYear}-${String(checkMonth + 1).padStart(2,'0')}-${String(checkDay).padStart(2,'0')}`;
    
    const today = new Date();
    if (checkYear === today.getFullYear() && checkMonth === today.getMonth() && checkDay === today.getDate()) {
        dayElement.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    const dayEvents = document.createElement('div');
    dayEvents.className = 'day-events';
    
    const dayEventsData = events.filter(event => event.date === dateStr);
    dayEventsData.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = `event-item ${event.type}`;
        eventItem.innerHTML = `<span class="event-dot"></span>${event.title}`;
        eventItem.title = `${event.title} (${event.time})`;
        eventItem.addEventListener('click', (e) => {
            e.stopPropagation();
            showEventDetails(event);
        });
        dayEvents.appendChild(eventItem);
    });
    
    dayElement.appendChild(dayEvents);
    
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
    
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7*24*60*60*1000);
    
    const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
    }).sort((a,b) => new Date(a.date) - new Date(b.date));
    
    if (upcomingEvents.length === 0) {
        upcomingGrid.innerHTML = '<p style="color: #6C757D; grid-column: 1/-1; text-align: center; padding: 20px;">No upcoming events this week</p>';
        return;
    }
    
    upcomingEvents.forEach(event => {
        const card = document.createElement('div');
        card.className = `upcoming-card ${event.type}`;
        
        const eventDate = new Date(event.date);
        const dateStr = eventDate.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
        
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

function openEventModal(event = null) {
    editingEventId = event ? event.id : null;
    
    if (event) {
        document.getElementById('modalTitle').textContent = 'Edit Event';
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventTime').value = event.time;
        document.getElementById('eventType').value = event.type;
        document.getElementById('eventDescription').value = event.description || '';
        document.querySelectorAll('input[name="platform"]').forEach(cb => {
            cb.checked = event.platforms.includes(cb.value.charAt(0).toUpperCase() + cb.value.slice(1));
        });
    } else {
        document.getElementById('modalTitle').textContent = 'Schedule New Post';
        eventForm.reset();
        if (selectedDate) document.getElementById('eventDate').value = selectedDate;
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
eventModal.addEventListener('click', (e) => { if(e.target === eventModal) closeEventModal(); });

// ==================== FORM SUBMISSION (CREATE/EDIT) ====================
eventForm.addEventListener('submit', async (e) => {
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

    const eventData = { title, date, time, type, platforms, description };

    try {
        if (editingEventId) {
            await fetch(`/api/events/${editingEventId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(eventData)
            });
            showNotification('Event updated successfully', 'success');
        } else {
            await fetch('/api/events', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(eventData)
            });
            showNotification('Schedule Successful', 'success');
        }
        closeEventModal();
        await loadEvents();
    } catch (err) {
        showNotification('Failed to save event', 'error');
        console.error(err);
    }
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
    document.querySelector('.modal-overlay:last-child')?.remove();
    const event = events.find(e => e.id === eventId);
    openEventModal(event);
}

// ==================== DELETE EVENT ====================
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
        await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
        showNotification('Event deleted successfully', 'success');
        document.querySelector('.modal-overlay:last-child')?.remove();
        await loadEvents();
    } catch (err) {
        showNotification('Failed to delete event', 'error');
        console.error(err);
    }
}

// ==================== SCHEDULE POST BUTTON ====================
document.getElementById('schedulePostBtn').addEventListener('click', () => {
    openEventModal();
});

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type='info') {
    const existing = document.querySelector('.centered-notification');
    if(existing) existing.remove();

    const colors = { success:'#00C853', error:'#FF5252', info:'#00BCD4', warning:'#FFB84D' };
    const notification = document.createElement('div');
    notification.className = 'centered-notification';
    
    let icon='';
    if(type==='success') icon = `<div style="width:50px;height:50px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <svg viewBox="0 0 24 24" fill="none" stroke="${colors[type]}" stroke-width="3" width="30" height="30">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    </div>`;
    
    notification.style.cssText = `
        position: fixed; top:50%; left:50%; transform: translate(-50%,-50%);
        background: ${type==='success'?'rgba(255,255,255,0.95)':colors[type]};
        color: ${type==='success'?'#333':'white'};
        padding:32px 48px; border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,0.2);
        font-size:18px; font-weight:600; z-index:10000;
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        min-width:300px; backdrop-filter: blur(8px); animation: popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
    `;
    notification.innerHTML = `${icon}<span>${message}</span>`;
    document.body.appendChild(notification);
    
    if(!document.getElementById('notification-anim-style')){
        const style=document.createElement('style');
        style.id='notification-anim-style';
        style.textContent=`@keyframes popIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.8);}to{opacity:1;transform:translate(-50%,-50%) scale(1);}}@keyframes fadeOut{from{opacity:1;transform:translate(-50%,-50%) scale(1);}to{opacity:0;transform:translate(-50%,-50%) scale(0.9);}}`;
        document.head.appendChild(style);
    }
    
    setTimeout(()=>{ notification.style.animation='fadeOut 0.3s ease forwards'; setTimeout(()=>notification.remove(),300); },2000);
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown',(e)=>{
    if(e.key==='n' && !e.ctrlKey && !e.metaKey){
        const active=document.activeElement;
        if(active.tagName!=='INPUT' && active.tagName!=='TEXTAREA') openEventModal();
    }
    if(e.key==='Escape'){ if(eventModal.classList.contains('active')) closeEventModal(); }
    if(e.key==='ArrowLeft' && e.ctrlKey) document.getElementById('prevMonth').click();
    if(e.key==='ArrowRight' && e.ctrlKey) document.getElementById('nextMonth').click();
});

// ==================== INITIALIZATION ====================
window.addEventListener('load', loadEvents);

// ==================== LOGOUT ====================
document.getElementById('logoutBtn').addEventListener('click', function(e){
    e.preventDefault();
    if(confirm('Are you sure you want to logout?')){
        showNotification('Logging out...','info');
        setTimeout(()=>window.location.href='login.html',1000);
    }
});
