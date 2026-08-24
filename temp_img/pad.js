const Jimp = require('jimp');

async function padLogo() {
  try {
    // Read the original image
    const logo = await Jimp.read('../mobile/assets/new_logo.png');
    
    // Create a new blank white image (1024x1024 is recommended for adaptive icons)
    const bg = new Jimp(1024, 1024, '#FFFFFF');
    
    // Scale the logo so it fits in the safe zone (60% of 1024 is roughly 614)
    logo.scaleToFit(600, 600);
    
    // Composite the logo onto the center of the white background
    bg.composite(logo, (1024 - logo.bitmap.width) / 2, (1024 - logo.bitmap.height) / 2);
    
    // Save as adaptive-icon.png
    await bg.writeAsync('../mobile/assets/adaptive-icon.png');
    console.log('Successfully created padded adaptive icon!');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

padLogo();
