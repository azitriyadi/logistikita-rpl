// State Machine
let currentRole = 'admin';

// Element Grabbers
const btnAdmin = document.getElementById('btnAdminSide');
const btnFinance = document.getElementById('btnFinanceSide');
const menuContent = document.getElementById('sidebar-menu-content');
const roleLabel = document.getElementById('currentRoleLabel');

const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const accountOverlay = document.getElementById('accountOverlay');

// Nav Links Data
const adminLinks = `
    <div class="sidebar-item active" data-target="admin-view"><i class="fas fa-chart-line"></i> Dashboard</div>
    <div class="sidebar-item" data-target="shipments-view"><i class="fas fa-box"></i> Pengiriman</div>
    <div class="sidebar-item" data-target="fleet-view"><i class="fas fa-truck"></i> Armada</div>
    <div class="sidebar-item" data-target="couriers-view"><i class="fas fa-id-card"></i> Kurir</div>
    <div class="sidebar-item" data-target="accounts-view"><i class="fas fa-user-shield"></i> Manajemen Akun</div>
    <div class="sidebar-item" data-target="customers-view"><i class="fas fa-users"></i> Pelanggan</div>
    <div class="sidebar-item" data-target="reports-view"><i class="fas fa-file-invoice"></i> Laporan</div>
`;

const financeLinks = `
    <div class="sidebar-item finance-active active" data-target="finance-view"><i class="fas fa-chart-line"></i> Dashboard Keuangan</div>
    <div class="sidebar-item finance-active" data-target="settlement-view"><i class="fas fa-file-invoice-dollar"></i> Settlement</div>
    <div class="sidebar-item finance-active" data-target="api-view"><i class="fas fa-server"></i> API Gateway</div>
`;

// Universal Navigation Function
function navToView(targetId) {
    // Hide all sections
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(s => s.classList.remove('active'));

    // Show target section
    const target = document.getElementById(targetId);
    if (target) {
        setTimeout(() => target.classList.add('active'), 50);
    }

    // Update Sidebar Active State
    const items = document.querySelectorAll('.sidebar-item');
    items.forEach(item => {
        if (item.getAttribute('data-target') === targetId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Special: Init charts when view is shown
    if (targetId === 'finance-view') {
        setTimeout(initFinanceChart, 100);
    }

    if (window.innerWidth <= 1024) closeSidebar();
}

// Switch Role Logic
function switchToAdmin() {
    if (currentRole === 'admin') return;
    currentRole = 'admin';

    if (btnAdmin) btnAdmin.classList.add('active');
    if (btnFinance) btnFinance.classList.remove('active');
    if (roleLabel) roleLabel.innerText = 'System Admin';

    if (menuContent) menuContent.innerHTML = adminLinks;
    navToView('admin-view');
}

function switchToFinance() {
    if (currentRole === 'finance') return;
    currentRole = 'finance';

    if (btnFinance) btnFinance.classList.add('active');
    if (btnAdmin) btnAdmin.classList.remove('active');
    if (roleLabel) roleLabel.innerText = 'Finance Manager';

    if (menuContent) menuContent.innerHTML = financeLinks;
    navToView('finance-view');
}

function toggleSidebar() {
    if (sidebar) sidebar.classList.toggle('active');
    if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
}

function closeSidebar() {
    if (sidebar) sidebar.classList.remove('active');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
}

function toggleAccountOverlay(name = '') {
    if (accountOverlay) accountOverlay.classList.toggle('active');
    if (name) {
        const title = document.getElementById('overlayTitle');
        if (title) title.innerText = 'Edit Akun Pengguna';
        const userInp = document.getElementById('userName');
        if (userInp) userInp.value = name;
    } else {
        const title = document.getElementById('overlayTitle');
        if (title) title.innerText = 'Tambah Kurir';
        const userInp = document.getElementById('userName');
        if (userInp) userInp.value = '';
        const emailInp = document.getElementById('userEmail');
        if (emailInp) emailInp.value = '';
        const passInp = document.getElementById('userPassword');
        if (passInp) passInp.value = '';
    }
}

function saveUser() {
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const role = document.getElementById('userRole').value;
    const password = document.getElementById('userPassword').value;

    if (!name || !email || !password) {
        Swal.fire('Error', 'Semua kolom wajib diisi!', 'error');
        return;
    }

    fetch('http://localhost/logistikita/index.php?request=api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Akun Disimpan',
                text: 'Akun kurir berhasil dibuat.',
                confirmButtonColor: 'var(--brand-primary)'
            });
            toggleAccountOverlay();
            loadUsers(); // Refresh table
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    })
    .catch(err => Swal.fire('Error', 'Gagal terhubung ke server', 'error'));
}

