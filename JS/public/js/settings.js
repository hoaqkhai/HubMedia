// settings.js - Hub Media (No Auto-Save) + Tabs + REST Integration

/* ============================
   Helper Functions
============================ */

function showNotification(message, type = 'info', timeout = 2500) {
    const colors = {
        success: '#00C853',
        info: '#5B5FED',
        warning: '#FF9800',
        error: '#FF4444'
    };
    const popup = document.createElement('div');
    popup.className = 'notif';
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 12px 18px;
        border-radius: 10px;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 6px 18px rgba(0,0,0,0.15);
        transition: opacity .3s ease;
    `;
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 300);
    }, timeout);
}

async function safeJson(res) {
    try { return await res.json(); } catch { return null; }
}

/* ============================
   AUTH + SIDEBAR
============================ */

async function tryGetAuthProfile() {
    const res = await fetch("/auth/me", { credentials: "include" });
    if (!res.ok) return null;

    const data = await safeJson(res);
    return data?.user || null;
}

async function updateSidebar(user) {
    const footer = document.querySelector('.sidebar-footer');
    if (!footer) return;

    if (!user) {
        footer.innerHTML = `<a href="/login.html" class="btn-signin">Sign In</a>`;
        return;
    }

    const name = user.full_name || user.username || user.email || "User";

    footer.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;">
            <div style="width:40px;height:40px;border-radius:10px;background:#5B5FED;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">
                ${name[0].toUpperCase()}
            </div>
            <div style="flex:1">
                <strong>${name}</strong><br>
                <button id="logoutBtn" style="background:none;border:none;color:#777;cursor:pointer;margin-top:4px;">Logout</button>
            </div>
        </div>
    `;

    document.getElementById("logoutBtn").onclick = async () => {
        await fetch("/auth/logout", { method: "POST", credentials: "include" });
        window.location.href = "/login.html";
    };
}

/* ============================
   TAB HANDLING
============================ */

const navItems = document.querySelectorAll(".settings-nav-item");
const tabs = document.querySelectorAll(".settings-tab");

function loadTab(id) {
    if (!document.getElementById(id)) id = "general";

    navItems.forEach(i => i.classList.toggle("active", i.dataset.tab === id));
    tabs.forEach(t => t.classList.toggle("active", t.id === id));

    loadTabData(id);
}

navItems.forEach(item => {
    item.addEventListener("click", () => {
        const tab = item.dataset.tab;
        window.location.hash = tab;
        loadTab(tab);
    });
});

window.addEventListener("hashchange", () => {
    loadTab(window.location.hash.replace("#", "") || "general");
});

/* ============================
   API WRAPPER
============================ */

async function callAPI(url, method, payload, successMsg, failMsg) {
    try {
        const res = await fetch(url, {
            method,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: payload ? JSON.stringify(payload) : undefined
        });

        const data = await safeJson(res);

        if (!res.ok) {
            showNotification(failMsg + ": " + (data?.error || res.statusText), "error");
            return null;
        }

        showNotification(successMsg, "success");
        return data;
    } catch {
        showNotification(failMsg + ": Network Error", "error");
        return null;
    }
}

/* ============================
   LOAD DATA WHEN SWITCH TABS
============================ */

async function loadTabData(tab) {
    if (tab === "general") return loadGeneral();
    if (tab === "billing") return loadBilling();
    if (tab === "notifications") return loadNotifications();
    if (tab === "security") return; // no fetch needed
    if (tab === "team") return loadTeam();
    if (tab === "integrations") return loadIntegrations();
}

/* -------- General -------- */

async function loadGeneral() {
    const res = await fetch("/settings", { credentials: "include" });
    if (!res.ok) return;

    const data = await safeJson(res);
    if (!data) return;

    document.getElementById("fullName").value = data.full_name || "";
    document.getElementById("email").value = data.email || "";
}

document.getElementById("btnSaveGeneral")?.addEventListener("click", async () => {
    await callAPI(
        "/settings/profile",
        "PUT",
        {
            full_name: document.getElementById("fullName").value,
            email: document.getElementById("email").value
        },
        "Profile updated",
        "Failed to update"
    );
});

