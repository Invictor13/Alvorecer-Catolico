let datasets = {
    igreja: [],
    santos: [],
    concilios: [],
    milagres: []
};

let quizQuestions = [];
let flashcards = [];

let currentLang = 'pt';
let currentCategory = 'igreja';
let historicalEpochs = [];
let filteredEpochs = [];
let currentEpochIndex = 0;
let map = null;
let currentMarker = null;
let routeLayers = [];
let isPlaying = false;
let playInterval = null;
let isAudioPlaying = false;
let audioCtx = null;
let sidebarVisible = true;
let currentQuizIndex = 0;
let quizScore = 0;
let currentFlashcardIdx = 0;
let favorites = JSON.parse(localStorage.getItem('ecclesia_favs') || '[]');

const translations = {
    pt: {
        welcomeSub: "O mapa histórico, teológico e cultural definitivo da Santa Igreja Católica. Explore séculos de fé, milagres, magistério e vida dos santos.",
        menuBtn: "Menu Principal", quizBtn: "Quiz", codiceBtn: "Códice", filterTitle: "Filtrar por Século",
        btnPrev: "Anterior", btnNext: "Próximo", play: "Reproduzir", pause: "Pausar", verMais: "Códice Magna",
        panorama: "Panorama Histórico", theology: "Teologia & CIC", artGallery: "Galeria de Arte Sacra Georreferenciada",
        figures: "Figuras Chave e Testemunhas", prevChap: "Capítulo Anterior", nextChap: "Próximo Capítulo"
    },
    la: {
        welcomeSub: "Tabula historica, theologica et culturalis Sanctae Ecclesiae Catholicae. Explora saecula fidei, miracula et vitas sanctorum.",
        menuBtn: "Menu Principale", quizBtn: "Quaestiones", codiceBtn: "Codex", filterTitle: "Colatoria Saeculi",
        btnPrev: "Prior", btnNext: "Sequens", play: "Ludere", pause: "Pausare", verMais: "Codex Magna",
        panorama: "Panorama Historicum", theology: "Theologia & CIC", artGallery: "Galeria Artis Sacrae",
        figures: "Personae Insignes", prevChap: "Caput Prius", nextChap: "Caput Sequens"
    },
    en: {
        welcomeSub: "The definitive historical, theological, and cultural map of the Holy Catholic Church. Explore centuries of faith, miracles, and saints.",
        menuBtn: "Main Menu", quizBtn: "Quiz", codiceBtn: "Codex", filterTitle: "Filter by Century",
        btnPrev: "Previous", btnNext: "Next", play: "Play", pause: "Pause", verMais: "Magna Codex",
        panorama: "Historical Overview", theology: "Theology & CCC", artGallery: "Georeferenced Sacred Art",
        figures: "Key Figures & Witnesses", prevChap: "Previous Chapter", nextChap: "Next Chapter"
    },
    es: {
        welcomeSub: "El mapa histórico, teológico y cultural definitivo de la Santa Iglesia Católica. Explora siglos de fe, milagros y vidas de santos.",
        menuBtn: "Menú Principal", quizBtn: "Quiz", codiceBtn: "Códice", filterTitle: "Filtrar por Siglo",
        btnPrev: "Anterior", btnNext: "Siguiente", play: "Reproducir", pause: "Pausar", verMais: "Códice Magna",
        panorama: "Panorama Histórico", theology: "Teología y CIC", artGallery: "Galería de Arte Sacro",
        figures: "Figuras Clave y Testigos", prevChap: "Capítulo Anterior", nextChap: "Siguiente Capítulo"
    },
    it: {
        welcomeSub: "Il mappa storico, teologico e culturale definitivo della Santa Chiesa Cattolica. Esplora secoli di fede, miracoli e vita dei santi.",
        menuBtn: "Menù Principale", quizBtn: "Quiz", codiceBtn: "Codice", filterTitle: "Filtra per Secolo",
        btnPrev: "Precedente", btnNext: "Successivo", play: "Riproduci", pause: "Pausa", verMais: "Codice Magna",
        panorama: "Panoramica Storica", theology: "Teologia e CCC", artGallery: "Galleria d'Arte Sacra",
        figures: "Figure Chiave e Testimoni", prevChap: "Capitolo Precedente", nextChap: "Capitolo Successivo"
    }
};

