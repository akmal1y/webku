
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = 900;
const H = 260;
const G = 207;

let dino, obstacles, clouds, score;
let best = Number(localStorage.getItem("dinoBest")) || 0;
let speed, spawn, offset, state, frame, last = 0;
let spaceHeld = false;

// DRAW RECTANGLE
function rect(x, y, w, h, color = "#535353") {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

// RESET GAME
function reset() {
  dino = {
    x: 70,
    y: G - 44,
    w: 44,
    h: 44,
    vy: 0,
    ground: true,
    leg: 0,
    duck: false
  };

  obstacles = [];

  clouds = [
    { x: 120, y: 48 },
    { x: 410, y: 76 },
    { x: 710, y: 40 }
  ];

  score = 0;
  speed = 6;
  spawn = 65;
  offset = 0;
  state = "ready";
  frame = 0;
  spaceHeld = false;
}

// JUMP
function jump() {
  if (state === "over") {
    reset();
    state = "running";
  }

  if (state === "ready") {
    state = "running";
  }

  if (dino.ground) {
    dino.vy = -12.5;
    dino.ground = false;
    dino.duck = false;
  }
}

// DRAW NORMAL DINOSAUR
function drawDino(x, y, leg) {
  const c = "#535353";

  rect(x + 5, y + 12, 25, 25, c);
  rect(x + 20, y + 4, 20, 22, c);
  rect(x + 28, y, 18, 13, c);
  rect(x + 39, y + 8, 12, 8, c);
  rect(x, y + 18, 10, 7, c);
  rect(x + 10, y + 28, 10, 9, c);

  rect(x + 34, y + 16, 7, 5, "white");
  rect(x + 38, y + 17, 3, 3, c);

  if (Math.floor(leg) % 2 === 0) {
    rect(x + 23, y + 34, 8, 8, c);
    rect(x + 20, y + 40, 13, 4, c);
    rect(x + 8, y + 34, 7, 6, c);
    rect(x + 5, y + 39, 11, 4, c);
  } else {
    rect(x + 11, y + 34, 8, 8, c);
    rect(x + 8, y + 40, 13, 4, c);
    rect(x + 27, y + 34, 7, 6, c);
    rect(x + 26, y + 39, 11, 4, c);
  }
}

// DRAW DUCK DINOSAUR
function drawDinoDuck(x, y) {
  const c = "#535353";

  rect(x + 2, y + 17, 34, 20, c);
  rect(x + 27, y + 7, 20, 17, c);
  rect(x + 40, y + 12, 12, 8, c);
  rect(x, y + 23, 10, 6, c);

  rect(x + 39, y + 13, 4, 4, "white");
  rect(x + 41, y + 14, 2, 2, c);

  rect(x + 10, y + 34, 10, 7, c);
  rect(x + 25, y + 34, 10, 7, c);
}

// DRAW CACTUS
function drawCactus(o) {
  const x = o.x;
  const y = G - o.h;

  rect(x + 8, y, 8, o.h);
  rect(x + 3, y + 10, 5, 5);
  rect(x, y + 10, 5, 17);

  rect(x + 16, y + o.h * 0.45, 5, 5);
  rect(x + 21, y + o.h * 0.32, 5, 18);
  rect(x + 17, y + o.h * 0.32, 9, 5);
}

// DRAW BIRD
function drawBird(o) {
  const x = o.x;
  const y = o.y;

  const flap = Math.floor(frame / 7) % 2 === 0;

  rect(x + 10, y + 9, 24, 8);
  rect(x + 31, y + 6, 10, 7);
  rect(x + 39, y + 10, 7, 4);

  if (flap) {
    rect(x + 13, y, 8, 8);
    rect(x + 21, y + 3, 8, 6);
    rect(x + 4, y + 5, 10, 6);
  } else {
    rect(x + 13, y + 16, 8, 7);
    rect(x + 21, y + 14, 8, 6);
    rect(x + 4, y + 12, 10, 6);
  }

  rect(x + 34, y + 7, 2, 2, "white");
}

// DRAW TICKET / ROCKET
function drawTicket(o) {
  const x = o.x;
  const y = G - o.h;

  rect(x + 3, y, 25, 30, "#e6b83f");

  rect(x, y + 5, 4, 20, "#e6b83f");
  rect(x + 27, y + 5, 4, 20, "#e6b83f");

  rect(x + 7, y + 4, 17, 2, "#9b7522");
  rect(x + 7, y + 24, 17, 2, "#9b7522");

  rect(x + 10, y + 9, 3, 12, "#9b7522");
  rect(x + 16, y + 9, 3, 12, "#9b7522");
  rect(x + 22, y + 9, 2, 12, "#9b7522");
}

// DRAW GAME
function draw() {
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, W, H);

  // CLOUDS
  clouds.forEach(c => {
    rect(c.x, c.y + 8, 42, 7, "#e7e7e7");
    rect(c.x + 8, c.y, 12, 12, "#e7e7e7");
    rect(c.x + 20, c.y + 3, 13, 10, "#e7e7e7");
  });

  // GROUND
  rect(0, G, W, 2);

  for (let x = -(offset % 42); x < W; x += 42) {
    rect(x, G + 9, 12, 2, "#b8b8b8");
    rect(x + 23, G + 17, 4, 2, "#d0d0d0");
  }

  // OBSTACLES
  obstacles.forEach(o => {
    if (o.type === "bird") {
      drawBird(o);
    } else if (o.type === "ticket") {
      drawTicket(o);
    } else {
      drawCactus(o);
    }
  });

  // DINOSAUR
  if (dino.duck && dino.ground) {
    drawDinoDuck(dino.x, dino.y + 5);
  } else {
    drawDino(dino.x, dino.y, dino.leg);
  }

  // SCORE
  ctx.fillStyle = "#535353";
  ctx.textAlign = "right";
  ctx.font = "bold 18px monospace";

  ctx.fillText(
    String(Math.floor(score)).padStart(5, "0"),
    875,
    30
  );

  // HIGH SCORE
  ctx.fillStyle = "#999";
  ctx.font = "bold 13px monospace";

  ctx.fillText(
    "HI " + String(Math.floor(best)).padStart(5, "0"),
    760,
    30
  );

  ctx.textAlign = "center";

  // READY
  if (state === "ready") {
    ctx.fillStyle = "#535353";
    ctx.font = "bold 18px Arial";

    ctx.fillText(
      "TEKAN SPACE ATAU SENTUH UNTUK MULAI",
      450,
      105
    );
  }

  // GAME OVER
  if (state === "over") {
    ctx.fillStyle = "#535353";
    ctx.font = "bold 24px Arial";

    ctx.fillText("GAME OVER", 450, 100);

    ctx.font = "14px Arial";

    ctx.fillText(
      "Tekan Space atau tombol ULANGI",
      450,
      128
    );
  }

  // DARK MODE EVERY 150 POINTS
  const level = Math.floor(score / 150);

  if (level % 2 === 1) {
    canvas.style.filter = "invert(1)";
  } else {
    canvas.style.filter = "none";
  }
}