function loadUsers() {
    fetch('http://localhost/logistikita/index.php?request=api/auth/users')
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            const tbody = document.getElementById('accounts-table-body');
            const cbody = document.getElementById('couriers-table-body');
            if (tbody) tbody.innerHTML = '';
            if (cbody) cbody.innerHTML = '';
            
            let kurirCount = 0;
            data.data.forEach(user => {
                // For Accounts View
                if (tbody) {
                    let roleBadge = user.role === 'admin' ? '<span class="status-pill" style="background:#ef4444; color:white;">Admin</span>' : 
                                   user.role === 'kurir' ? '<span class="status-pill status-processing">Kurir</span>' : 
                                   '<span class="status-pill status-pending">User</span>';
                    
                    tbody.innerHTML += `
                        <tr>
                            <td><span class="text-bold">UID-${user.id}</span></td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${roleBadge}</td>
                            <td><span class="status-pill status-success">Aktif</span></td>
                            <td style="text-align: right;"><button class="btn-ghost">Edit</button></td>
                        </tr>
                    `;
                }

                // For Couriers View
                if (user.role === 'kurir') {
                    kurirCount++;
                    if (cbody) {
                        cbody.innerHTML += `
                            <tr>
                                <td>
                                    <div style="display:flex; align-items:center; gap:12px;">
                                        <div style="width:36px; height:36px; border-radius:50%; background:#1e293b; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold;">
                                            ${user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div class="text-bold">${user.name}</div>
                                            <div class="text-sub">${user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>KR-${user.id}00${user.id}</td>
                                <td>Seluruh Area</td>
                                <td><span class="text-bold">0</span> Paket</td>
                                <td><span class="status-pill status-pending">Standby</span></td>
                                <td style="text-align: right;"><button class="btn-ghost"><i class="fas fa-comment-dots"></i></button></td>
                            </tr>
                        `;
                    }
                }
            });

            if (cbody && cbody.innerHTML === '') {
                cbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Belum ada kurir terdaftar di sistem.</td></tr>';
            }

            const kpiTotal = document.getElementById('kpi-kurir-total');
            if (kpiTotal) kpiTotal.innerText = kurirCount;
            const kpiStandby = document.getElementById('kpi-kurir-standby');
            if (kpiStandby) kpiStandby.innerText = kurirCount; // All standby for now
        }
    });
}

function loadSystemLogs() {
    fetch('http://localhost/logistikita/index.php?request=api/logistikita/system_logs')
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            const consoleEl = document.getElementById('api-logs-console');
            if (consoleEl) {
                consoleEl.innerHTML = '';
                if (data.data.length === 0) {
                    consoleEl.innerHTML = '<div style="color: #64748b;">[System] Tidak ada log aktivitas terbaru...</div>';
                    return;
                }
                
                data.data.forEach(log => {
                    // Parse timestamp to time only
                    const date = new Date(log.timestamp);
                    const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
                    
                    let color = '#10b981'; // green for success/transit/delivered
                    if (log.status === 'pending') color = '#f59e0b';
                    else if (log.status === 'error' || log.status === 'batal') color = '#ef4444';

                    consoleEl.innerHTML += `<div style="color: ${color};">[${time}] EVENT /shipment/update - Resi: ${log.resi} -> ${log.status.toUpperCase()} (${log.lokasi})</div>`;
                });
                
                consoleEl.innerHTML += `<div style="color: #64748b;">[${new Date().toLocaleTimeString('id-ID')}] Waiting for upstream events...</div>`;
            }
        }
    })
    .catch(err => console.error("Error fetching logs:", err));
}

// Delegation for sidebar items
document.addEventListener('click', (e) => {
    const sidebarItem = e.target.closest('.sidebar-item');
    if (sidebarItem) {
        const target = sidebarItem.getAttribute('data-target');
        if (target) navToView(target);
    }
});

// Batch Approval Logic with Tab Filtering
const selectAll = document.getElementById('selectAllRequests');
const batchBar = document.getElementById('batchBar');
const batchCount = document.getElementById('batchCount');
const statusTabs = document.querySelectorAll('.status-tab');
const tableRows = document.querySelectorAll('#approvalTableBody tr');