async function loadData() {
    try {
        const [igrejaRes, santosRes, conciliosRes, milagresRes, quizRes, flashcardsRes] = await Promise.all([
            fetch('./Conteudo/periodos/igreja/data.json'),
            fetch('./Conteudo/periodos/santos/data.json'),
            fetch('./Conteudo/periodos/concilios/data.json'),
            fetch('./Conteudo/periodos/milagres/data.json'),
            fetch('./Conteudo/periodos/estudos/quiz.json'),
            fetch('./Conteudo/periodos/estudos/flashcards.json')
        ]);

        datasets.igreja = await igrejaRes.json();
        datasets.santos = await santosRes.json();
        datasets.concilios = await conciliosRes.json();
        datasets.milagres = await milagresRes.json();
        quizQuestions = await quizRes.json();
        flashcards = await flashcardsRes.json();

        // Initialize state after data load
        historicalEpochs = datasets.igreja;
        filteredEpochs = historicalEpochs;
    } catch (error) {
        console.error("Error loading JSON data:", error);
    }
}

function initMap() {
    map = L.map('map', {
        center: [30, 20],
        zoom: 3,
        zoomControl: true,
        attributionControl: false
    });

    setMapStyle('dark');
    buildModalChapters();
    updateEpoch(0);
    updateFavoritesUI();
}

