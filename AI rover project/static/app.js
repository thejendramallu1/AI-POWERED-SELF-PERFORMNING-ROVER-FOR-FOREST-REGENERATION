// Mock Data configuration for Rovers
let rovers = [
    { id: 'RX-01', status: 'online', battery: 84, speed: 4.2, seedsPlanted: 1240, seedsAvailable: 5000, location: 'Sector 4, Alpha Zone' },
    { id: 'RX-02', status: 'online', battery: 91, speed: 3.8, seedsPlanted: 980, seedsAvailable: 4500, location: 'Sector 2, Beta Zone' },
    { id: 'RX-03', status: 'charging', battery: 12, speed: 0.0, seedsPlanted: 1850, seedsAvailable: 1200, location: 'Base Station A' },
    { id: 'RX-04', status: 'issue', battery: 54, speed: 0.0, seedsPlanted: 420, seedsAvailable: 4800, location: 'Sector 7, Rugged Terrain' },
    { id: 'RX-05', status: 'online', battery: 76, speed: 4.5, seedsPlanted: 1105, seedsAvailable: 3895, location: 'Sector 1, Delta Zone' },
    { id: 'RX-06', status: 'online', battery: 65, speed: 3.2, seedsPlanted: 1300, seedsAvailable: 3700, location: 'Sector 3, Gamma Zone' },
    { id: 'RX-07', status: 'online', battery: 89, speed: 4.0, seedsPlanted: 1450, seedsAvailable: 3550, location: 'Sector 4, Alpha Zone' },
    { id: 'RX-08', status: 'online', battery: 43, speed: 3.7, seedsPlanted: 1560, seedsAvailable: 3440, location: 'Sector 5, Epsilon Zone' }
];

// App State
let activeRoverId = null;
let telemetryInterval = null;
let cameraStream = null;

// DOM Elements
const pageLogin = document.getElementById('page-login');
const pageDashboard = document.getElementById('page-dashboard');
const pageDetail = document.getElementById('page-rover-detail');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    setupLogin();
    setupNavigation();
}

// Setup Login
function setupLogin() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('login-error');

        // Simple validation
        if(username === 'admin' && password === 'admin123') {
            switchPage(pageDashboard);
            renderFleetDashboard();
        } else {
            errorMsg.textContent = "Invalid Credentials. Access Denied.";
            // Shake effect
            loginForm.parentElement.animate([
                { transform: 'translate(-50%, -50%) translateX(0)' },
                { transform: 'translate(-50%, -50%) translateX(-10px)' },
                { transform: 'translate(-50%, -50%) translateX(10px)' },
                { transform: 'translate(-50%, -50%) translateX(0)' }
            ], { duration: 300 });
        }
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('login-error').textContent = '';
        switchPage(pageLogin);
    });
}

function setupNavigation() {
    document.getElementById('btn-back').addEventListener('click', () => {
        if(telemetryInterval) clearInterval(telemetryInterval);
        stopCamera();
        switchPage(pageDashboard);
        renderFleetDashboard(); // Re-render to update dashboard stats
    });

    document.getElementById('btn-add-rover').addEventListener('click', () => {
        const newId = `RX-${String(rovers.length + 1).padStart(2, '0')}`;
        const newRover = {
            id: newId,
            status: 'online',
            battery: 100,
            speed: 0.0,
            seedsPlanted: 0,
            seedsAvailable: 5000,
            location: 'Deployment Zone'
        };
        rovers.push(newRover);
        renderFleetDashboard();
    });
}

function switchPage(targetPage) {
    [pageLogin, pageDashboard, pageDetail].forEach(p => p.classList.remove('active'));
    targetPage.classList.add('active');
}

