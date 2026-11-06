interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  color: string;
  size: number;
  shape: "circle" | "star";
}

export class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private rafId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas is not available");
    this.ctx = ctx;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize(): void {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  burst(x: number, y: number, color: string, count = 24): void {
    const colors =
      color === "#FFD700"
        ? ["#FFD700", "#FFA500", "#FF8C00", "#FFEC60", "#FFF0A0"]
        : ["#FF4444", "#FF6666", "#FF2222", "#CC2222", "#FF8888"];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const speed = 2.5 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 1,
        decay: 0.018 + Math.random() * 0.012,
        color: colors[Math.floor(Math.random() * colors.length)] ?? color,
        size: 4 + Math.random() * 5,
        shape: Math.random() > 0.5 ? "star" : "circle",
      });
    }

    if (!this.rafId) this.loop();
  }

  private drawStar(x: number, y: number, r: number): void {
    const spikes = 5;
    const inner = r * 0.4;
    this.ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? r : inner;
      const angle = (Math.PI * i) / spikes - Math.PI / 2;
      if (i === 0) this.ctx.moveTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
      else this.ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  private loop(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles = this.particles.filter((p) => p.life > 0);

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18;
      p.vx *= 0.98;
      p.life -= p.decay;

      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillStyle = p.color;
      const s = p.size * Math.max(0.1, p.life);

      if (p.shape === "star") {
        this.drawStar(p.x, p.y, s);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.ctx.globalAlpha = 1;

    if (this.particles.length > 0) {
      this.rafId = requestAnimationFrame(() => this.loop());
    } else {
      this.rafId = null;
    }
  }
}
