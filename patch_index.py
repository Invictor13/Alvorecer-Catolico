import re

with open('index.html', 'r') as f:
    content = f.read()

book_stage_html = """
        <!-- MODO LIVRO (BOOK STAGE) -->
        <div id="book-stage" class="hidden relative w-full h-[80vh] flex-1 perspective-1000 items-center justify-center overflow-visible z-50">
          <div class="book-container relative w-full max-w-5xl h-full sm:h-[90%] mx-auto transform-style-3d transition-transform duration-1000">
            <!-- Book Cover -->
            <div class="book-cover absolute inset-0 z-50 bg-slate-900 dark:bg-black rounded-r-xl border-l-8 border-[#3b2f2f] shadow-2xl origin-left transition-transform duration-1000 flex flex-col items-center justify-center p-8 cursor-pointer group" onclick="openBook()">
              <div class="absolute inset-2 border-2 border-gold-600/30 rounded-xl rounded-l-none pointer-events-none"></div>
              <div class="absolute inset-4 border border-gold-600/20 rounded-lg rounded-l-none pointer-events-none"></div>

              <div class="w-24 h-24 mb-8 text-gold-600/80 group-hover:text-gold-500 transition-colors drop-shadow-md">
                <i data-lucide="cross" class="w-full h-full"></i>
              </div>

              <h2 id="book-cover-title" class="font-cinzel text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gold-400 to-gold-700 text-center mb-4 uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">O Códice</h2>
              <p class="font-garamond italic text-gold-600/60 text-lg">História & Tradição</p>

              <div class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-gradient-to-r from-yellow-600 to-yellow-800 rounded-l-md shadow-inner flex items-center justify-center opacity-80">
                <div class="w-1 h-10 bg-yellow-900 rounded-full"></div>
              </div>
            </div>

            <!-- Pages Wrapper -->
            <div class="book-pages absolute inset-0 flex bg-[#f4ecd8] dark:bg-[#d4c5a9] rounded-xl shadow-inner overflow-hidden border border-[#d9cbb2] dark:border-[#b5a68c]">
              <!-- Spine Shadow -->
              <div class="absolute top-0 bottom-0 left-[50%] w-12 -ml-6 bg-gradient-to-r from-transparent via-black/20 to-transparent z-20 pointer-events-none"></div>

              <!-- Left Page: Visual Retable -->
              <div class="page-left w-1/2 h-full p-6 sm:p-10 border-r border-[#d9cbb2] dark:border-[#b5a68c] relative flex flex-col">
                <div class="absolute inset-0 parchment-texture pointer-events-none opacity-40"></div>

                <div class="relative z-10 flex-1 flex flex-col items-center justify-center space-y-6">
                  <!-- Image Container with Gothic Frame -->
                  <div class="relative w-full h-[60%] border-4 border-slate-800 dark:border-[#2a241e] rounded-t-full shadow-xl overflow-hidden group">
                    <img id="book-image" src="" alt="Iluminura" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>

                    <!-- Lupa de Monge Button -->
                    <button class="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-slate-900/80 text-gold-400 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800 hover:text-gold-300 border border-gold-600/30" title="Inspecionar">
                      <i data-lucide="zoom-in" class="w-5 h-5"></i>
                    </button>
                  </div>

                  <div class="text-center w-full max-w-xs mx-auto">
                    <h4 class="font-cinzel text-sm font-bold text-slate-800 dark:text-[#3e3428] uppercase tracking-wider mb-2">Testemunhas</h4>
                    <div id="book-saints" class="text-xs font-garamond italic text-slate-600 dark:text-[#5c4e3c]"></div>
                  </div>
                </div>

                <!-- Mini Map Button -->
                <button onclick="hideAllStages(); document.getElementById('timeline-map-stage').classList.remove('hidden');" class="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-2 bg-slate-800/10 hover:bg-slate-800/20 rounded-lg transition-colors border border-slate-800/20 text-slate-800 dark:text-[#3e3428] font-cinzel text-xs uppercase font-bold group">
                  <i data-lucide="globe" class="w-4 h-4 text-marian-700 group-hover:animate-spin"></i> Olhar para o Globo
                </button>
              </div>

              <!-- Right Page: Historical Codex -->
              <div class="page-right w-1/2 h-full p-6 sm:p-10 relative overflow-y-auto custom-scrollbar">
                <div class="absolute inset-0 parchment-texture pointer-events-none opacity-40"></div>

                <div class="relative z-10">
                  <div class="text-center mb-8">
                    <div class="flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-widest text-sacred-800 dark:text-sacred-900 mb-2">
                      <span id="book-category"></span> <span>•</span> <span id="book-period"></span>
                    </div>
                    <h2 id="book-title" class="font-cinzel text-2xl sm:text-4xl font-black text-slate-900 dark:text-[#2a241e]"></h2>
                  </div>

                  <div class="prose prose-sm sm:prose text-slate-800 dark:text-[#3e3428] font-garamond text-lg leading-relaxed text-justify mb-8">
                    <p id="book-description" class="drop-cap"></p>
                  </div>

                  <!-- Wax Seal Quote Box -->
                  <div class="relative bg-white/40 dark:bg-[#e6dac3]/50 p-6 rounded-lg border border-[#d9cbb2] dark:border-[#c5b59a] shadow-inner mb-8 mt-12">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-sacred-700 rounded-full flex items-center justify-center shadow-md wax-seal">
                      <i data-lucide="crosshair" class="w-6 h-6 text-red-300 opacity-50"></i>
                    </div>
                    <blockquote id="book-quote" class="font-garamond italic text-center text-lg text-slate-800 dark:text-[#2a241e] mt-4"></blockquote>
                  </div>

                  <div class="mt-8 border-t border-[#d9cbb2] dark:border-[#c5b59a] pt-6">
                    <h4 class="font-cinzel text-sm font-bold text-slate-900 dark:text-[#2a241e] uppercase tracking-wider mb-2">Cenário Secular</h4>
                    <p id="book-secular" class="font-garamond text-[15px] text-slate-700 dark:text-[#4a3e30]"></p>
                  </div>
                </div>
              </div>

              <!-- Bookmark Ribbon -->
              <div class="absolute -bottom-10 right-20 w-8 h-32 bg-sacred-700 ribbon-tail cursor-pointer hover:-translate-y-2 transition-transform duration-300 z-30 flex items-end justify-center pb-2 text-red-200" onclick="resetToAmbient()" title="Voltar (Marcador)">
                <i data-lucide="arrow-up" class="w-4 h-4"></i>
              </div>
            </div>
          </div>
        </div>
"""

# Insert the book stage before the content-stage
if 'id="content-stage"' in content:
    content = content.replace('<!-- Tela Completa do Estudo -->', book_stage_html + '\n        <!-- Tela Completa do Estudo Antigo -->')

with open('index.html', 'w') as f:
    f.write(content)
