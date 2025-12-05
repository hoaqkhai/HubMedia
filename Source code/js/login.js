// Toggle Password Visibility
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle eye icon
    const eyeIcon = this.querySelector('.eye-icon');
    if (type === 'text') {
        eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
    } else {
        eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
    }
});

// Form Validation
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) || email.length >= 3; // Allow username or email
}

// Password validation
function validatePassword(password) {
    return password.length >= 6;
}

// Show error
function showError(input, errorElement, message) {
    input.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

// Hide error
function hideError(input, errorElement) {
    input.classList.remove('error');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
}

// Real-time validation
emailInput.addEventListener('blur', function() {
    if (!validateEmail(this.value)) {
        showError(emailInput, emailError, 'Vui lòng nhập email hoặc tên đăng nhập hợp lệ');
    } else {
        hideError(emailInput, emailError);
    }
});

emailInput.addEventListener('input', function() {
    if (emailError.classList.contains('show')) {
        if (validateEmail(this.value)) {
            hideError(emailInput, emailError);
        }
    }
});

passwordInput.addEventListener('blur', function() {
    if (!validatePassword(this.value)) {
        showError(passwordInput, passwordError, 'Mật khẩu phải có ít nhất 6 ký tự');
    } else {
        hideError(passwordInput, passwordError);
    }
});

passwordInput.addEventListener('input', function() {
    if (passwordError.classList.contains('show')) {
        if (validatePassword(this.value)) {
            hideError(passwordInput, passwordError);
        }
    }
});

// Form submission
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Reset errors
    hideError(emailInput, emailError);
    hideError(passwordInput, passwordError);
    
    let isValid = true;
    
    // Validate email
    if (!validateEmail(emailInput.value)) {
        showError(emailInput, emailError, 'Vui lòng nhập email hoặc tên đăng nhập hợp lệ');
        isValid = false;
    }
    
    // Validate password
    if (!validatePassword(passwordInput.value)) {
        showError(passwordInput, passwordError, 'Mật khẩu phải có ít nhất 6 ký tự');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Show loading state
    const loginBtn = this.querySelector('.btn-login');
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    
    // Simulate API call
    try {
        await simulateLogin(emailInput.value, passwordInput.value);
        
        // Success - redirect to dashboard
        showSuccessMessage();
        setTimeout(() => {
            window.location.href = 'Index.html';
        }, 1500);
        
    } catch (error) {
        // Error handling
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        showError(passwordInput, passwordError, error.message);
    }
});

// Simulate login API call
function simulateLogin(email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Demo credentials
            if (email === 'admin' || email === 'admin@example.com') {
                if (password === 'admin123' || password === 'password') {
                    resolve({ success: true });
                } else {
                    reject({ message: 'Mật khẩu không chính xác' });
                }
            } else {
                // For demo, accept any valid input
                resolve({ success: true });
            }
        }, 1500);
    });
}

// Success message
function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #00C853, #00A344);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0, 200, 83, 0.3);
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.5s ease;
    `;
    successDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Đăng nhập thành công!</span>
        </div>
    `;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => successDiv.remove(), 500);
    }, 1000);
}

// Social login handlers
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
        
        // Add loading animation
        this.style.opacity = '0.6';
        this.style.pointerEvents = 'none';
        
        // Simulate social login
        setTimeout(() => {
            alert(`Đăng nhập với ${provider} đang được phát triển...`);
            this.style.opacity = '1';
            this.style.pointerEvents = 'auto';
        }, 800);
    });
});

// Forgot password handler
document.querySelector('.forgot-password').addEventListener('click', function(e) {
    e.preventDefault();
    
    const email = prompt('Vui lòng nhập email của bạn để khôi phục mật khẩu:');
    
    if (email && validateEmail(email)) {
        showNotification('Đã gửi link khôi phục mật khẩu đến email của bạn!', 'success');
    } else if (email) {
        showNotification('Email không hợp lệ!', 'error');
    }
});

// Signup link handler
// Signup link handler - Default behavior (navigation) is sufficient

// Notification helper
function showNotification(message, type = 'info') {
    const colors = {
        success: 'linear-gradient(135deg, #00C853, #00A344)',
        error: 'linear-gradient(135deg, #FF4444, #CC0000)',
        info: 'linear-gradient(135deg, #0066FF, #0052CC)'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.5s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Auto-focus first input
window.addEventListener('load', () => {
    emailInput.focus();
});

// Prevent multiple form submissions
let isSubmitting = false;
loginForm.addEventListener('submit', function(e) {
    if (isSubmitting) {
        e.preventDefault();
        return false;
    }
});

// Enter key support for better UX
emailInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        passwordInput.focus();
    }
});

// Remember me functionality
const rememberCheckbox = document.getElementById('remember');
const savedEmail = localStorage.getItem('rememberedEmail');

if (savedEmail) {
    emailInput.value = savedEmail;
    rememberCheckbox.checked = true;
}

rememberCheckbox.addEventListener('change', function() {
    if (this.checked && emailInput.value) {
        localStorage.setItem('rememberedEmail', emailInput.value);
    } else {
        localStorage.removeItem('rememberedEmail');
    }
});

// Save email when checkbox is checked
emailInput.addEventListener('blur', function() {
    if (rememberCheckbox.checked && this.value) {
        localStorage.setItem('rememberedEmail', this.value);
    }
});
