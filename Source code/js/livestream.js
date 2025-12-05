// Livestream Studio Logic

// State
let isLive = false;
let streamDuration = 0;
let timerInterval;
let viewerCount = 0;
let viewerInterval;

// DOM Elements
const videoPlaceholder = document.querySelector('.video-placeholder');
const liveBadge = document.querySelector('.live-badge');
const goLiveBtn = document.getElementById('goLiveBtn');
const timerDisplay = document.getElementById('streamTimer');
const viewerDisplay = document.getElementById('viewerCount');
const chatMessages = document.querySelector('.chat-messages');
const chatInput = document.querySelector('.chat-input');
const sendBtn = document.querySelector('.btn-send');

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
    goLiveBtn.addEventListener('click', toggleStream);

    // Chat
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Controls
    micBtn.addEventListener('click', () => toggleControl(micBtn));
    camBtn.addEventListener('click', () => toggleControl(camBtn));
    shareBtn.addEventListener('click', () => toggleControl(shareBtn));

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
    const icon = btn.querySelector('svg');
    
    // Visual feedback would go here (e.g., changing icon)
    // For now just toggle active state styling
    if (!isActive) {
        btn.style.color = '#FF5252'; // Muted/Off state color
    } else {
        btn.style.color = '';
    }
}

// Chat Logic
function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    addMessage({
        author: 'You',
        text: text,
        isSelf: true,
        avatar: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'50\' fill=\'%235B5FED\'/%3E%3Ctext x=\'50\' y=\'65\' font-size=\'40\' text-anchor=\'middle\' fill=\'white\' font-family=\'Arial\' font-weight=\'bold\'%3EU%3C/text%3E%3C/svg%3E'
    });
    
    chatInput.value = '';
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
            
            addMessage({
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
