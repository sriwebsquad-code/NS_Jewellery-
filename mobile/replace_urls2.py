import os

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
            
        # VERY SPECIFIC REPLACEMENTS
        content = content.replace(
            "'https://ns-jewellery.onrender.com/api/", 
            "`${ENV.API_URL}/"
        ).replace(
            "`https://ns-jewellery.onrender.com/api/", 
            "`${ENV.API_URL}/"
        ).replace(
            "const API_URL = 'https://ns-jewellery.onrender.com';",
            "const API_URL = ENV.BASE_URL;"
        ).replace(
            "const API_URL = 'https://ns-jewellery.onrender.com'; // local backend",
            "const API_URL = ENV.BASE_URL; // local backend"
        ).replace(
            "`https://ns-jewellery.onrender.com${item.images[0]}`",
            "`${ENV.BASE_URL}${item.images[0]}`"
        ).replace(
            "`https://ns-jewellery.onrender.com${item.image}`",
            "`${ENV.BASE_URL}${item.image}`"
        ).replace(
            "'https://ns-jewellery.onrender.com/api/rates'",
            "`${ENV.API_URL}/rates`"
        ).replace(
            "'https://ns-jewellery.onrender.com/api/digital/locker-dashboard'",
            "`${ENV.API_URL}/digital/locker-dashboard`"
        ).replace(
            "'https://ns-jewellery.onrender.com/api/plans/my-plans'",
            "`${ENV.API_URL}/plans/my-plans`"
        ).replace(
            "'https://ns-jewellery.onrender.com/api/user/profile'",
            "`${ENV.API_URL}/user/profile`"
        )
        
        # fix the fetch('`${ENV.API_URL}/rates`') to fetch(`${ENV.API_URL}/rates`)
        content = content.replace("fetch('`${ENV.API_URL}", "fetch(`${ENV.API_URL}")
        content = content.replace("`')", "`)")
        
        # and fetchWithTimeout
        content = content.replace("fetchWithTimeout('`${ENV.API_URL}", "fetchWithTimeout(`${ENV.API_URL}")

    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated", file)
