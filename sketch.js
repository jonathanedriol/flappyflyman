// flappy-flyman-complet.js
// JS complet — p5.js style (préload/setup/draw) + bouton Spotify fixe, cliquable, ONLY on game over

// CONFIG
const W = 360, H = 640;
const GRAVITY = 0.4, FLAP = -7;
let SPEED = 1.5, ROCKET_RATE = 6, CHICKEN_RATE = 8;

// GAME STATE
let canvas;
let state = 'start'; // 'start'|'play'|'over'
let rocket, enemies = [], obstacles = [], score = 0, best = 0;
let rocketFrames = [], chickenFrames = [], rocketIdx = 0, chickenIdx = 0;
let picImgs = [], picNames = ['pic_petit_haut.png','pic_petit_bas.png','pic_gros_haut.png','pic_gros_bas.png'];
let introFrames = [];
let backgroundIntro1, backgroundIntro2, logo, backgroundGame;
let backgroundGameFrames = [], backgroundGameIdx = 0;
let introBackgroundIdx = 0;
let mainMusic;
let currentPhrase = '';
const phrases = [
  "You'll get 'em next time! 🚀","The chickens are laughing… for now. 🐔","Nice try, pilot! ✈️",
  "Almost made it to the moon! 🌙","That rocket needs more coffee. ☕","Gravity wins again! 🪂",
  "So close… kinda. 😅","Chickens: 1 — You: 0 🐓","Even NASA has bad days. 🛰️",
  "Rocket science is hard, right? 🤓","Mayday! Mayday! 💥","Next flight’s on the house. 🛫",
  "Almost legendary! ✨","At least you looked cool doing it. 😎","Not bad for a rookie. 🎯",
  "Your rocket called… it needs a vacation. 🏝️","You flew like a boss… until you didn’t. 💀",
  "Don’t worry, chickens can’t drive rockets. 🐥","100% effort, 0% survival. 💪","Better luck next launch! 🚀"
];
const spotifyUrl = "https://open.spotify.com/intl-fr/track/27VtBFVZRFBLbn2dKnBNSX?si=e9691dc8dcd64510";

// Button guard
let pointerDownOnButton = false;

// ------------------ PRELOAD ------------------
function preload(){
  // rocket frames
  for(let i=0;i<6;i++) rocketFrames[i] = loadImage(sprites/frame_${i.toString().padStart(2,'0')}.png);
  for(let i=0;i<2;i++) chickenFrames[i] = loadImage(sprites/chicken_${i.toString().padStart(2,'0')}.png);
  for(let i=0;i<4;i++) picImgs[i] = loadImage(sprites/${picNames[i]});
  for(let i=0;i<6;i++) introFrames[i] = loadImage(sprites/avatarintro_${i.toString().padStart(3,'0')}.png);

  backgroundIntro1 = loadImage('sprites/backgroundintro_00.png');
  backgroundIntro2 = loadImage('sprites/backgroundintro_01.png');
  logo = loadImage('sprites/logo.png');
  backgroundGame = loadImage('sprites/fondbleu.png');

  // background frames (optional heavy)
  for(let i=128;i>=1;i--) backgroundGameFrames[128 - i] = loadImage(sprites/background_${i.toString().padStart(3,'0')}.png);

  // sound (optional)
  mainMusic = loadSound && typeof loadSound === 'function' ? loadSound('sounds/main.mp3') : null;
}

// ------------------ SETUP ------------------
function setup(){
  canvas = createCanvas(W, H);
  centerCanvas();
  textFont('monospace');
  textAlign(CENTER, CENTER);
  noSmooth();
  resetGame();

  createSpotifyButton(); // create but hidden
}

// Responsive canvas centering + ensure button position updated
function centerCanvas(){
  const scaleFactor = Math.min(windowWidth / W, windowHeight / H);
  const canvasWidth = W * scaleFactor;
  const canvasHeight = H * scaleFactor;
  canvas.style('width', ${canvasWidth}px);
  canvas.style('height', ${canvasHeight}px);
  const x = (windowWidth - canvasWidth) / 2;
  const y = (windowHeight - canvasHeight) / 2;
  canvas.position(x, y);
  positionSpotifyButton();
}