let tileLayerInstance = null;
function setMapStyle(styleKey) {
    if (tileLayerInstance) map.removeLayer(tileLayerInstance);

    let url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    if (styleKey === 'parchment') {
        url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    } else if (styleKey === 'satellite') {
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    tileLayerInstance = L.tileLayer(url, { maxZoom: 18, subdomains: 'abcd' }).addTo(map);
    document.getElementById('map-style-menu').classList.add('hidden');
}

function toggleMapStyleMenu() {
    document.getElementById('map-style-menu').classList.toggle('hidden');
}

function selectCategory(categoryKey) {
    currentCategory = categoryKey;
    historicalEpochs = datasets[categoryKey] || [];
    filteredEpochs = historicalEpochs;
    currentEpochIndex = 0;

    document.getElementById('welcome-portal').classList.add('hidden');
    document.getElementById('timeline-slider').max = Math.max(0, filteredEpochs.length - 1);
    document.getElementById('timeline-slider').value = 0;

    const titles = {
        igreja: "Alvorecer Católico — História da Igreja Católica",
        santos: "Alvorecer Católico — Biografia e Teologia dos Santos",
        concilios: "Alvorecer Católico — Magistério dos Concílios Ecumênicos",
        milagres: "Alvorecer Católico — Sinais, Milagres Eucarísticos e Aparições"
    };
    document.getElementById('modal-main-title').innerText = titles[categoryKey] || "Alvorecer Católico";

    if (!map) initMap();
    else {
        buildModalChapters();
        updateEpoch(0);
    }
}

function openWelcomeMenu() {
    pauseStory();
    document.getElementById('welcome-portal').classList.remove('hidden');
}

function updateEpoch(index) {
    if (index < 0 || index >= filteredEpochs.length) return;
    currentEpochIndex = index;
    const epoch = filteredEpochs[currentEpochIndex];

    if (!epoch || !epoch.coords || typeof epoch.coords[0] !== 'number' || typeof epoch.coords[1] !== 'number') return;

    // Update Bottom HUD
    document.getElementById('epoch-era').innerText = epoch.era;
    document.getElementById('epoch-year').innerText = epoch.year;
    document.getElementById('epoch-title').innerText = epoch.title;
    document.getElementById('epoch-region').innerText = epoch.region;
    document.getElementById('epoch-desc').innerText = epoch.overview;
    document.getElementById('epoch-ccc').innerText = epoch.ccc || 'CIC § 767';
    document.getElementById('epoch-counter').innerText = `${currentEpochIndex + 1} / ${filteredEpochs.length}`;
    document.getElementById('timeline-slider').value = currentEpochIndex;

    // Update Modal Reader
    document.getElementById('modal-epoch-year').innerText = epoch.year;
    document.getElementById('modal-epoch-era').innerText = epoch.era;
    document.getElementById('modal-epoch-ccc-badge').innerText = epoch.ccc || 'CIC § 767';
    document.getElementById('modal-epoch-title').innerText = epoch.title;
    document.getElementById('modal-epoch-region').innerText = epoch.region;
    document.getElementById('modal-epoch-overview').innerText = epoch.overview;
    document.getElementById('modal-epoch-theology').innerText = epoch.theology;
    document.getElementById('modal-epoch-quote').innerText = epoch.quote || '';
    document.getElementById('modal-epoch-figures').innerText = epoch.figures;
    document.getElementById('modal-art-title').innerText = epoch.artTitle;
    document.getElementById('modal-art-desc').innerText = epoch.artDesc;

    // Check favorite state
    updateFavoriteButtonState();

    // Clear Old Markers & Routes
    if (currentMarker) map.removeLayer(currentMarker);
    routeLayers.forEach(l => map.removeLayer(l));
    routeLayers = [];

    // Category Icons Badge Mapping
    const categoryIcons = {
        igreja: 'fa-landmark-dome',
        santos: 'fa-user-shield',
        concilios: 'fa-scroll',
        milagres: 'fa-hand-holding-heart'
    };
    const currentIconClass = categoryIcons[currentCategory] || 'fa-cross';

    const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
                 <div style="position:absolute; width:44px; height:44px; background:rgba(245,158,11,0.4); border-radius:50%; animation: pulse-ring 2.5s infinite;"></div>
                 <div style="width:28px; height:28px; background:linear-gradient(135deg, #f59e0b, #b45309); border:2px solid #ffffff; border-radius:50%; box-shadow:0 0 20px #f59e0b; display:flex; align-items:center; justify-content:center; color:#030712; font-size:13px;">
                    <i class="fa-solid ${currentIconClass}"></i>
                 </div>
               </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
    });

    currentMarker = L.marker(epoch.coords, { icon: customIcon }).addTo(map);
    currentMarker.bindPopup(`
        <div style="font-family:'Inter',sans-serif; color:#111827; padding:4px;">
            <strong style="font-family:'Cinzel',serif; font-size:14px; color:#b45309;">${epoch.title}</strong><br>
            <span style="font-size:12px; font-weight:600; color:#4b5563;">${epoch.year} — ${epoch.region}</span>
        </div>
    `);

    // Render Routes
    if (epoch.routes && epoch.routes.length > 0) {
        epoch.routes.forEach(route => {
            if (!route.from || !route.to) return;
            const line = L.polyline([route.from, route.to], {
                color: '#f59e0b',
                weight: 3.5,
                opacity: 0.9,
                dashArray: '8, 12',
                className: 'animated-route'
            }).addTo(map);
            line.bindTooltip(route.label, { permanent: false, direction: 'top' });
            routeLayers.push(line);

            const destIcon = L.divIcon({
                className: 'custom-dest-icon',
                html: `<div style="width:14px; height:14px; background:#f59e0b; border:2px solid #ffffff; border-radius:50%; box-shadow:0 0 10px #f59e0b;"></div>`,
                iconSize: [14, 14], iconAnchor: [7, 7]
            });
            const destMarker = L.marker(route.to, { icon: destIcon }).addTo(map);
            routeLayers.push(destMarker);
        });
    }

    map.flyTo(epoch.coords, epoch.zoom, { duration: 2.0, easeLinearity: 0.25 });
    updateModalActiveCard();
    triggerSacredSoundTransition();
}

function handleGlobalSearch(query) {
    const dropdown = document.getElementById('search-results-dropdown');
    const clearBtn = document.getElementById('search-clear-btn');

    if (!query || query.trim().length < 2) {
        dropdown.classList.add('hidden');
        clearBtn.classList.add('hidden');
        return;
    }

    clearBtn.classList.remove('hidden');
    const q = query.toLowerCase().trim();
    let matches = [];

    // Search across all datasets
    Object.keys(datasets).forEach(cat => {
        datasets[cat].forEach((item, index) => {
            if (item.title.toLowerCase().includes(q) || item.overview.toLowerCase().includes(q) || (item.figures && item.figures.toLowerCase().includes(q)) || (item.region && item.region.toLowerCase().includes(q))) {
                matches.push({ ...item, categoryKey: cat, index });
            }
        });
    });

    if (matches.length === 0) {
        dropdown.innerHTML = `<div class="p-4 text-xs text-gray-400 text-center">Nenhum marco encontrado para "${query}"</div>`;
    } else {
        dropdown.innerHTML = matches.map(m => `
            <div onclick="selectSearchResult('${m.categoryKey}', ${m.index})" class="p-3 hover:bg-gold-500/20 border-b border-gray-800/80 cursor-pointer transition flex items-center justify-between">
                <div>
                    <span class="text-[10px] text-gold-400 font-mono">${m.year}</span>
                    <h5 class="text-xs font-bold text-white font-cinzel">${m.title}</h5>
                    <span class="text-[10px] text-gray-400">${m.region}</span>
                </div>
                <i class="fa-solid fa-chevron-right text-xs text-gold-400"></i>
            </div>
        `).join('');
    }
    dropdown.classList.remove('hidden');
}