function updateBatchBar() {
    // Count checked boxes only for VISIBLE rows
    const checkedCount = Array.from(tableRows).filter(row =>
        row.style.display !== 'none' &&
        row.querySelector('.request-check') &&
        row.querySelector('.request-check').checked
    ).length;

    if (batchBar && batchCount) {
        if (checkedCount > 0) {
            batchBar.style.display = 'flex';
            batchCount.innerText = checkedCount;
        } else {
            batchBar.style.display = 'none';
        }
    }
}

// Tab Switching Logic
statusTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter');

        // Update active tab UI
        statusTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Filter rows
        tableRows.forEach(row => {
            if (filter === 'all' || row.getAttribute('data-status') === filter) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
                const check = row.querySelector('.request-check');
                if (check) check.checked = false; // Uncheck hidden rows
            }
        });

        if (selectAll) selectAll.checked = false;
        updateBatchBar();
    });
});

if (selectAll) {
    selectAll.addEventListener('change', () => {
        tableRows.forEach(row => {
            if (row.style.display !== 'none') {
                const check = row.querySelector('.request-check');
                if (check) check.checked = selectAll.checked;
            }
        });
        updateBatchBar();
    });
}

// Listen for individual check changes
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('request-check')) {
        updateBatchBar();
    }
});

