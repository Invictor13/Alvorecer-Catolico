import re
with open('app.js', 'r') as f:
    content = f.read()

content = content.replace("document.getElementById('content-stage').classList.contains('hidden') === false", "document.getElementById('book-stage').classList.contains('hidden') === false")
with open('app.js', 'w') as f:
    f.write(content)
