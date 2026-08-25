import re

with open('index.html', 'r') as f:
    content = f.read()

# I notice that some colors inside index.html for book mode were arbitrary hexes.
# We should probably define them as part of tailwind config or just let them be arbitrary, it's fine.
