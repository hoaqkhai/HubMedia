// ==================== SIMPLE CHART LIBRARY ====================
class Chart {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        const rect = canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * 2;
        this.canvas.height = rect.height * 2;
        this.ctx.scale(2, 2);
    }

    drawAreaChart(data, color = '#4A90E2') {
        const width = this.canvas.width / 2;
        const height = this.canvas.height / 2;
        const padding = 20;
        const chartHeight = height - padding * 2;
        const chartWidth = width - padding * 2;
        
        const max = Math.max(...data);
        const step = chartWidth / (data.length - 1);
        
        // Draw area
        this.ctx.beginPath();
        this.ctx.moveTo(padding, height - padding);
        
        data.forEach((value, i) => {
            const x = padding + i * step;
            const y = height - padding - (value / max) * chartHeight;
            this.ctx.lineTo(x, y);
        });
        
        this.ctx.lineTo(padding + chartWidth, height - padding);
        this.ctx.closePath();
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, color + '80');
        gradient.addColorStop(1, color + '10');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw line
        this.ctx.beginPath();
        data.forEach((value, i) => {
            const x = padding + i * step;
            const y = height - padding - (value / max) * chartHeight;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        });
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawBarChart(data) {
        const width = this.canvas.width / 2;
        const height = this.canvas.height / 2;
        const padding = 20;
        const chartHeight = height - padding * 2;
        const barWidth = (width - padding * 2) / (data.length * 2);
        
        const max = Math.max(...data.map(d => Math.max(...d.values)));
        
        data.forEach((group, groupIndex) => {
            group.values.forEach((value, barIndex) => {
                const x = padding + groupIndex * barWidth * 4 + barIndex * barWidth;
                const barHeight = (value / max) * chartHeight;
                const y = height - padding - barHeight;
                
                this.ctx.fillStyle = group.colors[barIndex];
                this.ctx.fillRect(x, y, barWidth * 0.8, barHeight);
            });
        });
    }

    drawLineChart(data, color = '#00BCD4') {
        const width = this.canvas.width / 2;
        const height = this.canvas.height / 2;
        const padding = 10;
        const chartHeight = height - padding * 2;
        const chartWidth = width - padding * 2;
        
        const max = Math.max(...data);
        const step = chartWidth / (data.length - 1);
        
        this.ctx.beginPath();
        data.forEach((value, i) => {
            const x = padding + i * step;
            const y = height - padding - (value / max) * chartHeight;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        });
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawDoughnutChart(data, colors) {
        const width = this.canvas.width / 2;
        const height = this.canvas.height / 2;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;
        const innerRadius = radius * 0.6;
        
        const total = data.reduce((a, b) => a + b, 0);
        let currentAngle = -Math.PI / 2;
        
        data.forEach((value, index) => {
            const sliceAngle = (value / total) * Math.PI * 2;
            
            this.ctx.fillStyle = colors[index];
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            this.ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            this.ctx.closePath();
            this.ctx.fill();
            
            currentAngle += sliceAngle;
        });
        
        // Center circle
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Icon in center
        this.ctx.fillStyle = '#E9ECEF';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, innerRadius * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawMiniSparkline(data, color = '#00C853') {
        const width = this.canvas.width / 2;
        const height = this.canvas.height / 2;
        const max = Math.max(...data);
        const step = width / (data.length - 1);
        
        this.ctx.beginPath();
        data.forEach((value, i) => {
            const x = i * step;
            const y = height - (value / max) * height;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        });
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
}

// ==================== DATA ====================
// Data related to Home page activities and Schedule page events
const trendingAds = [
    { 
        title: 'Weekly Deals Post - Facebook & Zalo', 
        date: 'Published on Mon, 10:00 AM (from Schedule)', 
        value: '245K', 
        data: [4, 6, 5, 7, 6, 8, 7] 
    },
    { 
        title: 'Product Review Video - YouTube', 
        date: 'Published 2 days ago (from Recent Activities)', 
        value: '189K', 
        data: [3, 5, 4, 6, 5, 7, 6] 
    },
    { 
        title: 'Cooking with Chef John - Livestream', 
        date: 'Scheduled for Wed, 5:00 PM (from Home)', 
        value: '156K', 
        data: [5, 7, 6, 8, 7, 9, 8] 
    },
    { 
        title: 'New Arrivals Livestream - TikTok & YouTube', 
        date: 'Scheduled for Wed, 7:00 PM (from Schedule)', 
        value: '134K', 
        data: [4, 5, 6, 7, 6, 8, 7] 
    },
    { 
        title: 'Product Showcase Video - Multi-platform', 
        date: 'Scheduled for Fri, 2:00 PM (from Schedule)', 
        value: '112K', 
        data: [3, 4, 5, 6, 5, 7, 6] 
    }
];


const goalData = [
    { platform: 'YouTube', type: 'Subscribers', value: '45.2K/50K', icon: 'Y', color: 'instagram' },
    { platform: 'Facebook', type: 'Followers', value: '38.5K/40K', icon: 'F', color: 'facebook' },
    { platform: 'TikTok', type: 'Engagement', value: '22.1K/25K', icon: 'T', color: 'twitter' },
    { platform: 'Zalo', type: 'Followers', value: '15.8K/20K', icon: 'Z', color: 'instagram' }
];

const performedCampaigns = [
    { 
        id: '#CONTENT001', 
        title: 'Weekly Deals Promotion Campaign (Mon 10:00 AM)', 
        conversion: '6.8%', 
        engagement: '245K' 
    },
    { 
        id: '#CONTENT002', 
        title: 'Product Review Series (Recent Activities)', 
        conversion: '5.2%', 
        engagement: '189K' 
    },
    { 
        id: '#CONTENT003', 
        title: 'Live Streaming Events (Multi-platform)', 
        conversion: '8.9%', 
        engagement: '156K' 
    },
    { 
        id: '#CONTENT004', 
        title: 'Weekend Special Livestream (Sat 8:00 PM)', 
        conversion: '7.3%', 
        engagement: '198K' 
    }
];

// ==================== COUNTER ANIMATION ====================
function animateValue(element, target, duration = 2000, suffix = '') {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (target >= 1000000) {
            element.textContent = (current / 1000).toFixed(0) + ',123k';
        } else if (target >= 1000) {
            element.textContent = (current / 1000).toFixed(0) + 'K';
        } else {
            element.textContent = Math.floor(current).toLocaleString() + suffix;
        }
    }, 16);
}

