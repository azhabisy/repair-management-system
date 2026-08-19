// Repair Management System - Main Application
// HAKIEEM MOBILE REPAIR SERVICE

// Global state
let currentJob = null;
let jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
let customers = JSON.parse(localStorage.getItem('customers') || '[]');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('Repair Management System initialized');
    showDashboard();
});

// Navigation
function showDashboard() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('dashboard').classList.add('active');
    updateDashboardStats();
    renderJobsList();
}

function showNewJob() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('newJob').classList.add('active');
    resetNewJobForm();
}

function showJobDetails(jobId) {
    currentJob = jobs.find(j => j.id === jobId);
    if (!currentJob) return;
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('jobDetails').classList.add('active');
    renderJobDetails();
}

// Dashboard
function updateDashboardStats() {
    const today = new Date().toDateString();
    const todayJobs = jobs.filter(j => new Date(j.createdAt).toDateString() === today);
    const activeJobs = jobs.filter(j => j.status !== 'completed');
    const completedJobs = jobs.filter(j => j.status === 'completed');
    
    document.getElementById('todayJobs').textContent = todayJobs.length;
    document.getElementById('activeJobs').textContent = activeJobs.length;
    document.getElementById('completedJobs').textContent = completedJobs.length;
    document.getElementById('totalJobs').textContent = jobs.length;
}

