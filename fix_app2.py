with open('app.js', 'r') as f:
    content = f.read()

content = content.replace("""}


  if(window.innerWidth < 1024 && sidebarOpen) toggleSidebar();
}

function resetToAmbient() {""", """}


function resetToAmbient() {""")

with open('app.js', 'w') as f:
    f.write(content)
