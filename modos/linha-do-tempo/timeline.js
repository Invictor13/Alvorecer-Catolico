import { initGiantMap, updateGiantMap, updateMapLayers } from '../mapa-mundi/mapa.js';

let timelineEras = [];
let currentEraIndex = 0;
let isPlaying = false;
let playInterval = null;
let playSpeed = 1; // 1 = 1x, 2 = 2x, 5 = 5x
let isCinematic = false;

// Filter state
let activeLayers = {
  politics: true,
  routes: true,
  monuments: true,
  missions: true
};

export async function fetchEras() {
  try {
    const res = await fetch('./Conteudo/periodos/eras.json');
    timelineEras = await res.json();
  } catch (err) {
    console.error('Failed to load eras.json', err);
  }
}

export function loadTimelineStage(hideAllStages) {
  hideAllStages();
  document.getElementById('timeline-map-stage').classList.remove('hidden');

  initScrubber();

  setTimeout(() => {
    initGiantMap();
    selectTimelineEra(0);
  }, 100);
}

function initScrubber() {
  const slider = document.getElementById('timeline-slider');
  slider.max = timelineEras.length - 1;
  slider.value = 0;

  // Create markers
  const markersContainer = document.getElementById('timeline-markers');
  markersContainer.innerHTML = '';

  timelineEras.forEach((era, idx) => {
    const marker = document.createElement('div');
    marker.className = 'w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 transition-colors';
    marker.id = `marker-${idx}`;
    markersContainer.appendChild(marker);
  });
}

function updateScrubberUI() {
  const slider = document.getElementById('timeline-slider');
  slider.value = currentEraIndex;

  const progress = document.getElementById('timeline-progress');
  const percentage = (currentEraIndex / (timelineEras.length - 1)) * 100;
  progress.style.width = `${percentage}%`;

  // Update markers
  timelineEras.forEach((_, idx) => {
    const marker = document.getElementById(`marker-${idx}`);
    if (marker) {
      if (idx <= currentEraIndex) {
        marker.classList.add('bg-gold-400');
        marker.classList.remove('bg-slate-300', 'dark:bg-slate-600');
      } else {
        marker.classList.remove('bg-gold-400');
        marker.classList.add('bg-slate-300', 'dark:bg-slate-600');
      }
    }
  });
}

export function handleTimelineSliderChange(event) {
  if (isCinematic || isPlaying) {
    event.target.value = currentEraIndex; // reset slider
    return; // Block manual override during cinematic or playing
  }

  const index = parseInt(event.target.value, 10);
  if (index !== currentEraIndex) {
    selectTimelineEra(index);
  }
}

export function selectTimelineEra(index) {
  if (index < 0 || index >= timelineEras.length) return;

  currentEraIndex = index;
  const era = timelineEras[index];

  // Play sound effect context
  if (window.playEraSound) {
    window.playEraSound(index);
  }

  // Update Texts
  const titleParts = era.title.split('•');
  document.getElementById('timeline-era-title').innerText = titleParts[1] ? titleParts[1].trim() : era.title;
  document.getElementById('timeline-era-subtitle').innerText = titleParts[0] ? titleParts[0].trim() : '';

  document.getElementById('timeline-church-desc').innerText = era.churchDesc;
  document.getElementById('timeline-humanity-desc').innerText = era.humanityDesc;

  updateScrubberUI();
  updateMapLayers(activeLayers);
  updateGiantMap(era.center, era.zoom, era, isCinematic);
}

export function toggleTimelinePlay() {
  if (!giantLeafletMap || timelineEras.length === 0) {
    console.warn("Aguardando carregamento do mapa e dados históricos...");
    return;
  }

  isPlaying = !isPlaying;
  const btnIcon = document.querySelector('#timeline-play-btn i');

  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }

  if (isPlaying) {
    if (btnIcon) btnIcon.setAttribute('data-lucide', 'pause');
    if (currentEraIndex >= timelineEras.length - 1) {
      selectTimelineEra(0); // Restart if at the end
    }
    const intervalTime = 4000 / playSpeed; // Base time 4s per era
    playInterval = setInterval(() => {
      if (currentEraIndex < timelineEras.length - 1) {
        selectTimelineEra(currentEraIndex + 1);
      } else {
        if (isPlaying) toggleTimelinePlay(); // Stop when finished
      }
    }, intervalTime);
  } else {
    if (btnIcon) btnIcon.setAttribute('data-lucide', 'play');
    if (isCinematic) toggleCinematicMode(); // Also turn off cinematic if paused
  }

  if (window.lucide) window.lucide.createIcons();
}

export function timelineNextEra() {
  if (isCinematic || isPlaying) return;
  if (currentEraIndex < timelineEras.length - 1) {
    selectTimelineEra(currentEraIndex + 1);
  }
}

export function timelinePrevEra() {
  if (isCinematic || isPlaying) return;
  if (currentEraIndex > 0) {
    selectTimelineEra(currentEraIndex - 1);
  }
}

export function setTimelineSpeed(speed) {
  playSpeed = speed;

  // Update buttons UI
  document.querySelectorAll('.timeline-speed-btn').forEach(btn => {
    if (parseInt(btn.dataset.speed) === speed) {
      btn.classList.add('text-marian-700', 'dark:text-white', 'bg-white', 'dark:bg-slate-700', 'shadow-sm');
      btn.classList.remove('text-slate-500', 'dark:text-slate-400', 'bg-transparent');
    } else {
      btn.classList.remove('text-marian-700', 'dark:text-white', 'bg-white', 'dark:bg-slate-700', 'shadow-sm');
      btn.classList.add('text-slate-500', 'dark:text-slate-400', 'bg-transparent');
    }
  });

  if (isPlaying) {
    // Restart interval with new speed
    toggleTimelinePlay();
    toggleTimelinePlay();
  }
}

export function toggleCinematicMode() {
  isCinematic = !isCinematic;
  const btn = document.getElementById('cinematic-btn');

  if (btn) {
    if (isCinematic) {
      btn.classList.add('ring-2', 'ring-amber-400', 'ring-offset-2', 'dark:ring-offset-slate-900');
    } else {
      btn.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-2', 'dark:ring-offset-slate-900');
    }
  }

  if (isCinematic && !isPlaying) {
    iniciarModoHistoria();
  } else if (!isCinematic && isPlaying) {
    toggleTimelinePlay();
  }
}

export async function iniciarModoHistoria() {
  if (!giantLeafletMap || timelineEras.length === 0) {
    console.warn("Aguardando carregamento do mapa e dados históricos...");
    // Reset state since it failed to start
    isCinematic = false;
    const btn = document.getElementById('cinematic-btn');
    if (btn) btn.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-2', 'dark:ring-offset-slate-900');
    return;
  }

  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }

  if (!isPlaying) {
     toggleTimelinePlay();
  }
}

export function toggleMapLayer(layerId) {
  activeLayers[layerId] = !activeLayers[layerId];

  const btn = document.getElementById(`layer-btn-${layerId}`);
  if (activeLayers[layerId]) {
    btn.classList.add('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-marian-900', 'dark:text-white');
    btn.classList.remove('text-slate-600', 'dark:text-slate-400');
  } else {
    btn.classList.remove('bg-white', 'dark:bg-slate-700', 'shadow-sm', 'text-marian-900', 'dark:text-white');
    btn.classList.add('text-slate-600', 'dark:text-slate-400');
  }

  // Re-render current era to apply filters
  selectTimelineEra(currentEraIndex);
}
