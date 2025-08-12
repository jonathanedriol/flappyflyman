// flappy-flyman-complet.js
// JS complet — p5.js style (préload/setup/draw) + bouton Spotify logo rectangulaire en fin de partie

// CONFIG
const W = 360, H = 640;
const GRAVITY = 0.4, FLAP = -7;
let SPEED = 1.5, ROCKET_RATE = 6, CHICKEN_RATE = 8;
let FONT, FONT_SIZE = 20;

// ASSETS
let bg, playerImg, rocketImg, chickenImg, groundImg;
let spotifyLogoImg;

// GAME STATE
let player, rockets = [], chickens = [];
let score = 0, bestScore = 0;
let gameOver = false;
let spotifyButton = { x: 0, y: 0, w: 0, h: 0 };

// PRELOAD
function preload() {
  bg = loadImage("sprites/bg.png");
  playerImg = loadImage("sprites/player.png");
  rocketImg = loadImage("sprites/rocket.png");
  chickenImg = loadImage("sprites/chicken.png");
  groundImg = loadImage("sprites/ground.png");
  spotifyLogoImg = loadImage("sprites/spotifylogo2.png?v=1"); // anti-cache
  FONT = loadFont("sprites/font.ttf");
}

// SETUP
function setup() {
  createCanvas(W, H);
  textFont(FONT);
  resetGame();
}

// RESET
function resetGame() {
  player = { x: 50, y: H / 2, vy: 0 };
  rockets = [];
  chickens = [];
  score = 0;
  gameOver = false;
}

// DRAW
function draw() {
  background(0);
  image(bg, 0, 0, W, H);

  if (!gameOver) {
    // Joueur
    player.vy += GRAVITY;
    player.y += player.vy;
    image(playerImg, player.x, player.y);

    // Génération rockets
    if (frameCount % (ROCKET_RATE * 60) === 0) {
      rockets.push({ x: W, y: random(50, H - 150) });
    }
    for (let i = rockets.length - 1; i >= 0; i--) {
      rockets[i].x -= SPEED * 3;
      image(rocketImg, rockets[i].x, rockets[i].y);
      if (rockets[i].x < -50) rockets.splice(i, 1);
    }

    // Génération chickens
    if (frameCount % (CHICKEN_RATE * 60) === 0) {
      chickens.push({ x: W, y: random(50, H - 150) });
    }
    for (let i = chickens.length - 1; i >= 0; i--) {
      chickens[i].x -= SPEED * 2;
      image(chickenImg, chickens[i].x, chickens[i].y);
      if (chickens[i].x < -50) chickens.splice(i, 1);
    }

    // Score
    fill(255);
    textSize(FONT_SIZE);
    textAlign(LEFT, TOP);
    text("Score: " + score, 10, 10);

    // Collisions simples
    if (player.y > H - 50 || player.y < 0) endGame();

  } else {
    // Écran de fin
    fill(255, 255, 0);
    textSize(FONT_SIZE);
    textAlign(CENTER, CENTER);
    text("Score: " + score, W / 2, H / 2 - 60);
    text("Best: " + bestScore, W / 2, H / 2 - 30);

    // Afficher le logo Spotify en bouton
    let logoTargetWidth = 200;
    let aspectRatio = spotifyLogoImg.height / spotifyLogoImg.width;
    let logoTargetHeight = logoTargetWidth * aspectRatio;
    spotifyButton.w = logoTargetWidth;
    spotifyButton.h = logoTargetHeight;
    spotifyButton.x = (W - logoTargetWidth) / 2;
    spotifyButton.y = H / 2 + 20;
    image(spotifyLogoImg, spotifyButton.x, spotifyButton.y, spotifyButton.w, spotifyButton.h);
  }
}

// INPUTS
function keyPressed() {
  if (!gameOver && (key === ' ' || keyCode === UP_ARROW)) {
    player.vy = FLAP;
    score++;
  } else if (gameOver) {
    resetGame();
  }
}

function mousePressed() {
  if (!gameOver) {
    player.vy = FLAP;
    score++;
  } else {
    if (
      mouseX >= spotifyButton.x &&
      mouseX <= spotifyButton.x + spotifyButton.w &&
      mouseY >= spotifyButton.y &&
      mouseY <= spotifyButton.y + spotifyButton.h
    ) {
      window.open("https://open.spotify.com/playlist/XXXXXXXXXXXX", "_blank");
    } else {
      resetGame();
    }
  }
}

// FIN DE PARTIE
function endGame() {
  gameOver = true;
  if (score > bestScore) bestScore = score;
}
