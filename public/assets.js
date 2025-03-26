// Define assets globally
let assets = {
  fonts: {},
  sounds: {},
  backgrounds: {},
  birds: {},
  signs: {},
  directions: {},
  cards: {},
  instructions: {},
};

function preloadAssets() {
  // Load sound with error handling
  assets.sounds.backgroundMusic = loadSound(
    "assets/sounds/gameBackgroundMusic.mp3"
  );
  assets.sounds.screech = loadSound("assets/sounds/screech.mp3");

  // Load instruction images with error handling
  assets.instructions.instruction1 = loadImage(
    "assets/images/instructions/1-instruction.png"
  );
  assets.instructions.instruction2 = loadImage(
    "assets/images/instructions/2-instruction.png"
  );
  assets.instructions.instruction3 = loadImage(
    "assets/images/instructions/3-instruction.png"
  );
  assets.instructions.instruction4 = loadImage(
    "assets/images/instructions/4-instruction.png"
  );
  assets.instructions.instruction5 = loadImage(
    "assets/images/instructions/5-instruction.png"
  );
  assets.instructions.level2 = loadImage(
    "assets/images/instructions/level2-instruction.png"
  );
  assets.instructions.level3 = loadImage(
    "assets/images/instructions/level3-instruction.png"
  );
  // Load fonts with error handling
  assets.fonts.headingText = loadFont("assets/fonts/PressStart2P-Regular.ttf");

  assets.fonts.bodyText = loadFont(
    "assets/fonts/PixelifySans-VariableFont_wght.ttf"
  );

  // Load background images with error handling
  assets.backgrounds.forest = loadImage("assets/images/forest.png");
  assets.backgrounds.wingman = loadImage("assets/images/level1-wingman.png");
  assets.backgrounds.win = loadImage("assets/images/win.png");
  assets.backgrounds.lose = loadImage("assets/images/lose.png");

  // directional sprites
  assets.signs.down = loadImage("assets/images/direction/down.png");
  assets.signs.left = loadImage("assets/images/direction/left.png");
  assets.signs.right = loadImage("assets/images/direction/right.png");
  assets.signs.up = loadImage("assets/images/direction/up.png");
  assets.signs.bar = loadImage("assets/images/bar.png");
  assets.cards.x = loadImage("assets/images/direction/x.png");
  // Load bird images with error handling
  assets.birds.male = loadImage("assets/images/cards/male-bird-card.png");
  assets.birds.wingman = loadImage("assets/images/cards/wingman-card.png");
  assets.birds.red = loadImage("assets/images/red.png");

  //signs
  assets.signs.title = loadImage("assets/images/signs/1-title.png");
  assets.signs.choose = loadImage("assets/images/signs/2-choose.png");
  assets.signs.how = loadImage("assets/images/signs/3-how.png");
  assets.signs.success = loadImage("assets/images/signs/4-success.png");
  assets.signs.lose = loadImage("assets/images/signs/5-lose.png");
  assets.signs.level = loadImage("assets/images/signs/6-level.png");

  //cards
  assets.cards.female = loadImage("assets/images/cards/female-card.png");
  assets.cards.altmale = loadImage("assets/images/cards/wingman-male.png");
  assets.cards.male = loadImage("assets/images/cards/male-explain.png");
  assets.cards.wingman = loadImage("assets/images/cards/wingmanside-card.png");
  assets.cards.dance = loadImage("assets/images/cards/combo-card.png");
}