// COLLISION DETECTION
function collision(a, b) {
  const ax = a.x + 7;
  const ay = a.y + 5;
  const aw = a.w - 12;
  const ah = a.h - 7;

  const bx = b.x + 2;

  const by = b.type === "bird"
    ? b.y + 4
    : G - b.h + 3;

  const bw = b.type === "bird"
    ? b.w - 5
    : b.w - 4;

  const bh = b.type === "bird"
    ? b.h - 7
    : b.h - 4;

  return (
    ax < bx + bw &&
    ax + aw > bx &&
    ay < by + bh &&
    ay + ah > by
  );
}

// SAVE HIGH SCORE
function saveBest() {
  const currentScore = Math.floor(score);

  if (currentScore > best) {
    best = currentScore;
    localStorage.setItem("dinoBest", best);
  }
}

// UPDATE GAME
function update(dt) {
  if (state !== "running") return;

  frame += dt;
  score += dt * 0.12;

  // SPEED INCREASE EVERY 150 POINTS
  const level = Math.floor(score / 150);

  speed =
    (6 + score / 180) *
    Math.pow(1.25, level);

  offset += speed * dt;

  // DINO GRAVITY
  dino.vy += 0.62 * dt;
  dino.y += dino.vy * dt;

  if (dino.y >= G - dino.h) {
    dino.y = G - dino.h;
    dino.vy = 0;
    dino.ground = true;
  }

  // AUTO JUMP WHILE SPACE IS HELD
  if (
    spaceHeld &&
    dino.ground &&
    state === "running"
  ) {
    dino.vy = -12.5;
    dino.ground = false;
  }

  dino.leg += dt * 0.28;

  // CLOUD MOVEMENT
  clouds.forEach(c => {
    c.x -= speed * 0.22 * dt;

    if (c.x < -60) {
      c.x = W + Math.random() * 150;
      c.y = 30 + Math.random() * 60;
    }
  });

  // MOVE OBSTACLES
  obstacles.forEach(o => {
    const multiplier = o.speedMultiplier || 1;
    o.x -= speed * multiplier * dt;
  });

  // REMOVE OBSTACLES THAT HAVE PASSED
  obstacles = obstacles.filter(o => {
    return o.x + (o.w || 28) > -20;
  });

  // SPAWN OBSTACLES
  if (obstacles.length === 0) {
    spawn -= dt;

    if (spawn <= 0) {
      const chance = Math.random();

      if (score > 250 && chance < 0.22) {
        // BIRD
        const ys = [G - 72, G - 91, G - 52];

        obstacles.push({
          type: "bird",
          x: W + 10,
          y: ys[Math.floor(Math.random() * ys.length)],
          w: 48,
          h: 24
        });

      } else if (score > 100 && chance < 0.38) {
        // FAST TICKET / ROCKET
        obstacles.push({
          type: "ticket",
          x: W + 10,
          w: 31,
          h: 30,
          speedMultiplier: 1.7
        });

      } else {
        // CACTUS
        const h = 28 + Math.random() * 25;
        const w = 23 + Math.random() * 8;

        obstacles.push({
          type: "cactus",
          x: W + 10,
          h: h,
          w: w
        });

        // DOUBLE CACTUS
        if (score > 450 && Math.random() < 0.22) {
          obstacles.push({
            type: "cactus",
            x: W + 44,
            h: h * 0.8,
            w: w * 0.8
          });
        }
      }

      // WAIT BEFORE NEXT OBSTACLE
      spawn = 35 + Math.random() * 15;
    }
  }

  // COLLISION CHECK
  for (const o of obstacles) {
    if (collision(dino, o)) {
      state = "over";
      spaceHeld = false;

      // SAVE HIGH SCORE
      saveBest();

      break;
    }
  }
}

