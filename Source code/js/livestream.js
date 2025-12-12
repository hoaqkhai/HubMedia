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
let peakViewers = 0;
let newFollowers = 0;

// Stream Settings
let streamSettings = {
    title: '',
    description: '',
    quality: '1080',
    platforms: []
};

// DOM Elements
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
    console.log('=== LIVESTREAM INIT START ===');
    
    // FORCE hide all modals on page load
    const allModals = document.querySelectorAll('.modal-overlay');
    console.log(`Found ${allModals.length} modals`);
    
    allModals.forEach((modal, index) => {
        // Remove active class
        modal.classList.remove('active');
        
        // Force inline styles as backup
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        
        console.log(`Modal ${index + 1} (${modal.id}): HIDDEN`);
    });
    
    // Ensure body can scroll
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    
    console.log('=== LIVESTREAM INIT COMPLETE ===');
    
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
// Stream Logic
let localStream = null;

function toggleStream() {
    if (isLive) {
        // Confirmation before ending
        if(confirm('Are you sure you want to end the stream?')) {
            showSummaryModal();
        }
    } else {
        // Show Setup Modal instead of starting immediately
        setupModal.classList.add('active');
    }
}

async function startCamera() {
    try {
        // Quality constraints based on selected quality
        const qualityConstraints = {
            '720': { width: 1280, height: 720 },
            '1080': { width: 1920, height: 1080 },
            '1440': { width: 2560, height: 1440 },
            '2160': { width: 3840, height: 2160 }
        };
        
        const selectedQuality = qualityConstraints[streamSettings.quality] || qualityConstraints['1080'];
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                width: { ideal: selectedQuality.width },
                height: { ideal: selectedQuality.height },
                frameRate: { ideal: 30 }
            }, 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });
        localStream = stream;
        const videoElement = document.getElementById('localVideo');
        videoElement.srcObject = stream;
        
        // Apply initial button states
        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];
        
        if (audioTrack) audioTrack.enabled = micBtn.classList.contains('active');
        if (videoTrack) videoTrack.enabled = camBtn.classList.contains('active');

        return true;
    } catch (err) {
        console.error("Error accessing media devices:", err);
        alert("Could not access camera/microphone. Please check permissions.");
        return false;
    }
}

function stopCamera() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
        const videoElement = document.getElementById('localVideo');
        videoElement.srcObject = null;
    }
}

async function startStream() {
    // Try to start camera first
    const cameraStarted = await startCamera();
    if (!cameraStarted) return; // Exit if camera failed

    isLive = true;

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
    
    // Hide placeholder, show video
    const videoPlaceholder = document.getElementById('videoPlaceholder');
    if(videoPlaceholder) videoPlaceholder.classList.add('hidden');
    
    // Start Timer
    streamDuration = 0;
    timerInterval = setInterval(updateTimer, 1000);
    
    // Start Viewer Simulation
    viewerCount = 0;
    viewerInterval = setInterval(updateViewers, 3000);
    
    addSystemMessage('Stream started. You are now live!');
    startChatSimulation();
    
    // Reset Stats
    totalRevenue = 0;
    peakViewers = 0;
    newFollowers = 0;
    document.getElementById('revenueCount').textContent = '0.00';
    startInteractionSimulation();
}

function stopStream() {
    // Stop Camera
    stopCamera();

    isLive = false; // Fix: Ensure isLive is set to false

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
    
    // Show placeholder
    const videoPlaceholder = document.getElementById('videoPlaceholder');
    if(videoPlaceholder) videoPlaceholder.classList.remove('hidden');
    
    // Stop Timer
    clearInterval(timerInterval);
    timerDisplay.textContent = '00:00:00';
    
    // Stop Viewers
    clearInterval(viewerInterval);
    viewerCount = 0;
    viewerDisplay.textContent = '0';
    
    addSystemMessage('Stream ended.');
    stopChatSimulation();
    stopInteractionSimulation();
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
    if (viewerCount > peakViewers) peakViewers = viewerCount;
}

// Control Logic
function toggleControl(btn) {
    btn.classList.toggle('active');
    const isActive = btn.classList.contains('active');
    
    // Visual update
    if (!isActive) {
        btn.style.color = '#FF5252'; // Muted/Off state color
    } else {
        btn.style.color = '';
    }

    // Hardware update if stream is running
    if (localStream) {
        if (btn.id === 'micBtn') {
            const audioTracks = localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                audioTracks[0].enabled = isActive;
                addSystemMessage(isActive ? 'Microphone enabled' : 'Microphone muted');
            }
        } else if (btn.id === 'camBtn') {
            const videoTracks = localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                videoTracks[0].enabled = isActive;
                addSystemMessage(isActive ? 'Camera enabled' : 'Camera disabled');
            }
        }
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

// ==================== NEW FEATURES ====================

// 1. Floating Reactions
const reactionBtn = document.getElementById('reactionBtn');
const reactionContainer = document.getElementById('reactionContainer');

if (reactionBtn) {
    reactionBtn.addEventListener('click', triggerReaction);
}

function triggerReaction() {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    
    // Random horizontal position
    const randomLeft = Math.random() * 60 + 20; // 20% to 80%
    heart.style.left = `${randomLeft}%`;
    
    reactionContainer.appendChild(heart);
    
    // Remove after animation
    setTimeout(() => {
        heart.remove();
    }, 2000);
}

