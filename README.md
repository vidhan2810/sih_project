# CivicPulse — Civic Issue Reporting & Resolution Platform 🏛️📍

A modern, responsive, full-featured **Civic Issue Reporting & Resolution Platform** designed for citizens, municipal corporations, government agencies, and NGOs.

---

## 🌟 Key Features

### 1. 📸 Live Camera Verification
- Instant device camera activation (`navigator.mediaDevices.getUserMedia`)
- Front / Rear camera switcher
- Real-time video stream preview with live shutter snapshot
- **Watermark Engine**: Automatically burns GPS coordinates, timestamp, and verification badge onto the captured photo canvas
- Fallback photo upload & sample civic hazard dataset for desktop testing

### 2. 📍 Live Location & Interactive GPS Mapping
- Live GPS detection (`navigator.geolocation.getCurrentPosition`)
- Draggable pin marker on **Leaflet.js / OpenStreetMap** to fine-tune exact issue location
- Automatic reverse geocoding to human-readable street address
- Full interactive live map with color-coded status pins:
  - 🔴 **New / Submitted**
  - 🟠 **Under Review**
  - 🟡 **Assigned**
  - 🔵 **In Progress**
  - 🟢 **Resolved**
  - ⚫ **Closed**

### 3. 👥 Multi-Role Workflow & Persona Switcher
Quick dropdown in navigation bar to toggle between personas:
- **Citizen (Rahul Sharma)**: Report issues, view personal dashboard, track live timeline, receive status alerts.
- **Authority (PWD & Road Works)**: View operational queue, update lifecycle status, add remarks, upload "After" repair proof photos.
- **Authority (Solid Waste Mgmt & Water Board)**: Filter assigned category issues and dispatch field crews.
- **Platform Administrator**: Manage authorized organizations, configure SLAs, monitor system audit logs.

### 4. 🔄 End-to-End Lifecycle & Photographic Proof
- Every complaint has a transparent, immutable activity timeline.
- Side-by-side **Before** (Citizen Live Photo) and **After** (Authority Resolution Proof) visual comparison.
- Unique Human-Readable Complaint IDs (e.g. `CIV-2026-000108`).

### 5. 📊 Operational Analytics
- Dynamic Chart.js visualizations for category breakdown, status distribution, and 7-day resolution velocity.

---

## 🚀 Quick Start Instructions

### Method 1: Double Click
Simply open [`index.html`](file:///c:/Users/HP/OneDrive/Documents/SIH%20Project/index.html) in any modern web browser (Chrome, Edge, Firefox, Safari).

### Method 2: Run with Python Server
Open terminal/powershell in this folder and run:
```bash
python server.py
```
This starts the local web server at `http://localhost:8000` and automatically opens your browser.

---

## 📂 Project Architecture

```
SIH Project/
│
├── index.html              # Main Single Page App (Tailwind CSS, Leaflet, Chart.js, Lucide)
├── styles.css              # Custom styling, animations, leaflet pins, camera flash
├── server.py               # Local Python web server helper
├── README.md               # Documentation & setup guide
│
└── js/
    ├── data.js             # Mock seed database & LocalStorage state engine
    ├── camera.js           # WebRTC camera, snapshot watermark, preview, file fallback
    ├── location.js         # Geolocation API & reverse geocoding
    ├── map.js              # Leaflet map instance, pins, popups, and draggable pins
    ├── analytics.js        # Chart.js dashboards & resolution velocity charts
    └── app.js              # Master router, wizard stepper, role switcher, notifications
```
