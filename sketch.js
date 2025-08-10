if (score >= 20) {
  if (c.vx === undefined) {
    const v = chickenSpeed / Math.sqrt(2);
    if (random() < 0.5) {
      c.vx = -v;
      c.vy = v;
    } else {
      c.vx = -v;
      c.vy = -v;
    }
  }
  c.x += c.vx;
  c.y += c.vy;

  // Rebond sur les bords haut et bas
  if (c.y < 0) {
    c.y = 0;
    c.vy = -c.vy;
  } else if (c.y + c.h > H) {
    c.y = H - c.h;
    c.vy = -c.vy;
  }
} else {
  c.x -= chickenSpeed;
}
