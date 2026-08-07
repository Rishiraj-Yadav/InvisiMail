'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplineScene({ scene, className }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [SplineComponent, setSplineComponent] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldLoad) {
      const loadSpline = async () => {
        const Spline = (await import('@splinetool/react-spline')).default;
        setSplineComponent(() => Spline);
      };
      
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => loadSpline());
      } else {
        setTimeout(() => loadSpline(), 100);
      }
    }
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-transparent z-10"
          >
            <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 border-purple-500/20 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="w-full h-full"
      >
        {SplineComponent && (
          <SplineComponent
            scene={scene}
            onLoad={() => setIsLoaded(true)}
          />
        )}
      </motion.div>
    </div>
  );
}
