// Livestream Studio Logic - Backend Integrated

// State
let isLive = false;
let streamDuration = 0;
let timerInterval;
let viewerInterval;
let moderationEnabled = false;
let currentStreamId = null; // ← mới, lưu stream_id hiện tại

// DOM Elements
const videoPlaceholder = document.querySelector('.video-placeholder');
const liveBadge = document.querySelector('.live-badge');
const goLiveBtn = document.getElementById('goLiveBtn');
const timerDisplay = document.getElementById('streamTimer');
const viewerDisplay = document.getElementById('viewerCount');
const chatMessages = document.getElementById('liveChatMessages');
const chatInput = document.querySelector('.chat-input');
const sendBtn = document.querySelector('.btn-send');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const moderationQueue = document.getElementById('moderationQueue');
const moderationToggle = document.getElementById('moderationToggle');
const modCountBadge = document.getElementById('modCount');

const micBtn = document.getElementById('micBtn');
const camBtn = document.getElementById('camBtn');
const shareBtn = document.getElementById('shareBtn');

// Initialize
function init() {
    setupEventListeners();
    addSystemMessage('Welcome to Livestream Studio. Set up your stream and click "Go Live" to start.');
    fetchModerationQueue();
}

// ------------------ EVENT LISTENERS ------------------
function setupEventListeners() {
    if (goLiveBtn) goLiveBtn.addEventListener('click', toggleStream);

    if (sendBtn) sendBtn.addEventListener('click', handleUserSend);
    if (chatInput) chatInput.addEventListener('keypress', e => { if(e.key==='Enter') handleUserSend(); });

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            tabBtns.forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            tabContents.forEach(c=>{
                c.classList.remove('active');
                if(c.id===`${tabId}Tab`) c.classList.add('active');
            });
        });
    });

    if (moderationToggle) {
        moderationToggle.addEventListener('change', (e) => {
            moderationEnabled = e.target.checked;
            addSystemMessage(`Moderation mode turned ${moderationEnabled?'ON':'OFF'}`);
        });
    }

    [micBtn, camBtn, shareBtn].forEach(btn => { if(btn) btn.addEventListener('click', ()=>toggleControl(btn)); });

    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) logoutBtn.addEventListener('click', e=>{
        e.preventDefault();
        if(confirm('Are you sure you want to logout?')) {
            addSystemMessage('Logging out...');
            setTimeout(()=>window.location.href='login.html',1000);
        }
    });
}

// ------------------ STREAM LOGIC ------------------
function toggleStream() {
    isLive = !isLive;
    if(isLive) startStream();
    else stopStream();
}

async function startStream() {
    // Tạo stream mới trên backend và lấy stream_id
    try {
        const res = await fetch('/api/streams/start',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ user_id: 1, title:'My Live Stream' }) // TODO: user_id động
        });
        const data = await res.json();
        currentStreamId = data.stream_id;
    } catch(err){
        console.error('Failed to start stream', err);
        return;
    }

    goLiveBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>End Stream`;
    goLiveBtn.classList.replace('btn-primary','btn-danger');
    liveBadge.classList.add('active'); liveBadge.querySelector('span').textContent='LIVE';
    videoPlaceholder.innerHTML=`<div style="text-align:center;"><div style="font-size:48px;margin-bottom:16px;">🎥</div>
        <h3>Stream is Live</h3><p>You are broadcasting to your audience</p></div>`;

    streamDuration=0; timerInterval=setInterval(updateTimer,1000);
    viewerInterval=setInterval(updateViewers,3000);

    addSystemMessage('Stream started. You are now live!');
    startChatSimulation();
}

async function stopStream() {
    if(!confirm('Are you sure you want to end the stream?')) { isLive=true; return; }

    // Kết thúc stream trên backend
    try {
        await fetch('/api/streams/end',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ stream_id: currentStreamId, viewer_count: parseInt(viewerDisplay.textContent.replace(/,/g,'')) })
        });
        currentStreamId=null;
    } catch(err){ console.error('Failed to end stream', err); }

    goLiveBtn.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>Go Live`;
    goLiveBtn.classList.replace('btn-danger','btn-primary');
    liveBadge.classList.remove('active'); liveBadge.querySelector('span').textContent='OFFLINE';
    videoPlaceholder.innerHTML=`<h3>Stream Offline</h3><p>Click "Go Live" to start streaming</p>`;

    clearInterval(timerInterval); timerDisplay.textContent='00:00:00';
    clearInterval(viewerInterval); viewerDisplay.textContent='0';

    addSystemMessage('Stream ended.');
    stopChatSimulation();
}