// Fetch and Render Fleet Dashboard
async function renderFleetDashboard() {
    try {
        const grid = document.getElementById('rover-grid');
        grid.innerHTML = ''; // Clear previous
        
        document.getElementById('total-rovers-count').textContent = rovers.length;

        rovers.forEach(rover => {
            const card = document.createElement('div');
            card.className = 'rover-card';
            card.onclick = () => openRoverDetail(rover);
            
            let statusClass = 'indicator-online';
            let statusText = 'ONLINE';
            
            if (rover.status === 'charging') { statusClass = 'indicator-charging'; statusText = 'CHARGING'; }
            else if (rover.status === 'issue') { statusClass = 'indicator-issue'; statusText = 'ISSUE'; }

            card.innerHTML = `
                <div class="rc-header">
                    <h3>Rover ${rover.id}</h3>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="rc-stats">
                    <div class="rc-row">
                        <span>Battery</span>
                        <span class="rc-val">${rover.battery}%</span>
                    </div>
                    <div class="rc-row">
                        <span>Seeds Planted</span>
                        <span class="rc-val">${rover.seedsPlanted}</span>
                    </div>
                    <div class="rc-row" style="margin-top:0.5rem; font-size:0.8rem; color:var(--accent-emerald);">
                        <span class="material-symbols-outlined" style="font-size:14px; vertical-align:middle;">location_on</span>
                        ${rover.location}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        console.error("Failed to load rover data:", err);
    }
}

// Render Rover Detail
function openRoverDetail(rover) {
    activeRoverId = rover.id;
    switchPage(pageDetail);
    startCamera();
    
    document.getElementById('detail-rover-id').textContent = rover.id;
    
    // Header Status Badge
    const headerBadge = pageDetail.querySelector('.status-badge');
    headerBadge.className = 'status-badge';
    if(rover.status === 'online') { headerBadge.classList.add('indicator-online'); headerBadge.textContent = "ONLINE"; }
    else if(rover.status === 'charging') { headerBadge.classList.add('indicator-charging'); headerBadge.textContent = "CHARGING"; }
    else { headerBadge.classList.add('indicator-issue'); headerBadge.textContent = "ISSUE"; }

    // Init values
    document.getElementById('stat-session').textContent = rover.seedsPlanted.toLocaleString();
    document.getElementById('stat-available').textContent = rover.seedsAvailable.toLocaleString();
    updateGauge('battery', rover.battery);
    updateGauge('speed', rover.speed, 10); // max 10 km/h

    // Setup Logs
    const logFeed = document.getElementById('diagnostics-log');
    logFeed.innerHTML = '';
    
    addLog(`System initialized. Connect to ${rover.id}.`, 'info');
    if(rover.status === 'issue') {
        addLog(`OBSTACLE AVOIDANCE ERROR: Path blocked by large fallen tree. Attempting SLAM rerouting...`, 'error');
    } else {
        addLog(`SLAM Navigation Active. Terrain mapping online.`, 'info');
        addLog(`Camera fusion and LiDAR sync OK.`, 'info');
    }

    // Start Simulation
    if(telemetryInterval) clearInterval(telemetryInterval);
    if(rover.status === 'online') {
        telemetryInterval = setInterval(() => simulateTelemetry(rover), 2000);
    }
}

function simulateTelemetry(rover) {
    // Fluctuations
    let speedFluctuation = (Math.random() - 0.5) * 0.8;
    let newSpeed = Math.max(0, Math.min(6, rover.speed + speedFluctuation)).toFixed(1);
    
    updateGauge('speed', newSpeed, 10);
    document.getElementById('speed-value').textContent = newSpeed;

    // Simulate planting
    if(Math.random() > 0.7) {
        let plantedAmount = Math.floor(Math.random() * 5) + 1;
        rover.seedsPlanted += plantedAmount;
        rover.seedsAvailable = Math.max(0, rover.seedsAvailable - plantedAmount);
        
        document.getElementById('stat-session').textContent = rover.seedsPlanted.toLocaleString();
        document.getElementById('stat-available').textContent = rover.seedsAvailable.toLocaleString();
        
        let action = Math.random() > 0.5 ? 'Seed detected and collected.' : 'Precision planting executed.';
        addLog(`[ACTION] ${action}`, 'info');
    }

    // Overlay text
    const states = ["Targeting Optimal Soil...", "Avoiding Obstruction...", "Scanning Topography...", "Calculating Path..."];
    document.getElementById('live-feed-overlay').textContent = states[Math.floor(Math.random() * states.length)];
}

function updateGauge(type, percentage, scale = 100) {
    const circle = document.getElementById(`${type}-meter`);
    // 251.2 is the max stroke offset for length
    let mappedDash = mapRange(percentage, 0, scale, 251.2, 0); 
    circle.style.strokeDashoffset = mappedDash;

    if(type === 'battery') {
        document.getElementById('battery-value').textContent = Math.round(percentage);
        if(percentage < 20) circle.style.stroke = 'var(--accent-red)';
        else if(percentage < 50) circle.style.stroke = 'var(--accent-orange)';
        else circle.style.stroke = 'var(--accent-emerald)';
    }

    if(type === 'speed') {
         circle.style.stroke = 'var(--accent-blue)';
    }
}

function addLog(msg, type) {
    const logFeed = document.getElementById('diagnostics-log');
    const d = new Date();
    const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;

    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `<div class="log-time">[${time}]</div><div class="log-msg">${msg}</div>`;
    
    logFeed.prepend(entry);
    
    // limit logs to 50
    if(logFeed.children.length > 50) {
        logFeed.removeChild(logFeed.lastChild);
    }
}

// Utility
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// Camera functions
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraStream = stream;
        const videoElement = document.getElementById('rover-camera-feed');
        if (videoElement) {
            videoElement.srcObject = stream;
        }
        addLog('Real-time camera feed connected.', 'info');
    } catch (err) {
        console.error("Error accessing camera:", err);
        addLog('Camera access denied or hardware unavailable.', 'error');
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        const videoElement = document.getElementById('rover-camera-feed');
        if (videoElement) {
            videoElement.srcObject = null;
        }
    }
}
