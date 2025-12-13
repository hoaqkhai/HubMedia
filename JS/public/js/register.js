// Toggle Password Visibility
function setupPasswordToggle(toggleId, inputId) {
    const toggleBtn = document.getElementById(toggleId);
    const input = document.getElementById(inputId);

    if (!toggleBtn || !input) return;

    toggleBtn.addEventListener("click", function () {
        const type = input.getAttribute("type") === "password" ? "text" : "password";
        input.setAttribute("type", type);
    });
}

setupPasswordToggle("togglePassword", "password");
setupPasswordToggle("toggleConfirmPassword", "confirmPassword");

// Form Elements
const registerForm = document.getElementById("registerForm");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

// Submit Handler
registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Validate Password Match
    if (password !== confirmPassword) {
        return showNotification("Mật khẩu không khớp", "error");
    }

    // Validate Username Not Empty
    if (!username || username.length < 4) {
        return showNotification("Tên đăng nhập phải có ít nhất 4 ký tự!", "error");
    }

    // Button Loading State
    const btn = this.querySelector(".btn-register");
    btn.classList.add("loading");
    btn.disabled = true;

    // Create Payload
    const payload = {
        full_name: `${firstName} ${lastName}`,
        email,
        username,
        password
    };

    try {
        const res = await fetch("/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            btn.classList.remove("loading");
            btn.disabled = false;
            return showNotification(data.msg || "Lỗi không xác định", "error");
        }

        // Success Animation / Message
        showSuccessMessage();

        setTimeout(() => {
            window.location.href = "/login.html";
        }, 2000);

    } catch (err) {
        console.error(err);
        showNotification("Lỗi kết nối đến server", "error");
        btn.classList.remove("loading");
        btn.disabled = false;
    }
});

// Notification System
function showNotification(message, type = "info") {
    alert(message);
}

// Success Popup
function showSuccessMessage() {
    alert("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
}
