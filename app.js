// ============================================
// HAKIEEM MOBILE REPAIR SERVICE - Main App
// ============================================

let currentJobId = null;
let customerSignaturePad = null;
let ownerSignaturePad = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initForm();
    initFilters();
    updateDashboard();
});

// Navigation
function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            showView(view);
        });
    });
}

function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${viewName}-view`).classList.add('active');
    const navBtn = document.querySelector(`[data-view="${viewName}"]`);
    if (navBtn) navBtn.classList.add('active');
    
    if (viewName === 'dashboard') updateDashboard();
    if (viewName === 'history') updateHistory();
}

// Form handling
function initForm() {
    document.getElementById('new-job-form').addEventListener('submit', (e) => {
        e.preventDefault();
        createJob();
    });
}

function createJob() {
    const job = {
        id: generateJobId(),
        date: new Date().toISOString(),
        customer: {
            name: document.getElementById('customer-name').value,
            phone: document.getElementById('customer-phone').value,
            ic: document.getElementById('customer-ic').value
        },
        device: {
            type: document.getElementById('device-type').value,
            model: document.getElementById('device-model').value,
            imei: document.getElementById('device-imei').value,
            color: document.getElementById('device-color').value
        },
        issue: document.getElementById('issue-description').value,
        pricing: {
            componentCost: parseFloat(document.getElementById('component-cost').value) || 0,
            laborCost: parseFloat(document.getElementById('labor-cost').value) || 0,
            customerPrice: parseFloat(document.getElementById('customer-price').value) || 0
        },
        status: 'Active',
        preRepairCheck: {},
        postRepairCheck: {},
        repairNotes: '',
        signatures: {
            customer: null,
            owner: null
        }
    };
    
    saveJob(job);
    document.getElementById('new-job-form').reset();
    alert('Job created successfully! Job ID: ' + job.id);
    showView('dashboard');
}

function generateJobId() {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const jobs = getJobs();
    const todayJobs = jobs.filter(j => j.id.includes(dateStr));
    const seq = String(todayJobs.length + 1).padStart(3, '0');
    return `HMR-${dateStr}-${seq}`;
}

// Storage
function getJobs() {
    return JSON.parse(localStorage.getItem('repairJobs') || '[]');
}

function saveJob(job) {
    const jobs = getJobs();
    const index = jobs.findIndex(j => j.id === job.id);
    if (index >= 0) {
        jobs[index] = job;
    } else {
        jobs.push(job);
    }
    localStorage.setItem('repairJobs', JSON.stringify(jobs));
}

function getJob(id) {
    return getJobs().find(j => j.id === id);
}

// Dashboard
function updateDashboard() {
    const jobs = getJobs();
    const today = new Date().toDateString();
    
    const activeJobs = jobs.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled');
    const completedToday = jobs.filter(j => 
        j.status === 'Completed' && new Date(j.date).toDateString() === today
    );
    
    document.getElementById('active-jobs').textContent = activeJobs.length;
    document.getElementById('completed-today').textContent = completedToday.length;
    document.getElementById('total-jobs').textContent = jobs.length;
    
    const listEl = document.getElementById('active-jobs-list');
    if (activeJobs.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No active jobs. Click "New Job" to start.</p>';
    } else {
        listEl.innerHTML = activeJobs.map(job => createJobCard(job)).join('');
    }
}

function createJobCard(job) {
    const statusClass = job.status === 'Completed' ? 'status-completed' : 
                        job.status === 'Waiting Part' ? 'status-waiting' : 'status-active';
    const date = new Date(job.date).toLocaleDateString('ms-MY');
    
    return `
        <div class="job-card" onclick="openJob('${job.id}')">
            <div class="job-card-header">
                <span class="job-id">${job.id}</span>
                <span class="job-status ${statusClass}">${job.status}</span>
            </div>
            <div class="job-details">
                <strong>${job.customer.name}</strong> — ${job.device.type} ${job.device.model}<br>
                Issue: ${job.issue.substring(0, 80)}${job.issue.length > 80 ? '...' : ''}<br>
                Date: ${date} | Price: RM ${job.pricing.customerPrice.toFixed(2)}
            </div>
        </div>
    `;
}

// Job Detail
function openJob(jobId) {
    currentJobId = jobId;
    const job = getJob(jobId);
    if (!job) return;
    
    document.getElementById('job-title').textContent = `Job: ${job.id}`;
    
    // Job info
    document.getElementById('job-info-section').innerHTML = `
        <div class="form-grid">
            <div><strong>Customer:</strong> ${job.customer.name}</div>
            <div><strong>Phone:</strong> ${job.customer.phone}</div>
            <div><strong>Device:</strong> ${job.device.type} ${job.device.model}</div>
            <div><strong>IMEI:</strong> ${job.device.imei || 'N/A'}</div>
            <div><strong>Issue:</strong> ${job.issue}</div>
            <div><strong>Status:</strong> <span class="job-status">${job.status}</span></div>
            <div><strong>Customer Price:</strong> RM ${job.pricing.customerPrice.toFixed(2)}</div>
        </div>
    `;
    
    // Checklists
    populateChecklists(job.device.type);
    
    // Load existing checklist data
    if (job.preRepairCheck) {
        Object.entries(job.preRepairCheck).forEach(([key, val]) => {
            const cb = document.querySelector(`#pre-repair-checklist input[data-item="${key}"]`);
            if (cb) cb.checked = val;
        });
    }
    if (job.postRepairCheck) {
        Object.entries(job.postRepairCheck).forEach(([key, val]) => {
            const cb = document.querySelector(`#post-repair-checklist input[data-item="${key}"]`);
            if (cb) cb.checked = val;
        });
    }
    
    // Load repair notes
    document.getElementById('repair-notes').value = job.repairNotes || '';
    
    // Highlight active status
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.status === job.status);
    });
    
    showView('job-detail');
}

