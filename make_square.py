from PIL import Image

def make_square():
    img_path = 'mobile/assets/gold icon.png'
    img = Image.open(img_path).convert('RGBA')
    width, height = img.size
    
    # We want a perfect square based on the max dimension
    max_dim = max(width, height)
    
    # Create a new square image with a black background
    new_img = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 255))
    
    # Paste the original image in the center
    paste_x = (max_dim - width) // 2
    paste_y = (max_dim - height) // 2
    
    # Composite using alpha just in case, but simple paste is fine
    new_img.paste(img, (paste_x, paste_y), img)
    
    # Resize to 1024x1024 for Expo requirements
    final_img = new_img.resize((1024, 1024), Image.Resampling.LANCZOS)
    
    final_img.save(img_path)
    print(f"Successfully resized and padded gold icon to {final_img.size}")

if __name__ == '__main__':
    make_square()
