let currentLeafletMap = null;
let giantLeafletMap = null;

export function initGiantMap() {
  const container = document.getElementById('giant-map');
  if (!container) return;

  if (giantLeafletMap) {
    giantLeafletMap.remove();
    giantLeafletMap = null;
  }

  giantLeafletMap = L.map('giant-map', {
    zoomControl: true,
    scrollWheelZoom: false
  }).setView([20.0, 0.0], 2);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB',
    maxZoom: 18
  }).addTo(giantLeafletMap);

  setTimeout(() => {
    if (giantLeafletMap) giantLeafletMap.invalidateSize();
  }, 100);
}

export function updateGiantMap(center, zoom, markers) {
  if (!giantLeafletMap) return;

  giantLeafletMap.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      giantLeafletMap.removeLayer(layer);
    }
  });

  giantLeafletMap.setView(center, zoom);

  markers.forEach(m => {
    L.marker([m.lat, m.lng]).addTo(giantLeafletMap).bindPopup(`<b>${m.title}</b>`);
  });

  giantLeafletMap.invalidateSize();
}

export function initLeafletMap(center, zoom, markers) {
  if (currentLeafletMap) currentLeafletMap.remove();
  currentLeafletMap = L.map('content-map').setView(center, zoom);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(currentLeafletMap);
  markers.forEach(m => L.marker([m.lat, m.lng]).addTo(currentLeafletMap).bindPopup(m.title));
}
