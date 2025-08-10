// Flappy Flyman – adapté pour smartphones
let rocket, enemies = [], obstacles = [], score = 0, best = 0;
let rocketFrames = [], chickenFrames = [], rocketIdx = 0, chickenIdx = 0;
let picImgs = [], picNames = ['pic_petit_haut.png', 'pic_petit_bas.png', 'pic_gros_haut.png', 'pic_gros_bas.png'];
let introFrames = [];
let backgroundIntro1, backgroundIntro2, logo;
let backgroundGameFrames = [];
let backgroundGameIdx = 0;
const GRAVITY = 0.4, FLAP = -7, W = 360, H = 640, SPEED = 1.5, ROCKET_RATE = 6, CHICKEN_RATE = 8;
let state = 'start';
let canvas;
let introBackgroundIdx = 0;

function preload() {
  // avatar
  for (let i = 0; i < 6; i++) {
    let num = i.toString().padStart(2, '0');
    rocketFrames[i] = loadImage(`sprites/frame_${num}.png`);
  }
  // poulets & pics
  for (let i = 0; i < 2; i++) {
    let num = i.toString().padStart(2, '0');
    chickenFrames[i] = loadImage(`sprites/chicken_${num}.png`);
  }
  for (let i = 0; i < 4; i++) {
    picImgs[i] = loadImage(`sprites/${picNames[i]}`);
  }
  // intro
  for (let i = 0; i < 6; i++) {
    let num = i.toString().padStart(3, '0');
    introFrames[i] = loadImage(`sprites/avatarintro_${num}.png`);
  }
  // fonds d'introduction
  backgroundIntro1 = loadImage('sprites/backgroundintro_00.png');
  backgroundIntro2 = loadImage('sprites/backgroundintro_01.png');
  // logo
  logo = loadImage('sprites/logo.png');
  // fond de jeu
  backgroundGame = loadImage('sprites/fondbleu.png'); // Charger l'image de fond
  // fonds de jeu animés (chargés dans l'ordre inverse)
  for (let i = 128; i >= 1; i--) {
    let num = i.toString().padStart(3, '0');
    backgroundGameFrames[128 - i] = loadImage(`sprites/background_${num}.png`);
  }
}

function setup() {
  canvas = createCanvas(W, H);
  centerCanvas();
  resetGame();
  textFont('monospace');
  textAlign(CENTER, CENTER);
  noSmooth();
}

function centerCanvas() {
  const x = (windowWidth - width) / 2;
  const y = (windowHeight - height) / 2;
  canvas.position(x, y);
}

function draw() {
  background('#001e38');
  switch (state) {
    case 'start': drawStart(); break;
    case 'play':  drawPlay();  break;
    case 'over':  drawOver();  break;
  }
}

function drawStart() {
  if (frameCount % 60 === 0) {
    introBackgroundIdx = (introBackgroundIdx + 1) % 2;
  }
  if (introBackgroundIdx === 0) {
    background(backgroundIntro1);
  } else {
    background(backgroundIntro2);
  }
  // Logo
  let logoWidth = W * 0.8; // 80% de la largeur du canvas
  let logoHeight = logo.height * (logoWidth / logo.width);
  let logoY = 100; // Position Y du logo descendue
  image(logo, W/2 - logoWidth/2, logoY, logoWidth, logoHeight); // centré horizontalement
  // Titre
  fill(233, 46, 46); // rouge
  textSize(36); text('FLAPPY FLYMAN', W/2, logoY + logoHeight + 50); // Position Y descendue
  // Avatar intro
  let avatarWidth = 300; // largeur cible augmentée encore
  let avatarHeight = introFrames[0].height * (avatarWidth / introFrames[0].width);
  let avatarY = 300; // Position Y de l'avatar descendue
  drawRocket(W/2, avatarY, introFrames, avatarWidth, avatarHeight);
  // Instruction
  textSize(24); text('TAP or CLICK or SPACE', W/2, 450); // Position Y descendue
  textSize(32); text('TO START', W/2, 500); // Position Y descendue
}

function drawOver() {
  // Dessiner le fond
  image(backgroundGame, 0, 0, W, H);

  // Animer le fond
  if (frameCount % 30 === 0) {
    backgroundGameIdx = (backgroundGameIdx + 1) % backgroundGameFrames.length;
  }
  let bg = backgroundGameFrames[backgroundGameIdx];
  let bgWidth = bg.width * 0.25; // Réduire de 75% (50% + 25%)
  let bgHeight = bg.height * 0.25; // Réduire de 75% (50% + 25%)
  let bgX = (W - bgWidth) / 2; // Centrer horizontalement
  let bgY = H - bgHeight; // Aligner le bas de l'image avec le bas de l'écran

  image(bg, bgX, bgY, bgWidth, bgHeight); // Dessiner l'image de fond

  fill(233, 46, 46); // rouge
  textSize(36); text('GAME OVER', W/2, 100);
  textSize(24); text(`Score : ${score}   Best : ${best}`, W/2, 150);
  textSize(24); text('TAP or CLICK or SPACE to RESTART', W/2, 200);
}

