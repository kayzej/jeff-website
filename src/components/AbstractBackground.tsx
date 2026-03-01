'use client';
import { useEffect, useRef } from 'react';

export default function AbstractBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let t = 0;
    let animId: number;
    let W: number, H: number;

    const COLORS = ['rgba(196,85,42,', 'rgba(212,168,83,', 'rgba(61,74,92,', 'rgba(232,228,223,'];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    class FlowLine {
      x = 0;
      y = 0;
      vx = 0;
      vy = 0;
      life = 0;
      maxLife = 0;
      color = '';
      width = 0;
      pts: { x: number; y: number }[] = [];
      noiseOffset = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.life = 0;
        this.maxLife = 400 + Math.random() * 600;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.width = 0.3 + Math.random() * 1.2;
        this.pts = [];
        this.noiseOffset = Math.random() * 1000;
      }

      update() {
        const angle =
          Math.sin(this.x * 0.003 + t * 0.0008 + this.noiseOffset) * Math.PI * 2 +
          Math.cos(this.y * 0.004 + t * 0.0005) * Math.PI;

        this.vx += Math.cos(angle) * 0.03;
        this.vy += Math.sin(angle) * 0.03;

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 1.2) {
          this.vx /= speed;
          this.vy /= speed;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.life++;

        this.pts.push({ x: this.x, y: this.y });
        if (this.pts.length > 80) this.pts.shift();

        if (this.life > this.maxLife || this.x < -50 || this.x > W + 50 || this.y < -50 || this.y > H + 50) {
          this.reset();
        }
      }

      draw() {
        if (this.pts.length < 2) return;
        const progress = this.life / this.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.4;

        ctx.beginPath();
        ctx.moveTo(this.pts[0].x, this.pts[0].y);
        for (let i = 1; i < this.pts.length; i++) {
          ctx.lineTo(this.pts[i].x, this.pts[i].y);
        }
        ctx.strokeStyle = this.color + alpha + ')';
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    class Floater {
      x = 0;
      y = 0;
      r = 0;
      color = '';
      vx = 0;
      vy = 0;
      phase = 0;
      pulseSpeed = 0;
      baseAlpha = 0;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = 40 + Math.random() * 180;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.vx = (Math.random() - 0.5) * 0.08;
        this.vy = (Math.random() - 0.5) * 0.08;
        this.phase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.003 + Math.random() * 0.005;
        this.baseAlpha = 0.015 + Math.random() * 0.025;
      }

      update() {
        this.x += this.vx + Math.sin(t * 0.0006 + this.phase) * 0.15;
        this.y += this.vy + Math.cos(t * 0.0004 + this.phase) * 0.12;
        if (this.x < -this.r * 2) this.x = W + this.r;
        if (this.x > W + this.r * 2) this.x = -this.r;
        if (this.y < -this.r * 2) this.y = H + this.r;
        if (this.y > H + this.r * 2) this.y = -this.r;
      }

      draw() {
        const pulse = 1 + Math.sin(t * this.pulseSpeed + this.phase) * 0.15;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * pulse);
        grad.addColorStop(0, this.color + this.baseAlpha * 2 + ')');
        grad.addColorStop(0.5, this.color + this.baseAlpha + ')');
        grad.addColorStop(1, this.color + '0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    resize();
    window.addEventListener('resize', resize);

    const lines = Array.from({ length: 120 }, () => new FlowLine());
    const floaters = Array.from({ length: 12 }, () => new Floater());

    function draw() {
      ctx.fillStyle = 'rgba(10,10,15,0.04)';
      ctx.fillRect(0, 0, W, H);

      floaters.forEach((f) => {
        f.update();
        f.draw();
      });
      lines.forEach((l) => {
        l.update();
        l.draw();
      });

      if (t % 3 === 0) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const col = COLORS[Math.floor(Math.random() * COLORS.length)];
        const g = ctx.createRadialGradient(x, y, 0, x, y, 3);
        g.addColorStop(0, col + '0.6)');
        g.addColorStop(1, col + '0)');
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      t++;
      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
}
