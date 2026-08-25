with open('app.js', 'r') as f:
    content = f.read()

# I removed the leaflet map init code that was inside loadFullContent earlier by using a regex replacement, maybe I should check if there are any trailing braces.
print(content[16000:])