// 2. Gifting System
const giftBtn = document.getElementById('giftBtn');
const giftModal = document.getElementById('giftModal');
const closeGiftModal = document.getElementById('closeGiftModal');
const revenueDisplay = document.getElementById('revenueCount');

if (giftBtn) {
    giftBtn.addEventListener('click', () => {
        giftModal.classList.add('active');
    });
}

if (closeGiftModal) {
    closeGiftModal.addEventListener('click', () => {
        giftModal.classList.remove('active');
    });
}

document.querySelectorAll('.gift-item').forEach(item => {
    item.addEventListener('click', () => {
        const giftType = item.dataset.gift;
        const price = parseFloat(item.dataset.price);
        
        sendGift(giftType, price);
        giftModal.classList.remove('active');
    });
});

function sendGift(type, price, isSelf = true, userName = 'You') {
    // Update Revenue
    totalRevenue += price;
    revenueDisplay.textContent = totalRevenue.toFixed(2);
    
    // Add to Chat
    const icons = { rose: '🌹', coffee: '☕', diamond: '💎', rocket: '🚀' };
    const icon = icons[type] || '🎁';
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message gift-message`;
    msgDiv.innerHTML = `
        <div class="message-content">
            <div class="message-text">
                ${userName} sent ${type} ${icon} <span class="gift-emoji"></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 3. Interaction Simulation (Bot Likes & Gifts)
let interactionInterval;

function startInteractionSimulation() {
    interactionInterval = setInterval(() => {
        // Random Likes
        if (Math.random() > 0.3) {
            triggerReaction();
        }
        
        // Random Gifts (rarer)
        if (Math.random() > 0.85) {
            const gifts = [
                { type: 'rose', price: 1 },
                { type: 'coffee', price: 5 },
                { type: 'diamond', price: 20 }
            ];
            const gift = gifts[Math.floor(Math.random() * gifts.length)];
            const user = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
            
            sendGift(gift.type, gift.price, false, user.name);
        }

        // Random Followers
        if (Math.random() > 0.9) {
            newFollowers++;
        }
    }, 800);
}

function stopInteractionSimulation() {
    clearInterval(interactionInterval);
}

// 4. Summary Modal
const summaryModal = document.getElementById('summaryModal');
const closeSummaryBtn = document.getElementById('closeSummaryBtn');

function showSummaryModal() {
    // Populate Data
    const hours = Math.floor(streamDuration / 3600);
    const minutes = Math.floor((streamDuration % 3600) / 60);
    const seconds = streamDuration % 60;
    
    document.getElementById('sumDuration').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
    document.getElementById('sumViewers').textContent = peakViewers.toLocaleString();
    document.getElementById('sumFollowers').textContent = newFollowers;
    document.getElementById('sumRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    
    summaryModal.classList.add('active');
}

closeSummaryBtn.addEventListener('click', () => {
    summaryModal.classList.remove('active');
    stopStream();
});

// 5. Setup Stream Logic
const setupModal = document.getElementById('setupModal');
const closeSetupModal = document.getElementById('closeSetupModal');
const startBroadcastBtn = document.getElementById('startBroadcastBtn');
const streamTitleInput = document.getElementById('streamTitleInput');

if (closeSetupModal) {
    closeSetupModal.addEventListener('click', () => {
        setupModal.classList.remove('active');
    });
}

// Close modal when clicking on overlay background
if (setupModal) {
    setupModal.addEventListener('click', (e) => {
        if (e.target === setupModal) {
            setupModal.classList.remove('active');
        }
    });
}

// Close gift modal when clicking on overlay
if (giftModal) {
    giftModal.addEventListener('click', (e) => {
        if (e.target === giftModal) {
            giftModal.classList.remove('active');
        }
    });
}

// Close summary modal when clicking on overlay
if (summaryModal) {
    summaryModal.addEventListener('click', (e) => {
        if (e.target === summaryModal) {
            summaryModal.classList.remove('active');
            stopStream();
        }
    });
}

if (startBroadcastBtn) {
    startBroadcastBtn.addEventListener('click', startBroadcast);
}

function startBroadcast() {
    const title = streamTitleInput.value.trim();
    const description = document.getElementById('streamDescInput').value.trim();
    const quality = document.getElementById('streamQualitySelect').value;
    
    // Validation
    if (!title) {
        alert('Please enter a stream title');
        streamTitleInput.focus();
        return;
    }
    
    if (!description) {
        alert('Please enter a stream description');
        document.getElementById('streamDescInput').focus();
        return;
    }
    
    // Get Selected Platforms
    const platforms = Array.from(document.querySelectorAll('input[name="streamPlatform"]:checked'))
        .map(cb => cb.value);
        
    if (platforms.length === 0) {
        alert('Please select at least one platform');
        return;
    }
    
    // Store stream settings
    streamSettings = {
        title: title,
        description: description,
        quality: quality,
        platforms: platforms
    };
    
    // Update stream title preview in UI
    const streamTitlePreview = document.querySelector('.stream-title-preview');
    if (streamTitlePreview) {
        streamTitlePreview.textContent = title;
    }
    
    // Show quality info in system message
    const qualityLabels = {
        '720': '720p HD',
        '1080': '1080p Full HD',
        '1440': '1440p 2K',
        '2160': '4K Ultra HD'
    };
    
    addSystemMessage(`Starting stream: "${title}" in ${qualityLabels[quality]} on ${platforms.join(', ')}...`);
    
    setupModal.classList.remove('active');
    startStream();
}