// ------------------ TIMER & VIEWERS ------------------
function updateTimer() {
    streamDuration++;
    const h=Math.floor(streamDuration/3600);
    const m=Math.floor((streamDuration%3600)/60);
    const s=streamDuration%60;
    timerDisplay.textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function updateViewers() {
    if(!currentStreamId) return;
    fetch(`/api/viewers?stream_id=${currentStreamId}`)
        .then(res=>res.json())
        .then(data=>viewerDisplay.textContent=data.count.toLocaleString())
        .catch(()=>{/* ignore */});
}

// ------------------ CONTROL ------------------
function toggleControl(btn){ btn.classList.toggle('active'); btn.style.color=btn.classList.contains('active')?'':'#FF5252'; }

// ------------------ CHAT ------------------
function handleUserSend(){
    const text = chatInput.value.trim();
    if(!text) return;
    const msg={ author:'You', text, isSelf:true, timestamp:new Date() };

    if(moderationEnabled) addToModerationQueue(msg);
    else sendMessageToBackend(msg);
    chatInput.value='';
}

function handleIncomingMessage(msg){
    if(moderationEnabled) addToModerationQueue(msg);
    else addMessage(msg);
}

function addMessage({author,text,isSelf=false,avatar}){
    const msgDiv=document.createElement('div');
    msgDiv.className=`chat-message ${isSelf?'self':''}`;
    msgDiv.innerHTML=`<div class="chat-avatar"><img src="${avatar||'/default-avatar.png'}" alt="${author}"></div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">${author}</span>
                <span class="message-time">${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
            </div>
            <div class="message-text">${text}</div>
        </div>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop=chatMessages.scrollHeight;
}

function addSystemMessage(text){
    const msgDiv=document.createElement('div'); msgDiv.className='chat-message system';
    msgDiv.innerHTML=`<div class="message-text">${text}</div>`;
    chatMessages.appendChild(msgDiv); chatMessages.scrollTop=chatMessages.scrollHeight;
}

// ------------------ MODERATION ------------------
function addToModerationQueue(msg){
    if(!currentStreamId) return;
    fetch(`/api/moderation/add`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...msg, stream_id: currentStreamId})
    }).then(res=>res.json()).then(()=>fetchModerationQueue());
}

function fetchModerationQueue(){
    if(!currentStreamId) return;
    fetch(`/api/moderation?stream_id=${currentStreamId}`)
        .then(res=>res.json()).then(data=>renderModerationQueue(data))
        .catch(()=>renderModerationQueue([]));
}

function renderModerationQueue(queue=[]){
    moderationQueue.innerHTML='';
    if(queue.length===0){
        moderationQueue.innerHTML=`<div class="empty-state"><p>No messages pending approval</p></div>`;
        modCountBadge.style.display='none';
        return;
    }
    modCountBadge.style.display='inline-block';
    modCountBadge.textContent=queue.length;

    queue.forEach(msg=>{
        const item=document.createElement('div');
        item.className='moderation-item';
        item.innerHTML=`<div class="mod-header"><span class="mod-author">${msg.author}</span>
            <span class="mod-time">${new Date(msg.timestamp).toLocaleTimeString()}</span></div>
            <div class="mod-text">${msg.text}</div>
            <div class="mod-actions">
                <button class="btn-mod btn-reject" onclick="rejectMessage(${msg.id})">Reject</button>
                <button class="btn-mod btn-approve" onclick="approveMessage(${msg.id})">Approve</button>
            </div>`;
        moderationQueue.appendChild(item);
    });
}

window.approveMessage = function(id){ fetch(`/api/moderation/approve/${id}`,{method:'POST'}).then(()=>fetchModerationQueue()); };
window.rejectMessage = function(id){ fetch(`/api/moderation/reject/${id}`,{method:'POST'}).then(()=>fetchModerationQueue()); };

// ------------------ CHAT SIMULATION ------------------
let chatInterval;
function startChatSimulation(){
    chatInterval=setInterval(()=>{
        if(!currentStreamId) return;
        if(Math.random()>0.6){
            fetch('/api/chat/simulate')
                .then(res=>res.json())
                .then(msg=>handleIncomingMessage(msg));
        }
    },2000);
}
function stopChatSimulation(){ clearInterval(chatInterval); }

// ------------------ SEND CHAT TO BACKEND ------------------
function sendMessageToBackend(msg){
    if(!currentStreamId) return;
    fetch('/api/chat/send',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...msg, stream_id: currentStreamId})
    }).then(res=>res.json()).then(savedMsg=>addMessage(savedMsg));
}

// ------------------ INIT ------------------
init();
