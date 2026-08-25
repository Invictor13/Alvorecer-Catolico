import re

with open('app.js', 'r') as f:
    content = f.read()

# Let's check where the window.loadFullContent assignment is.
print(content.split("window.loadFullContent = loadFullContent;\n")[-1][:500])
