with open('index.html', 'r') as f:
    content = f.read()

# Fix bookmark ribbon position so it hangs properly out the bottom of the right page.
# Right now it says absolute -bottom-10 right-20 but the pages wrapper is absolute inset-0.
# The container is relative, so it hangs out. But it's being cut off by the overflow-hidden on the pages wrapper.
# Let's move it outside the pages wrapper.

content = content.replace("""              <!-- Bookmark Ribbon -->
              <div class="absolute -bottom-10 right-20 w-8 h-32 bg-sacred-700 ribbon-tail cursor-pointer hover:-translate-y-2 transition-transform duration-300 z-30 flex items-end justify-center pb-2 text-red-200" onclick="resetToAmbient()" title="Voltar (Marcador)">
                <i data-lucide="arrow-up" class="w-4 h-4"></i>
              </div>
            </div>""", """            </div>

            <!-- Bookmark Ribbon -->
            <div class="absolute -bottom-10 right-20 w-8 h-32 bg-sacred-700 ribbon-tail cursor-pointer hover:-translate-y-2 transition-transform duration-300 z-30 flex items-end justify-center pb-2 text-red-200" onclick="resetToAmbient()" title="Voltar (Marcador)">
              <i data-lucide="arrow-up" class="w-4 h-4"></i>
            </div>""")

with open('index.html', 'w') as f:
    f.write(content)
