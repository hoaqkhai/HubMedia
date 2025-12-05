// Livestream Studio Logic

// State
let isLive = false;
let streamDuration = 0;
let timerInterval;
let viewerCount = 0;
let viewerInterval;
let moderationEnabled = false;
let messageQueue = [];
let nextMessageId = 1;

// DOM Elements
const videoPlaceholder = document.querySelector('.video-placeholder');
const liveBadge = document.querySelector('.live-badge');
const goLiveBtn = document.getElementById('goLiveBtn');
const timerDisplay = document.getElementById('streamTimer');
const viewerDisplay = document.getElementById('viewerCount');
const chatMessages = document.getElementById('liveChatMessages'); // Updated ID
const chatInput = document.querySelector('.chat-input');
const sendBtn = document.querySelector('.btn-send');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const moderationQueue = document.getElementById('moderationQueue');
const moderationToggle = document.getElementById('moderationToggle');
const modCountBadge = document.getElementById('modCount');

// Controls
const micBtn = document.getElementById('micBtn');
const camBtn = document.getElementById('camBtn');
const shareBtn = document.getElementById('shareBtn');

// Initialize
function init() {
    setupEventListeners();
    addSystemMessage('Welcome to Livestream Studio. Set up your stream and click "Go Live" to start.');
}

function setupEventListeners() {
    // Go Live Button
    if (goLiveBtn) goLiveBtn.addEventListener('click', toggleStream);

    // Chat
    if (sendBtn) sendBtn.addEventListener('click', handleUserSend);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUserSend();
        });
    }

    // Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update Buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update Content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}Tab`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Moderation Toggle
    if (moderationToggle) {
        moderationToggle.addEventListener('change', (e) => {
            moderationEnabled = e.target.checked;
            const status = moderationEnabled ? 'ON' : 'OFF';
            addSystemMessage(`Moderation mode turned ${status}`);
        });
    }

    // Controls
    if (micBtn) micBtn.addEventListener('click', () => toggleControl(micBtn));
    if (camBtn) camBtn.addEventListener('click', () => toggleControl(camBtn));
    if (shareBtn) shareBtn.addEventListener('click', () => toggleControl(shareBtn));

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                addSystemMessage('Logging out...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        });
    }
}

// Stream Logic
function toggleStream() {
    isLive = !isLive;
    
    if (isLive) {
        startStream();
    } else {
        stopStream();
    }
}

function startStream() {
    // UI Updates
    goLiveBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        End Stream
    `;
    goLiveBtn.classList.replace('btn-primary', 'btn-danger');
    goLiveBtn.style.backgroundColor = '#FF5252';
    
    liveBadge.classList.add('active');
    liveBadge.querySelector('span').textContent = 'LIVE';
    
    videoPlaceholder.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎥</div>
            <h3>Stream is Live</h3>
            <p>You are broadcasting to your audience</p>
        </div>
    `;
    
    // Start Timer
    streamDuration = 0;
    timerInterval = setInterval(updateTimer, 1000);
    
    // Start Viewer Simulation
    viewerCount = 0;
    viewerInterval = setInterval(updateViewers, 3000);
    
    addSystemMessage('Stream started. You are now live!');
    startChatSimulation();
}

