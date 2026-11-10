import { useEffect, useRef } from 'react';

/** Quiet, CSS-assisted starfield. No astronaut or foreground character. */
export default function SpaceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let animationId = 0;
    let stars = [];
    let shootingStar = null;
    let nextShootingStar = 0;
    const isSmall = () => window.innerWidth < 760;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = isSmall() ? 58 : 112;
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.15 + 0.25,
        alpha: Math.random() * 0.44 + 0.12,
        twinkle: Math.random() * 0.014 + 0.002,
        drift: Math.random() * 0.12 + 0.025,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      frame += 1;
      context.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        star.y += star.drift;
        star.phase += star.twinkle;
        if (star.y > height + 3) {
          star.y = -3;
          star.x = Math.random() * width;
        }
        const shimmer = star.alpha + Math.sin(star.phase) * 0.11;
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(222, 218, 255, ${Math.max(0.08, shimmer)})`;
        context.fill();
      });

      if (!reducedMotion && frame > nextShootingStar && !shootingStar) {
        shootingStar = {
          x: Math.random() * width * 0.8 + width * 0.1,
          y: Math.random() * height * 0.38,
          length: isSmall() ? 55 : 92,
          progress: 0,
          speed: isSmall() ? 7 : 9,
        };
      }
      if (shootingStar) {
        const s = shootingStar;
        const fade = Math.max(0, 1 - s.progress / 34);
        const gradient = context.createLinearGradient(s.x, s.y, s.x - s.length, s.y + s.length * 0.54);
        gradient.addColorStop(0, `rgba(240, 235, 255, ${fade * 0.8})`);
        gradient.addColorStop(1, 'rgba(184, 168, 255, 0)');
        context.strokeStyle = gradient;
        context.lineWidth = 1.4;
        context.beginPath();
        context.moveTo(s.x, s.y);
        context.lineTo(s.x - s.length, s.y + s.length * 0.54);
        context.stroke();
        s.x += s.speed;
        s.y += s.speed * 0.54;
        s.progress += 1;
        if (s.progress > 34) {
          shootingStar = null;
          nextShootingStar = frame + 260 + Math.random() * 360;
        }
      }
      if (!reducedMotion) animationId = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="space-background" aria-hidden="true">
      <div className="nebula nebula-one" />
      <div className="nebula nebula-two" />
      <div className="orbital-haze orbital-haze-one" />
      <canvas ref={canvasRef} className="star-canvas" />
      <div className="space-vignette" />
    </div>
  );
}
