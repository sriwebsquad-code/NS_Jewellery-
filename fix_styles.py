import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already using getStyles
    if 'getStyles(colors' in content or 'useStyles(' in content:
        print(f"Skipping {filepath} (already migrated)")
        return

    # Check if file has StyleSheet.create
    if 'StyleSheet.create({' not in content:
        return

    # We need to inject `const styles = getStyles(colors, mode);` into the component body.
    # The component usually starts with `const ScreenName = () => {` or `const ScreenName = ({ route }) => {`
    # We can inject it after `const colors = mode === 'dark' ? Colors.dark : Colors.light;`
    
    if 'const colors = mode === \'dark\' ? Colors.dark : Colors.light;' in content:
        content = content.replace(
            "const colors = mode === 'dark' ? Colors.dark : Colors.light;",
            "const colors = mode === 'dark' ? Colors.dark : Colors.light;\n  const styles = getStyles(colors, mode);"
        )
    else:
        # Some components might not have the colors defined yet.
        print(f"Needs manual color injection: {filepath}")
        return

    # Remove the existing `const styles = StyleSheet.create({` and replace with getStyles
    # We'll replace it at the bottom.
    
    def replacer(match):
        body = match.group(1)
        # Now replace COLORS usage inside the stylesheet body
        body = re.sub(r'COLORS\.white', 'colors.cardBackground', body)
        body = re.sub(r'COLORS\.gray', 'colors.background', body)
        body = re.sub(r'COLORS\.black', 'colors.text', body)
        body = re.sub(r'COLORS\.darkGray', 'colors.textMuted', body)
        body = re.sub(r'COLORS\.lightGray', 'colors.border', body)
        
        return f"const getStyles = (colors: any, mode: string) => StyleSheet.create({{{body}}});"

    # Match `const styles = StyleSheet.create({ ... });`
    content = re.sub(r'const styles = StyleSheet\.create\({(.*)}\);', replacer, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Processed {filepath}")


def main():
    screens_dir = os.path.join('mobile', 'src', 'screens')
    for root, dirs, files in os.walk(screens_dir):
        for file in files:
            if file.endswith('.tsx'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