// ==================== RENDER FUNCTIONS ====================
function renderTrendingAds() {
    const container = document.getElementById('trendingList');
    container.innerHTML = '';
    
    trendingAds.forEach(ad => {
        const item = document.createElement('div');
        item.className = 'trending-item';
        item.innerHTML = `
            <div class="trending-content">
                <h4>${ad.title}</h4>
                <p>${ad.date}</p>
            </div>
            <div class="trending-stats">
                <canvas class="trending-chart" width="60" height="30"></canvas>
                <div class="trending-value">${ad.value}</div>
            </div>
        `;
        container.appendChild(item);
        
        // Draw mini chart
        const canvas = item.querySelector('canvas');
        const chart = new Chart(canvas);
        chart.drawMiniSparkline(ad.data);
    });
}

function renderGoals() {
    const container = document.getElementById('goalList');
    container.innerHTML = '';
    
    goalData.forEach(goal => {
        const item = document.createElement('div');
        item.className = 'goal-item';
        item.innerHTML = `
            <div class="goal-platform">
                <div class="platform-icon ${goal.color}">${goal.icon}</div>
                <div class="platform-info">
                    <h4>${goal.platform}</h4>
                    <p>${goal.type}</p>
                </div>
            </div>
            <div class="goal-value">${goal.value}</div>
        `;
        container.appendChild(item);
    });
}