function clearSearch() {
    document.getElementById('global-search-input').value = '';
    document.getElementById('search-results-dropdown').classList.add('hidden');
    document.getElementById('search-clear-btn').classList.add('hidden');
}

function selectSearchResult(catKey, index) {
    selectCategory(catKey);
    updateEpoch(index);
    clearSearch();
}

function onSliderChange(val) {
    pauseStory();
    updateEpoch(parseInt(val, 10));
}

function toggleFavoritesDrawer() {
    document.getElementById('favorites-drawer').classList.toggle('translate-x-full');
}

function toggleCurrentFavorite() {
    const currentItem = filteredEpochs[currentEpochIndex];
    if (!currentItem) return;

    const existingIdx = favorites.findIndex(f => f.title === currentItem.title);
    if (existingIdx >= 0) {
        favorites.splice(existingIdx, 1);
    } else {
        favorites.push({
            title: currentItem.title,
            year: currentItem.year,
            categoryKey: currentCategory,
            index: currentEpochIndex
        });
    }

    localStorage.setItem('ecclesia_favs', JSON.stringify(favorites));
    updateFavoriteButtonState();
    updateFavoritesUI();
}

function updateFavoriteButtonState() {
    const currentItem = filteredEpochs[currentEpochIndex];
    const icon = document.getElementById('fav-current-icon');
    if (!currentItem || !icon) return;

    const isFav = favorites.some(f => f.title === currentItem.title);
    icon.className = isFav ? "fa-solid fa-bookmark text-gold-400" : "fa-regular fa-bookmark";
}

function updateFavoritesUI() {
    const list = document.getElementById('favorites-list');
    const badge = document.getElementById('fav-count-badge');
    badge.innerText = favorites.length;
    badge.classList.toggle('hidden', favorites.length === 0);

    if (favorites.length === 0) {
        list.innerHTML = `<p class="text-xs text-gray-500 italic">Nenhum item salvo no relicário.</p>`;
        return;
    }

    list.innerHTML = favorites.map(f => `
        <div onclick="selectSearchResult('${f.categoryKey}', ${f.index})" class="p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs flex items-center justify-between cursor-pointer">
            <div>
                <span class="text-[10px] text-gold-400 font-mono">${f.year}</span>
                <h6 class="font-bold text-white font-cinzel truncate">${f.title}</h6>
            </div>
            <i class="fa-solid fa-location-arrow text-gold-400"></i>
        </div>
    `).join('');
}

