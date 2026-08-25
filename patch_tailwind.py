import re

with open('tailwind-config.js', 'r') as f:
    content = f.read()

# Make sure tailwind typography is available if needed, but for now we are just appending prose styles if we want.
# Actually, the user already uses prose in the classes.
