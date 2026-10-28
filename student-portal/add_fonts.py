import glob

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    if "https://fonts.googleapis.com/css2?family=Outfit" not in content:
        # Insert Google font link after tailwind script
        content = content.replace(
            '<script src="https://cdn.tailwindcss.com"></script>',
            '<script src="https://cdn.tailwindcss.com"></script>\n  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">'
        )
    
    if "fontFamily: {" not in content:
        # Add font family configuration to tailwind config
        content = content.replace(
            'extend: {',
            'extend: {\n          fontFamily: { sans: [\'Outfit\', \'sans-serif\'] },'
        )
    
    with open(filepath, 'w') as f:
        f.write(content)

for filepath in glob.glob('frontend/*.html'):
    process_file(filepath)

print("Fonts added to all HTML files.")