function renderPerformed() {
    const container = document.getElementById('performedList');
    container.innerHTML = '';
    
    performedCampaigns.forEach(campaign => {
        const item = document.createElement('div');
        item.className = 'performed-item';
        item.innerHTML = `
            <div class="performed-header">
                <span class="performed-id">${campaign.id}</span>
            </div>
            <div class="performed-title">${campaign.title}</div>
            <div class="performed-stats">
                <div class="performed-stat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <polyline points="17 11 19 13 23 9"></polyline>
                    </svg>
                    Conversion: ${campaign.conversion}
                </div>
                <div class="performed-stat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Engagement: ${campaign.engagement}
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

// ==================== TAB SWITCHING ====================
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', function() {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        showNotification(`Switched to ${this.textContent} view`, 'info');
        setTimeout(() => initCharts(), 300);
    });
});

// Download button handler
const downloadBtn = document.querySelector('.btn-download');
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        showNotification('Downloading CSV file...', 'info');
        setTimeout(() => showNotification('CSV downloaded!', 'success'), 1500);
    });
}

// ==================== INITIALIZE CHARTS ====================
function initCharts() {
    // Click Summary Chart
    const clickCanvas = document.getElementById('clickChart');
    const clickChart = new Chart(clickCanvas);
    clickChart.drawAreaChart([
        200, 400, 300, 500, 400, 600, 500, 700, 600, 800, 700, 900
    ], '#4A90E2');
    
    // Engagement Chart
    const engagementCanvas = document.getElementById('engagementChart');
    const engagementChart = new Chart(engagementCanvas);
    engagementChart.drawBarChart([
        { values: [45, 52, 3], colors: ['#FF5252', '#4A90E2', '#00BCD4'] },
        { values: [40, 48, 5], colors: ['#FF5252', '#4A90E2', '#00BCD4'] },
        { values: [50, 45, 2], colors: ['#FF5252', '#4A90E2', '#00BCD4'] },
        { values: [42, 50, 4], colors: ['#FF5252', '#4A90E2', '#00BCD4'] },
        { values: [48, 46, 3], colors: ['#FF5252', '#4A90E2', '#00BCD4'] },
        { values: [45, 52, 3], colors: ['#FF5252', '#4A90E2', '#00BCD4'] },
        { values: [47, 49, 2], colors: ['#FF5252', '#4A90E2', '#00BCD4'] }
    ]);
    
    // Balance Chart
    const balanceCanvas = document.getElementById('balanceChart');
    const balanceChart = new Chart(balanceCanvas);
    balanceChart.drawLineChart([20, 40, 30, 50, 45, 60, 55, 70], '#00C853');
    
    // Campaign Chart
    const campaignCanvas = document.getElementById('campaignChart');
    const campaignChart = new Chart(campaignCanvas);
    campaignChart.drawLineChart([30, 50, 45, 60, 55, 70, 65, 80], '#00C853');
    
    // Target Chart
    const targetCanvas = document.getElementById('targetChart');
    const targetChart = new Chart(targetCanvas);
    targetChart.drawDoughnutChart(
        [35, 25, 20, 20],
        ['#4A90E2', '#FF9800', '#9C27B0', '#00C853']
    );
    
    // Insight Chart
    const insightCanvas = document.getElementById('insightChart');
    const insightChart = new Chart(insightCanvas);
    insightChart.drawLineChart([
        30, 45, 35, 50, 40, 55, 45, 60, 50, 65, 55, 70
    ], '#4A90E2');
}

// ==================== LOGOUT ====================
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        showNotification('Logging out...', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
});

// ==================== NOTIFICATION ====================
function showNotification(message, type = 'info') {
    const colors = {
        success: '#00C853',
        error: '#FF5252',
        info: '#4A90E2'
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
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== ANIMATIONS ====================
const style = document.createElement('style');
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

// ==================== LOADING STATE ====================
function showLoadingState() {
    const widgets = document.querySelectorAll('.widget');
    widgets.forEach(widget => {
        widget.style.opacity = '0.5';
        widget.style.pointerEvents = 'none';
    });
}

function hideLoadingState() {
    const widgets = document.querySelectorAll('.widget');
    widgets.forEach(widget => {
        widget.style.opacity = '1';
        widget.style.pointerEvents = 'auto';
    });
}

// ==================== DATA REFRESH ====================
function refreshData() {
    showLoadingState();
    showNotification('Refreshing data...', 'info');
    
    setTimeout(() => {
        // Re-animate counters
        animateValue(document.getElementById('clickCount'), 1200 + Math.floor(Math.random() * 100));
        animateValue(document.getElementById('balance'), 244.55 + Math.random() * 10, 2000, '.55');
        animateValue(document.getElementById('campaignCount'), 124 + Math.floor(Math.random() * 10));
        
        // Re-render lists
        renderTrendingAds();
        renderGoals();
        renderPerformed();
        
        hideLoadingState();
        showNotification('Data refreshed successfully!', 'success');
    }, 1500);
}

// Add refresh button functionality
window.addEventListener('load', () => {
    // Add keyboard shortcut for refresh (Ctrl+R or Cmd+R)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshData();
        }
    });
});

// ==================== INITIALIZATION ====================
window.addEventListener('load', () => {
    // Animate counters
    animateValue(document.getElementById('clickCount'), 1200);
    animateValue(document.getElementById('balance'), 244.55, 2000, '.55');
    animateValue(document.getElementById('campaignCount'), 124);
    
    // Initialize charts
    initCharts();
    
    // Render lists
    renderTrendingAds();
    renderGoals();
    renderPerformed();
    
    showNotification('Analytics dashboard loaded', 'success');
    
    // Auto-refresh data every 5 minutes
    setInterval(() => {
        refreshData();
    }, 300000); // 5 minutes
});

// Resize charts on window resize
window.addEventListener('resize', () => {
    initCharts();
});
