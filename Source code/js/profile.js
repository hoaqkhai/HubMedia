/**
 * Profile Page Logic
 * Refactored for modularity and enhanced features
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. STATE MANAGEMENT
    // ==========================================
    const State = {
        userRole: localStorage.getItem('userRole') || 'guest',
        isDirty: false,
        profileData: null,
        defaults: {
            admin: {
                fullName: 'Quản trị viên',
                email: 'admin@hubmedia.com',
                bio: 'Hệ thống quản lý Hub Media',
                avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%235B5FED'/%3E%3Ctext x='50' y='65' font-size='40' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold'%3EA%3C/text%3E%3C/svg%3E"
            },
            customer: {
                fullName: 'Khách hàng',
                email: 'customer@hubmedia.com',
                bio: 'Thành viên thân thiết',
                avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%235B5FED'/%3E%3Ctext x='50' y='65' font-size='40' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold'%3EC%3C/text%3E%3C/svg%3E"
            },
            guest: {
                fullName: 'Guest User',
                email: 'guest@hubmedia.com',
                bio: 'Please login to manage profile',
                avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%239e9e9e'/%3E%3Ctext x='50' y='65' font-size='40' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold'%3EG%3C/text%3E%3C/svg%3E"
            }
        }
    };

    // Redirect if not logged in (optional based on requirements)
    if (!localStorage.getItem('userRole')) {
        // window.location.href = 'login.html'; // Uncomment if strict auth needed
    }

    // ==========================================
    // 2. DOM ELEMENTS
    // ==========================================
    const DOM = {
        // Headers & Text
        displayName: document.getElementById('displayName'),
        displayBio: document.getElementById('displayBio'),
        
        // Forms & Inputs
        profileForm: document.getElementById('profileForm'),
        securityForm: document.getElementById('securityForm'),
        inputs: document.querySelectorAll('#profileForm input:not(#role), #profileForm textarea'),
        roleInput: document.getElementById('role'),
        
        // Actions
        btnEdit: document.getElementById('editProfileBtn'),
        btnCancel: document.getElementById('cancelEditBtn'),
        actionsContainer: document.getElementById('profileActions'),
        
        // Avatar
        avatarImg: document.getElementById('profileAvatar'),
        sidebarAvatar: document.querySelector('.sidebar-avatar-img'), 
        // Old input (kept for fallback but mostly unused now)
        avatarInput: document.getElementById('avatarUpload'),
        
        // Buttons
        btnRemoveAvatar: document.getElementById('btnRemoveAvatar'),
        btnViewAvatar: document.getElementById('btnViewAvatar'),
        
        // Avatar Selection Modal
        modal: document.getElementById('avatarModal'),
        btnCloseModal: document.querySelector('.btn-close-modal'),
        btnModalCancel: document.getElementById('btnModalCancel'),
        btnModalSave: document.getElementById('btnModalSave'),
        tabs: document.querySelectorAll('.tab-btn'),
        tabContents: document.querySelectorAll('.tab-content'),
        dropZone: document.getElementById('dropZone'),
        modalNativeInput: document.getElementById('modalNativeInput'),
        btnBrowse: document.querySelector('.btn-browse'),
        galleryGrid: document.getElementById('avatarGallery'),
        previewContainer: document.getElementById('previewContainer'),
        previewImg: document.getElementById('modalPreviewImage'),

        // Lightbox
        lightbox: document.getElementById('lightbox'),
        lightboxImg: document.getElementById('lightboxImage'),
        lightboxClose: document.querySelector('.lightbox-close'),
        
        // ... rest of DOM
    };

    // ==========================================
    // 3. INITIALIZATION
    // ==========================================
    function init() {
        loadProfileData();
        renderActivityTimeline();
        animateStats();
        setupEventListeners();
        generateGallery(); // [NEW]
    }

    // ... loadProfileData ...
    // ... updateUI ...
    // ... updateAvatarDisplay ...

    // ==========================================
    // 4. LOGIC & HANDLERS
    // ==========================================
    
    // ... Profile Editing (toggleEditMode, saveProfile, cancelEdit) ...

    // --- Avatar Management (Enhanced) ---
    
    // [NEW] Modal State
    let pendingAvatar = null; // Store avatar choice before saving

    function openAvatarModal() {
        DOM.modal.classList.remove('hidden');
        resetModal();
    }

    function closeAvatarModal() {
        DOM.modal.classList.add('hidden');
        pendingAvatar = null;
    }

    function resetModal() {
        pendingAvatar = null;
        DOM.previewContainer.classList.add('hidden');
        DOM.btnModalSave.disabled = true;
        // Reset Tabs
        switchTab('upload');
        // Reset Gallery Selection
        document.querySelectorAll('.gallery-item').forEach(el => el.classList.remove('selected'));
    }

    function switchTab(tabName) {
        DOM.tabs.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        DOM.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
            if (content.id === `tab-${tabName}`) {
                 // Animation reset
                 content.style.animation = 'none';
                 content.offsetHeight; /* trigger reflow */
                 content.style.animation = 'fadeIn 0.3s ease';
            }
        });
    }

    function handleFileSelection(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            showToast('Error', 'Only image files are allowed', 'error');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('Error', 'Image size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            updatePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    function updatePreview(src) {
        pendingAvatar = src;
        DOM.previewImg.src = src;
        DOM.previewContainer.classList.remove('hidden');
        DOM.btnModalSave.disabled = false;
        
        // Clear gallery selection if active
        document.querySelectorAll('.gallery-item').forEach(el => el.classList.remove('selected'));
    }

    function saveAvatarChange() {
        if (!pendingAvatar) return;

        // Persist
        State.profileData.avatar = pendingAvatar;
        localStorage.setItem(`userProfile_${State.userRole}`, JSON.stringify(State.profileData));

        // Update UI
        updateAvatarDisplay(pendingAvatar);
        
        closeAvatarModal();
        showToast('Success', 'Profile picture updated', 'success');
    }

    // [NEW] Gallery Generation
    function generateGallery() {
        if (!DOM.galleryGrid) return;
        
        // Collection of playful avatars (using DiceBear or similar placeholder services or SVGs)
        // Using seeded SVGs for internal consistency
        const seeds = ['Felix', 'Aneka', 'Zack', 'Midnight', 'Luna', 'Shadow', 'Buddy', 'Molly'];
        const galleryHtml = seeds.map(seed => {
            // Using multiavatar or similar logic - here simply creating colored circles with initials for demo
            // In a real app, use real image URLs or a library.
            // Using a reliable placeholder service for demo:
            const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
            return `
                <div class="gallery-item" data-src="${url}">
                    <img src="${url}" alt="Avatar ${seed}" loading="lazy">
                </div>
            `;
        }).join('');

        DOM.galleryGrid.innerHTML = galleryHtml;

        // Add click listeners to items
        DOM.galleryGrid.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', () => {
                // UI Toggle
                document.querySelectorAll('.gallery-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                
                // Update Preview
                updatePreview(item.dataset.src);
            });
        });
    }

    // ... removeAvatar (refactored to just reset logic) ...
    function removeAvatar() {
        if (!confirm('Revert to default avatar?')) return;
        const defaultAv = State.defaults[State.userRole]?.avatar || State.defaults.guest.avatar;
        State.profileData.avatar = defaultAv;
        localStorage.setItem(`userProfile_${State.userRole}`, JSON.stringify(State.profileData));
        updateAvatarDisplay(defaultAv);
        showToast('Success', 'Avatar reset', 'success');
    }

    // ... Lightbox logic (keep existing) ...

    // ==========================================
    // 5. EVENT LISTENERS
    // ==========================================
    function setupEventListeners() {
        // ... existing form/edit listeners ...

        // --- Avatar Selection Modal Triggers ---
        // Instead of triggering input immediately, open Modal
        const avatarContainer = document.querySelector('.profile-avatar-large');
        if (avatarContainer) {
            avatarContainer.addEventListener('click', (e) => {
                 // Prevent if clicking View/Remove buttons
                 if (e.target.closest('.avatar-control')) return; 
                 // If clicking the main area or the edit button
                 openAvatarModal();
            });
        }
        
        // Modal Controls
        DOM.btnCloseModal.addEventListener('click', closeAvatarModal);
        DOM.btnModalCancel.addEventListener('click', closeAvatarModal);
        DOM.btnModalSave.addEventListener('click', saveAvatarChange);
        
        // Tabs
        DOM.tabs.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });

        // Drag & Drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            DOM.dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            DOM.dropZone.addEventListener(eventName, () => DOM.dropZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            DOM.dropZone.addEventListener(eventName, () => DOM.dropZone.classList.remove('dragover'), false);
        });

        DOM.dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFileSelection(files[0]);
        });
        
        // Browse Button
        DOM.btnBrowse.addEventListener('click', () => {
            DOM.modalNativeInput.click();
        });
        
        DOM.modalNativeInput.addEventListener('change', (e) => {
            handleFileSelection(e.target.files[0]);
            e.target.value = ''; // Reset
        });

        // Existing Direct View/Remove buttons
        if (DOM.btnRemoveAvatar) DOM.btnRemoveAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            removeAvatar();
        });
        if (DOM.btnViewAvatar) DOM.btnViewAvatar.addEventListener('click', (e) => {
             e.stopPropagation();
             openLightbox();
        });
        
        // Close modal on outside click
        DOM.modal.addEventListener('click', (e) => {
            if (e.target === DOM.modal) closeAvatarModal();
        });

        // ... rest of listeners (Security, Logout, Utils) ...
    }

        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', formatPhone);
        }
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', validateEmailInput);
        }
    }

    // ==========================================
    // 6. UTILITIES & HELPERS
    // ==========================================
    
    function showToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconPath = '';
        if (type === 'success') iconPath = '<polyline points="20 6 9 17 4 12"></polyline>';
        else if (type === 'error') iconPath = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';
        else iconPath = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>';

        toast.innerHTML = `
            <div class="toast-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">${iconPath}</svg>
            </div>
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;

        DOM.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function checkPasswordStrength(val) {
        let strength = 0;
        if (val.length >= 6) strength++;
        if (val.match(/[A-Z]/)) strength++;
        if (val.match(/[0-9]/)) strength++;
        
        const bar = DOM.passStrength;
        bar.className = 'password-strength';
        if (val.length > 0) {
            if (strength === 1) bar.classList.add('strength-weak');
            else if (strength === 2) bar.classList.add('strength-medium');
            else if (strength >= 3) bar.classList.add('strength-strong');
        }
    }

    function handleSecurityUpdate() {
        const current = DOM.currentPass.value;
        const newP = DOM.newPass.value;
        const confirmP = DOM.confirmPass.value;

        if (!current) return showToast('Error', 'Enter current password', 'error');
        if (newP.length < 6) return showToast('Error', 'New password must be > 6 chars', 'error');
        if (newP !== confirmP) return showToast('Error', 'Passwords do not match', 'error');

        setTimeout(() => {
            showToast('Success', 'Password updated successfully', 'success');
            DOM.securityForm.reset();
            DOM.passStrength.className = 'password-strength';
        }, 500);
    }

    function formatPhone(e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,3})/);
        if (x[1]) {
            e.target.value = !x[2] ? x[1] : `(+${x[1]}) ${x[2]}${x[3] ? ` ${x[3]}` : ''}${x[4] ? ` ${x[4]}` : ''}`;
        }
    }

    function validateEmailInput(e) {
        const valid = String(e.target.value).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        if (!valid && e.target.value) {
            showToast('Warning', 'Invalid email format', 'error');
            e.target.style.borderColor = 'var(--danger-red)';
        } else {
            e.target.style.borderColor = '';
        }
    }

    function animateStats() {
        document.querySelectorAll('.stat-details h3').forEach(stat => {
            const original = stat.innerText;
            const match = original.match(/([\d\.]+)(.*)/);
            if (!match) return;
            
            const value = parseFloat(match[1]);
            const suffix = match[2];
            let current = 0;
            const step = value / 40;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= value) {
                    clearInterval(timer);
                    stat.innerText = original;
                } else {
                    stat.innerText = (Number.isInteger(value) ? Math.floor(current) : current.toFixed(1)) + suffix;
                }
            }, 30);
        });
    }

    function renderActivityTimeline() {
        const activities = [
            { type: 'post', content: 'Published a new blog post <strong>"Top 10 Media Trends"</strong>', time: '2 hours ago' },
            { type: 'comment', content: 'Commented on <strong>User123\'s</strong> video', time: '5 hours ago' },
            { type: 'login', content: 'Logged in from <strong>Chrome on Windows</strong>', time: '1 day ago' },
            { type: 'engagement', content: 'Liked <strong>"UI Design Principles"</strong>', time: '2 days ago' }
        ];

        const container = DOM.timelineContainer;
        if (!container) return;
        container.innerHTML = '';

        activities.forEach(act => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            let iconCode = ''; 
            // Simplified icon mapping
            if (act.type === 'post') iconCode = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>';
            else if (act.type === 'comment') iconCode = '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>';
            else if (act.type === 'login') iconCode = '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline>';
            else iconCode = '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>';

            item.innerHTML = `
                <div class="timeline-icon ${act.type}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${iconCode}</svg>
                </div>
                <div class="timeline-content">
                    <p>${act.content}</p>
                    <span class="timeline-time">${act.time}</span>
                </div>
            `;
            container.appendChild(item);
        });
    }

    // Run Init
    init();
});

