import { initGiantMap, updateGiantMap } from '../mapa-mundi/mapa.js';

let timelineEras = [];

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

  const container = document.getElementById('timeline-controls');
  container.innerHTML = timelineEras.map((era, idx) => `
    <button onclick="window.selectTimelineEra(${idx})" id="era-btn-${idx}" class="timeline-era-btn p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all font-medium">
      <div class="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold truncate">${era.title.split('•')[0]}</div>
      <div class="text-[11px] font-bold font-cinzel text-slate-800 dark:text-slate-200 truncate">${era.title.split('•')[1]}</div>
    </button>
  `).join('');

  setTimeout(() => { initGiantMap(); selectTimelineEra(0); }, 100);
}

export function selectTimelineEra(index) {
  const era = timelineEras[index];
  if (!era) return;

  document.querySelectorAll('.timeline-era-btn').forEach((btn, idx) => {
    if (idx === index) {
      btn.classList.add('border-marian-500', 'bg-marian-50', 'dark:bg-marian-900/30', 'shadow-sm');
      btn.classList.remove('border-slate-200', 'dark:border-slate-700', 'hover:bg-slate-50', 'dark:hover:bg-slate-800');
    } else {
      btn.classList.remove('border-marian-500', 'bg-marian-50', 'dark:bg-marian-900/30', 'shadow-sm');
      btn.classList.add('border-slate-200', 'dark:border-slate-700', 'hover:bg-slate-50', 'dark:hover:bg-slate-800');
    }
  });

  document.getElementById('timeline-era-title').innerText = era.title;
  document.getElementById('timeline-church-desc').innerText = era.churchDesc;
  document.getElementById('timeline-humanity-desc').innerText = era.humanityDesc;

  updateGiantMap(era.center, era.zoom, era.markers);
}