function populateChecklists(deviceType) {
    const commonItems = [
        'Screen/Display', 'Touch Response', 'Speaker', 'Microphone',
        'Camera (Front)', 'Camera (Back)', 'WiFi', 'Bluetooth',
        'Charging Port', 'Battery Health', 'Buttons', 'Vibration'
    ];
    
    const iphoneItems = [...commonItems, 'Face ID / Touch ID', 'SIM Tray', 'GPS'];
    const androidItems = [...commonItems, 'Fingerprint Sensor', 'SIM Tray', 'GPS', 'NFC'];
    
    const items = deviceType === 'iPhone' ? iphoneItems : androidItems;
    
    const preHtml = items.map(item => `
        <div class="checklist-item">
            <input type="checkbox" data-item="${item}" onchange="saveChecklist('pre')">
            <label>${item}</label>
        </div>
    `).join('');
    
    const postHtml = items.map(item => `
        <div class="checklist-item">
            <input type="checkbox" data-item="${item}" onchange="saveChecklist('post')">
            <label>${item}</label>
        </div>
    `).join('');
    
    document.getElementById('pre-repair-checklist').innerHTML = preHtml;
    document.getElementById('post-repair-checklist').innerHTML = postHtml;
}

function saveChecklist(type) {
    const job = getJob(currentJobId);
    if (!job) return;
    
    const checklistEl = document.getElementById(`${type === 'pre' ? 'pre' : 'post'}-repair-checklist`);
    const checks = {};
    checklistEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        checks[cb.dataset.item] = cb.checked;
    });
    
    if (type === 'pre') {
        job.preRepairCheck = checks;
    } else {
        job.postRepairCheck = checks;
    }
    
    saveJob(job);
}

function completePreRepair() {
    saveChecklist('pre');
    const job = getJob(currentJobId);
    job.preRepairCompleted = true;
    job.preRepairDate = new Date().toISOString();
    saveJob(job);
    alert('Pre-repair check completed!');
}

function completePostRepair() {
    saveChecklist('post');
    const job = getJob(currentJobId);
    job.postRepairCompleted = true;
    job.postRepairDate = new Date().toISOString();
    saveJob(job);
    alert('Post-repair check completed!');
}

function updateStatus(status) {
    const job = getJob(currentJobId);
    if (!job) return;
    
    job.status = status;
    if (status === 'Completed') {
        job.completedDate = new Date().toISOString();
    }
    saveJob(job);
    
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.status === status);
    });
    
    alert(`Status updated to: ${status}`);
}

function saveRepairNotes() {
    const job = getJob(currentJobId);
    if (!job) return;
    
    job.repairNotes = document.getElementById('repair-notes').value;
    saveJob(job);
    alert('Repair notes saved!');
}

function backToJobDetail() {
    if (currentJobId) {
        showView('job-detail');
        openJob(currentJobId);
    } else {
        showView('dashboard');
    }
}