function windowResized(){
  centerCanvas();
}

// ------------------ DRAW LOOP ------------------
function draw(){
  background('#001e38');

  switch(state){
    case 'start':
      drawStart();
      hideSpotifyButton();
      break;
    case 'play':
      drawPlay();
      hideSpotifyButton();
      break;
    case 'over':
      drawOver();
      showSpotifyButton();
      break;
  }
}

// ------------------ DRAW SCREENS ------------------
function drawStart(){
  if(frameCount % 60 === 0) introBackgroundIdx = (introBackgroundIdx + 1) % 2;
  image(introBackgroundIdx === 0 ? backgroundIntro1 : backgroundIntro2, 0, 0, W, H);
  let logoWidth = W * 0.8;
  let logoHeight = logo.height * (logoWidth / logo.width);
  image(logo, W/2 - logoWidth/2, 100, logoWidth, logoHeight);
  fill(233,46,46); textSize(36); text('FLAPPY FLYMAN', W/2, 100 + logoHeight + 50);
  drawRocket(W/2, 300, introFrames, 300, introFrames[0].height * (300 / introFrames[0].width));
  textSize(24); fill(255); text('TAP or CLICK or SPACE', W/2, 450);
  textSize(32); text('TO START', W/2, 500);
}

function drawPlay(){
  image(backgroundGame, 0, 0, W, H);
  if(frameCount % 30 === 0) backgroundGameIdx = (backgroundGameIdx + 1) % backgroundGameFrames.length;
  let bg = backgroundGameFrames[backgroundGameIdx];
  let bgWidth = bg.width * 0.25;
  let bgHeight = bg.height * 0.25;
  image(bg, (W - bgWidth)/2, H - bgHeight, bgWidth, bgHeight);

  rocket.vel += GRAVITY;
  rocket.y += rocket.vel;
  drawRocket(rocket.x, rocket.y);
  if (rocket.y < 0 || rocket.y > H) gameOver();

  let picSpeed = SPEED + score * 0.05;
  let chickenSpeed = picSpeed * 1.3;
  let enemyFrequency = max(60, 120 - score * 1.5);
  if(frameCount % enemyFrequency === 0){
    if(random() > 0.5) enemies.push(makeChicken());
    else obstacles.push(makePic());
  }

  for(let i = enemies.length - 1; i >= 0; i--){
    let c = enemies[i];
    if(score >= 20){
      if(c.vx === undefined){
        const v = chickenSpeed / Math.sqrt(2);
        if(random() < 0.5){ c.vx = -v; c.vy = v; } else { c.vx = -v; c.vy = -v; }
      }
      c.x += c.vx; c.y += c.vy;
      if(c.y < 0){ c.y = 0; c.vy = -c.vy; }
      if(c.y + c.h > H){ c.y = H - c.h; c.vy = -c.vy; }
    } else {
      c.x -= chickenSpeed;
    }
    drawChicken(c);
    if(c.x + c.w < 0) enemies.splice(i,1);
    if(hitRocket(rocket, c)) gameOver();
    if(!c.passed && c.x + c.w < rocket.x){ c.passed = true; score++; }
  }

  for(let i = obstacles.length - 1; i >= 0; i--){
    let p = obstacles[i];
    p.x -= picSpeed;
    drawPic(p);
    if(p.x + p.w < 0) obstacles.splice(i,1);
    if(hitRocket(rocket, p)) gameOver();
    if(!p.passed && p.x + p.w < rocket.x){ p.passed = true; score++; }
  }

  fill(233,46,46); textSize(36); text(score, W/2, 60);
}

