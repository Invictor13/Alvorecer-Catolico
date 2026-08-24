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

  renderSidebar();
  loadDailyLiturgy();
  initThreeAmbient();
  lucide.createIcons();
}

async function enterPortal() {
  const splash = document.getElementById('splash-screen');
  const splashCard = splash.querySelector('.splash-card');
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
  if (splashCard) {
    splashCard.classList.add('exit-scale');
  }
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

function renderSidebar() {
  const container = document.getElementById('sidebar-content');
  let html = '';

  const groups = {
    historia: { icon: 'clock', title: 'Eras Históricas', items: ['era1', 'era2'] },
    biblia: { icon: 'book-open', title: 'Estudos Bíblicos', items: ['biblia1'] },
    livros: { icon: 'library', title: 'Mestres', items: ['livro1'] },
    sobrenatural: { icon: 'sparkles', title: 'Milagres', items: ['milagre1'] }
  };

  for(let [key, group] of Object.entries(groups)) {
    html += `<div class="sidebar-group" data-group="${key}">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1">
        <i data-lucide="${group.icon}" class="w-3.5 h-3.5 text-marian-600 dark:text-gold-400"></i>
        <span>${group.title}</span>
      </h3><ul class="space-y-1">`;

    group.items.forEach(itemId => {
      const item = dataModules[itemId];
      if(!item) return;
      html += `<li>
        <button onmouseenter="window.previewSidebarItem('${itemId}')" onclick="window.loadFullContent('${itemId}')" class="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-between group">
          <span class="font-medium text-slate-700 dark:text-slate-300 group-hover:text-marian-900 dark:group-hover:text-white">${item.title}</span>
          <i data-lucide="chevron-right" class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-marian-600 dark:text-gold-400"></i>
        </button>
      </li>`;
    });
    html += `</ul></div>`;
  }
  container.innerHTML = html;
  lucide.createIcons();
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

function previewSidebarItem(key) {
  if (document.getElementById('content-stage').classList.contains('hidden') === false) return;

  const item = dataModules[key];
  if (!item) return;

  hideAllStages();
  document.getElementById('preview-stage').classList.remove('hidden');

  document.getElementById('preview-category-tag').innerText = `${item.categoryName} • ${item.period}`;
  document.getElementById('preview-title').innerText = item.title;
  document.getElementById('preview-description').innerText = item.description;
  document.getElementById('preview-highlights').innerText = item.highlights;
  document.getElementById('preview-saints-summary').innerText = item.saints.map(s=>s.name).join(', ');
  document.getElementById('preview-cta-btn').onclick = () => window.loadFullContent(key);

  updateParticleColor(item.color);
}

function loadFullContent(key) {
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
  saintsContainer.innerHTML = item.saints.map(s => `
    <div class="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
      <div class="font-bold text-xs text-slate-800 dark:text-slate-200">${s.name}</div>
      <div class="text-[11px] text-marian-700 dark:text-gold-400 font-medium">${s.role}</div>
      <div class="text-[11px] text-slate-500 mt-0.5">${s.detail}</div>
    </div>
  `).join('');

  updateParticleColor(item.color);
  setTimeout(() => initLeafletMap(item.mapCenter, item.mapZoom, item.markers), 100);

  if(window.innerWidth < 1024 && sidebarOpen) toggleSidebar();
}

function resetToAmbient() {
  hideAllStages();
  document.getElementById('ambient-stage').classList.remove('hidden');
  updateParticleColor(0x2563eb);
}

function hideAllStages() {
  ['ambient-stage', 'timeline-map-stage', 'preview-stage', 'content-stage'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
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
           item.saints.some(s => s.name.toLowerCase().includes(query));
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
  if(sidebarOpen) {
    toggleSidebar();
  }
  if(document.getElementById('preview-stage').classList.contains('hidden') === false) resetToAmbient();
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
window.filterSidebar = filterSidebar;
window.previewSidebarItem = previewSidebarItem;
window.loadFullContent = loadFullContent;
window.closeModal = closeModal;
window.handleSearch = handleSearch;
window.findNearbyChurches = findNearbyChurches;

window.onload = init;