function stopStream() {
    if (!confirm('Are you sure you want to end the stream?')) {
        isLive = true;
        return;
    }

    // UI Updates
    goLiveBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10 8 16 12 10 16 10 8"></polygon>
        </svg>
        Go Live
    `;
    goLiveBtn.classList.replace('btn-danger', 'btn-primary');
    goLiveBtn.style.backgroundColor = '';
    
    liveBadge.classList.remove('active');
    liveBadge.querySelector('span').textContent = 'OFFLINE';
    
    videoPlaceholder.innerHTML = `
        <h3>Stream Offline</h3>
        <p>Click "Go Live" to start streaming</p>
    `;
    
    // Stop Timer
    clearInterval(timerInterval);
    timerDisplay.textContent = '00:00:00';
    
    // Stop Viewers
    clearInterval(viewerInterval);
    viewerCount = 0;
    viewerDisplay.textContent = '0';
    
    addSystemMessage('Stream ended.');
    stopChatSimulation();
}

function updateTimer() {
    streamDuration++;
    const hours = Math.floor(streamDuration / 3600);
    const minutes = Math.floor((streamDuration % 3600) / 60);
    const seconds = streamDuration % 60;
    
    timerDisplay.textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateViewers() {
    // Simulate fluctuation
    const change = Math.floor(Math.random() * 10) - 3;
    viewerCount = Math.max(0, viewerCount + change + (streamDuration < 60 ? 5 : 0)); // Grow faster at start
    viewerDisplay.textContent = viewerCount.toLocaleString();
}

// Control Logic
function toggleControl(btn) {
    btn.classList.toggle('active');
    const isActive = btn.classList.contains('active');
    
    if (!isActive) {
        btn.style.color = '#FF5252'; // Muted/Off state color
    } else {
        btn.style.color = '';
    }
}

// Chat Logic
function handleUserSend() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    const messageData = {
        author: 'You',
        text: text,
        isSelf: true,
        avatar: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'50\' fill=\'%235B5FED\'/%3E%3Ctext x=\'50\' y=\'65\' font-size=\'40\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial\' font-weight=\'bold\'%3EU%3C/text%3E%3C/svg%3E',
        timestamp: new Date()
    };
    
    if (moderationEnabled) {
        addToModerationQueue(messageData);
        // Temporarily clear input as if sent
        chatInput.value = '';
    } else {
        addMessage(messageData);
        chatInput.value = '';
    }
}

function handleIncomingMessage(data) {
    // Basic User messages (from simulator or others)
    const messageData = {
        ...data,
        timestamp: new Date()
    };
    
    if (moderationEnabled) {
        addToModerationQueue(messageData);
    } else {
        addMessage(messageData);
    }
}

function addMessage({ author, text, isSelf = false, avatar }) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${isSelf ? 'self' : ''}`;
    
    msgDiv.innerHTML = `
        <div class="chat-avatar">
            <img src="${avatar}" alt="${author}">
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">${author}</span>
                <span class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="message-text">${text}</div>
        </div>
    `;
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addSystemMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message system';
    msgDiv.innerHTML = `<div class="message-text">${text}</div>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Moderation Logic
function addToModerationQueue(message) {
    const id = nextMessageId++;
    const queuedMessage = { ...message, id };
    messageQueue.push(queuedMessage);
    renderModerationQueue();
    updateBadge();
}

function renderModerationQueue() {
    moderationQueue.innerHTML = '';
    
    if (messageQueue.length === 0) {
        moderationQueue.innerHTML = `
            <div class="empty-state">
                <p>No messages pending approval</p>
            </div>
        `;
        return;
    }
    
    messageQueue.forEach(msg => {
        const item = document.createElement('div');
        item.className = 'moderation-item';
        item.innerHTML = `
            <div class="mod-header">
                <span class="mod-author">${msg.author}</span>
                <span class="mod-time">${msg.timestamp.toLocaleTimeString()}</span>
            </div>
            <div class="mod-text">${msg.text}</div>
            <div class="mod-actions">
                <button class="btn-mod btn-reject" onclick="rejectMessage(${msg.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Reject
                </button>
                <button class="btn-mod btn-approve" onclick="approveMessage(${msg.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Approve
                </button>
            </div>
        `;
        moderationQueue.appendChild(item);
    });
}

function updateBadge() {
    if (messageQueue.length > 0) {
        modCountBadge.style.display = 'inline-block';
        modCountBadge.textContent = messageQueue.length;
    } else {
        modCountBadge.style.display = 'none';
        modCountBadge.textContent = '0';
    }
}

// Global functions for onClick
window.approveMessage = function(id) {
    const index = messageQueue.findIndex(m => m.id === id);
    if (index !== -1) {
        const msg = messageQueue[index];
        addMessage(msg); // Move to chat
        messageQueue.splice(index, 1); // Remove from queue
        renderModerationQueue();
        updateBadge();
    }
};

window.rejectMessage = function(id) {
    const index = messageQueue.findIndex(m => m.id === id);
    if (index !== -1) {
        messageQueue.splice(index, 1); // Remove from queue
        renderModerationQueue();
        updateBadge();
    }
};

// Chat Simulation
let chatInterval;
const simulatedUsers = [
    { name: 'Sarah J.', avatar: 'https://ui-avatars.com/api/?name=Sarah+J&background=random' },
    { name: 'Mike Tech', avatar: 'https://ui-avatars.com/api/?name=Mike+T&background=random' },
    { name: 'DesignPro', avatar: 'https://ui-avatars.com/api/?name=Design+P&background=random' },
    { name: 'Alex', avatar: 'https://ui-avatars.com/api/?name=Alex&background=random' }
];
const simulatedMessages = [
    "Great stream!",
    "Can you show that setting again?",
    "Hello from Vietnam! 🇻🇳",
    "Audio is a bit low",
    "Loving the new update",
    "When is the next giveaway?",
    "Wow, didn't know that!",
    "Keep it up!"
];

function startChatSimulation() {
    chatInterval = setInterval(() => {
        if (Math.random() > 0.6) { // 40% chance to send message every interval
            const user = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
            const text = simulatedMessages[Math.floor(Math.random() * simulatedMessages.length)];
            
            handleIncomingMessage({
                author: user.name,
                text: text,
                avatar: user.avatar
            });
        }
    }, 2000);
}

function stopChatSimulation() {
    clearInterval(chatInterval);
}

// Run Init
init();
