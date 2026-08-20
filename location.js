/**
 * CivicPulse - Live Location & GPS Subsystem
 * Integrates HTML5 Geolocation, reverse geocoding, and distance calculations.
 */

const locationModule = {
  currentLat: 28.6139,
  currentLng: 77.2090,
  currentAddress: 'Main Ring Road, Sector 14, Near Metro Pillar 84',
  accuracy: 10, // meters

  async detectLiveGPS(callback) {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported by browser.');
      this.updateDisplay();
      if (callback) callback(this.currentLat, this.currentLng, this.currentAddress);
      return;
    }

    app.showToast('Acquiring precise GPS coordinates...', 'info');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        this.currentLat = pos.coords.latitude;
        this.currentLng = pos.coords.longitude;
        this.accuracy = pos.coords.accuracy || 10;

        // Perform reverse geocoding to human-readable address
        const addr = await this.reverseGeocode(this.currentLat, this.currentLng);
        this.currentAddress = addr;

        this.updateDisplay();
        app.showToast('GPS Locked with high accuracy (±' + Math.round(this.accuracy) + 'm)', 'success');

        if (callback) callback(this.currentLat, this.currentLng, this.currentAddress);
      },
      (err) => {
        console.warn('GPS position error or permission denied:', err.message);
        app.showToast('Using local municipal zone coordinates.', 'info');
        this.updateDisplay();
        if (callback) callback(this.currentLat, this.currentLng, this.currentAddress);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0
      }
    );
  },

  async reverseGeocode(lat, lng) {
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          return parts.slice(0, 3).join(',').trim();
        }
      }
    } catch (e) {
      console.warn('Nominatim reverse lookup failed, using local landmark.');
    }
    return `Zone 4, Sector 14 (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`;
  },

  updateDisplay() {
    const latElem = document.getElementById('wizard-lat-display');
    const lngElem = document.getElementById('wizard-lng-display');
    const addrElem = document.getElementById('wizard-address-input');

    if (latElem) latElem.innerText = this.currentLat.toFixed(4);
    if (lngElem) lngElem.innerText = this.currentLng.toFixed(4);
    if (addrElem) addrElem.value = this.currentAddress;
  },

  // Calculate distance between two coordinates in kilometers using Haversine formula
  getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  }
};