// Receipt
function showReceiptPreview() {
    const job = getJob(currentJobId);
    if (!job) return;
    
    // Populate receipt
    document.getElementById('receipt-job-id').textContent = job.id;
    document.getElementById('receipt-date').textContent = new Date(job.date).toLocaleDateString('ms-MY');
    
    document.getElementById('receipt-customer-info').innerHTML = `
        <p>Name: ${job.customer.name}</p>
        <p>Phone: ${job.customer.phone}</p>
        ${job.customer.ic ? `<p>IC: ${job.customer.ic}</p>` : ''}
        <p>Device: ${job.device.type} ${job.device.model}</p>
        ${job.device.imei ? `<p>IMEI: ${job.device.imei}</p>` : ''}
    `;
    
    document.getElementById('receipt-repair-details').innerHTML = `
        <p><strong>Issue Reported:</strong> ${job.issue}</p>
        <p><strong>Repair Done:</strong> ${job.repairNotes || 'See checklist'}</p>
        <p><strong>Technician:</strong> Hakieem</p>
    `;
    
    // Pre-repair check
    const preCheckHtml = Object.entries(job.preRepairCheck || {}).map(([item, checked]) => 
        `<p>${checked ? '✓' : '✗'} ${item}: ${checked ? 'OK' : 'Issue'}</p>`
    ).join('');
    document.getElementById('receipt-pre-check').innerHTML = preCheckHtml || '<p>No pre-repair check recorded</p>';
    
    // Post-repair check
    const postCheckHtml = Object.entries(job.postRepairCheck || {}).map(([item, checked]) => 
        `<p>${checked ? '✓' : '✗'} ${item}: ${checked ? 'OK' : 'Issue'}</p>`
    ).join('');
    document.getElementById('receipt-post-check').innerHTML = postCheckHtml || '<p>No post-repair check recorded</p>';
    
    document.getElementById('receipt-total').textContent = `RM ${job.pricing.customerPrice.toFixed(2)}`;
    document.getElementById('sig-customer-name').textContent = `(${job.customer.name})`;
    
    // Init signature pads
    setTimeout(() => initSignaturePads(), 100);
    
    showView('receipt');
}

function initSignaturePads() {
    const customerCanvas = document.getElementById('customer-signature');
    const ownerCanvas = document.getElementById('owner-signature');
    
    customerSignaturePad = new SignaturePad(customerCanvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
    });
    
    ownerSignaturePad = new SignaturePad(ownerCanvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
    });
    
    // Load existing signatures
    const job = getJob(currentJobId);
    if (job && job.signatures) {
        if (job.signatures.customer) {
            customerSignaturePad.fromData(job.signatures.customer);
        }
        if (job.signatures.owner) {
            ownerSignaturePad.fromData(job.signatures.owner);
        }
    }
    
    // Save on stop drawing
    customerSignaturePad.addEventListener('endStroke', () => {
        saveSignatures();
    });
    
    ownerSignaturePad.addEventListener('endStroke', () => {
        saveSignatures();
    });
}

function saveSignatures() {
    const job = getJob(currentJobId);
    if (!job) return;
    
    job.signatures = {
        customer: customerSignaturePad ? customerSignaturePad.toData() : null,
        owner: ownerSignaturePad ? ownerSignaturePad.toData() : null
    };
    saveJob(job);
}

function clearSignatures() {
    if (customerSignaturePad) customerSignaturePad.clear();
    if (ownerSignaturePad) ownerSignaturePad.clear();
    saveSignatures();
}

