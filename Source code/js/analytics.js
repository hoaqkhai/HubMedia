// ==================== PROFESSIONAL CHART LIBRARY ====================
class Chart {
    constructor(canvas, config = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        const rect = canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * 2;
        this.canvas.height = rect.height * 2;
        this.ctx.scale(2, 2);
        
        this.width = rect.width;
        this.height = rect.height;
        this.padding = config.padding || { top: 20, right: 20, bottom: 30, left: 40 };
        this.chartWidth = this.width - this.padding.left - this.padding.right;
        this.chartHeight = this.height - this.padding.top - this.padding.bottom;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawGrid(horizontalCount = 5) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#E9ECEF';
        this.ctx.lineWidth = 1;

        // Horizontal Grid
        for (let i = 0; i <= horizontalCount; i++) {
            const y = this.padding.top + (this.chartHeight / horizontalCount) * i;
            this.ctx.moveTo(this.padding.left, y);
            this.ctx.lineTo(this.width - this.padding.right, y);
        }
        
        this.ctx.stroke();
    }

    drawAxes(labels, maxVal) {
        this.ctx.fillStyle = '#6C757D';
        this.ctx.font = '10px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';

        // X Axis Labels
        if (labels) {
            const step = this.chartWidth / (labels.length - 1);
            labels.forEach((label, i) => {
                const x = this.padding.left + i * step;
                if (window.innerWidth < 768 && i % 2 !== 0) return; // Skip label on mobile
                this.ctx.fillText(label, x, this.height - this.padding.bottom + 8);
            });
        }

        // Y Axis Labels
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        const steps = 5;
        for (let i = 0; i <= steps; i++) {
            const val = Math.round(maxVal - (maxVal / steps) * i);
            const y = this.padding.top + (this.chartHeight / steps) * i;
            this.ctx.fillText(val, this.padding.left - 10, y);
        }
    }

    drawAreaChart(data, labels, color = '#5B5FED') {
        this.clear();
        const max = Math.ceil(Math.max(...data) * 1.1); // add 10% headroom
        
        this.drawGrid();
        this.drawAxes(labels, max);

        const step = this.chartWidth / (data.length - 1);
        
        // Draw Fill
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding.left, this.height - this.padding.bottom);
        
        data.forEach((value, i) => {
            const x = this.padding.left + i * step;
            const y = this.padding.top + this.chartHeight - (value / max) * this.chartHeight;
            this.ctx.lineTo(x, y);
        });
        
        this.ctx.lineTo(this.width - this.padding.right, this.height - this.padding.bottom);
        this.ctx.lineTo(this.padding.left, this.height - this.padding.bottom);
        this.ctx.closePath();
        
        const gradient = this.ctx.createLinearGradient(0, this.padding.top, 0, this.height - this.padding.bottom);
        gradient.addColorStop(0, color + '40'); // 25% opacity
        gradient.addColorStop(1, color + '00'); // 0% opacity
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw Line
        this.ctx.beginPath();
        data.forEach((value, i) => {
            const x = this.padding.left + i * step;
            const y = this.padding.top + this.chartHeight - (value / max) * this.chartHeight;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.bezierCurveTo(
                x - step / 2, this.padding.top + this.chartHeight - (data[i-1] / max) * this.chartHeight,
                x - step / 2, y,
                x, y
            );
        });
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Draw Points
        this.ctx.fillStyle = '#FFFFFF';
        data.forEach((value, i) => {
            const x = this.padding.left + i * step;
            const y = this.padding.top + this.chartHeight - (value / max) * this.chartHeight;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        });
    }

    drawBarChart(datasets, labels) {
        this.clear();
        const allValues = datasets.flatMap(d => d.values);
        const max = Math.ceil(Math.max(...allValues) * 1.1);
        
        this.drawGrid();
        this.drawAxes(labels, max);

        const groupWidth = this.chartWidth / labels.length;
        const barWidth = groupWidth * 0.3; // 30% of group width
        const spacing = groupWidth * 0.1;

        datasets.forEach((dataset, setIndex) => {
            dataset.values.forEach((value, i) => {
                // Calculate center of group, then offset based on set index
                // Assuming 2 datasets for now
                const groupCenter = this.padding.left + i * groupWidth + groupWidth / 2;
                const offset = setIndex === 0 ? -(barWidth + spacing/2) : (spacing/2);
                
                const x = groupCenter + offset;
                const barHeight = (value / max) * this.chartHeight;
                const y = this.height - this.padding.bottom - barHeight;
                
                this.ctx.fillStyle = dataset.color;
                
                // Draw rounded top bar
                this.ctx.beginPath();
                this.ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
                this.ctx.fill();
            });
        });
    }

    drawDoughnutChart(data, colors, labels) {
        this.clear();
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.chartWidth, this.chartHeight) / 2;
        const innerRadius = radius * 0.75;
        
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
            
            // Draw label lines if needed, or simple legend
            currentAngle += sliceAngle;
        });
    }
}

// ==================== DATA ====================
// Mock Data for Professional Charts
const viewsData = {
    daily: [1420, 1680, 2100, 1850, 2400, 2150, 2800],
    weekly: [12500, 14200, 11800, 15600, 18900, 17500, 21000],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
};

