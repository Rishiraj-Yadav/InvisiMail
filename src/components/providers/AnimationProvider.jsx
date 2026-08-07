'use client';

import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';

export default function AnimationProvider({ children }) {
  useEffect(() => {
    // Only initialize smooth scrolling on public pages
    const path = window.location.pathname;
    if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
      return;
    }

    let lenis;
    let rafId;

    const initLenis = () => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => initLenis());
    } else {
      setTimeout(() => initLenis(), 100);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
}