// Leaflet Map Initialization
let map;
function initMap() {
    if (document.getElementById('map') && typeof L !== 'undefined') {
        // Center on Indonesia (Java region)
        if (!map) {
            map = L.map('map').setView([-6.2088, 106.8456], 7);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
        }

        // Custom Icon
        const truckIcon = L.divIcon({
            className: 'custom-marker',
            html: '<i class="fas fa-truck"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        // Clear existing markers if any
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Add active transit markers dynamically
        if (window.activeTransits && window.activeTransits.length > 0) {
            window.activeTransits.forEach((loc, index) => {
                const latOffset = (Math.random() - 0.5) * 2; 
                const lngOffset = (Math.random() - 0.5) * 2; 
                
                const lat = -6.2088 + latOffset;
                const lng = 106.8456 + lngOffset;

                L.marker([lat, lng], { icon: truckIcon })
                    .addTo(map)
                    .bindPopup(`<b>${loc.resi}</b><br>Tujuan: ${loc.penerima_nama}<br>Status: Moving`);
            });
        }
    }
}

let financeChartInstance = null;
function initFinanceChart(grossArray = [0, 0, 0, 0, 0, 0, 0], settlementArray = [0, 0, 0, 0, 0, 0, 0]) {
    const ctx = document.getElementById('financeChart');
    if (ctx && typeof Chart !== 'undefined') {
        if (financeChartInstance) {
            financeChartInstance.destroy();
        }
        financeChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                datasets: [{
                    label: 'Gross Revenue (Juta Rp)',
                    data: grossArray,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#10b981'
                }, {
                    label: 'Settlement (Juta Rp)',
                    data: settlementArray,
                    borderColor: '#e11d48',
                    backgroundColor: 'rgba(225, 29, 72, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#e11d48'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: { family: 'Outfit', weight: 'bold' },
                            usePointStyle: true,
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: { font: { family: 'Outfit' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Outfit' } }
                    }
                }
            }
        });
    }
}

// Fetch Admin Data
function loadAdminData() {
    const userSession = localStorage.getItem('user');
    if (!userSession) {
        window.location.href = 'auth';
        return;
    }
    const user = JSON.parse(userSession);
    if (user.role !== 'admin') {
        window.location.href = 'auth';
        return;
    }

    const userNameEl = document.querySelector('.user-name');
    if (userNameEl) userNameEl.innerText = user.name;

    fetch('http://localhost/logistikita/index.php?request=api/logistikita/daftar_pengiriman&type=all')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                const tbody = document.getElementById('approvalTableBody');
                if (tbody) tbody.innerHTML = '';
                const pengiriman = data.data;

                const kpiTotal = document.getElementById('kpi-total');
                if (kpiTotal) kpiTotal.innerText = pengiriman.length;

                let pendingCount = 0;
                let transitCount = 0;
                let deliveredCount = 0;
                let grossRevenue = 0;
                let miniGridHtml = '';
                let fleetHtml = '';
                let shipmentsHtml = '';
                window.activeTransits = []; // For Map

                pengiriman.forEach(item => {
                    grossRevenue += parseFloat(item.biaya_ongkir) + parseFloat(item.biaya_layanan || 0) + parseFloat(item.asuransi || 0);

                    let dateObj = new Date(item.created_at || Date.now());
                    let dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

                    let statusHtml = '';
                    if (item.status === 'pending') {
                        statusHtml = '<span class="status-pill status-pending">Menunggu Verifikasi</span>';
                    } else if (item.status === 'delivered') {
                        statusHtml = '<span class="status-pill status-success">Terkirim</span>';
                    } else {
                        statusHtml = `<span class="status-pill status-processing">${item.status.toUpperCase()}</span>`;
                    }

                    if (item.status === 'pending') pendingCount++;
                    if (item.status === 'transit') {
                        transitCount++;
                        window.activeTransits.push(item);
                        miniGridHtml += `
                                <tr>
                                    <td>${item.resi}</td>
                                    <td>${item.penerima_nama.substring(0, 10)}...</td>
                                    <td><span class="dot-online"></span></td>
                                </tr>
                            `;
                        fleetHtml += `
                                <tr>
                                    <td><span class="text-bold">${item.resi}</span></td>
                                    <td>Kurir LogistiKita</td>
                                    <td>Sistem Pusat</td>
                                    <td>Menuju Tujuan</td>
                                    <td>-</td>
                                    <td><span class="status-pill status-processing">Moving</span></td>
                                </tr>
                            `;
                    }
                    if (item.status === 'delivered') deliveredCount++;

                    shipmentsHtml += `
                            <tr>
                                <td><span class="text-bold">${item.resi}</span></td>
                                <td>Client ${item.user_id}</td>
                                <td>${item.penerima_nama}</td>
                                <td><span class="text-bold">${item.layanan || item.nama_layanan || '-'}</span></td>
                                <td>${statusHtml}</td>
                                <td>${dateStr}</td>
                                <td><button class="btn-ghost">Detail</button></td>
                            </tr>
                        `;

                    let actionHtml = '';
                    if (item.status === 'pending') {
                        actionHtml = `<button class="btn-action-primary" onclick="updateStatus('${item.resi}', 'menunggu_pickup')"><i class="fas fa-check"></i> Terima</button>`;
                    } else if (item.status === 'menunggu_pickup') {
                        actionHtml = `<button class="btn-action-primary" style="background-color:#3b82f6;" onclick="updateStatus('${item.resi}', 'transit')"><i class="fas fa-truck"></i> Kirim</button>`;
                    } else if (item.status === 'transit') {
                        actionHtml = `<button class="btn-action-primary" style="background-color:#10b981;" onclick="updateStatus('${item.resi}', 'delivered')"><i class="fas fa-check-double"></i> Selesai</button>`;
                    } else {
                        actionHtml = `<button class="btn-action-secondary" disabled>Sudah Diterima</button>`;
                    }

                    if (tbody) {
                        tbody.innerHTML += `
                                <tr data-status="${item.status}">
                                    <td class="check-col"><input type="checkbox" class="custom-checkbox request-check"></td>
                                    <td>
                                        <div style="display: flex; flex-direction: column;">
                                            <span class="text-bold"><span class="urgency-dot urgency-standard"></span>${item.resi}</span>
                                            <span class="text-sub">Penerima: ${item.penerima_nama}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="text-bold" style="color: var(--brand-red);">${item.nama_layanan || item.layanan_id}</span>
                                        <span class="text-sub">${item.penerima_alamat.substring(0,20)}...</span>
                                    </td>
                                    <td>${statusHtml}</td>
                                    <td style="text-align: center;">${actionHtml}</td>
                                </tr>
                            `;
                    }
                });

                if (pengiriman.length === 0 && tbody) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Belum ada permohonan pengiriman baru</td></tr>';
                }

                const kpiPending = document.getElementById('kpi-pending');
                if (kpiPending) kpiPending.innerText = pendingCount;
                const kpiArmada = document.getElementById('kpi-armada');
                if (kpiArmada) kpiArmada.innerText = transitCount;
                const kpiDelivered = document.getElementById('kpi-delivered');
                if (kpiDelivered) kpiDelivered.innerText = deliveredCount;

                const tabAll = document.getElementById('tab-count-all');
                if (tabAll) tabAll.innerText = pengiriman.length;
                const tabPending = document.getElementById('tab-count-pending');
                if (tabPending) tabPending.innerText = pendingCount;
                const tabDelivered = document.getElementById('tab-count-delivered');
                if (tabDelivered) tabDelivered.innerText = deliveredCount;

                const fleetActive = document.getElementById('fleet-active');
                if (fleetActive) fleetActive.innerText = transitCount;
                const fleetTransit = document.getElementById('fleet-transit');
                if (fleetTransit) fleetTransit.innerText = transitCount;
                const fleetArriving = document.getElementById('fleet-arriving');
                if (fleetArriving) fleetArriving.innerText = deliveredCount;

                const miniGrid = document.getElementById('mini-grid-body');
                if (miniGrid) {
                    if (miniGridHtml === '') miniGridHtml = '<tr><td colspan="3" style="text-align:center;">Tidak ada armada di jalan</td></tr>';
                    miniGrid.innerHTML = miniGridHtml;
                }

                const fleetBody = document.getElementById('fleet-table-body');
                if (fleetBody) {
                    if (fleetHtml === '') fleetHtml = '<tr><td colspan="6" style="text-align:center;">Tidak ada armada di jalan</td></tr>';
                    fleetBody.innerHTML = fleetHtml;
                }

                const shipmentsBody = document.getElementById('shipments-table-body');
                if (shipmentsBody) {
                    if (shipmentsHtml === '') shipmentsHtml = '<tr><td colspan="7" style="text-align:center;">Belum ada data pengiriman global</td></tr>';
                    shipmentsBody.innerHTML = shipmentsHtml;
                }

                const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' });
                const grossEl = document.getElementById('finance-gross');
                if (grossEl) grossEl.innerText = formatter.format(grossRevenue);
                const settleEl = document.getElementById('finance-settlement');
                if (settleEl) settleEl.innerText = formatter.format(grossRevenue * 0.1); 
                const marginEl = document.getElementById('finance-margin');
                if (marginEl) marginEl.innerText = '95.5%';

                // Update Map
                initMap();

                // Update Chart Data (Dinamic from Database)
                let gData = [0, 0, 0, 0, 0, 0, 0];
                let sData = [0, 0, 0, 0, 0, 0, 0];
                
                let today = new Date();
                today.setHours(0,0,0,0);
                
                pengiriman.forEach(item => {
                    let itemDate = new Date(item.created_at);
                    itemDate.setHours(0,0,0,0);
                    let diffTime = Math.abs(today - itemDate);
                    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays < 7) {
                        let rev = (parseFloat(item.biaya_ongkir) + parseFloat(item.biaya_layanan || 0) + parseFloat(item.asuransi || 0)) / 1000000;
                        gData[6 - diffDays] += rev; // index 6 is today, 5 is yesterday, etc.
                        sData[6 - diffDays] += rev * 0.7; // simulate settlement logic
                    }
                });

                if (gData.reduce((a, b) => a + b, 0) === 0) {
                    // Fallback visual if no revenue in last 7 days
                    gData = [0.1, 0.2, 0.15, 0.3, 0.2, 0.4, 0.5];
                    sData = gData.map(v => v * 0.7);
                }

                initFinanceChart(gData, sData);
            }
        });

    fetch('http://localhost/logistikita/index.php?request=api/logistikita/biaya_layanan_logistik')
        .then(r => r.json())
        .then(d => {
            if (d.status === 'success') {
                const totalFeeStr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(d.data.total_fee);
                const el = document.getElementById('finance-total-fee');
                if (el) el.innerText = totalFeeStr;
            }
        });

    loadUsers();
    loadSystemLogs();
}



function updateStatus(resi, newStatus) {
    Swal.fire({
        title: 'Konfirmasi',
        text: `Terima pesanan ${resi}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: 'var(--brand-primary)',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Terima!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('http://localhost/logistikita/index.php?request=api/logistikita/tracking_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resi: resi, status: newStatus, lokasi: 'Admin HQ', keterangan: 'Pesanan diverifikasi' })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        Swal.fire({
                            icon: 'success',
                            title: 'Berhasil',
                            text: 'Status berhasil diupdate!',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        loadAdminData();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal',
                            text: 'Gagal update status: ' + data.message
                        });
                    }
                })
                .catch(err => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Kesalahan',
                        text: 'Gagal terhubung ke server.'
                    });
                });
        }
    });
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initFinanceChart();
    loadAdminData();

    if (btnAdmin) btnAdmin.addEventListener('click', switchToAdmin);
    if (btnFinance) btnFinance.addEventListener('click', switchToFinance);
    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
});