// GAME LOOP
function loop(t) {
  if (!last) last = t;

  const dt = Math.min(2.5, (t - last) / 16.67);
  last = t;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

// KEYBOARD CONTROLS
document.addEventListener("keydown", e => {
  if (
    ["Space", "ArrowUp", "ArrowDown"].includes(e.code)
  ) {
    e.preventDefault();
  }

  if (
    ["Space", "ArrowUp", "KeyW"].includes(e.code) &&
    !e.repeat
  ) {
    jump();
  }

  if (e.code === "Space" && state === "running") {
    spaceHeld = true;
  }

  if (
    e.code === "ArrowDown" &&
    state === "running" &&
    dino.ground
  ) {
    dino.duck = true;
  }

  if (
    e.code === "ArrowDown" &&
    state === "running" &&
    !dino.ground
  ) {
    dino.vy += 2;
  }
});

document.addEventListener("keyup", e => {
  if (e.code === "Space") {
    spaceHeld = false;
  }

  if (e.code === "ArrowDown") {
    dino.duck = false;
  }
});

// TOUCH SCREEN
canvas.addEventListener("pointerdown", jump);

// BUTTONS
document.getElementById("jumpBtn")
  .addEventListener("click", jump);

document.getElementById("restartBtn")
  .addEventListener("click", () => {
    reset();
    state = "running";
  });

// START
reset();
requestAnimationFrame(loop);
