const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

let width, height;
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}
resize();
window.addEventListener("resize", resize);

let points = [];
const totalPoints = 115;
for (let i = 0; i < totalPoints; i++) {
  points.push({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.12,
    vy: (Math.random() - 0.5) * 0.12,
    fired: false,
    fireProgress: 0
  });
}

let current = randomPoint();
let next = randomPoint();
let progress = 0;
let firing = true;
const duration = 250;

function randomPoint() {
  return points[Math.floor(Math.random() * points.length)];
}

function drawBackgroundNet() {
  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    for (let j = i + 1; j < points.length; j++) {
      let q = points[j];
      let dx = p.x - q.x;
      let dy = p.y - q.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 115) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(160, 200, 255, ${0.06 + (1 - dist / 115) * 0.3})`;
        ctx.lineWidth = 0.45;
        ctx.stroke();
      }
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#99bbdd';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.fill();
  }
}

function drawNeuronEffect() {
  const pulse = 2 + Math.sin(progress / duration * Math.PI) * 2.2;

  ctx.beginPath();
  ctx.arc(current.x, current.y, pulse, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + 0.25 * Math.sin(progress / duration * Math.PI)})`;
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 8;
  ctx.fill();

  for (let i = 0; i < points.length; i++) {
    let p = points[i];
    let dx = current.x - p.x;
    let dy = current.y - p.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150 && dist > 10) {
      ctx.beginPath();
      ctx.moveTo(current.x, current.y);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 + 0.12 * Math.sin(progress / duration * Math.PI)})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 4;
      ctx.fill();
    }
  }

  progress++;
  if (progress >= duration) {
    current = next;
    next = randomPoint();
    progress = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  drawBackgroundNet();
  drawNeuronEffect();
  requestAnimationFrame(draw);
}

draw();
