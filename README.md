# 🔧 HAKIEEM MOBILE REPAIR SERVICE

Sistem pengurusan repair phone untuk bisnes repair mobile.

## 📱 Features

- ✅ Create job order dengan maklumat customer & device
- ✅ Pre-repair & post-repair checklist
- ✅ Digital signature (customer + owner)
- ✅ Generate receipt PDF dengan warranty
- ✅ Harga kos & upah hidden dari customer
- ✅ Dashboard dengan stats
- ✅ Search & filter job history
- ✅ Data simpan dalam browser (localStorage)
- ✅ Responsive design (laptop, phone, tablet)

## 🚀 Cara Guna (Local Host)

### Option 1: Double-click (Paling Simple)
1. Buka folder `repair-management-system`
2. Double-click `index.html`
3. Website akan buka dalam browser
4. Siap! Boleh terus guna

### Option 2: Python Simple Server
```bash
cd repair-management-system
python -m http.server 8000
```
Then buka browser: `http://localhost:8000`

### Option 3: Node.js Server
```bash
cd repair-management-system
npx serve
```
Then buka browser: `http://localhost:3000`

## 🌐 Deploy ke GitHub Pages

### Step 1: Create GitHub Repository
1. Pergi https://github.com/new
2. Repository name: `repair-management-system`
3. Pilih Public
4. Click "Create repository"

### Step 2: Upload Files
**Cara Mudah (Web Upload):**
1. Dalam repo page, click "Add file" → "Upload files"
2. Drag & drop semua files dari folder `repair-management-system`
3. Click "Commit changes"

**Cara Git (Advanced):**
```bash
cd repair-management-system
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/repair-management-system.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Pergi repo Settings
2. Click "Pages" di sidebar
3. Source: pilih "Deploy from a branch"
4. Branch: pilih "main" / "root"
5. Click Save
6. Tunggu 1-2 minit
7. Website live di: `https://YOUR_USERNAME.github.io/repair-management-system/`

## 📋 Cara Guna App

### 1. Create New Job
- Click "New Job" tab
- Isi maklumat customer (nama, phone, IC)
- Isi maklumat device (type, model, IMEI, color)
- Tulis issue yang customer report
- Isi harga:
  - **Component Cost**: Harga komponen (hidden)
  - **Labor Cost**: Upah awk (hidden)
  - **Customer Price**: Harga untuk customer (nampak dalam resit)
- Click "Create Job Order"

### 2. Pre-Repair Check
- Click job card dari dashboard
- Tick semua function yang perlu check
- Click "Complete Pre-Repair Check"

### 3. Update Status
- Pilih status: In Progress / Waiting Part / Completed
- Tulis repair notes (apa yang dibuat)
- Click "Save Notes"

### 4. Post-Repair Check
- Tick semua function yang dah test
- Click "Complete Post-Repair Check"

### 5. Generate Receipt
- Click "Generate Receipt"
- Customer sign di kotak signature
- Awk sign di kotak signature
- Click "Download PDF" atau "Print Receipt"

### 6. View History
- Click "History" tab
- Search by customer name atau job ID
- Filter by status

## 💾 Data Storage

- Semua data simpan dalam browser (localStorage)
- Data tak hilang kalau close browser
- Data akan hilang kalau clear browser data
- **Backup**: Download receipt PDF untuk setiap job

## 🎨 Customize

### Tukar Business Name
Edit `index.html`:
```html
<h1>🔧 YOUR BUSINESS NAME</h1>
```

### Tukar Contact Info
Edit `js/app.js` dalam function `downloadReceipt()`:
```javascript
doc.text('YOUR CONTACT', pageWidth / 2, y, { align: 'center' });
```

### Tukar Color Scheme
Edit `css/style.css`:
```css
/* Tukar gradient color */
background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
```

## 📦 Tech Stack

- HTML5
- CSS3 (Responsive)
- JavaScript (Vanilla)
- localStorage (Data persistence)
- Signature Pad (Digital signature)
- jsPDF (PDF generation)

## 🔒 Privacy

- Semua data simpan local dalam browser
- Tak ada data hantar ke server
- Tak perlu internet (kecuali load library CDN)
- 100% private & secure

## 📞 Support

Kalau ada masalah atau nak tambah feature, boleh contact:
- Developer: Hakieem
- Email: [your-email]
- Phone: [your-phone]

## 📝 License

Free untuk guna & modify untuk bisnes sendiri.

---

**Made with ❤️ for Hakieem Mobile Repair Service**