function renderJobsList() {
    const container = document.getElementById('jobsList');
    if (jobs.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#888;padding:40px;">No jobs yet. Create your first job order!</p>';
        return;
    }
    
    container.innerHTML = jobs.map(job => `
        <div class="job-card" onclick="showJobDetails('${job.id}')">
            <div class="job-card-header">
                <span class="job-id">${job.id}</span>
                <span class="status-badge status-${job.status}">${job.status}</span>
            </div>
            <div class="job-card-body">
                <div><strong>${job.customerName}</strong></div>
                <div>${job.deviceModel}</div>
                <div style="color:#888;font-size:0.85em;">${new Date(job.createdAt).toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

// New Job Form
function resetNewJobForm() {
    document.getElementById('newJobForm').reset();
}

function saveNewJob(e) {
    e.preventDefault();
    
    const job = {
        id: 'HMR-' + Date.now(),
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        customerIC: document.getElementById('customerIC').value,
        deviceModel: document.getElementById('deviceModel').value,
        deviceIMEI: document.getElementById('deviceIMEI').value,
        deviceColor: document.getElementById('deviceColor').value,
        issueReported: document.getElementById('issueReported').value,
        status: 'pending',
        createdAt: new Date().toISOString(),
        preRepairChecklist: {},
        postRepairChecklist: {},
        repairNotes: '',
        componentCost: 0,
        labourCost: 0,
        customerPrice: 0,
        warrantyDays: 30,
        customerSignature: null,
        ownerSignature: null
    };
    
    jobs.unshift(job);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    
    // Save customer
    saveCustomer(job);
    
    alert('Job created successfully! Job ID: ' + job.id);
    showJobDetails(job.id);
}

function saveCustomer(job) {
    const existing = customers.find(c => c.phone === job.customerPhone);
    if (!existing) {
        customers.push({
            name: job.customerName,
            phone: job.customerPhone,
            ic: job.customerIC
        });
        localStorage.setItem('customers', JSON.stringify(customers));
    }
}

// Job Details
function renderJobDetails() {
    if (!currentJob) return;
    
    document.getElementById('jobDetailId').textContent = currentJob.id;
    document.getElementById('jobDetailStatus').textContent = currentJob.status;
    document.getElementById('jobDetailStatus').className = 'status-badge status-' + currentJob.status;
    
    // Customer info
    document.getElementById('detailCustomerName').textContent = currentJob.customerName;
    document.getElementById('detailCustomerPhone').textContent = currentJob.customerPhone;
    document.getElementById('detailCustomerIC').textContent = currentJob.customerIC || '-';
    
    // Device info
    document.getElementById('detailDeviceModel').textContent = currentJob.deviceModel;
    document.getElementById('detailDeviceIMEI').textContent = currentJob.deviceIMEI || '-';
    document.getElementById('detailDeviceColor').textContent = currentJob.deviceColor || '-';
    
    // Issue
    document.getElementById('detailIssue').textContent = currentJob.issueReported;
    
    // Timeline
    document.getElementById('detailCreatedAt').textContent = new Date(currentJob.createdAt).toLocaleString();
    
    // Pricing (internal only)
    document.getElementById('detailComponentCost').textContent = 'RM ' + (currentJob.componentCost || 0).toFixed(2);
    document.getElementById('detailLabourCost').textContent = 'RM ' + (currentJob.labourCost || 0).toFixed(2);
    document.getElementById('detailTotalCost').textContent = 'RM ' + ((currentJob.componentCost || 0) + (currentJob.labourCost || 0)).toFixed(2);
    document.getElementById('detailCustomerPrice').textContent = 'RM ' + (currentJob.customerPrice || 0).toFixed(2);
    
    // Warranty
    document.getElementById('detailWarranty').textContent = currentJob.warrantyDays + ' days';
    
    // Show/hide sections based on status
    document.getElementById('preRepairSection').style.display = currentJob.status === 'pending' ? 'block' : 'none';
    document.getElementById('postRepairSection').style.display = currentJob.status === 'in_progress' ? 'block' : 'none';
    document.getElementById('completeSection').style.display = currentJob.status === 'in_progress' ? 'block' : 'none';
    document.getElementById('receiptSection').style.display = currentJob.status === 'completed' ? 'block' : 'none';
}

// Pre-Repair Checklist
function startPreRepair() {
    currentJob.status = 'in_progress';
    saveJob();
    renderJobDetails();
}

function savePreRepairChecklist() {
    const checklist = {};
    document.querySelectorAll('#preRepairChecklist input[type="checkbox"]').forEach(cb => {
        checklist[cb.name] = cb.checked;
    });
    currentJob.preRepairChecklist = checklist;
    saveJob();
    alert('Pre-repair checklist saved!');
}

// Post-Repair Checklist
function savePostRepairChecklist() {
    const checklist = {};
    document.querySelectorAll('#postRepairChecklist input[type="checkbox"]').forEach(cb => {
        checklist[cb.name] = cb.checked;
    });
    currentJob.postRepairChecklist = checklist;
    saveJob();
    alert('Post-repair checklist saved!');
}

// Complete Job
function savePricing() {
    currentJob.componentCost = parseFloat(document.getElementById('inputComponentCost').value) || 0;
    currentJob.labourCost = parseFloat(document.getElementById('inputLabourCost').value) || 0;
    currentJob.customerPrice = parseFloat(document.getElementById('inputCustomerPrice').value) || 0;
    currentJob.warrantyDays = parseInt(document.getElementById('inputWarrantyDays').value) || 30;
    currentJob.repairNotes = document.getElementById('inputRepairNotes').value;
    saveJob();
    alert('Pricing saved!');
}

function completeJob() {
    if (!currentJob.customerPrice) {
        alert('Please enter pricing first!');
        return;
    }
    currentJob.status = 'completed';
    currentJob.completedAt = new Date().toISOString();
    saveJob();
    renderJobDetails();
    alert('Job completed! Ready for receipt generation.');
}

// Signature
let signatureCanvas = null;
let signatureCtx = null;
let isDrawing = false;

function initSignature(canvasId) {
    signatureCanvas = document.getElementById(canvasId);
    signatureCtx = signatureCanvas.getContext('2d');
    signatureCtx.strokeStyle = '#000';
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = 'round';
    
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('touchstart', handleTouch);
    signatureCanvas.addEventListener('touchmove', handleTouchMove);
    signatureCanvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    signatureCtx.lineTo(x, y);
    signatureCtx.stroke();
    signatureCtx.beginPath();
    signatureCtx.moveTo(x, y);
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    signatureCanvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    signatureCanvas.dispatchEvent(mouseEvent);
}

function clearSignature(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveSignature(type) {
    const canvasId = type === 'customer' ? 'customerSignatureCanvas' : 'ownerSignatureCanvas';
    const canvas = document.getElementById(canvasId);
    const dataUrl = canvas.toDataURL();
    
    if (type === 'customer') {
        currentJob.customerSignature = dataUrl;
    } else {
        currentJob.ownerSignature = dataUrl;
    }
    saveJob();
    alert(type + ' signature saved!');
}

// Receipt Generation
function generateReceipt() {
    if (!currentJob.customerSignature || !currentJob.ownerSignature) {
        alert('Both customer and owner signatures are required!');
        return;
    }
    
    const receiptWindow = window.open('', '_blank');
    const receiptHTML = buildReceiptHTML();
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
}

function buildReceiptHTML() {
    const job = currentJob;
    const warrantyExpiry = new Date(job.completedAt);
    warrantyExpiry.setDate(warrantyExpiry.getDate() + job.warrantyDays);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Receipt - ${job.id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
        .header h1 { font-size: 16px; margin-bottom: 5px; }
        .header p { font-size: 11px; }
        .section { margin-bottom: 15px; }
        .section-title { font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 5px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .row span:first-child { color: #555; }
        .checklist { margin: 5px 0; }
        .checklist-item { margin: 2px 0; }
        .signatures { display: flex; justify-content: space-between; margin: 20px 0; }
        .signature-box { text-align: center; width: 45%; }
        .signature-box img { width: 100%; height: 60px; border: 1px solid #000; margin-bottom: 5px; }
        .footer { text-align: center; border-top: 2px dashed #000; padding-top: 10px; margin-top: 15px; font-size: 11px; }
        .warranty-box { border: 2px solid #000; padding: 10px; margin: 10px 0; text-align: center; }
        @media print { body { padding: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>HAKIEEM MOBILE REPAIR SERVICE</h1>
        <p>USIM Campus | 01X-XXXXXXX</p>
    </div>
    
    <div class="section">
        <div class="row"><span>Job ID:</span><span><strong>${job.id}</strong></span></div>
        <div class="row"><span>Date:</span><span>${new Date(job.createdAt).toLocaleDateString()}</span></div>
        <div class="row"><span>Completed:</span><span>${new Date(job.completedAt).toLocaleDateString()}</span></div>
    </div>
    
    <div class="section">
        <div class="section-title">CUSTOMER INFO</div>
        <div class="row"><span>Name:</span><span>${job.customerName}</span></div>
        <div class="row"><span>Phone:</span><span>${job.customerPhone}</span></div>
        ${job.customerIC ? `<div class="row"><span>IC:</span><span>${job.customerIC}</span></div>` : ''}
    </div>
    
    <div class="section">
        <div class="section-title">DEVICE INFO</div>
        <div class="row"><span>Model:</span><span>${job.deviceModel}</span></div>
        ${job.deviceIMEI ? `<div class="row"><span>IMEI:</span><span>${job.deviceIMEI}</span></div>` : ''}
        ${job.deviceColor ? `<div class="row"><span>Color:</span><span>${job.deviceColor}</span></div>` : ''}
    </div>
    
    <div class="section">
        <div class="section-title">REPAIR DETAILS</div>
        <div class="row"><span>Issue:</span><span>${job.issueReported}</span></div>
        ${job.repairNotes ? `<div class="row"><span>Repair:</span><span>${job.repairNotes}</span></div>` : ''}
    </div>
    
    <div class="section">
        <div class="section-title">PRE-REPAIR CHECK</div>
        <div class="checklist">
            ${Object.entries(job.preRepairChecklist || {}).map(([key, val]) => 
                `<div class="checklist-item">${val ? '✓' : '✗'} ${key}</div>`
            ).join('')}
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">POST-REPAIR CHECK</div>
        <div class="checklist">
            ${Object.entries(job.postRepairChecklist || {}).map(([key, val]) => 
                `<div class="checklist-item">${val ? '✓' : '✗'} ${key}</div>`
            ).join('')}
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">PAYMENT</div>
        <div class="row"><span><strong>Service Fee:</strong></span><span><strong>RM ${job.customerPrice.toFixed(2)}</strong></span></div>
    </div>
    
    <div class="warranty-box">
        <strong>WARRANTY: ${job.warrantyDays} DAYS</strong><br>
        Valid until: ${warrantyExpiry.toLocaleDateString()}<br>
        <small>Covers repair defect only. Void if device opened by others.</small>
    </div>
    
    <div class="signatures">
        <div class="signature-box">
            <img src="${job.customerSignature}" alt="Customer Signature">
            <div><strong>${job.customerName}</strong></div>
            <div>Customer</div>
        </div>
        <div class="signature-box">
            <img src="${job.ownerSignature}" alt="Owner Signature">
            <div><strong>Hakieem</strong></div>
            <div>Technician</div>
        </div>
    </div>
    
    <div class="footer">
        <p>Thank you for your business!</p>
        <p>Keep this receipt for warranty claims.</p>
    </div>
    
    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>`;
}

// Search & Filter
function searchJobs() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = jobs.filter(job => 
        job.customerName.toLowerCase().includes(query) ||
        job.deviceModel.toLowerCase().includes(query) ||
        job.id.toLowerCase().includes(query) ||
        (job.deviceIMEI && job.deviceIMEI.toLowerCase().includes(query))
    );
    renderJobsList(filtered);
}

function filterByStatus() {
    const status = document.getElementById('filterStatus').value;
    if (status === 'all') {
        renderJobsList(jobs);
    } else {
        const filtered = jobs.filter(job => job.status === status);
        renderJobsList(filtered);
    }
}

// Export/Import
function exportData() {
    const data = {
        jobs: jobs,
        customers: customers,
        exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repair-backup-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.jobs) {
                    jobs = data.jobs;
                    localStorage.setItem('repairJobs', JSON.stringify(jobs));
                }
                if (data.customers) {
                    customers = data.customers;
                    localStorage.setItem('customers', JSON.stringify(customers));
                }
                alert('Data imported successfully!');
                renderDashboard();
            } catch (err) {
                alert('Error importing data: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderDashboard();
});