function downloadReceipt() {
    const job = getJob(currentJobId);
    if (!job) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let y = 20;
    const lineHeight = 6;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('HAKIEEM MOBILE REPAIR SERVICE', pageWidth / 2, y, { align: 'center' });
    y += lineHeight + 2;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('USIM Campus | 01X-XXXXXXX', pageWidth / 2, y, { align: 'center' });
    y += lineHeight + 5;
    
    // Line
    doc.setLineWidth(0.5);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;
    
    // Job Info
    doc.setFontSize(10);
    doc.text(`Job ID: ${job.id}`, 20, y);
    doc.text(`Date: ${new Date(job.date).toLocaleDateString('ms-MY')}`, pageWidth - 20, y, { align: 'right' });
    y += lineHeight + 5;
    
    // Customer Info
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER INFO', 20, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${job.customer.name}`, 20, y); y += lineHeight;
    doc.text(`Phone: ${job.customer.phone}`, 20, y); y += lineHeight;
    if (job.customer.ic) { doc.text(`IC: ${job.customer.ic}`, 20, y); y += lineHeight; }
    doc.text(`Device: ${job.device.type} ${job.device.model}`, 20, y); y += lineHeight;
    if (job.device.imei) { doc.text(`IMEI: ${job.device.imei}`, 20, y); y += lineHeight; }
    y += 5;
    
    // Repair Details
    doc.setFont('helvetica', 'bold');
    doc.text('REPAIR DETAILS', 20, y); y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.text(`Issue Reported: ${job.issue}`, 20, y); y += lineHeight;
    const repairDone = job.repairNotes || 'See checklist';
    const splitRepair = doc.splitTextToSize(`Repair Done: ${repairDone}`, pageWidth - 40);
    doc.text(splitRepair, 20, y); y += splitRepair.length * lineHeight;
    doc.text('Technician: Hakieem', 20, y); y += 10;
    
    // Pre-Repair Check
    doc.setFont('helvetica', 'bold');
    doc.text('PRE-REPAIR CHECK', 20, y); y += lineHeight;
    doc.setFont('helvetica', 'normal');
    Object.entries(job.preRepairCheck || {}).forEach(([item, checked]) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${checked ? '[OK]' : '[!!]'} ${item}`, 20, y); y += lineHeight;
    });
    y += 5;
    
    // Post-Repair Check
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.text('POST-REPAIR CHECK', 20, y); y += lineHeight;
    doc.setFont('helvetica', 'normal');
    Object.entries(job.postRepairCheck || {}).forEach(([item, checked]) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${checked ? '[OK]' : '[!!]'} ${item}`, 20, y); y += lineHeight;
    });
    y += 10;
    
    // Payment
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT', 20, y); y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.text(`Service Fee: RM ${job.pricing.customerPrice.toFixed(2)}`, 20, y); y += lineHeight;
    doc.text('Warranty: 30 days', 20, y); y += 10;
    
    // Warranty Terms
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.text('WARRANTY TERMS', 20, y); y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.text('- 30 days warranty untuk repair yang sama', 20, y); y += lineHeight;
    doc.text('- Tidak termasuk kerosakan baru (jatuh, air, dll)', 20, y); y += lineHeight;
    doc.text('- Warranty batal jika device dibuka oleh orang lain', 20, y); y += 15;
    
    // Signatures
    if (y > 220) { doc.addPage(); y = 20; }
    
    if (job.signatures && job.signatures.customer) {
        try {
            const customerCanvas = document.getElementById('customer-signature');
            const customerImg = customerCanvas.toDataURL('image/png');
            doc.addImage(customerImg, 'PNG', 20, y, 60, 30);
        } catch(e) {}
    }
    
    if (job.signatures && job.signatures.owner) {
        try {
            const ownerCanvas = document.getElementById('owner-signature');
            const ownerImg = ownerCanvas.toDataURL('image/png');
            doc.addImage(ownerImg, 'PNG', pageWidth - 80, y, 60, 30);
        } catch(e) {}
    }
    
    y += 35;
    doc.setFontSize(9);
    doc.text('Customer Signature', 50, y, { align: 'center' });
    doc.text('Owner Signature', pageWidth - 50, y, { align: 'center' });
    y += lineHeight;
    doc.text(`(${job.customer.name})`, 50, y, { align: 'center' });
    doc.text('(Hakieem)', pageWidth - 50, y, { align: 'center' });
    
    // Footer
    y += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business!', pageWidth / 2, y, { align: 'center' });
    
    doc.save(`Receipt_${job.id}.pdf`);
}

function printReceipt() {
    window.print();
}

// History
function initFilters() {
    document.getElementById('search-jobs').addEventListener('input', updateHistory);
    document.getElementById('filter-status').addEventListener('change', updateHistory);
}

function updateHistory() {
    const jobs = getJobs();
    const search = document.getElementById('search-jobs').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    
    let filtered = jobs;
    
    if (search) {
        filtered = filtered.filter(j => 
            j.customer.name.toLowerCase().includes(search) ||
            j.id.toLowerCase().includes(search) ||
            j.device.model.toLowerCase().includes(search)
        );
    }
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(j => j.status === statusFilter);
    }
    
    // Sort by date, newest first
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const listEl = document.getElementById('history-list');
    if (filtered.length === 0) {
        listEl.innerHTML = '<p class="empty-state">No jobs found.</p>';
    } else {
        listEl.innerHTML = filtered.map(job => createJobCard(job)).join('');
    }
}