function drawOver(){
  image(backgroundGame, 0, 0, W, H);
  if(frameCount % 30 === 0) backgroundGameIdx = (backgroundGameIdx + 1) % backgroundGameFrames.length;
  let bg = backgroundGameFrames[backgroundGameIdx];
  let bgWidth = bg.width * 0.25, bgHeight = bg.height * 0.25;
  image(bg, (W - bgWidth)/2, H - bgHeight, bgWidth, bgHeight);

  textAlign(CENTER, CENTER);

  // Phrase jaune en premier, wrapping si nécessaire
  fill(255,223,0); textSize(28);
  let phraseMaxWidth = W * 0.9;
  if(textWidth(currentPhrase) > phraseMaxWidth){
    let words = currentPhrase.split(' '), lines = [], line = "";
    for(let w of words){
      let test = line + (line ? " " : "") + w;
      if(textWidth(test) > phraseMaxWidth){ lines.push(line); line = w; } else line = test;
    }
    if(line) lines.push(line);
    for(let i=0;i<lines.length;i++) text(lines[i], W/2, 110 + i * 30);
  } else {
    text(currentPhrase, W/2, 120);
  }

  // Score / Best
  fill(233,46,46); textSize(24);
  text(Score: ${score}    Best: ${best}, W/2, 70);

  // (no restart instructions — CTA Spotify focus)
}

// ------------------ DRAW HELPERS ------------------
function drawRocket(x,y,frames=rocketFrames,width=100,height=34){
  push();
  imageMode(CENTER);
  if(frameCount % (60 / ROCKET_RATE) === 0) rocketIdx = (rocketIdx + 1) % frames.length;
  image(frames[rocketIdx], x, y, width, height);
  pop();
}
function drawChicken(c){
  push();
  imageMode(CENTER);
  if(frameCount % (60 / CHICKEN_RATE) === 0) chickenIdx = (chickenIdx + 1) % chickenFrames.length;
  image(chickenFrames[chickenIdx], c.x + 25, c.y + 25, 50, 50);
  pop();
}
function drawPic(p){ image(p.img, p.x, p.y, p.w, p.h); }

// ------------------ ENTITIES ------------------
function makeChicken(){ return { x: W, y: random(25, H-25), w: 50, h: 50, passed:false }; }
function makePic(){
  const idx = floor(random(4)), img = picImgs[idx];
  let y,w,h,hitboxW;
  switch(picNames[idx]){
    case 'pic_petit_haut.png': w=h=80*1.05; hitboxW=20; y=0; break;
    case 'pic_petit_bas.png': w=h=80*1.05; hitboxW=20; y=H-h; break;
    case 'pic_gros_haut.png': w=h=120*1.05; hitboxW=40; y=0; break;
    case 'pic_gros_bas.png': w=h=120*1.05; hitboxW=40; y=H-h; break;
  }
  return { x: W, y, w, h, hitboxW, img, passed:false };
}

function hitRocket(r,o){
  const wR = 100, hR = 34;
  return (r.x - wR/2 < o.x + o.w && r.x + wR/2 > o.x) &&
         (r.y - hR/2 < o.y + o.h && r.y + hR/2 > o.y);
}

// ------------------ GAME CONTROL ------------------
function resetGame(){
  rocket = { x: 100, y: H/2, vel: 0 };
  enemies = []; obstacles = []; score = 0;
}
function startMusic(){ if(mainMusic && mainMusic.isLoaded && mainMusic.isLoaded()){ if(!mainMusic.isPlaying()) { mainMusic.play(); mainMusic.setLoop(true); } } }
function stopMusic(){ if(mainMusic && mainMusic.isPlaying && mainMusic.isPlaying()) mainMusic.stop(); }

function gameOver(){
  state = 'over';
  best = max(score, best);
  stopMusic();
  currentPhrase = phrases[Math.floor(Math.random()*phrases.length)];
}