function buildModalChapters() {
    const grid = document.getElementById('modal-chapters-grid');
    grid.innerHTML = '';

    filteredEpochs.forEach((epoch, idx) => {
        const card = document.createElement('div');
        card.id = `modal-card-${idx}`;
        card.className = `p-3 rounded-2xl border transition cursor-pointer flex items-center space-x-3 ${
            idx === currentEpochIndex ? 'bg-gold-500/20 border-gold-500/60' : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
        }`;
        card.onclick = () => {
            pauseStory();
            updateEpoch(idx);
        };

        card.innerHTML = `
            <div class="w-8 h-8 rounded-xl flex items-center justify-center font-cinzel font-bold text-xs ${
                idx === currentEpochIndex ? 'bg-gold-500 text-gray-950 shadow-md' : 'bg-gray-800 text-gray-300'
            }">${idx + 1}</div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-mono text-gold-400 font-semibold">${epoch.year}</span>
                </div>
                <h5 class="text-xs font-bold text-white truncate font-cinzel">${epoch.title}</h5>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateModalActiveCard() {
    filteredEpochs.forEach((_, idx) => {
        const card = document.getElementById(`modal-card-${idx}`);
        if (!card) return;
        if (idx === currentEpochIndex) {
            card.className = "p-3 rounded-2xl border transition cursor-pointer flex items-center space-x-3 bg-gold-500/20 border-gold-500/60 shadow-lg";
        } else {
            card.className = "p-3 rounded-2xl border transition cursor-pointer flex items-center space-x-3 bg-gray-900/60 border-gray-800 hover:border-gray-700";
        }
    });
}

function switchModalTab(tabKey) {
    ['overview', 'theology', 'scripture', 'art'].forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        const content = document.getElementById(`tab-content-${t}`);
        if (t === tabKey) {
            btn.className = "pb-2.5 px-3 border-b-2 border-gold-400 text-gold-400 font-bold";
            content.classList.remove('hidden');
        } else {
            btn.className = "pb-2.5 px-3 border-b-2 border-transparent text-gray-400 hover:text-white";
            content.classList.add('hidden');
        }
    });
}

function openModal() { document.getElementById('encyclopedia-modal').classList.remove('hidden'); }
function closeModal() { document.getElementById('encyclopedia-modal').classList.add('hidden'); }

function modalNextEpoch() {
    if (currentEpochIndex < filteredEpochs.length - 1) updateEpoch(currentEpochIndex + 1);
    else updateEpoch(0);
}

function modalPreviousEpoch() {
    if (currentEpochIndex > 0) updateEpoch(currentEpochIndex - 1);
    else updateEpoch(filteredEpochs.length - 1);
}

function nextEpoch() {
    if (currentEpochIndex < filteredEpochs.length - 1) updateEpoch(currentEpochIndex + 1);
    else pauseStory();
}

function previousEpoch() {
    if (currentEpochIndex > 0) updateEpoch(currentEpochIndex - 1);
}

function togglePlayPause() {
    if (isPlaying) pauseStory();
    else playStory();
}

function playStory() {
    isPlaying = true;
    document.getElementById('play-icon').className = "fa-solid fa-pause";
    document.getElementById('play-text').innerText = translations[currentLang].pause;

    if (currentEpochIndex >= filteredEpochs.length - 1) currentEpochIndex = -1;

    playInterval = setInterval(() => {
        if (currentEpochIndex < filteredEpochs.length - 1) nextEpoch();
        else pauseStory();
    }, 6500);
}

function pauseStory() {
    isPlaying = false;
    document.getElementById('play-icon').className = "fa-solid fa-play";
    document.getElementById('play-text').innerText = translations[currentLang].play;
    if (playInterval) { clearInterval(playInterval); playInterval = null; }
}

function resetMapView() { map.setView([30, 20], 3); }

function focusCurrentPoint() {
    const epoch = filteredEpochs[currentEpochIndex];
    if (epoch && epoch.coords) map.flyTo(epoch.coords, epoch.zoom);
}

function toggleSidebar() {
    sidebarVisible = !sidebarVisible;
    const dock = document.getElementById('bottom-dock');
    const icon = document.getElementById('sidebar-toggle-icon');
    if (sidebarVisible) {
        dock.style.opacity = '1'; dock.style.transform = 'translateY(0)'; dock.style.pointerEvents = 'auto';
        icon.className = "fa-solid fa-sliders";
    } else {
        dock.style.opacity = '0'; dock.style.transform = 'translateY(20px)'; dock.style.pointerEvents = 'none';
        icon.className = "fa-solid fa-eye-slash";
    }
}

function openQuizModal() {
    if (quizQuestions.length === 0) return;
    currentQuizIndex = 0;
    quizScore = 0;
    document.getElementById('quiz-modal').classList.remove('hidden');
    renderQuizQuestion();
}

function closeQuizModal() { document.getElementById('quiz-modal').classList.add('hidden'); }

function renderQuizQuestion() {
    const container = document.getElementById('quiz-content');
    const q = quizQuestions[currentQuizIndex];
    document.getElementById('quiz-score').innerText = `Pontuação: ${quizScore} / ${quizQuestions.length}`;
    document.getElementById('quiz-next-btn').classList.add('hidden');

    let html = `
        <div class="space-y-2">
            <span class="text-xs font-mono font-bold text-gold-400">Pergunta ${currentQuizIndex + 1} de ${quizQuestions.length}</span>
            <h4 class="font-cinzel text-base font-bold text-white">${q.question}</h4>
        </div>
        <div class="space-y-2 pt-2">
    `;
    q.options.forEach((opt, idx) => {
        html += `<button onclick="checkQuizAnswer(${idx})" id="quiz-opt-${idx}" class="w-full text-left p-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs sm:text-sm text-gray-200 transition font-medium">${opt}</button>`;
    });
    html += `</div><div id="quiz-explanation" class="hidden p-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-200 mt-3"></div>`;
    container.innerHTML = html;
}

function checkQuizAnswer(selectedIdx) {
    const q = quizQuestions[currentQuizIndex];
    const correctIdx = q.answer;

    for (let i = 0; i < q.options.length; i++) {
        const btn = document.getElementById(`quiz-opt-${i}`);
        btn.disabled = true;
        if (i === correctIdx) btn.className = "w-full text-left p-3 rounded-xl bg-emerald-600/30 border border-emerald-500 text-xs sm:text-sm text-white font-bold";
        else if (i === selectedIdx) btn.className = "w-full text-left p-3 rounded-xl bg-rose-600/30 border border-rose-500 text-xs sm:text-sm text-white font-bold";
    }

    if (selectedIdx === correctIdx) quizScore++;
    document.getElementById('quiz-score').innerText = `Pontuação: ${quizScore} / ${quizQuestions.length}`;

    const expBox = document.getElementById('quiz-explanation');
    expBox.innerHTML = `<strong>Explicação:</strong> ${q.explanation}`;
    expBox.classList.remove('hidden');

    if (currentQuizIndex < quizQuestions.length - 1) {
        document.getElementById('quiz-next-btn').classList.remove('hidden');
    } else {
        const container = document.getElementById('quiz-content');
        container.innerHTML += `<div class="p-4 rounded-2xl bg-gold-500/20 border border-gold-500/50 text-center space-y-2 mt-4"><h4 class="font-cinzel text-lg font-bold text-gold-400">Excelente! Quiz Concluído</h4><p class="text-xs text-gray-200">Você acertou ${quizScore} de ${quizQuestions.length} perguntas. Continue explorando a história sagrada!</p></div>`;
    }
}

function nextQuizQuestion() {
    currentQuizIndex++;
    renderQuizQuestion();
}

function openFlashcardsModal() {
    if (flashcards.length === 0) return;
    currentFlashcardIdx = 0;
    document.getElementById('flashcards-modal').classList.remove('hidden');
    renderFlashcard();
}

function closeFlashcardsModal() { document.getElementById('flashcards-modal').classList.add('hidden'); }

function renderFlashcard() {
    const fc = flashcards[currentFlashcardIdx];
    document.getElementById('fc-front-title').innerText = fc.frontTitle;
    document.getElementById('fc-front-tag').innerText = fc.frontTag;
    document.getElementById('fc-back-text').innerText = fc.backText;
    document.getElementById('fc-back-ccc').innerText = fc.ccc;
    document.getElementById('fc-counter').innerText = `${currentFlashcardIdx + 1} / ${flashcards.length}`;
    document.querySelector('.flip-card').classList.remove('flipped');
}

function flipCard(cardEl) { cardEl.classList.toggle('flipped'); }
function nextFlashcard() {
    currentFlashcardIdx = (currentFlashcardIdx + 1) % flashcards.length;
    renderFlashcard();
}
function prevFlashcard() {
    currentFlashcardIdx = (currentFlashcardIdx - 1 + flashcards.length) % flashcards.length;
    renderFlashcard();
}

function exportCurrentStudyNote() {
    const epoch = filteredEpochs[currentEpochIndex];
    if (!epoch) return;

    const text = `
==================================================
ALVORECER CATÓLICO — FICHA DE ESTUDO CATEQUÉTICO
Criado por Victor Ladislau Viana
==================================================
Título: ${epoch.title} (${epoch.year})
Era: ${epoch.era} | Local: ${epoch.region}
Referência do Catecismo: ${epoch.ccc || 'CIC § 767'}

PANORAMA HISTÓRICO:
${epoch.overview}

TEOLOGIA & MAGISTÉRIO:
${epoch.theology}

CITAÇÃO SAGRADA:
${epoch.quote || 'N/A'}

FIGURAS CHAVE:
${epoch.figures}
==================================================
Plataforma de Ensino Católico — Alvorecer Católico
Desenvolvido por Victor Ladislau Viana
    `.trim();

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Estudo_${epoch.title.replace(/\s+/g, '_')}.txt`;
    a.click();
}

function toggleAudio() {
    const icon = document.getElementById('audio-icon');
    const btn = document.getElementById('audio-btn');

    if (isAudioPlaying) {
        if (audioCtx) audioCtx.close();
        audioCtx = null;
        isAudioPlaying = false;
        icon.className = "fa-solid fa-volume-xmark";
        btn.className = "w-10 h-10 sm:w-11 sm:h-11 rounded-2xl glass-panel hover:bg-gray-800 text-gold-400 flex items-center justify-center text-sm transition";
    } else {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            isAudioPlaying = true;
            icon.className = "fa-solid fa-volume-high text-gold-400";
            btn.className = "w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gold-500/20 border border-gold-500/50 text-gold-400 flex items-center justify-center text-sm transition";
            triggerSacredSoundTransition();
        } catch(e) {
            console.error("Audio API not supported", e);
        }
    }
}

function triggerSacredSoundTransition() {
    if (!audioCtx || !isAudioPlaying) return;
    const now = audioCtx.currentTime;

    const freqs = [146.83, 220.00, 293.66, 440.00];
    freqs.forEach((f, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.04, now + 0.3 + (idx * 0.1));
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 4.8);
    });
}

