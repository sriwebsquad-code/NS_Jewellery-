from PIL import Image

def make_white_transparent(img_path, output_path):
    img = Image.open(img_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    
    newData = []
    # threshold for considering a pixel "white"
    threshold = 240
    for item in datas:
        # If the pixel is close to white, make it transparent
        # item is (R, G, B, A)
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            # Check how close it is to white for alpha blending (optional, but a hard threshold is fine)
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    make_white_transparent(
        r"C:\Users\smile\.gemini\antigravity-ide\brain\c11144b6-2ab3-4a35-a5ec-c27bdd300837\.user_uploaded\media_1789715701373.png",
        r"d:\All projects\NS_jewellery\mobile\assets\logo_transparent.png"
    )
