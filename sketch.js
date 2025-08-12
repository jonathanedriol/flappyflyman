// flappy-flyman-complet.js
// JS complet — p5.js style (preload/setup/draw) + bouton Spotify cliquable à l'écran de fin

// CONFIG
const W = 360, H = 640;
const GRAVITY = 0.4, FLAP = -7;
let SPEED = 1.5, ROCKET_RATE = 6, CHICKEN_RATE = 4;
let gap = 150;

// VARIABLES
let bird, rockets = [], chickens = [];
let score = 0, best = 0;
let gameOver = false;
let fontRegular, yellowFont;
let spotifyLogoImg;
let spotifyBtnX, spotifyBtnY, spotifyBtnW, spotifyBtnH;

// PRELOAD
function preload() {
  birdImg = loadImage('sprites/bird.png');
  rocketImg = loadImage('sprites/rocket.png');
  chickenImg = loadImage('sprites/chicken.png');
  bgImg = loadImage('sprites/bg.png');
  fontRegular = loadFont('sprites/PressStart2P-Regular.ttf');
  yellowFont = color(255, 255, 0);
  spotifyLogoImg = loadImage('sprites/spotifylogo2.png');
}

// SETUP
function setup() {
  createCanvas(W, H);
  resetGame();
}

// RESET
function resetGame() {
  bird = {
    x: 50,
    y: H / 2,
    vy: 0,
    size: 24
  };
  rockets = [];
  chickens = [];
  score = 0;
  gameOver = false;
}

// DRAW
function draw() {
  background(0);
  image(bgImg, 0, 0, W, H);

  if (!gameOver) {
    // Bird physics
    bird.vy += GRAVITY;
    bird.y += bird.vy;

    // Draw bird
    image(birdImg, bird.x, bird.y, bird.size, bird.size);

    // Spawn rockets
    if (frameCount % (ROCKET_RATE * 60) === 0) {
      let gapY = random(50, H - gap - 50);
      rockets.push({ x: W, y: gapY });
    }

    // Spawn chickens
    if (frameCount % (CHICKEN_RATE * 60) === 0) {
      let cy = random(50, H - 50);
      chickens.push({ x: W, y: cy });
    }

    // Rockets update
    for (let i = rockets.length - 1; i >= 0; i--) {
      rockets[i].x -= SPEED * 60 / frameRate();
      image(rocketImg, rockets[i].x, rockets[i].y - rocketImg.height, rocketImg.width, rocketImg.height);
      image(rocketImg, rockets[i].x, rockets[i].y + gap, rocketImg.width, rocketImg.height);

      // Collision
      if (collides(bird, rockets[i])) {
        gameOver = true;
        best = max(score, best);
      }

      if (rockets[i].x + rocketImg.width < 0) {
        rockets.splice(i, 1);
        score++;
      }
    }

    // Chickens update
    for (let i = chickens.length - 1; i >= 0; i--) {
      chickens[i].x -= SPEED * 60 / frameRate();
      image(chickenImg, chickens[i].x, chickens[i].y, chickenImg.width, chickenImg.height);

      if (collides(bird, chickens[i])) {
        score++;
        chickens.splice(i, 1);
      }

      if (chickens[i].x + chickenImg.width < 0) {
        chickens.splice(i, 1);
      }
    }

    // Out of bounds
    if (bird.y > H || bird.y < 0) {
      gameOver = true;
      best = max(score, best);
    }

    // Score
    drawScore();
  } else {
    drawGameOver();
  }
}

// COLLISION
function collides(b, obj) {
  let bx = b.x, by = b.y, bs = b.size;
  let ox = obj.x, oy = obj.y;
  let ow = obj.width || rocketImg.width;
  let oh = obj.height || rocketImg.height;

  // Rocket collision check (gap handling)
  if (obj === rockets.find(r => r === obj)) {
    let inX = bx + bs > ox && bx < ox + rocketImg.width;
    let hitTop = by < oy && bx + bs > ox && bx < ox + rocketImg.width;
    let hitBottom = by + bs > oy + gap && bx + bs > ox && bx < ox + rocketImg.width;
    return inX && (hitTop || hitBottom);
  }

  // Chicken collision
  return bx + bs > ox && bx < ox + ow && by + bs > oy && by < oy + oh;
}

// SCORE DISPLAY
function drawScore() {
  fill(255);
  textFont(fontRegular);
  textSize(16);
  textAlign(LEFT);
  text(`Score: ${score}`, 10, 20);
  textAlign(RIGHT);
  text(`Best: ${best}`, W - 10, 20);
}

// GAME OVER DISPLAY
function drawGameOver() {
  fill(yellowFont);
  textFont(fontRegular);
  textSize(14);
  textAlign(CENTER);
  text("Game Over!", W / 2, H / 2 - 60);

  fill(255);
  textSize(12);
  text(`Score: ${score}`, W / 2, H / 2 - 40);
  text(`Best: ${best}`, W / 2, H / 2 - 25);

  // Spotify button sizing
  let originalW = 840;
  let originalH = 324;
  let scaleFactor = 0.25;
  spotifyBtnW = originalW * scaleFactor;
  spotifyBtnH = originalH * scaleFactor;

  spotifyBtnX = W / 2 - spotifyBtnW / 2;
  spotifyBtnY = H / 2;

  image(spotifyLogoImg, spotifyBtnX, spotifyBtnY, spotifyBtnW, spotifyBtnH);
}

// CLICK HANDLER
function mousePressed() {
  if (gameOver) {
    if (
      mouseX >= spotifyBtnX &&
      mouseX <= spotifyBtnX + spotifyBtnW &&
      mouseY >= spotifyBtnY &&
      mouseY <= spotifyBtnY + spotifyBtnH
    ) {
      window.open("https://open.spotify.com/playlist/xxxxxxxxxxxx", "_blank");
    } else {
      resetGame();
    }
  }
}

// KEYPRESS
function keyPressed() {
  if (key === ' ' && !gameOver) {
    bird.vy = FLAP;
  } else if (key === ' ' && gameOver) {
    resetGame();
  }
}
