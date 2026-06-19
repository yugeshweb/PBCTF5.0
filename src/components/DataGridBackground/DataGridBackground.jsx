import { useEffect, useRef, useMemo } from 'react';
import './DataGridBackground.css';

export default function DataGridBackground({ scrollProgress }) {
  const glowRef = useRef(null);
  const bgRef = useRef(null);

  // Mouse tracking logic
  useEffect(() => {
    // Only track mouse on desktop to save battery on mobile
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return;

    const handleMouseMove = (e) => {
      if (!glowRef.current) return;
      // Use web animations API for buttery smooth tracking without React re-renders
      glowRef.current.animate(
        {
          transform: `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`
        },
        { duration: 400, fill: 'forwards', easing: 'ease-out' }
      );
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fade in/out logic driven by scroll
  useEffect(() => {
    let frame;
    const updateOpacity = () => {
      if (bgRef.current && scrollProgress) {
        // Fade in rapidly between 5% and 15% scroll (as CyberCore fades out)
        let p = (scrollProgress.current - 0.05) / 0.1;
        p = Math.max(0, Math.min(1, p));
        bgRef.current.style.opacity = p.toFixed(3);
      }
      frame = requestAnimationFrame(updateOpacity);
    };
    frame = requestAnimationFrame(updateOpacity);
    return () => cancelAnimationFrame(frame);
  }, [scrollProgress]);

  // Generate random stable particles
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const left = `${Math.random() * 100}%`;
      const delay = `${Math.random() * 10}s`;
      const duration = `${10 + Math.random() * 15}s`;
      const size = Math.random() > 0.8 ? '3px' : '2px';
      return (
        <div
          key={i}
          className="data-grid__particle"
          style={{ 
            left, 
            width: size,
            height: size,
            animationDelay: delay, 
            animationDuration: duration 
          }}
        />
      );
    });
  }, []);

  return (
    <div ref={bgRef} className="data-grid-bg">
      <div ref={glowRef} className="data-grid__glow" />
      <div className="data-grid__perspective">
        <div className="data-grid__plane" />
      </div>
      {particles}
    </div>
  );
}
