from PIL import Image

def make_adaptive_foreground():
    # Read the original non-square image
    # Note: earlier we overwrote 'mobile/assets/gold icon.png' with 1024x1024
    # Wait, did we overwrite it? Yes, make_square.py saved it back to the same path.
    img_path = 'mobile/assets/gold icon.png'
    img = Image.open(img_path).convert('RGBA')
    
    # Let's make it 1080x1080 but scale the logo down so it fits perfectly in the "safe zone"
    # Adaptive icons have a safe zone of the inner 66% (which is about 712x712 for a 1080x1080 image)
    # The current gold icon.png is 1024x1024 and the logo takes up most of it.
    
    # We will create a massive 1500x1500 black square, then paste our 1024x1024 icon in the center.
    # This pushes the edges of the foreground image WAY outside the mask, so the shadow won't be visible.
    
    new_size = 1500
    new_img = Image.new('RGBA', (new_size, new_size), (0, 0, 0, 255))
    
    # Paste the 1024x1024 image in the center
    paste_x = (new_size - img.width) // 2
    paste_y = (new_size - img.height) // 2
    new_img.paste(img, (paste_x, paste_y), img)
    
    # Save as foreground icon
    fg_path = 'mobile/assets/adaptive_foreground.png'
    new_img.save(fg_path)
    print(f"Created adaptive foreground: {fg_path} with size {new_img.size}")

if __name__ == '__main__':
    make_adaptive_foreground()
