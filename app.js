import { initThreeAmbient, updateParticleColor } from './animations/particles-sacro.js';
import { initLeafletMap } from './modos/mapa-mundi/mapa.js';
import { fetchEras, loadTimelineStage, selectTimelineEra } from './modos/linha-do-tempo/timeline.js';
import { findNearbyChurches } from './modos/paroquias/paroquias.js';

let dataModules = {};
let sidebarOpen = false;
let audioSynth = null;
let audioReverb = null;
let isAudioPlaying = false;

async function init() {
  try {
    const res = await fetch('./Conteudo/periodos/modules.json');
    dataModules = await res.json();
  } catch(e) {
    console.error("Failed to load modules.json", e);
  }
  await fetchEras();

  if(localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    document.getElementById('theme-icon').setAttribute('data-lucide', 'sun');
  }

  renderSidebarLevel1();
  loadDailyLiturgy();

  // Initialize canvas for both splash (if exists) and ambient
  if (document.getElementById('splash-canvas')) {
    initThreeAmbient('splash-canvas', true);
  }
  initThreeAmbient('ambient-canvas', false);

  lucide.createIcons();

  runIntroSequence();
}

function triggerRipple() {
  const rippleLayer = document.getElementById('ripple-layer');
  if (!rippleLayer) return;
  const ripple = document.createElement('div');
  ripple.className = 'water-ripple';
  rippleLayer.appendChild(ripple);
  setTimeout(() => ripple.remove(), 1600);
}

function runIntroSequence() {
  const phase1 = document.getElementById('intro-phase-1');
  const phase2 = document.getElementById('intro-phase-2');

  // Gota 1 -> Fase 1
  setTimeout(() => {
    triggerRipple();
    if (phase1) {
      phase1.classList.remove('opacity-0');
    }
  }, 1500);

  // Gota 2 -> Fase 2
  setTimeout(() => {
    triggerRipple();
    if (phase1) {
      phase1.classList.add('opacity-0');
    }

    setTimeout(() => {
      if (phase2) {
        phase2.classList.remove('opacity-0');
        phase2.classList.remove('pointer-events-none');
      }
    }, 400);
  }, 6500);
}

async function enterPortal() {
  const splash = document.getElementById('splash-screen');
  const ambientCanvas = document.getElementById('ambient-canvas');

  // Trigger Sound Effect via Tone.js Context without background loop
  if(Tone.context.state !== 'running') {
    await Tone.start();
  }
  const synth = new Tone.PolySynth(Tone.FMSynth, {
    envelope: { attack: 0.1, decay: 2, sustain: 0.2, release: 2 }
  }).toDestination();
  synth.volume.value = -15;
  synth.triggerAttackRelease(["C3", "C4"], "2n");

  // Animate Splash Out and Canvas Expand
  const phase1 = document.getElementById('intro-phase-1');
  const phase2 = document.getElementById('intro-phase-2');
  if (phase1) phase1.classList.add('exit-scale');
  if (phase2) phase2.classList.add('exit-scale');

  splash.classList.add('opacity-0', 'pointer-events-none');

  if (ambientCanvas) {
    ambientCanvas.style.transition = 'transform 3s cubic-bezier(0.16, 1, 0.3, 1)';
    ambientCanvas.style.transform = 'scale(1.05)';
  }

  if (splash) {
    splash.classList.add('opacity-0');
    setTimeout(() => {
      splash.remove();
    }, 1000);
  }
}

const sidebarGroups = {
  eras_historicas: {
    icon: 'clock',
    title: 'Eras Históricas',
    bgImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/The_delivery_of_the_keys_to_Saint_Peter_by_Pietro_Perugino.jpg/800px-The_delivery_of_the_keys_to_Saint_Peter_by_Pietro_Perugino.jpg',
    tag: 'Séc. I ao XXI'
  },
  estudos_biblicos: {
    icon: 'book-open',
    title: 'Estudos Bíblicos',
    bgImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Gutenberg_Bible_B42_Deutsches_Buch_und_Schriftmuseum.jpg/800px-Gutenberg_Bible_B42_Deutsches_Buch_und_Schriftmuseum.jpg',
    tag: 'Sagradas Escrituras'
  },
  doutores_santos: {
    icon: 'crown',
    title: 'Doutores & Santos',
    bgImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Philippe_de_Champaigne_-_Saint_Augustine_-_WGA04712.jpg/800px-Philippe_de_Champaigne_-_Saint_Augustine_-_WGA04712.jpg',
    tag: 'Mestres da Fé'
  },
  milagres_reliquias: {
    icon: 'sparkles',
    title: 'Milagres & Relíquias',
    bgImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Lanciano_Reliquary.jpg/800px-Lanciano_Reliquary.jpg',
    tag: 'Sobrenatural'
  },
  paroquias_rotas: {
    icon: 'map-pin',
    title: 'Paróquias & Rotas',
    bgImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/1570_Ortelius_Map_of_the_World_-_Typus_Orbis_Terrarum_-_Geographicus_-_World-ortelius-1570.jpg/800px-1570_Ortelius_Map_of_the_World_-_Typus_Orbis_Terrarum_-_Geographicus_-_World-ortelius-1570.jpg',
    tag: 'Geografia Sagrada'
  }
};