const engagementData = {
    mobile: [65, 55, 80, 45, 70],
    desktop: [45, 35, 60, 25, 50],
    labels: ['Likes', 'Shares', 'Comments', 'Saves', 'Clicks']
};

// ==================== INITIALIZATION ====================
window.addEventListener('load', () => {
    // Animate KPI Counters
    animateCounter('clickCount', 84250);
    animateCounter('balance', 12450.50);
    animateCounter('campaignCount', 24);

    renderLists();
    initCharts();

    // Chart Periods Toggle
    document.querySelectorAll('.chart-period').forEach(btn => {
        btn.addEventListener('click', function() {
            const btns = document.querySelectorAll('.chart-period');
            btns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update Chart
            const isWeekly = this.textContent === 'Weekly';
            const canvas = document.getElementById('clickChart');
            const chart = new Chart(canvas);
            const data = isWeekly ? viewsData.weekly : viewsData.daily;
            chart.drawAreaChart(data, viewsData.labels, '#5B5FED');
        });
    });

    // Date Selectors
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// Resize handler
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initCharts, 250); // Debounce
});

// ==================== HELPER FUNCTIONS ====================
function initCharts() {
    // 1. Views Summary (Area Chart)
    const clickCanvas = document.getElementById('clickChart');
    if (clickCanvas) {
        const chart = new Chart(clickCanvas);
        chart.drawAreaChart(viewsData.daily, viewsData.labels, '#5B5FED');
    }

    // 2. Engagement (Bar Chart)
    const engCanvas = document.getElementById('engagementChart');
    if (engCanvas) {
        const chart = new Chart(engCanvas);
        chart.drawBarChart([
            { values: engagementData.mobile, color: '#5B5FED' },
            { values: engagementData.desktop, color: '#E0E1FC' }
        ], engagementData.labels);

        // Render Legend Manually
        const legend = document.getElementById('engagementLegend');
        if (legend) {
            legend.innerHTML = `
                <div class="legend-item"><span class="dot" style="background:#5B5FED"></span> Mobile</div>
                <div class="legend-item"><span class="dot" style="background:#E0E1FC"></span> Desktop</div>
            `;
        }
    }

    // 3. Target (Doughnut)
    const targetCanvas = document.getElementById('targetChart');
    if (targetCanvas) {
        const chart = new Chart(targetCanvas, { padding: { top:10, right:10, bottom:10, left:10 } });
        chart.drawDoughnutChart([35, 40, 25], ['#5B5FED', '#00C853', '#FF9800']);
    }
}

function renderLists() {
    // Trending List
    const trendingList = document.getElementById('trendingList');
    if (trendingList) {
        const trendingItems = [
            { title: 'Flash Sale Thịt Heo Sạch', type: 'Facebook', val: '24.5K', trend: '+12%' },
            { title: 'Livestream Rau Củ Giá Sốc', type: 'YouTube', val: '18.2K', trend: '+8%' },
            { title: 'Video Combo Gia Đình', type: 'TikTok', val: '12.1K', trend: '+5%' }
        ];
        
        trendingList.innerHTML = trendingItems.map(item => `
            <div class="trending-item">
                <div class="trending-content">
                    <h4>${item.title}</h4>
                    <p>${item.type}</p>
                </div>
                <div class="trending-right">
                    <div class="trending-value">${item.val}</div>
                    <span class="trend positive">${item.trend}</span>
                </div>
            </div>
        `).join('');
    }

    // Top Content List
    const performedList = document.getElementById('performedList');
    if (performedList) {
        const topItems = [
            { title: 'Khuyến Mãi Hải Sản Tươi Sống', cr: '4.2%', views: '150K' },
            { title: 'Livestream Giới Thiệu Sản Phẩm Organic', cr: '3.8%', views: '120K' },
            { title: 'Video Hướng Dẫn Nấu Món Giáng Sinh', cr: '5.1%', views: '200K' }
        ];

        performedList.innerHTML = topItems.map(item => `
            <div class="performed-item">
                <div class="performed-title">${item.title}</div>
                <div class="performed-stats">
                    <div class="stat-badge blue">CR: ${item.cr}</div>
                    <div class="stat-badge gray">Views: ${item.views}</div>
                </div>
            </div>
        `).join('');
    }

    // Goals List
    const goalList = document.getElementById('goalList');
    if (goalList) {
        const goals = [
            { name: 'Tăng Trưởng FB', val: '85%', color: '#5B5FED' },
            { name: 'Doanh Thu', val: '92%', color: '#00C853' },
            { name: 'Khách Hàng', val: '78%', color: '#FF9800' }
        ];
        
        goalList.innerHTML = goals.map(item => `
            <div class="goal-item">
                <div class="goal-info">
                    <div class="goal-dot" style="background: ${item.color}"></div>
                    <span class="goal-name">${item.name}</span>
                </div>
                <span class="goal-val">${item.val}</span>
            </div>
        `).join('');
    }
}

function animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    
    // Simple mock animation logic
    el.textContent = target.toLocaleString(); 
}

// Logout Logic
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if(confirm('Are you sure you want to logout?')) {
            window.location.href = 'login.html';
        }
    });
}