function drawPlay() {
  // Dessiner le fond
  image(backgroundGame, 0, 0, W, H);

  // Animer le fond
  if (frameCount % 30 === 0) {
    backgroundGameIdx = (backgroundGameIdx + 1) % backgroundGameFrames.length;
  }
  let bg = backgroundGameFrames[backgroundGameIdx];
  let bgWidth = bg.width * 0.25; // Réduire de 75% (50% + 25%)
  let bgHeight = bg.height * 0.25; // Réduire de 75% (50% + 25%)
  let bgX = (W - bgWidth) / 2; // Centrer horizontalement
  let bgY = H - bgHeight; // Aligner le bas de l'image avec le bas de l'écran

  image(bg, bgX, bgY, bgWidth, bgHeight); // Dessiner l'image de fond

  rocket.vel += GRAVITY;
  rocket.y += rocket.vel;
  drawRocket(rocket.x, rocket.y);
  if (rocket.y < 0 || rocket.y > H) gameOver();

  if (frameCount % 120 === 0) {
    if (random() > 0.5) {
      enemies.push(makeChicken());
    } else {
      obstacles.push(makePic());
    }
  }

  // Poulets
  for (let i = enemies.length - 1; i >= 0; i--) {
    let c = enemies[i];
    c.x -= SPEED * 2.5;
    drawChicken(c);
    if (c.x + c.w < 0) enemies.splice(i, 1);
    if (hitRocket(rocket, c)) gameOver();
    if (!c.passed && c.x + c.w < rocket.x) { c.passed = true; score++; }
  }

  // Pics
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let p = obstacles[i];
    p.x -= SPEED;
    drawPic(p);
    if (p.x + p.w < 0) obstacles.splice(i, 1);
    if (hitRocket(rocket, p)) gameOver();
    if (!p.passed && p.x + p.w < rocket.x) { p.passed = true; score++; }
  }

  fill(233, 46, 46); // rouge
  textSize(36);
  text(score, W/2, 60);
}

function drawRocket(x, y, frames = rocketFrames, width = 100, height = 34) {
  push();
  imageMode(CENTER);
  if (frameCount % (60 / ROCKET_RATE) === 0) {
    rocketIdx = (rocketIdx + 1) % frames.length;
  }
  image(frames[rocketIdx], x, y, width, height);
  pop();
}

function drawChicken(c) {
  push();
  imageMode(CENTER);
  if (frameCount % (60 / CHICKEN_RATE) === 0) {
    chickenIdx = (chickenIdx + 1) % chickenFrames.length;
  }
  image(chickenFrames[chickenIdx], c.x + 25, c.y + 25, 50, 50);
  pop();
}

function drawPic(p) {
  image(p.img, p.x, p.y, p.w, p.h);
}

function makeChicken() {
  return { x: W, y: random(25, H - 25), w: 50, h: 50, passed: false };
}

function makePic() {
  const idx = floor(random(4));
  const img = picImgs[idx];
  let y, w, h, hitboxW;
  switch (picNames[idx]) {
    case 'pic_petit_haut.png':
      w = 80 * 0.7 * 1.5; // Réduire de 30% puis augmenter de 50%
      h = 80 * 0.7 * 1.5; // Réduire de 30% puis augmenter de 50%
      hitboxW = 20; // Largeur de la hitbox réduite à 20 pixels
      y = 0;
      break;
    case 'pic_petit_bas.png':
      w = 80 * 0.7 * 1.5; // Réduire de 30% puis augmenter de 50%
      h = 80 * 0.7 * 1.5; // Réduire de 30% puis augmenter de 50%
      hitboxW = 20; // Largeur de la hitbox réduite à 20 pixels
      y = H - h;
      break;
    case 'pic_gros_haut.png':
      w = 120 * 0.7 * 1.5; // Réduire de 30% puis augmenter de 50%
      h = 120 * 0.7 * 1.5; // Réduire de 30% puis augmenter de 50%
      hitboxW = 40; // Largeur de la hitbox réduite à 40 pixels
      y = 0;
      break;
    case 'pic_gros_bas.png':
      w = 120 * 0.7 * 1.5; // Réduire de 30% puis augmenter de 50%
      h = 120 * 0.7 * 1.5; // Réduire de 30% puis augmenter de 50%
      hitboxW = 40; // Largeur de la hitbox réduite à 40 pixels
      y = H - h;
      break;
  }
  return { x: W, y, w, h, hitboxW, img, passed: false };
}

function hitRocket(r, o) {
  const wR = 100;   // Largeur de l'avatar
  const hR = 34;    // Hauteur de l'avatar
  return (r.x - wR/2 < o.x + o.w && r.x + wR/2 > o.x) &&
         (r.y - hR/2 < o.y + o.h && r.y + hR/2 > o.y);
}

function resetGame() {
  rocket = { x: 100, y: H/2, vel: 0 };
  enemies = [];
  obstacles = [];
  score = 0;
}

function gameOver() {
  state = 'over';
  best = max(score, best);
}

function keyPressed() {
  if (key === ' ') action();
}

function mousePressed() { action(); }

function action() {
  if (state === 'start') { resetGame(); state = 'play'; }
  else if (state === 'play') rocket.vel = FLAP;
  else if (state === 'over') { resetGame(); state = 'play'; }
}