let currentLevel2Group = null;

function renderSidebarLevel1() {
  const container = document.getElementById('sidebar-level-1');
  let html = '';

  for (let [key, group] of Object.entries(sidebarGroups)) {
    // Determine items for this group
    const itemsCount = Object.values(dataModules).filter(item => item.category === key).length;

    html += `
      <div class="sidebar-group cursor-pointer group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300"
           data-group="${key}"
           onclick="openSidebarLevel2('${key}')">

        <!-- Background Image with Overlay -->
        <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style="background-image: url('${group.bgImage}')"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/20 group-hover:via-slate-900/40 transition-colors"></div>

        <!-- Border Glow Effect -->
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 border-2 border-gold-400/50 rounded-xl transition-opacity duration-300 pointer-events-none"></div>

        <!-- Content -->
        <div class="relative z-10 p-4 h-32 flex flex-col justify-between">
          <div class="flex justify-between items-start">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/40 text-gold-400 backdrop-blur-md border border-white/10">
              ${group.tag}
            </span>
            <i data-lucide="${group.icon}" class="w-5 h-5 text-white/70 group-hover:text-gold-400 transition-colors"></i>
          </div>

          <div>
            <h3 class="font-cinzel font-bold text-lg text-white group-hover:text-gold-200 transition-colors drop-shadow-md">${group.title}</h3>
            <p class="text-xs text-slate-300 font-medium">${itemsCount} Registros</p>
          </div>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
  lucide.createIcons();
}

function openSidebarLevel2(groupKey) {
  const group = sidebarGroups[groupKey];
  if (!group) return;

  currentLevel2Group = groupKey;

  // Header
  document.getElementById('lvl2-cover').style.backgroundImage = `url('${group.bgImage}')`;
  document.getElementById('lvl2-title').innerText = group.title;

  const items = Object.entries(dataModules).filter(([id, item]) => item.category === groupKey);
  document.getElementById('lvl2-count').innerText = `${items.length} itens`;

  // Search Reset
  document.getElementById('lvl2-search').value = '';

  renderSidebarLevel2Items(items);

  // Transition slider
  document.getElementById('sidebar-slider').classList.add('-translate-x-full');

  // Specific interaction: load map immediately if Paróquias & Rotas is clicked
  if (groupKey === 'paroquias_rotas') {
    hideAllStages();
    const stage = document.getElementById('content-stage');
    stage.classList.remove('hidden');
    // We can initialize an empty or default map for Paróquias & Rotas
    // or call initLeafletMap with default world coordinates
    setTimeout(() => initLeafletMap([41.9028, 12.4964], 2, []), 100);
  }
}

function backToLevel1() {
  document.getElementById('sidebar-slider').classList.remove('-translate-x-full');
  currentLevel2Group = null;
}

function renderSidebarLevel2Items(itemsEntries) {
  const container = document.getElementById('sidebar-level-2-items');

  if (itemsEntries.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">Nenhum item encontrado.</p>';
    lucide.createIcons();
    return;
  }

  let html = itemsEntries.map(([id, item]) => {
    const hasAudio = false; // Mock for now, could be added to data
    const hasMap = item.mapCenter && item.mapCenter.length > 0;

    return `
    <button onmouseenter="window.previewSidebarItem('${id}')" onclick="window.loadFullContent('${id}')" class="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600 group flex items-start gap-3">
      <!-- Avatar -->
      <div class="w-10 h-10 rounded-full flex-shrink-0 bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
        ${item.avatar ? `<img src="${item.avatar}" class="w-full h-full object-cover group-hover:scale-110 transition-transform" />` : `<div class="w-full h-full flex items-center justify-center"><i data-lucide="image" class="w-4 h-4 text-slate-400"></i></div>`}
      </div>

      <!-- Text -->
      <div class="flex-1 min-w-0">
        <h4 class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors truncate">${item.title}</h4>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">${item.description}</p>

        <!-- Media Indicators -->
        <div class="flex items-center gap-2 mt-1.5 opacity-60">
          ${hasMap ? '<i data-lucide="map-pin" class="w-3 h-3 text-sacred-600 dark:text-rose-400"></i>' : ''}
          <i data-lucide="file-text" class="w-3 h-3 text-slate-500"></i>
        </div>
      </div>
    </button>
  `}).join('');

  container.innerHTML = html;
  lucide.createIcons();
}

function handleLevel2Search() {
  const query = document.getElementById('lvl2-search').value.toLowerCase();

  if (!currentLevel2Group) return;

  const items = Object.entries(dataModules).filter(([id, item]) => {
    if (item.category !== currentLevel2Group) return false;

    return item.title.toLowerCase().includes(query) ||
           item.description.toLowerCase().includes(query) ||
           (item.saints && item.saints.some(s => s.name.toLowerCase().includes(query)));
  });

  renderSidebarLevel2Items(items);
}


async function toggleAudio() {
  const btn = document.getElementById('btn-audio');

  if(!audioSynth) {
    await Tone.start();
    audioReverb = new Tone.Reverb({ decay: 10, preDelay: 0.1 }).toDestination();
    audioSynth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 1, modulationIndex: 1,
      oscillator: { type: "sine" },
      envelope: { attack: 2, decay: 2, sustain: 0.8, release: 4 },
      modulation: { type: "triangle" }
    }).connect(audioReverb);
    audioSynth.volume.value = -20;
  }

  if(isAudioPlaying) {
    audioSynth.releaseAll();
    isAudioPlaying = false;
    btn.classList.remove('text-marian-700', 'dark:text-gold-400');
  } else {
    const notes = ["C3", "G3", "C4", "F4"];
    audioSynth.triggerAttack(notes);
    isAudioPlaying = true;
    btn.classList.add('text-marian-700', 'dark:text-gold-400');

    setInterval(() => {
      if(!isAudioPlaying) return;
      if(Math.random() > 0.5) {
         audioSynth.triggerRelease(["F4"]);
         setTimeout(() => audioSynth.triggerAttack(["E4"]), 1000);
      } else {
         audioSynth.triggerRelease(["E4"]);
         setTimeout(() => audioSynth.triggerAttack(["F4"]), 1000);
      }
    }, 8000);
  }
}

window.playEraSound = function(index) {
  if (!isAudioPlaying || !audioSynth) return;
  // Toca um badalar suave para marcar a transição de era
  const bellSynth = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.001, decay: 1.4, release: 0.2 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
  }).toDestination();

  bellSynth.volume.value = -10;

  // Varia levemente a nota com base no index
  const notes = ["C4", "E4", "G4", "B4"];
  const note = notes[index % notes.length];

  bellSynth.triggerAttackRelease(note, "1n");
};

function previewSidebarItem(key) {
  if (document.getElementById('book-stage').classList.contains('hidden') === false) return;

  const item = dataModules[key];
  if (!item) return;

  hideAllStages();
  document.getElementById('preview-stage').classList.remove('hidden');

  document.getElementById('preview-category-tag').innerText = `${item.categoryName} • ${item.period}`;
  document.getElementById('preview-title').innerText = item.title;
  document.getElementById('preview-description').innerText = item.description;
  document.getElementById('preview-highlights').innerText = item.highlights;
  document.getElementById('preview-saints-summary').innerText = (item.saints || []).map(s=>s.name).join(', ');
  document.getElementById('preview-cta-btn').onclick = () => window.loadFullContent(key);

  updateParticleColor(item.color);
  if(window.innerWidth < 1024 && sidebarOpen) toggleSidebar();
}

function loadFullContent(key) {
  const item = dataModules[key];
  if (!item) return;

  hideAllStages();
  const stage = document.getElementById('book-stage');
  stage.classList.remove('hidden');

  // Reset Book Cover
  const cover = stage.querySelector('.book-cover');
  if(cover) cover.classList.remove('open');

  // Update Cover
  const coverTitle = document.getElementById('book-cover-title');
  if(coverTitle) coverTitle.innerText = item.title;

  // Update Content
  const cat = document.getElementById('book-category');
  if(cat) cat.innerText = item.categoryName;

  const per = document.getElementById('book-period');
  if(per) per.innerText = item.period;

  const title = document.getElementById('book-title');
  if(title) title.innerText = item.title;

  const desc = document.getElementById('book-description');
  if(desc) desc.innerText = item.description;

  const quote = document.getElementById('book-quote');
  if(quote) quote.innerText = item.quote;

  const secular = document.getElementById('book-secular');
  if(secular) secular.innerText = item.secular;

  const img = document.getElementById('book-image');
  if (item.image && img) {
    img.src = item.image;
  }

  const saintsContainer = document.getElementById('book-saints');
  if(saintsContainer) {
      saintsContainer.innerHTML = (item.saints || []).map(s => `
        <span class="block mb-1 font-bold text-sacred-800 dark:text-[#7a1c1c]">${s.name}</span>
        <span class="block text-[10px] mb-2">${s.role} - ${s.detail}</span>
      `).join('');
  }

  // Store current item globally for flyToGlobe
  window.currentActiveItem = item;

  lucide.createIcons();

  updateParticleColor(item.color);
  if(window.innerWidth < 1024 && sidebarOpen) toggleSidebar();
}

function flyToItemGlobe() {
  if (!window.currentActiveItem || !window.currentActiveItem.mapCenter) return;
  hideAllStages();
  document.getElementById('timeline-map-stage').classList.remove('hidden');
  import('./modos/mapa-mundi/mapa.js').then(module => {
    module.updateGiantMap(window.currentActiveItem.mapCenter, 6, window.currentActiveItem, true);
  });
}

function openBook() {
  const cover = document.querySelector('.book-cover');
  if(cover && !cover.classList.contains('open')) {
    cover.classList.add('open');
    playBookOpenSound();
  }
}

function playBookOpenSound() {
  if (typeof Tone === 'undefined') return;
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

  // Requires user interaction, so we wrap it just in case
  try {
      if(Tone.context.state !== 'running') {
          Tone.start();
      }
      thud.triggerAttackRelease("C2", "8n");
      setTimeout(() => noise.triggerAttackRelease("16n"), 200);
  } catch(e) {
      console.warn("Audio context could not start.", e);
  }
}


function resetToAmbient() {
  hideAllStages();
  document.getElementById('ambient-stage').classList.remove('hidden');
  updateParticleColor(0x2563eb);
}

function hideAllStages() {
  ['ambient-stage', 'timeline-map-stage', 'preview-stage', 'content-stage', 'book-stage'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.classList.add('hidden');
  });
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(event, id) {
  if(event) event.stopPropagation();
  document.getElementById(id).classList.remove('active');
}

function handleSearch() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const resultsContainer = document.getElementById('search-results');
  if (query.length < 2) {
    resultsContainer.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">Digite para pesquisar no acervo...</p>';
    return;
  }

  const results = Object.entries(dataModules).filter(([key, item]) => {
    return item.title.toLowerCase().includes(query) ||
           item.description.toLowerCase().includes(query) ||
           (item.saints && item.saints.some(s => s.name.toLowerCase().includes(query)));
  });

  if (results.length === 0) {
    resultsContainer.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">Nenhum resultado encontrado.</p>';
    return;
  }

  resultsContainer.innerHTML = results.map(([key, item]) => `
    <div onclick="window.loadFullContent('${key}'); window.closeModal(null, 'search-modal')" class="p-3 mb-2 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700">
      <div class="text-sm font-bold text-slate-900 dark:text-white">${item.title}</div>
      <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">${item.description}</div>
    </div>
  `).join('');
}

function toggleDarkMode() {
  const html = document.documentElement;
  const themeIcon = document.getElementById('theme-icon');

  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    themeIcon.setAttribute('data-lucide', 'moon');
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    themeIcon.setAttribute('data-lucide', 'sun');
  }
  lucide.createIcons();
}

function loadDailyLiturgy() {
  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateStr = now.toLocaleDateString('pt-BR', options).toUpperCase();

  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

  const verses = [
    {
      title: "Evangelho (João 14, 6)",
      text: "Disse-lhe Jesus: 'Eu sou o caminho, a verdade e a vida; ninguém vem ao Pai, senão por mim.'",
      homily: "Neste trecho profundo do Evangelho de São João, Cristo não se apresenta apenas como um mestre que aponta uma direção, mas como o próprio Caminho encarnado..."
    },
    {
      title: "Evangelho (Mateus 5, 14)",
      text: "Vós sois a luz do mundo; não se pode esconder uma cidade edificada sobre um monte.",
      homily: "A vocação do cristão não é o isolamento, mas a irradiação. Assim como uma lâmpada não é acesa para ser colocada debaixo de uma cama, a graça que recebemos..."
    },
    {
      title: "Salmo 23, 1-2",
      text: "O Senhor é o meu pastor, nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.",
      homily: "O salmista Davi expressa, nestes versos, a mais profunda confiança na Providência Divina. Reconhecer Deus como Pastor significa aceitar a Sua condução diária..."
    },
    {
      title: "Evangelho (Lucas 1, 46-47)",
      text: "A minha alma engrandece ao Senhor, e o meu espírito se alegra em Deus meu Salvador.",
      homily: "O canto do Magnificat é a expressão máxima da humildade exaltada. Maria Santíssima reconhece prontamente que toda a sua grandeza provém unicamente da graça imerecida de Deus..."
    }
  ];

  const reading = verses[dayOfYear % verses.length];

  const homeDate = document.getElementById('home-liturgy-date');
  if(homeDate) homeDate.innerText = dateStr;

  const homeTitle = document.getElementById('home-liturgy-title');
  if(homeTitle) homeTitle.innerText = reading.title;

  const homeSnippet = document.getElementById('home-liturgy-snippet');
  if(homeSnippet) homeSnippet.innerText = `"${reading.text}"`;

  const modalDate = document.getElementById('modal-liturgy-date');
  if(modalDate) modalDate.innerText = dateStr;

  const modalTitle = document.getElementById('modal-liturgy-title');
  if(modalTitle) modalTitle.innerText = reading.title;

  const modalText = document.getElementById('modal-liturgy-text');
  if(modalText) modalText.innerText = reading.text;

  const modalHomily = document.getElementById('modal-liturgy-homily');
  if(modalHomily) modalHomily.innerText = reading.homily;
}

function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  const sidebar = document.getElementById('sidebar-drawer');
  const icon = document.getElementById('floating-toggle-icon');

  if (sidebarOpen) {
    sidebar.classList.remove('-translate-x-full');
    icon.setAttribute('data-lucide', 'chevron-left');
  } else {
    sidebar.classList.add('-translate-x-full');
    icon.setAttribute('data-lucide', 'chevron-right');
  }
  lucide.createIcons();
}

function handleSidebarMouseLeave() {
  // on mobile, don't auto-close on mouse leave since hover behavior is unreliable
  if(window.innerWidth >= 1024) {
    if(sidebarOpen) {
      toggleSidebar();
    }
    if(document.getElementById('preview-stage').classList.contains('hidden') === false) resetToAmbient();
  }
}

function filterSidebar(cat) {
  document.querySelectorAll('.sidebar-filter-btn').forEach(btn => {
    btn.classList.remove('bg-white', 'dark:bg-slate-700', 'shadow-xs', 'text-marian-900', 'dark:text-white');
    btn.classList.add('text-slate-600', 'dark:text-slate-400');
  });
  const activeBtn = document.getElementById(`filter-${cat}`);
  if(activeBtn) {
    activeBtn.classList.remove('text-slate-600', 'dark:text-slate-400');
    activeBtn.classList.add('bg-white', 'dark:bg-slate-700', 'shadow-xs', 'text-marian-900', 'dark:text-white');
  }
  document.querySelectorAll('.sidebar-group').forEach(group => {
    if(cat === 'todos' || group.getAttribute('data-group') === cat) group.style.display = 'block';
    else group.style.display = 'none';
  });
}

// Expose handlers to window to keep compatibility with HTML inline `onclick`
window.resetToAmbient = resetToAmbient;
window.enterPortal = enterPortal;
window.toggleAudio = toggleAudio;
window.openModal = openModal;
window.toggleDarkMode = toggleDarkMode;
window.toggleSidebar = toggleSidebar;
window.handleSidebarMouseLeave = handleSidebarMouseLeave;
window.loadTimelineStage = () => loadTimelineStage(hideAllStages);
window.selectTimelineEra = selectTimelineEra;
import { handleTimelineSliderChange, toggleTimelinePlay, timelineNextEra, timelinePrevEra, setTimelineSpeed, toggleCinematicMode, toggleMapLayer } from './modos/linha-do-tempo/timeline.js';
window.handleTimelineSliderChange = handleTimelineSliderChange;
window.toggleTimelinePlay = toggleTimelinePlay;
window.timelineNextEra = timelineNextEra;
window.timelinePrevEra = timelinePrevEra;
window.setTimelineSpeed = setTimelineSpeed;
window.toggleCinematicMode = toggleCinematicMode;
window.toggleMapLayer = toggleMapLayer;
window.filterSidebar = filterSidebar;
window.previewSidebarItem = previewSidebarItem;
window.loadFullContent = loadFullContent;
window.openBook = openBook;
window.flyToItemGlobe = flyToItemGlobe;
window.closeModal = closeModal;
window.handleSearch = handleSearch;
window.findNearbyChurches = findNearbyChurches;
window.openSidebarLevel2 = openSidebarLevel2;
window.backToLevel1 = backToLevel1;
window.handleLevel2Search = handleLevel2Search;

window.onload = init;
