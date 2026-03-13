const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

let width, height;
let points = [];

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  initPoints();
}

function initPoints() {
  points = [];
  const count = Math.floor(width * height * 0.00020);
  for (let i = 0; i < count; i++) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      z: Math.random()
    });
  }
}

resize();
window.addEventListener("resize", resize);

function randomPoint() {
  return points[Math.floor(Math.random() * points.length)];
}

function findNearbyPoint(from) {
  let candidates = points
    .map(p => ({ p, dist: Math.hypot(p.x - from.x, p.y - from.y) }))
    .filter(entry => entry.dist > 20 && entry.dist < 140);
  if (candidates.length === 0) return randomPoint();
  candidates.sort((a, b) => a.dist - b.dist);
  const closeFew = candidates.slice(0, Math.min(5, candidates.length));
  return closeFew[Math.floor(Math.random() * closeFew.length)].p;
}

let current = randomPoint();
let next = findNearbyPoint(current);
let pulseStart = performance.now();
let pulseDuration = 10000;

function drawBackgroundNet() {
  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    const radius = 0.8 + p.z * 0.7;
    const opacity = 0.2 + p.z * 0.8;

    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(153, 187, 221, ${opacity})`;
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.fill();

    for (let j = i + 1; j < points.length; j++) {
      let q = points[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const avgZ = (p.z + q.z) / 2;
        const lineOpacity = (1 - dist / 150) * (0.08 + avgZ * 0.25);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(160, 200, 255, ${lineOpacity})`;
        ctx.lineWidth = 0.15 + avgZ * 0.85;
        ctx.stroke();
      }
    }
  }
}

function drawNeuronEffect() {
  const elapsed = performance.now() - pulseStart;
  const t = Math.min(elapsed / pulseDuration, 1);
  const pulse = 2 + Math.sin(t * Math.PI) * 2.1;

  const cx = current.x;
  const cy = current.y;

  ctx.beginPath();
  ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${0.14 + 0.24 * Math.sin(t * Math.PI)})`;
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 8;
  ctx.fill();

  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    let dx = cx - p.x;
    let dy = cy - p.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 140 && dist > 12) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.07 + 0.14 * Math.sin(t * Math.PI)})`;
      ctx.lineWidth = 0.55;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 4;
      ctx.fill();
    }
  }

  if (elapsed >= pulseDuration) {
    current = next;
    next = findNearbyPoint(current);
    pulseStart = performance.now();
    pulseDuration = 8000 + Math.random() * 7000;
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  drawBackgroundNet();
  drawNeuronEffect();
  requestAnimationFrame(draw);
}

draw();
