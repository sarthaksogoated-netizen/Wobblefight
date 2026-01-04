
import React, { useEffect, useRef } from 'react';
import { FighterEntity, Particle } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../constants';

interface ArenaProps {
  p1: FighterEntity;
  p2: FighterEntity;
  particles: Particle[];
}

const Arena: React.FC<ArenaProps> = ({ p1, p2, particles }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Background decorative clouds or jelly shapes
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(200, 150, 80, 0, Math.PI * 2);
      ctx.arc(300, 180, 60, 0, Math.PI * 2);
      ctx.fill();

      // Ground
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 10);

      // Draw Fighters
      drawFighter(ctx, p1);
      drawFighter(ctx, p2);

      // Draw Particles
      particles.forEach((p, i) => {
        ctx.globalAlpha = p.life / 40;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Update particles here for simplicity
        p.pos.x += p.vel.x;
        p.pos.y += p.vel.y;
        p.vel.y += 0.2;
        p.life--;
      });

      requestAnimationFrame(render);
    };

    const drawFighter = (ctx: CanvasRenderingContext2D, f: FighterEntity) => {
      ctx.save();
      
      // Calculate center for rotation
      const cx = f.pos.x + f.width / 2;
      const cy = f.pos.y + f.height / 2;
      
      ctx.translate(cx, cy);
      ctx.rotate(f.rotation);
      
      // Wobble scaling
      const scaleY = 1 + Math.sin(f.wobbleOffset) * 0.05;
      const scaleX = 1 - Math.sin(f.wobbleOffset) * 0.05;
      ctx.scale(scaleX, scaleY);

      // Body (The Bean)
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.roundRect(-f.width / 2, -f.height / 2, f.width, f.height, 20);
      ctx.fill();
      
      // Face
      ctx.fillStyle = '#000';
      const eyeOffset = f.facing * 15;
      // Eyes
      ctx.beginPath();
      ctx.arc(eyeOffset - 5, -15, 4, 0, Math.PI * 2);
      ctx.arc(eyeOffset + 15, -15, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Mouth / Expression
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000';
      ctx.beginPath();
      if (f.state === 'HIT') {
        ctx.arc(eyeOffset + 5, 0, 8, 0, Math.PI, true);
      } else if (f.state === 'ATTACKING') {
        ctx.arc(eyeOffset + 5, 5, 10, 0, Math.PI, false);
      } else {
        ctx.moveTo(eyeOffset - 5, 5);
        ctx.lineTo(eyeOffset + 15, 5);
      }
      ctx.stroke();

      // Shadow
      ctx.restore();
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(cx, GROUND_Y - 5, f.width * 0.8, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [p1, p2, particles]);

  return (
    <canvas 
      ref={canvasRef} 
      width={CANVAS_WIDTH} 
      height={CANVAS_HEIGHT}
      className="rounded-xl shadow-2xl border-8 border-slate-700 max-w-full h-auto"
    />
  );
};

export default Arena;
