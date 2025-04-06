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

class Neuron {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.life = 0;
    this.maxLife = 100 + Math.random() * 50;
    this.alpha = 0;
    this.firing = true;
  }

  update() {
    if (this.firing) {
      this.alpha = Math.min(1, this.alpha + 0.05);
    } else {
      this.alpha = Math.max(0, this.alpha - 0.02);
    }

    this.life++;
    if (this.life > this.maxLife) {
      this.life = 0;
      this.firing = !this.firing;
      if (this.firing) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      }
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(160, 200, 255, ${this.alpha})`;
    ctx.shadowColor = `rgba(160, 200, 255, ${this.alpha})`;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

const neurons = Array.from({ length: 1 }, () => new Neuron());

function animate() {
  ctx.clearRect(0, 0, width, height);
  neurons.forEach((n) => {
    n.update();
    n.draw(ctx);
  });
  requestAnimationFrame(animate);
}

animate();