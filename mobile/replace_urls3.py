import os
import re

def walk(directory):
    files = []
    for root, _, filenames in os.walk(directory):
        for filename in filenames:
            if filename.endswith('.ts') or filename.endswith('.tsx'):
                files.append(os.path.join(root, filename))
    return files

files = walk('./src')

for file in files:
    if 'env.ts' in file:
        continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    if 'https://ns-jewellery.onrender.com' in content:
        # Calculate depth
        parts = file.replace('\\', '/').split('/')
        depth = len(parts) - 2
        rel_path = './config/env' if depth == 0 else ('../' * depth) + 'config/env'
        
        if 'import { ENV }' not in content:
            lines = content.split('\n')
            last_import = 0
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    last_import = i
            lines.insert(last_import + 1, f"import {{ ENV }} from '{rel_path}';")
            content = '\n'.join(lines)
            
        # Replace 'https://ns-jewellery.onrender.com/api/xxx' with `${ENV.API_URL}/xxx`
        content = re.sub(r"'https://ns-jewellery\.onrender\.com/api/(.*?)'", r"`${ENV.API_URL}/\1`", content)
        
        # Replace 'https://ns-jewellery.onrender.com' (without trailing slash) with ENV.BASE_URL
        content = re.sub(r"'https://ns-jewellery\.onrender\.com'", r"ENV.BASE_URL", content)
        
        # Replace `https://ns-jewellery.onrender.com${item...}` with `${ENV.BASE_URL}${item...}`
        content = re.sub(r"`https://ns-jewellery\.onrender\.com(.*?)\`", r"`${ENV.BASE_URL}\1`", content)

    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated", file)