// ------------------ INPUTS ------------------
// Unified click/tap handling: ignore clicks that started on the spotify button.
function action(){
  if(state === 'start'){ resetGame(); state = 'play'; startMusic(); }
  else if(state === 'play'){ rocket.vel = FLAP; }
  else if(state === 'over'){ resetGame(); state = 'play'; startMusic(); hideSpotifyButton(); }
}

// p5.js key pressed
function keyPressed(){
  if(key === ' ') action();
}

// p5.js mousePressed receives the native event as argument
function mousePressed(evt){
  // if pointerDownOnButton set by document listener, block action
  if(pointerDownOnButton) { pointerDownOnButton = false; return; }

  // fallback: detect if click is inside button rect (robust)
  const btn = document.getElementById('spotify-button');
  if(btn && btn.style.display !== 'none'){
    const rect = btn.getBoundingClientRect();
    const x = evt.clientX, y = evt.clientY;
    if(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom){
      // click on button -> let the <a> handle it; don't call action()
      return;
    }
  }

  action();
}

// For touch events: p5.js touchStarted can be used too
function touchStarted(evt){
  // same guard
  if(pointerDownOnButton) { pointerDownOnButton = false; return false; }
  // if clicked on button, ignore
  const btn = document.getElementById('spotify-button');
  if(btn && btn.style.display !== 'none'){
    // touches[0] may be available
    const t = (evt.touches && evt.touches[0]) || (evt.changedTouches && evt.changedTouches[0]);
    if(t){
      const x = t.clientX, y = t.clientY;
      const rect = btn.getBoundingClientRect();
      if(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom){
        return false; // prevent game action
      }
    }
  }
  action();
  return false;
}

// ------------------ SPOTIFY BUTTON (create once) ------------------
function createSpotifyButton(){
  if(document.getElementById('spotify-button')) return;
  const btn = document.createElement('a');
  btn.id = 'spotify-button';
  btn.href = spotifyUrl;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.textContent = '🎵 Listen on Spotify';

  // Inline styles safe fallback (does not require CSS edit)
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '14px 32px',
    backgroundColor: '#1DB954',
    color: '#fff',
    borderRadius: '30px',
    fontWeight: '700',
    fontSize: '18px',
    textDecoration: 'none',
    textAlign: 'center',
    boxShadow: '0 0 12px #1DB954',
    cursor: 'pointer',
    userSelect: 'none',
    zIndex: '100000',
    animation: 'pulse 2.5s infinite ease-in-out',
    display: 'none'
  });

  // Stop propagation so the canvas/game doesn't receive the event
  btn.addEventListener('click', function(e){
    e.stopPropagation();
    // do NOT preventDefault() — we want the <a> to open
  }, { passive: false });

  // pointerdown guard: mark that pointer started on the button
  document.addEventListener('pointerdown', function(e){
    if(!e.target) { pointerDownOnButton = false; return; }
    // if the pointerdown target is the button or inside it, flag it
    pointerDownOnButton = !!(e.target.closest && e.target.closest('#spotify-button'));
  }, { capture: true });

  // also touchstart fallback for older browsers
  document.addEventListener('touchstart', function(e){
    if(!e.target) { pointerDownOnButton = false; return; }
    pointerDownOnButton = !!(e.target.closest && e.target.closest('#spotify-button'));
  }, { capture: true, passive: true });

  // Inject pulse keyframes if needed
  if(!document.getElementById('spotify-pulse-style')){
    const style = document.createElement('style');
    style.id = 'spotify-pulse-style';
    style.textContent = 
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 12px #1DB954; }
        50% { box-shadow: 0 0 22px #1DB954; }
      }
    ;
    document.head.appendChild(style);
  }

  document.body.appendChild(btn);
}

function showSpotifyButton(){ const b=document.getElementById('spotify-button'); if(b) b.style.display = 'block'; }
function hideSpotifyButton(){ const b=document.getElementById('spotify-button'); if(b) b.style.display = 'none'; }
function positionSpotifyButton(){ const b=document.getElementById('spotify-button'); if(b) b.style.bottom = '80px'; }

// ------------------ END OF FILE ------------------