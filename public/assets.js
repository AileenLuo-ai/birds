// Define assets globally
let assets = {
    fonts: {},
    sounds: {},
    backgrounds: {},
    birds: {},
  };
  
  function preloadAssets() {
    console.log("Loading assets...");
    
    // Load sound with error handling
    try {
      assets.sounds.backgroundMusic = loadSound(
        "assets/sounds/gameBackgroundMusic.mp3",
        () => console.log("Background music loaded successfully"),
        (err) => console.error("Failed to load background music:", err)
      );
    } catch (e) {
      console.error("Error loading sound:", e);
    }
  
    // Load fonts with error handling
    try {
      assets.fonts.headingText = loadFont(
        "assets/fonts/PixelifySans-VariableFont_wght.ttf",
        () => console.log("Heading font loaded successfully"),
        (err) => console.error("Failed to load heading font:", err)
      );
      
      assets.fonts.bodyText = loadFont(
        "assets/fonts/PressStart2P-Regular.ttf",
        () => console.log("Body font loaded successfully"),
        (err) => console.error("Failed to load body font:", err)
      );
    } catch (e) {
      console.error("Error loading fonts:", e);
    }
  
    // Load background images with error handling
    try {
      assets.backgrounds.forest = loadImage(
        "assets/images/forest.png",  // Changed filename - you'll need to update this
        () => console.log("Forest background loaded successfully"),
        (err) => console.error("Failed to load forest background:", err)
      );
    } catch (e) {
      console.error("Error loading background:", e);
    }
  
    // Load bird images with error handling
    try {
      assets.birds.male = loadImage(
        "assets/images/redbird.png",
        () => console.log("Male bird loaded successfully"),
        (err) => console.error("Failed to load male bird:", err)
      );
      
      assets.birds.female = loadImage(
        "assets/images/bluebird.png",
        () => console.log("Female bird loaded successfully"),
        (err) => console.error("Failed to load female bird:", err)
      );
    } catch (e) {
      console.error("Error loading birds:", e);
    }
    
    console.log("Asset preloading complete");
  }