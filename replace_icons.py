import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content.replace("require('../../../assets/icon.png')", "require('../../../assets/rn_logo.png')")
    new_content = new_content.replace("require('../../../assets/icon_circle.png')", "require('../../../assets/rn_logo.png')")
    new_content = new_content.replace("require('../../../assets/icon_circle_final.png')", "require('../../../assets/rn_logo.png')")

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

def main():
    screens_dir = os.path.join('mobile', 'src')
    for root, dirs, files in os.walk(screens_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
