import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  gravity: number;
  flicker: boolean;
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  exploded: boolean;
  color: string;
}

interface FireworksCanvasProps {
  active?: boolean;
  intensity?: 'ambient' | 'celebration';
  onBurst?: () => void;
}

export const FireworksCanvas: React.FC<FireworksCanvasProps> = ({
  active = true,
  intensity = 'ambient',
  onBurst,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let fireworks: Firework[] = [];
    let particles: Particle[] = [];

    // Luxury Golden Palette
    const luxuryColors = [
      '#F3D99A', // Warm gold
      '#D9B66F', // Champagne gold
      '#FFF5E6', // Pure Ivory
      '#FFDF95', // Radiant gold
      '#E89A7B', // Rose amber
      '#B97883', // Muted rose
    ];

    const createFirework = (customX?: number) => {
      const x = customX !== undefined ? customX : Math.random() * (width * 0.8) + width * 0.1;
      const targetY = Math.random() * (height * 0.42) + height * 0.08;
      const color = luxuryColors[Math.floor(Math.random() * luxuryColors.length)];
      fireworks.push({
        x,
        y: height,
        targetY,
        vy: -(Math.random() * 4 + 7.5),
        exploded: false,
        color,
      });
    };

    // Golden Willow Weeping Sparkle Explosion
    const explode = (x: number, y: number, color: string) => {
      if (onBurst) onBurst();
      const count = intensity === 'celebration' ? 70 : 42;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
        const speed = Math.random() * 4.2 + 1.2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: Math.random() * 0.013 + 0.01,
          color,
          size: Math.random() * 2 + 1.2,
          gravity: 0.045, // Soft weeping willow gravity
          flicker: Math.random() > 0.4,
        });
      }
    };

    let lastLaunch = 0;
    const launchInterval = intensity === 'celebration' ? 950 : 2400;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const loop = (timestamp: number) => {
      ctx.clearRect(0, 0, width, height);

      // Automatic launch
      if (timestamp - lastLaunch > launchInterval) {
        createFirework();
        if (intensity === 'celebration' && Math.random() > 0.45) {
          createFirework();
        }
        lastLaunch = timestamp;
      }

      // Update rockets
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        fw.y += fw.vy;

        // Sparkle rocket trail
        ctx.beginPath();
        ctx.arc(fw.x, fw.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = fw.color;
        ctx.shadowColor = fw.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (fw.y <= fw.targetY || fw.vy >= 0) {
          explode(fw.x, fw.y, fw.color);
          fireworks.splice(i, 1);
        }
      }

      // Update explosion weeping particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.982;
        p.vy *= 0.982;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        const displayAlpha = p.flicker && Math.random() > 0.6 ? p.alpha * 0.5 : p.alpha;
        ctx.globalAlpha = displayAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 7;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [active, intensity, onBurst]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-15 opacity-85"
      aria-hidden="true"
    />
  );
};
