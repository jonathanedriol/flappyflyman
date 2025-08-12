// flappy-flyman-complet.js
// JS complet — p5.js style (préload/setup/draw) + bouton Spotify fixe, cliquable, ONLY on game over

// CONFIG
const W = 360, H = 640;
const GRAVITY = 0.4, FLAP = -7;
let SPEED = 1.5, ROCKET_RATE = 6, CHICKEN_RATE = 200;
let fontRegular;

// SPRITES
let playerImg, rocketImg, chickenImg, bgImg;
let spotifyLogoImg;

// GAME STATE
let player, rockets = [], chickens = [];
let score = 0, bestScore = 0;
let gameOver = false;

// BOUTON SPOTIFY
let spotifyBtnX, spotifyBtnY, spotifyBtnW, spotifyBtnH;
const spotifyURL = "https://open.spotify.com/playlist/xxxxxx"; // Ton lien ici

function preload() {
  playerImg = loadImage('sprites/player.png');
  rocketImg = loadImage('sprites/rocket.png');
  chickenImg = loadImage('sprites/chicken.png');
  bgImg = loadImage('sprites/bg.png');
  spotifyLogoImg = loadImage('sprites/spotifylogo2.png'); // nouveau logo
  fontRegular = loadFont('sprites/PressStart2P-Regular.ttf');
}

function setup() {
  createCanvas(W, H);
  textFont(fontRegular);
  resetGame();
}

function draw() {
  background(0);
  image(bgImg, 0, 0, W, H);

  if (!gameOver) {
    updateGame();
    drawGame();
  } else {
    drawGame();
    drawGameOver();
  }
}

function resetGame() {
  player = {
    x: 50,
    y: height / 2,
    vy: 0,
    size: 24
  };
  rockets = [];
  chickens = [];
  score = 0;
  gameOver = false;
}

function updateGame() {
  player.vy += GRAVITY;
  player.y += player.vy;

  if (frameCount % floor(ROCKET_RATE * 60) === 0) {
    rockets.push({
      x: width,
      y: random(50, height - 50),
      w: 40,
      h: 20
    });
  }

  if (frameCount % CHICKEN_RATE === 0) {
    chickens.push({
      x: width,
      y: random(50, height - 50),
      w: 20,
      h: 20
    });
  }

  rockets.forEach((r, i) => {
    r.x -= SPEED * 3;
    if (collideRectCircle(r.x, r.y, r.w, r.h, player.x, player.y, player.size)) {
      endGame();
    }
  });

  chickens.forEach((c, i) => {
    c.x -= SPEED;
    if (collideRectCircle(c.x, c.y, c.w, c.h, player.x, player.y, player.size)) {
      score++;
      chickens.splice(i, 1);
    }
  });

  if (player.y > height || player.y < 0) {
    endGame();
  }
}

function drawGame() {
  image(playerImg, player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);

  rockets.forEach(r => {
    image(rocketImg, r.x, r.y, r.w, r.h);
  });

  chickens.forEach(c => {
    image(chickenImg, c.x, c.y, c.w, c.h);
  });

  fill(255, 255, 0);
  textSize(12);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);
  textAlign(RIGHT, TOP);
  text("Best: " + bestScore, width - 10, 10);
}

function drawGameOver() {
  fill(255, 255, 0);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("GAME OVER", width / 2, height / 2 - 60);

  // CALCUL dimensions optimales du logo (proportions conservées)
  let targetW = 160; // largeur réduite pour mobile
  let aspect = spotifyLogoImg.height / spotifyLogoImg.width;
  let targetH = targetW * aspect;

  spotifyBtnW = targetW;
  spotifyBtnH = targetH;
  spotifyBtnX = width / 2 - spotifyBtnW / 2;
  spotifyBtnY = height / 2;

  image(spotifyLogoImg, spotifyBtnX, spotifyBtnY, spotifyBtnW, spotifyBtnH);
}

function endGame() {
  gameOver = true;
  if (score > bestScore) {
    bestScore = score;
  }
}

function mousePressed() {
  if (gameOver) {
    if (mouseX >= spotifyBtnX && mouseX <= spotifyBtnX + spotifyBtnW &&
        mouseY >= spotifyBtnY && mouseY <= spotifyBtnY + spotifyBtnH) {
      window.open(spotifyURL, '_blank');
    } else {
      resetGame();
    }
  }
}

function keyPressed() {
  if (key === ' ') {
    if (gameOver) {
      resetGame();
    } else {
      player.vy = FLAP;
    }
  }
}

function mouseClicked() {
  if (!gameOver) {
    player.vy = FLAP;
  }
}
