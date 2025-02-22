// assets.js
let assets = {
  fonts: {},
  backgrounds: {},
  birds: {},
};

function preloadAssets() {
  // Load fonts
  assets.fonts.pixelify = loadFont(
    "https://fonts.gstatic.com/s/pixelifysans/v1/CHy2V-3HFKL2Zw7RH_G8qF5Xs9EN4GBC1F6.ttf"
  );
  assets.fonts.press2start = loadFont(
    "https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.ttf"
  );

  // Load background images
  // Once you have your images, uncomment and update these paths:
  // assets.backgrounds.forest = loadImage('assets/backgrounds/forest.png');
  // assets.backgrounds.sunset = loadImage('assets/backgrounds/sunset.png');

  // Load bird images
  // assets.birds.male = loadImage('assets/birds/male.png');
  // assets.birds.female = loadImage('assets/birds/female.png');
  // assets.birds.wingman = loadImage('assets/birds/wingman.png');
}