/* -------- Billing -------- */

async function loadBilling() {
    const res = await fetch("/settings", { credentials: "include" });
    const data = await safeJson(res);
    if (!data) return;

    document.getElementById("billingCard").value = data.card_number || "";
}

document.getElementById("btnSaveBilling")?.addEventListener("click", async () => {
    await callAPI(
        "/settings/billing",
        "PUT",
        { card_number: document.getElementById("billingCard").value },
        "Billing updated",
        "Failed to update billing"
    );
});

/* -------- Notifications -------- */

async function loadNotifications() {
    const res = await fetch("/settings", { credentials: "include" });
    const data = await safeJson(res);
    if (!data) return;

    document.getElementById("notifyEmail").checked = data.email_notif;
    document.getElementById("notifySMS").checked = data.sms_notif;
    document.getElementById("notifyPush").checked = data.push_notif;
}

document.getElementById("btnSaveNotifications")?.addEventListener("click", async () => {
    await callAPI(
        "/settings/notifications",
        "PUT",
        {
            email_notif: document.getElementById("notifyEmail").checked,
            sms_notif: document.getElementById("notifySMS").checked,
            push_notif: document.getElementById("notifyPush").checked
        },
        "Notifications updated",
        "Failed to update notifications"
    );
});

/* -------- Security -------- */

document.getElementById("btnUpdatePassword")?.addEventListener("click", async () => {
    const curr = document.getElementById("currentPass").value;
    const newP = document.getElementById("newPass").value;
    const confirmP = document.getElementById("confirmPass").value;

    if (newP !== confirmP) {
        showNotification("Passwords do not match!", "error");
        return;
    }

    await callAPI(
        "/settings/password",
        "PUT",
        { current_password: curr, new_password: newP },
        "Password updated",
        "Failed to update password"
    );
});

/* -------- Team -------- */

async function loadTeam() {
    const res = await fetch("/settings/team", { credentials: "include" });
    if (!res.ok) return;

    const data = await safeJson(res);
    const tbody = document.querySelector("#teamTable tbody");
    tbody.innerHTML = "";

    data.members.forEach(m => {
        tbody.innerHTML += `
            <tr>
                <td>${m.email}</td>
                <td>${m.role}</td>
                <td>${m.status}</td>
                <td><button class="btn-delete" data-email="${m.email}">Remove</button></td>
            </tr>
        `;
    });

    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.onclick = async () => {
            const email = btn.dataset.email;
            await callAPI("/settings/team/remove", "DELETE", { email }, "User removed", "Failed to remove");
            loadTeam();
        };
    });
}

document.getElementById("btnInviteTeam")?.addEventListener("click", async () => {
    const email = prompt("Enter email:");
    if (!email) return;

    await callAPI("/settings/team/invite", "POST", { email }, "Invitation sent", "Failed to invite");
    loadTeam();
});

/* -------- Integrations -------- */

async function loadIntegrations() {
    const res = await fetch("/settings/integrations", { credentials: "include" });
    if (!res.ok) return;

    const data = await safeJson(res);
    if (!data) return;

    document.querySelectorAll(".integration-item").forEach(item => {
        const name = item.dataset.platform;
        const btn = item.querySelector(".btn-connect");

        const connected = data.integrations[name]?.status === "connected";

        btn.textContent = connected ? "Connected" : "Connect";
        btn.classList.toggle("connected", connected);

        btn.onclick = async () => {
            const wantConnect = !btn.classList.contains("connected");

            await callAPI(
                `/settings/integrations/${name}`,
                "POST",
                { connected: wantConnect },
                wantConnect ? `${name} connected` : `${name} disconnected`,
                "Failed to update integration"
            );

            loadIntegrations();
        };
    });
}

/* ============================
   ON LOAD
============================ */

window.addEventListener("load", async () => {
    const user = await tryGetAuthProfile();
    updateSidebar(user);

    const tab = window.location.hash.replace("#", "") || "general";
    loadTab(tab);
});
