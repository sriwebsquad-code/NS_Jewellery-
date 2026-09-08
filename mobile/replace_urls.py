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
        # Depth calculation for import path
        # file: ./src/screens/main/HomeScreen.tsx
        parts = file.replace('\\', '/').split('/')
        # ['src', 'screens', 'main', 'HomeScreen.tsx'] -> length 4
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
            
        content = content.replace("'https://ns-jewellery.onrender.com/api", "ENV.API_URL + '")
        content = content.replace("`https://ns-jewellery.onrender.com/api", "`${ENV.API_URL}")
        content = content.replace("'https://ns-jewellery.onrender.com", "ENV.BASE_URL + '")
        content = content.replace("`https://ns-jewellery.onrender.com", "`${ENV.BASE_URL}")
        content = content.replace("https://ns-jewellery.onrender.com", "${ENV.BASE_URL}")

        # Fix specific cases where fetch('ENV.API_URL + '/rates') happens
        content = content.replace("fetch(ENV.API_URL + '/", "fetch(`${ENV.API_URL}/")
        content = content.replace("fetch(ENV.BASE_URL + '/", "fetch(`${ENV.BASE_URL}/")
        # Ensure we remove the trailing quote that was left over
        content = content.replace("fetch(`${ENV.API_URL}/rates')", "fetch(`${ENV.API_URL}/rates`)")
        content = content.replace("fetch(`${ENV.API_URL}/auth/send-otp')", "fetch(`${ENV.API_URL}/auth/send-otp`)")
        content = content.replace("fetch(`${ENV.API_URL}/user/profile')", "fetch(`${ENV.API_URL}/user/profile`)")
        content = content.replace("fetch(`${ENV.API_URL}/kyc/aadhar/send-otp')", "fetch(`${ENV.API_URL}/kyc/aadhar/send-otp`)")
        content = content.replace("fetch(`${ENV.API_URL}/kyc/aadhar/verify')", "fetch(`${ENV.API_URL}/kyc/aadhar/verify`)")
        content = content.replace("fetch(`${ENV.API_URL}/kyc/pan/verify')", "fetch(`${ENV.API_URL}/kyc/pan/verify`)")
        content = content.replace("fetch(`${ENV.API_URL}/auth/mpin/create')", "fetch(`${ENV.API_URL}/auth/mpin/create`)")
        content = content.replace("fetch(`${ENV.API_URL}/auth/mpin/login')", "fetch(`${ENV.API_URL}/auth/mpin/login`)")
        content = content.replace("fetch(`${ENV.API_URL}/auth/mpin/request-reset')", "fetch(`${ENV.API_URL}/auth/mpin/request-reset`)")
        content = content.replace("fetch(`${ENV.API_URL}/auth/mpin/reset')", "fetch(`${ENV.API_URL}/auth/mpin/reset`)")
        content = content.replace("fetch(`${ENV.API_URL}/notifications')", "fetch(`${ENV.API_URL}/notifications`)")
        content = content.replace("fetch(`${ENV.API_URL}/auth/verify-otp')", "fetch(`${ENV.API_URL}/auth/verify-otp`)")
        content = content.replace("fetch(`${ENV.API_URL}/digital/locker-dashboard')", "fetch(`${ENV.API_URL}/digital/locker-dashboard`)")
        content = content.replace("fetch(`${ENV.API_URL}/plans/my-plans')", "fetch(`${ENV.API_URL}/plans/my-plans`)")
        
        content = content.replace("const API_URL = ENV.BASE_URL + '';", "const API_URL = ENV.BASE_URL;")
        
        # In CatalogueScreen.tsx
        content = content.replace("ENV.BASE_URL + '${item.image}'", "`${ENV.BASE_URL}${item.image}`")
        content = content.replace("ENV.BASE_URL + '${item.images[0]}'", "`${ENV.BASE_URL}${item.images[0]}`")

    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated", file)
