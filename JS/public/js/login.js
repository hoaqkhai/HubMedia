document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        console.error("Không tìm thấy form login");
        return;
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value;

        const payload = { email, password };

        // Hiển thị loading (nếu bạn có)
        const loginBtn = document.querySelector(".btn-login");
        loginBtn.classList.add("loading");

        try {
            const response = await fetch("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log("🔵 Kết quả từ backend:", result);

            if (!result.success) {
                alert(result.message || "Đăng nhập thất bại");
                loginBtn.classList.remove("loading");
                return;
            }

            // *** DÙNG SESSION – KHÔNG DÙNG TOKEN ***
            // => Không lưu token vào localStorage nữa

            alert("🎉 Đăng nhập thành công!");

            window.location.href = "/"; // hoặc /dashboard nếu bạn có

        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            alert("Không thể kết nối đến server!");
        }

        loginBtn.classList.remove("loading");
    });
});
