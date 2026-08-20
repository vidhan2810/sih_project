/**
 * CivicPulse - Leaflet Map Subsystem
 * Manages full interactive map, marker styling, popups, and wizard draggable location pins.
 */

const mapModule = {
  fullMap: null,
  wizardMap: null,
  detailMiniMap: null,
  wizardMarker: null,
  fullMapMarkers: [],

  // Status to marker class & hex color mapping
  statusColors: {
    'Submitted': { bg: '#ef4444', label: '🔴 New' },
    'Under Review': { bg: '#f97316', label: '🟠 Under Review' },
    'Assigned': { bg: '#eab308', label: '🟡 Assigned' },
    'In Progress': { bg: '#3b82f6', label: '🔵 In Progress' },
    'Resolved': { bg: '#10b981', label: '🟢 Resolved' },
    'Closed': { bg: '#64748b', label: '⚫ Closed' }
  },

  // Initialize or re-center Full Civic Map
  initFullMap() {
    const mapContainer = document.getElementById('full-interactive-map');
    if (!mapContainer) return;

    if (this.fullMap) {
      setTimeout(() => this.fullMap.invalidateSize(), 200);
      return;
    }

    const defaultLat = 28.6139;
    const defaultLng = 77.2090;

    this.fullMap = L.map('full-interactive-map').setView([defaultLat, defaultLng], 14);

    // OpenStreetMap high contrast carto tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors | CivicPulse GovTech'
    }).addTo(this.fullMap);

    this.renderFullMapMarkers();
  },

  renderFullMapMarkers(statusFilter = 'all') {
    if (!this.fullMap) return;

    // Clear existing markers
    this.fullMapMarkers.forEach(m => this.fullMap.removeLayer(m));
    this.fullMapMarkers = [];

    const complaints = dataStore.getAllComplaints();

    complaints.forEach(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return;

      const markerColor = this.statusColors[item.status]?.bg || '#3b82f6';
      
      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="background-color: ${markerColor}; width: 34px; height: 34px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.35); color: white; font-weight: bold; font-size: 14px;">
            ${item.status === 'Resolved' ? '✓' : '!'}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([item.location.lat, item.location.lng], { icon: customIcon }).addTo(this.fullMap);

      // Interactive Popup Content
      const popupHtml = `
        <div class="w-64 text-slate-800 font-sans">
          <div class="relative h-28 bg-slate-900 overflow-hidden">
            <img src="${item.photoBefore}" class="w-full h-full object-cover" alt="Issue photo"/>
            <span class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase" style="background-color: ${markerColor}">
              ${item.status}
            </span>
            <span class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
              ${item.id}
            </span>
          </div>
          <div class="p-3">
            <h4 class="font-bold text-xs leading-snug text-slate-900">${item.title}</h4>
            <p class="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              📍 ${item.location.address}
            </p>
            <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span class="text-[10px] text-slate-400 font-semibold">${item.categoryName}</span>
              <button onclick="app.viewComplaintDetails('${item.id}')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-3 py-1 rounded-lg shadow-sm">
                View Ticket →
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      this.fullMapMarkers.push(marker);
    });
  },

  filterMapMarkers(status) {
    this.renderFullMapMarkers(status);
    app.showToast(`Showing ${status === 'all' ? 'All' : status} complaints on map`, 'info');
  },

  // Setup Wizard Map for Step 2 with Draggable Pin
  initWizardMap() {
    const container = document.getElementById('wizard-leaflet-map');
    if (!container) return;

    const lat = locationModule.currentLat || 28.6139;
    const lng = locationModule.currentLng || 77.2090;

    if (this.wizardMap) {
      this.wizardMap.setView([lat, lng], 16);
      if (this.wizardMarker) {
        this.wizardMarker.setLatLng([lat, lng]);
      }
      setTimeout(() => this.wizardMap.invalidateSize(), 250);
      return;
    }

    this.wizardMap = L.map('wizard-leaflet-map').setView([lat, lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.wizardMap);

    const pinIcon = L.divIcon({
      className: 'wizard-pin',
      html: `
        <div style="background-color: #2563eb; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37,99,235,0.5); color: white; font-size: 16px;">
          📍
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36]
    });

    this.wizardMarker = L.marker([lat, lng], {
      draggable: true,
      icon: pinIcon
    }).addTo(this.wizardMap);

    // Update coordinates when marker is dragged
    this.wizardMarker.on('dragend', async (e) => {
      const position = e.target.getLatLng();
      locationModule.currentLat = position.lat;
      locationModule.currentLng = position.lng;
      const addr = await locationModule.reverseGeocode(position.lat, position.lng);
      locationModule.currentAddress = addr;
      locationModule.updateDisplay();
      app.showToast('Location adjusted to pin spot', 'info');
    });

    setTimeout(() => this.wizardMap.invalidateSize(), 300);
  },

  // Setup Detail Mini Map
  initDetailMiniMap(lat, lng) {
    const container = document.getElementById('detail-mini-map');
    if (!container) return;

    if (this.detailMiniMap) {
      this.detailMiniMap.remove();
      this.detailMiniMap = null;
    }

    this.detailMiniMap = L.map('detail-mini-map', {
      zoomControl: false,
      attributionControl: false
    }).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.detailMiniMap);

    const pinIcon = L.divIcon({
      className: 'detail-pin',
      html: `<div style="background-color: #ef4444; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.3)">📍</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });

    L.marker([lat, lng], { icon: pinIcon }).addTo(this.detailMiniMap);

    setTimeout(() => this.detailMiniMap.invalidateSize(), 250);
  }
};
