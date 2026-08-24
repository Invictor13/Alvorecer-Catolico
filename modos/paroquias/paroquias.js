let churchLeafletMap = null;

export function findNearbyChurches() {
  const statusText = document.getElementById('church-status');
  statusText.innerText = "Buscando sua localização...";

  if (!navigator.geolocation) {
    statusText.innerText = "Geolocalização não suportada pelo navegador.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      statusText.innerText = "Buscando paróquias próximas...";

      if (!churchLeafletMap) {
        churchLeafletMap = L.map('church-map').setView([lat, lng], 13);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(churchLeafletMap);
      } else {
        churchLeafletMap.setView([lat, lng], 13);
      }

      L.marker([lat, lng]).addTo(churchLeafletMap).bindPopup("<b>Sua Localização</b>").openPopup();

      const overpassQuery = `
        [out:json];
        (
          node["amenity"="place_of_worship"]["religion"="christian"]["denomination"="catholic"](around:5000,${lat},${lng});
          way["amenity"="place_of_worship"]["religion"="christian"]["denomination"="catholic"](around:5000,${lat},${lng});
        );
        out center;
      `;

      fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery
      })
      .then(response => response.json())
      .then(data => {
        const elements = data.elements;
        if (elements.length === 0) {
          statusText.innerText = "Nenhuma paróquia encontrada num raio de 5km.";
          return;
        }

        statusText.innerText = `${elements.length} paróquias encontradas!`;

        const churchIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
        });

        elements.forEach(el => {
          const elLat = el.lat || el.center.lat;
          const elLng = el.lon || el.center.lon;
          const name = el.tags.name || "Paróquia Católica";
          L.marker([elLat, elLng], {icon: churchIcon}).addTo(churchLeafletMap).bindPopup(`<b>${name}</b>`);
        });
      })
      .catch(err => {
        console.error(err);
        statusText.innerText = "Erro ao buscar paróquias.";
      });
    },
    (error) => {
      console.error(error);
      statusText.innerText = "Permissão de localização negada.";
    }
  );
}
