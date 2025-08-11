// Flappy Flyman – version optimisée CTA Spotify
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

const spotifyUrl = "https://open.spotify.com/intl-fr/track/27VtBFVZRFBLbn2dKnBNSX?si=e9691dc8dcd64510";
const phrases = [
  "You'll get 'em next time! 🚀",
  "The chickens are laughing… for now. 🐔",
  "Nice try, pilot! ✈️",
  "Almost made it to the moon! 🌙",
  "That rocket needs more coffee. ☕",
  "Gravity wins again! 🪂",
  "So close… kinda. 😅",
  "Chickens: 1 — You: 0 🐓",
  "Even NASA has bad days. 🛰️",
  "Rocket science is hard, right? 🤓",
  "Mayday! Mayday! 💥",
  "Next flight’s on the house. 🛫",
  "Almost legendary! ✨",
  "At least you looked cool doing it. 😎",
  "Not bad for a rookie. 🎯",
  "Your rocket called… it needs a vacation. 🏝️",
  "You flew like a boss… until you didn’t. 💀",
  "Don’t worry, chickens can’t drive rockets. 🐥",
  "100% effort, 0% survival. 💪",
  "Better luck next launch! 🚀",
];
let currentPhrase = "";

function preload() {
  for (let i = 0; i < 6; i++) rocketFrames[i] = loadImage(`sprites/frame_${i.toString().padStart(2, '0')}.png`);
  for (let i = 0; i < 2; i++) chickenFrames[i] = loadImage(`sprites/chicken_${i.toString().padStart(2, '0')}.png`);
  for (let i = 0; i < 4; i++) picImgs[i] = loadImage(`sprites/${picNames[i]}`);
  for (let i = 0; i < 6; i++) introFrames[i] = loadImage(`sprites/avatarintro_${i.toString().padStart(3, '0')}.png`);
  backgroundIntro1 = loadImage('sprites/backgroundintro_00.png');
  backgroundIntro2 = loadImage('sprites/backgroundintro_01.png');
  logo = loadImage('sprites/logo.png');
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
  createSpotifyButton();
}

function centerCanvas() {
  const scaleFactor = Math.min(windowWidth / W, windowHeight / H);
  const canvasWidth = W * scaleFactor;
  const canvasHeight = H * scaleFactor;
  canvas.style('width', `${canvasWidth}px`);
  canvas.style('height', `${canvasHeight}px`);
  const x = (windowWidth - canvasWidth) / 2;
  const y = (windowHeight - canvasHeight) / 2;
  canvas.position(x, y);
  positionSpotifyButton();
}

function windowResized() { centerCanvas(); }

function draw() {
  background('#001e38');
  switch (state) {
    case 'start': drawStart(); hideSpotifyButton(); break;
    case 'play': drawPlay(); hideSpotifyButton(); break;
    case 'over': drawOver(); showSpotifyButton(); break;
  }
}

function drawRocket(x, y, frames = rocketFrames, width = 100, height = 34) {
  push();
  imageMode(CENTER);
  if (frameCount % (60 / ROCKET_RATE) === 0) rocketIdx = (rocketIdx + 1) % frames.length;
  image(frames[rocketIdx], x, y, width, height);
  pop();
}

function drawStart() {
  if (frameCount % 60 === 0) introBackgroundIdx = (introBackgroundIdx + 1) % 2;
  image(introBackgroundIdx === 0 ? backgroundIntro1 : backgroundIntro2, 0, 0, W, H);
  let logoWidth = W * 0.8;
  let logoHeight = logo.height * (logoWidth / logo.width);
  image(logo, W/2 - logoWidth/2, 100, logoWidth, logoHeight);
  fill(233, 46, 46);
  textSize(36); text('FLAPPY FLYMAN', W/2, 100 + logoHeight + 50);
  drawRocket(W/2, 300, introFrames, 300, introFrames[0].height * (300 / introFrames[0].width));
  textSize(24); text('TAP or CLICK or SPACE', W/2, 450);
  textSize(32); text('TO START', W/2, 500);
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

  let picSpeed = SPEED + score * 0.05;
  let chickenSpeed = picSpeed * 1.3;
  let enemyFrequency = max(60, 120 - score * 1.5);
  if (frameCount % enemyFrequency === 0) {
    if (random() > 0.5) enemies.push(makeChicken());
    else obstacles.push(makePic());
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    let c = enemies[i];
    if (score >= 20) {
      if (c.vx === undefined) {
        const v = chickenSpeed / Math.sqrt(2);
        if (random() < 0.5) { c.vx = -v; c.vy = v; }
        else { c.vx = -v; c.vy = -v; }
      }
      c.x += c.vx; c.y += c.vy;
      if (c.y < 0 || c.y + c.h > H) c.vy = -c.vy;
    } else c.x -= chickenSpeed;
    drawChicken(c);
    if (c.x + c.w < 0) enemies.splice(i, 1);
    if (hitRocket(rocket, c)) gameOver();
    if (!c.passed && c.x + c.w < rocket.x) { c.passed = true; score++; }
  }

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
  const idx = floor(random(4)), img = picImgs[idx];
  let y, w, h, hitboxW;
  switch (picNames[idx]) {
    case 'pic_petit_haut.png': w = h = 84; hitboxW = 20; y = 0; break;
    case 'pic_petit_bas.png': w = h = 84; hitboxW = 20; y = H - h; break;
    case 'pic_gros_haut.png': w = h = 126; hitboxW = 40; y = 0; break;
    case 'pic_gros_bas.png': w = h = 126; hitboxW = 40; y = H - h; break;
  }
  return { x: W, y, w, h, hitboxW, img, passed: false };
}

