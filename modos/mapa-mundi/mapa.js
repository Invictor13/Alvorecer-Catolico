let currentLeafletMap = null;
export let giantLeafletMap = null;
let activeLayers = {
  politics: true,
  routes: true,
  monuments: true,
  missions: true
};

const iconDefs = {
  cross: '<i data-lucide="cross" class="w-6 h-6 text-gold-400 marker-glow" style="color: #fbbf24"></i>',
  basilica: '<i data-lucide="landmark" class="w-6 h-6 text-marian-600 marker-build-up" style="color: #2563eb"></i>',
  scroll: '<i data-lucide="scroll" class="w-6 h-6 text-sacred-600 marker-glow" style="color: #e11d48"></i>',
  default: '<i data-lucide="map-pin" class="w-6 h-6 text-slate-800 marker-glow"></i>'
};

export function initGiantMap() {
  const container = document.getElementById('giant-map');
  if (!container) return;

  if (giantLeafletMap) {
    giantLeafletMap.remove();
    giantLeafletMap = null;
  }

  // Dark/Light tiles
  const isDark = document.documentElement.classList.contains('dark');
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  giantLeafletMap = L.map('giant-map', {
    zoomControl: true,
    scrollWheelZoom: false
  }).setView([20.0, 0.0], 2);

  L.tileLayer(tileUrl, {
    attribution: '&copy; CartoDB',
    maxZoom: 18
  }).addTo(giantLeafletMap);

  setTimeout(() => {
    if (giantLeafletMap) giantLeafletMap.invalidateSize();
  }, 100);
}

export function updateMapLayers(layers) {
  activeLayers = layers;
}

export function updateGiantMap(center, zoom, data, isCinematic = false) {
  if (!giantLeafletMap) return;

  giantLeafletMap.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Circle) {
      giantLeafletMap.removeLayer(layer);
    }
  });

  if (isCinematic) {
    giantLeafletMap.flyTo(center, zoom, { duration: 2, easeLinearity: 0.25 });
  } else {
    giantLeafletMap.setView(center, zoom);
  }

  const markers = data.markers || [];
  const routes = data.routes || [];
  const pulses = data.pulses || [];
  const conflicts = data.conflicts || [];

  // Conflicts (rendered below everything)
  conflicts.forEach(c => {
    L.circle([c.lat, c.lng], {
      color: c.color,
      fillColor: c.color,
      fillOpacity: 0.3,
      radius: c.radius,
      className: 'conflict-zone'
    }).addTo(giantLeafletMap).bindPopup(`<b>${c.title}</b>`);
  });

  // Pulses
  pulses.forEach(p => {
    L.circle([p.lat, p.lng], {
      color: p.color,
      fillColor: p.color,
      fillOpacity: 0.5,
      radius: p.radius,
      className: 'diffusion-pulse'
    }).addTo(giantLeafletMap);
  });

  // Routes
  routes.forEach(r => {
    if (r.layer && !activeLayers[r.layer]) return;
    const polyline = L.polyline(r.coordinates, {
      color: '#fbbf24',
      weight: 3,
      opacity: 0.8,
      className: 'route-line'
    }).addTo(giantLeafletMap);
    polyline.bindPopup(`<b>${r.name}</b>`);
  });

  // Markers
  markers.forEach(m => {
    if (m.layer && !activeLayers[m.layer]) return;

    const iconHtml = iconDefs[m.type] || iconDefs.default;
    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'custom-marker-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([m.lat, m.lng], { icon: customIcon }).addTo(giantLeafletMap);

    // Custom popup
    marker.bindPopup(`
      <div class="p-1 font-sans">
        <strong class="font-cinzel text-marian-900 dark:text-marian-400">${m.title}</strong><br>
        <span class="text-xs text-slate-600 dark:text-slate-300">${m.description || ''}</span>
      </div>
    `);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }

  giantLeafletMap.invalidateSize();
}

export function initLeafletMap(center, zoom, markers) {
  if (currentLeafletMap) currentLeafletMap.remove();
  const isDark = document.documentElement.classList.contains('dark');
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  currentLeafletMap = L.map('content-map').setView(center, zoom);
  L.tileLayer(tileUrl).addTo(currentLeafletMap);
  if(markers) {
    markers.forEach(m => L.marker([m.lat, m.lng]).addTo(currentLeafletMap).bindPopup(m.title));
  }
}
