import re

with open('app.js', 'r') as f:
    content = f.read()

# 1. Update hideAllStages
hide_stages = """function hideAllStages() {
  ['ambient-stage', 'timeline-map-stage', 'preview-stage', 'content-stage', 'book-stage'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
}"""
content = re.sub(r'function hideAllStages\(\) \{[\s\S]*?\}', hide_stages, content)

# 2. Update loadFullContent
load_content_original = """function loadFullContent(key) {
  const item = dataModules[key];
  if (!item) return;

  hideAllStages();
  const stage = document.getElementById('content-stage');
  stage.classList.remove('hidden');

  stage.classList.remove('animate-slide-up');
  void stage.offsetWidth;
  stage.classList.add('animate-slide-up');

  document.getElementById('content-category-tag').innerText = item.categoryName;
  document.getElementById('content-period-tag').innerText = item.period;
  document.getElementById('content-title').innerText = item.title;
  document.getElementById('content-description').innerText = item.description;
  document.getElementById('content-highlights').innerText = item.highlights;
  document.getElementById('content-quote').innerText = item.quote;
  document.getElementById('content-secular').innerText = item.secular;

  const saintsContainer = document.getElementById('content-saints');
  saintsContainer.innerHTML = (item.saints || []).map(s => `
    <div class="flex items-center space-x-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <div class="w-8 h-8 rounded-full bg-sacred-100 dark:bg-sacred-900/30 flex items-center justify-center text-sacred-700 dark:text-sacred-400">
        <i data-lucide="user" class="w-4 h-4"></i>
      </div>
      <div>
        <div class="text-sm font-bold text-slate-900 dark:text-white">${s.name}</div>
        <div class="text-[10px] text-slate-500">${s.role} - ${s.detail}</div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();

  if (item.mapCenter) {
    setTimeout(() => {
      if(!contentMap) {
        contentMap = L.map('content-map', { zoomControl: false }).setView(item.mapCenter, item.mapZoom || 5);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(contentMap);
      } else {
        contentMap.setView(item.mapCenter, item.mapZoom || 5);
        contentMap.eachLayer((layer) => {
          if (layer instanceof L.Marker) contentMap.removeLayer(layer);
        });
      }

      if(item.markers) {
        item.markers.forEach(m => {
          L.marker([m.lat, m.lng]).addTo(contentMap).bindPopup(m.title);
        });
      }
      contentMap.invalidateSize();
    }, 100);
  }

  updateParticleColor(item.color);
}"""

load_content_new = """function loadFullContent(key) {
  const item = dataModules[key];
  if (!item) return;

  hideAllStages();
  const stage = document.getElementById('book-stage');
  stage.classList.remove('hidden');

  // Reset Book Cover
  const cover = stage.querySelector('.book-cover');
  cover.classList.remove('open');

  // Update Cover
  document.getElementById('book-cover-title').innerText = item.title;

  // Update Content
  document.getElementById('book-category').innerText = item.categoryName;
  document.getElementById('book-period').innerText = item.period;
  document.getElementById('book-title').innerText = item.title;
  document.getElementById('book-description').innerText = item.description;
  document.getElementById('book-quote').innerText = item.quote;
  document.getElementById('book-secular').innerText = item.secular;

  if (item.image) {
    document.getElementById('book-image').src = item.image;
  }

  const saintsContainer = document.getElementById('book-saints');
  saintsContainer.innerHTML = (item.saints || []).map(s => `
    <span class="block mb-1 font-bold text-sacred-800 dark:text-[#7a1c1c]">${s.name}</span>
    <span class="block text-[10px] mb-2">${s.role} - ${s.detail}</span>
  `).join('');

  lucide.createIcons();

  updateParticleColor(item.color);
}

function openBook() {
  const cover = document.querySelector('.book-cover');
  if(cover && !cover.classList.contains('open')) {
    cover.classList.add('open');
    playBookOpenSound();
  }
}

function playBookOpenSound() {
  if (!Tone) return;
  // Synthesize a deep thud for the heavy leather cover
  const thud = new Tone.MembraneSynth({
    pitchDecay: 0.1,
    octaves: 2,
    oscillator: { type: "sine" },
    envelope: { attack: 0.01, decay: 0.4, sustain: 0.01, release: 0.5 }
  }).toDestination();
  thud.volume.value = -10;

  // Synthesize a rustle for the pages
  const noise = new Tone.NoiseSynth({
    noise: { type: "brown" },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0, release: 0.1 }
  }).toDestination();
  noise.volume.value = -20;

  thud.triggerAttackRelease("C2", "8n");
  setTimeout(() => noise.triggerAttackRelease("16n"), 200);
}
"""

content = content.replace(load_content_original, load_content_new)

# 3. Add to window exports
if "window.openBook = openBook;" not in content:
    content = content.replace("window.loadFullContent = loadFullContent;", "window.loadFullContent = loadFullContent;\nwindow.openBook = openBook;")


with open('app.js', 'w') as f:
    f.write(content)