function changeLanguage(lang) {
    currentLang = lang;
    document.getElementById('welcome-lang-select').value = lang;
    const t = translations[lang];
    if (!t) return;

    document.getElementById('txt-welcome-sub').innerText = t.welcomeSub;
    document.getElementById('ui-menu-btn').innerText = t.menuBtn;
    document.getElementById('ui-quiz-btn').innerText = t.quizBtn;
    document.getElementById('ui-codice-btn').innerText = t.codiceBtn;
    const filterTitle = document.getElementById('ui-filter-title');
    if (filterTitle) filterTitle.innerText = t.filterTitle;
    document.getElementById('ui-btn-prev').innerText = t.btnPrev;
    document.getElementById('ui-btn-next').innerText = t.btnNext;
    document.getElementById('play-text').innerText = isPlaying ? t.pause : t.play;
    document.getElementById('lbl-theology').innerText = t.theology;
    document.getElementById('lbl-art-gallery').innerText = t.artGallery;
    document.getElementById('lbl-prev-chap').innerText = t.prevChap;
    document.getElementById('lbl-next-chap').innerText = t.nextChap;
}

window.onload = async () => {
    await loadData();
    // Start with the welcome portal open, wait for user selection
    document.getElementById('welcome-portal').classList.remove('hidden');
};