function hitRocket(r, o) {
  const wR = 100, hR = 34;
  return (r.x - wR/2 < o.x + o.w && r.x + wR/2 > o.x) &&
         (r.y - hR/2 < o.y + o.h && r.y + hR/2 > o.y);
}

function resetGame() { rocket = { x: 100, y: H/2, vel: 0 }; enemies = []; obstacles = []; score = 0; }

function startMusic() { if (mainMusic?.isLoaded() && !mainMusic.isPlaying()) { mainMusic.play(); mainMusic.setLoop(true); } }
function stopMusic() { if (mainMusic?.isPlaying()) mainMusic.stop(); }

function gameOver() {
  state = 'over';
  best = max(score, best);
  stopMusic();
  currentPhrase = phrases[Math.floor(Math.random() * phrases.length)];
}

function createSpotifyButton() {
  if (document.getElementById('spotify-button')) return;
  const btn = document.createElement('a');
  btn.id = 'spotify-button';
  btn.href = spotifyUrl;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.textContent = '🎵 Listen on Spotify';
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '70px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '16px 38px',
    background: '#000',
    color: '#4ade80',
    borderRadius: '30px',
    fontWeight: '700',
    fontSize: '20px',
    textDecoration: 'none',
    textAlign: 'center',
    boxShadow: '0 0 14px #4ade80',
    cursor: 'pointer',
    userSelect: 'none',
    zIndex: '1000',
    animation: 'pulse 2.5s infinite ease-in-out',
    display: 'none',
  });
  if (!document.getElementById('pulseAnimation')) {
    const style = document.createElement('style');
    style.id = 'pulseAnimation';
    style.textContent = `@keyframes pulse { 0%,100%{box-shadow:0 0 14px #4ade80;} 50%{box-shadow:0 0 26px #4ade80;} }`;
    document.head.appendChild(style);
  }
  document.body.appendChild(btn);
}

function showSpotifyButton() { document.getElementById('spotify-button').style.display = 'block'; }
function hideSpotifyButton() { document.getElementById('spotify-button').style.display = 'none'; }
function positionSpotifyButton() { const btn = document.getElementById('spotify-button'); if (btn) btn.style.bottom = '70px'; }

function drawOver() {
  image(backgroundGame, 0, 0, W, H);
  if (frameCount % 30 === 0) backgroundGameIdx = (backgroundGameIdx + 1) % backgroundGameFrames.length;
  let bg = backgroundGameFrames[backgroundGameIdx];
  let bgWidth = bg.width * 0.25, bgHeight = bg.height * 0.25;
  image(bg, (W - bgWidth)/2, H - bgHeight, bgWidth, bgHeight);

  textAlign(CENTER, CENTER);

  fill(255, 223, 0);
  textSize(28);
  let phraseMaxWidth = W * 0.9;
  if (textWidth(currentPhrase) > phraseMaxWidth) {
    let words = currentPhrase.split(' '), lines = [], line = "";
    for (let w of words) {
      let testLine = line + (line ? " " : "") + w;
      if (textWidth(testLine) > phraseMaxWidth) { lines.push(line); line = w; }
      else line = testLine;
    }
    if (line) lines.push(line);
    for (let i = 0; i < lines.length; i++) text(lines[i], W/2, 120 + i * 30);
  } else text(currentPhrase, W/2, 120);

  fill(233, 46, 46);
  textSize(24);
  text(`Score: ${score}    Best: ${best}`, W / 2, 70);
}

function action() {
  if (state === 'start') { resetGame(); state = 'play'; startMusic(); }
  else if (state === 'play') { rocket.vel = FLAP; }
  else if (state === 'over') { resetGame(); state = 'play'; startMusic(); hideSpotifyButton(); }
}

function keyPressed() { if (key === ' ') action(); }
function mousePressed() { action(); }
