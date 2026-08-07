'use client';
import { useRef, useEffect } from 'react';

const SPOTLIGHT_R = 400; // Large spotlight radius

export default function RevealLayer({ children }) {
  const containerRef = useRef(null);
  // Default to center
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    const renderLoop = () => {
      if (smooth.current.x === -999) {
          smooth.current.x = mouse.current.x;
          smooth.current.y = mouse.current.y;
      } else {
          smooth.current.x += (mouse.current.x - smooth.current.x) * 0.15;
          smooth.current.y += (mouse.current.y - smooth.current.y) * 0.15;
      }
      
      if (containerRef.current && smooth.current.x !== -999) {
        containerRef.current.style.setProperty('--x', `${smooth.current.x}px`);
        containerRef.current.style.setProperty('--y', `${smooth.current.y}px`);
      }
      
      rafRef.current = requestAnimationFrame(renderLoop);
    };
    
    rafRef.current = requestAnimationFrame(renderLoop);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-30 pointer-events-none"
      style={{
        maskImage: `radial-gradient(${SPOTLIGHT_R}px circle at var(--x, 50%) var(--y, 50%), black 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)`,
        WebkitMaskImage: `radial-gradient(${SPOTLIGHT_R}px circle at var(--x, 50%) var(--y, 50%), black 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 100%)`,
      }}
    >
      {children}
    </div>
  );
}
