// Settings Page Functionality

document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching Logic
    const navItems = document.querySelectorAll('.settings-nav-item');
    const tabs = document.querySelectorAll('.settings-tab');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items and tabs
            navItems.forEach(nav => nav.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));

            // Add active class to clicked item
            item.classList.add('active');

            // Show corresponding tab
            const tabId = item.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // General Settings - Save
    const saveGeneralBtn = document.getElementById('saveGeneralBtn');
    if (saveGeneralBtn) {
        saveGeneralBtn.addEventListener('click', () => {
            simulateLoading(saveGeneralBtn, 'Saving...', 'Save Changes', () => {
                showNotification('Profile updated successfully!', 'success');
            });
        });
    }

    // Notification Toggles
    const toggles = document.querySelectorAll('.switch input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            if (!this.disabled) {
                const status = this.checked ? 'enabled' : 'disabled';
                const label = this.closest('.toggle-item').querySelector('h4').textContent;
                showNotification(`${label} ${status}`, 'info');
            }
        });
    });

    // Security - Update Password
    const updatePassBtn = document.querySelector('#security .btn-secondary');
    if (updatePassBtn) {
        updatePassBtn.addEventListener('click', () => {
            simulateLoading(updatePassBtn, 'Updating...', 'Update Password', () => {
                showNotification('Password updated successfully!', 'success');
                // Clear inputs
                document.querySelectorAll('#security input[type="password"]').forEach(input => input.value = '');
            });
        });
    }

    // Billing - Manage Subscription
    const manageSubBtn = document.querySelector('#billing .btn-secondary');
    if (manageSubBtn) {
        manageSubBtn.addEventListener('click', () => {
            showNotification('Redirecting to payment portal...', 'info');
        });
    }

    // Integrations Logic (Preserved)
    const connectBtns = document.querySelectorAll('.btn-connect');
    connectBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('connected')) {
                if (confirm('Are you sure you want to disconnect this account?')) {
                    this.classList.remove('connected');
                    this.textContent = 'Connect';
                    showNotification('Account disconnected', 'info');
                }
            } else {
                this.textContent = 'Connecting...';
                this.disabled = true;
                setTimeout(() => {
                    this.classList.add('connected');
                    this.textContent = 'Connected';
                    this.disabled = false;
                    showNotification('Account connected successfully!', 'success');
                }, 1500);
            }
        });
    });

    // Team Logic (Preserved)
    const inviteBtn = document.getElementById('inviteUserBtn');
    if (inviteBtn) {
        inviteBtn.addEventListener('click', () => {
            const email = prompt('Enter email address to invite:');
            if (email && email.includes('@')) {
                showNotification(`Invitation sent to ${email}`, 'success');
            }
        });
    }

    // Delete User Handler
    document.querySelectorAll('.btn-icon.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Are you sure you want to remove this user?')) {
                const row = this.closest('tr');
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    showNotification('User removed successfully', 'success');
                }, 300);
            }
        });
    });

    // Logout Logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                showNotification('Logging out...', 'info');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        });
    }
});

// Helper function for button loading state
function simulateLoading(btn, loadingText, originalText, callback) {
    btn.textContent = loadingText;
    btn.style.opacity = '0.7';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.opacity = '1';
        btn.disabled = false;
        if (callback) callback();
    }, 1000);
}

// Notification System
function showNotification(message, type = 'info') {
    const colors = {
        success: '#00C853',
        error: '#FF5252',
        info: '#5B5FED'
    };
    
    const notification = document.createElement('div');
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
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
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
    }
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
