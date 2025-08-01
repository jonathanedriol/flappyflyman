// Flappy Flyman – version stabilisée
let rocket, enemies = [], obstacles = [], score = 0, best = 0;
let rocketFrames = [], chickenFrames = [], rocketIdx = 0, chickenIdx = 0;
let picImgs = [], picNames = ['pic_petit_haut.png', 'pic_petit_bas.png', 'pic_gros_haut.png', 'pic_gros_bas.png'];
let introFrames = [];
let backgroundIntro1, backgroundIntro2, logo;
let backgroundGameFrames = [], backgroundGameIdx = 0;
const GRAVITY = 0.4, FLAP = -7, W = 360, H = 640;
let SPEED = 1.5, ROCKET_RATE = 6, CHICKEN_RATE = 8;
let state = 'start';
let canvas;
let introBackgroundIdx = 0;
let mainMusic;

function preload() {
  // Rocket
  for (let i = 0; i < 6; i++) {
    rocketFrames[i] = loadImage(`sprites/frame_${i.toString().padStart(2, '0')}.png`);
  }
  // Chickens
  for (let i = 0; i < 2; i++) {
    chickenFrames[i] = loadImage(`sprites/chicken_${i.toString().padStart(2, '0')}.png`);
  }
  // Pics
  for (let i = 0; i < 4; i++) {
    picImgs[i] = loadImage(`sprites/${picNames[i]}`);
  }
  // Intro
  for (let i = 0; i < 6; i++) {
    introFrames[i] = loadImage(`sprites/avatarintro_${i.toString().padStart(3, '0')}.png`);
  }
  backgroundIntro1 = loadImage('sprites/backgroundintro_00.png');
  backgroundIntro2 = loadImage('sprites/backgroundintro_01.png');
  logo = loadImage('sprites/logo.png');

  // Backgrounds
  backgroundGame = loadImage('sprites/fondbleu.png');
  for (let i = 128; i >= 1; i--) {
    backgroundGameFrames[128 - i] = loadImage(`sprites/background_${i.toString().padStart(3, '0')}.png`);
  }
  mainMusic = loadSound('sounds/main.mp3');
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

function windowResized() {
  centerCanvas();
}

function draw() {
  background('#001e38');
  switch (state) {
    case 'start': drawStart(); break;
    case 'play':  drawPlay();  break;
    case 'over':  drawOver();  break;
  }
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

function drawStart() {
  if (frameCount % 60 === 0) introBackgroundIdx = (introBackgroundIdx + 1) % 2;
  background(introBackgroundIdx === 0 ? backgroundIntro1 : backgroundIntro2);

  let logoWidth = W * 0.8;
  let logoHeight = logo.height * (logoWidth / logo.width);
  image(logo, W/2 - logoWidth/2, 100, logoWidth, logoHeight);

  fill(233, 46, 46);
  textSize(36); text('FLAPPY FLYMAN', W/2, 100 + logoHeight + 50);
  drawRocket(W/2, 300, introFrames, 300, introFrames[0].height * (300 / introFrames[0].width));

  textSize(24); text('TAP or CLICK or SPACE', W/2, 450);
  textSize(32); text('TO START', W/2, 500);
}

function drawOver() {
  image(backgroundGame, 0, 0, W, H);
  if (frameCount % 30 === 0) backgroundGameIdx = (backgroundGameIdx + 1) % backgroundGameFrames.length;

  let bg = backgroundGameFrames[backgroundGameIdx];
  let bgWidth = bg.width * 0.25;
  let bgHeight = bg.height * 0.25;
  image(bg, (W - bgWidth) / 2, H - bgHeight, bgWidth, bgHeight);

  fill(233, 46, 46);
  textSize(36); text('GAME OVER', W/2, 100);
  textSize(24); text('Score: ' + score, W/2, 150);
  text('Best: ' + best, W/2, 200);
  text('TAP or CLICK or SPACE', W/2, 250);
  textSize(32); text('TO RESTART', W/2, 300);
}

function drawPlay() {
  image(backgroundGame, 0, 0, W, H);
  if (frameCount % 30 === 0) backgroundGameIdx = (backgroundGameIdx + 1) % backgroundGameFrames.length;

  let bg = backgroundGameFrames[backgroundGameIdx];
  let bgWidth = bg.width * 0.25;
  let bgHeight = bg.height * 0.25;
  image(bg, (W - bgWidth) / 2, H - bgHeight, bgWidth, bgHeight);

  rocket.vel += GRAVITY;
  rocket.y += rocket.vel;
  drawRocket(rocket.x, rocket.y);
  if (rocket.y < 0 || rocket.y > H) gameOver();

  let enemyFrequency = max(60, 120 - score * 1.5); // limite basse = 60
  if (frameCount % enemyFrequency === 0) {
    if (random() > 0.5) enemies.push(makeChicken());
    else obstacles.push(makePic());
  }

  let chickenSpeed = SPEED + score * 0.05;
  for (let i = enemies.length - 1; i >= 0; i--) {
    let c = enemies[i];
    c.x -= chickenSpeed;
    drawChicken(c);
    if (c.x + c.w < 0) enemies.splice(i, 1);
    if (hitRocket(rocket, c)) gameOver();
    if (!c.passed && c.x + c.w < rocket.x) { c.passed = true; score++; }
  }

  let picSpeed = SPEED + score * 0.05;
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let p = obstacles[i];
    p.x -= picSpeed;
    drawPic(p);
    if (p.x + p.w < 0) obstacles.splice(i, 1);
    if (hitRocket(rocket, p)) gameOver();
    if (!p.passed && p.x + p.w < rocket.x) { p.passed = true; score++; }
  }

  fill(233, 46, 46);
  textSize(36);
  text(score, W/2, 60);
}

function drawChicken(c) {
  push();
  imageMode(CENTER);
  if (frameCount % (60 / CHICKEN_RATE) === 0) chickenIdx = (chickenIdx + 1) % chickenFrames.length;
  image(chickenFrames[chickenIdx], c.x + 25, c.y + 25, 50, 50);
  pop();
}

function drawPic(p) { image(p.img, p.x, p.y, p.w, p.h); }

function makeChicken() { return { x: W, y: random(25, H - 25), w: 50, h: 50, passed: false }; }

function makePic() {
  const idx = floor(random(4));
  const img = picImgs[idx];
  let y, w, h, hitboxW;
  switch (picNames[idx]) {
    case 'pic_petit_haut.png': w=h=80*1.05; hitboxW=20; y=0; break;
    case 'pic_petit_bas.png':  w=h=80*1.05; hitboxW=20; y=H-h; break;
    case 'pic_gros_haut.png':  w=h=120*1.05; hitboxW=40; y=0; break;
    case 'pic_gros_bas.png':   w=h=120*1.05; hitboxW=40; y=H-h; break;
  }
  return { x: W, y, w, h, hitboxW, img, passed: false };
}

function hitRocket(r, o) {
  const wR = 100, hR = 34;
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
  if (mainMusic && mainMusic.isPlaying()) mainMusic.stop();
}

function keyPressed() { if (key === ' ') action(); }
function mousePressed() { action(); }

function action() {
  if (state === 'start') {
    resetGame(); state = 'play';
    if (mainMusic && !mainMusic.isPlaying()) mainMusic.loop();
  } else if (state === 'play') {
    rocket.vel = FLAP;
  } else if (state === 'over') {
    resetGame(); state = 'play';
    if (mainMusic && !mainMusic.isPlaying()) mainMusic.loop();
  }
}