// Global bindings for inline HTML handlers
window.selectCategory = selectCategory;
window.openWelcomeMenu = openWelcomeMenu;
window.handleGlobalSearch = handleGlobalSearch;
window.clearSearch = clearSearch;
window.selectSearchResult = selectSearchResult;
window.toggleMapStyleMenu = toggleMapStyleMenu;
window.setMapStyle = setMapStyle;
window.openQuizModal = openQuizModal;
window.openFlashcardsModal = openFlashcardsModal;
window.toggleAudio = toggleAudio;
window.openModal = openModal;
window.resetMapView = resetMapView;
window.focusCurrentPoint = focusCurrentPoint;
window.toggleFavoritesDrawer = toggleFavoritesDrawer;
window.toggleSidebar = toggleSidebar;
window.onSliderChange = onSliderChange;
window.previousEpoch = previousEpoch;
window.togglePlayPause = togglePlayPause;
window.nextEpoch = nextEpoch;
window.toggleCurrentFavorite = toggleCurrentFavorite;
window.exportCurrentStudyNote = exportCurrentStudyNote;
window.closeModal = closeModal;
window.switchModalTab = switchModalTab;
window.modalPreviousEpoch = modalPreviousEpoch;
window.modalNextEpoch = modalNextEpoch;
window.closeQuizModal = closeQuizModal;
window.checkQuizAnswer = checkQuizAnswer;
window.nextQuizQuestion = nextQuizQuestion;
window.closeFlashcardsModal = closeFlashcardsModal;
window.flipCard = flipCard;
window.prevFlashcard = prevFlashcard;
window.nextFlashcard = nextFlashcard;
window.changeLanguage = changeLanguage;
