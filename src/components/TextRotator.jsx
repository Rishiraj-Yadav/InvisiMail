'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TextRotator({ words, interval = 3000, className = "" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className="inline-grid relative">
      <AnimatePresence>
        <motion.span
          key={index}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -15, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`col-start-1 row-start-1 ${className}`}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
      <span className={`invisible col-start-1 row-start-1 ${className}`} aria-hidden="true">
        {words.reduce((a, b) => a.length > b.length ? a : b)}
      </span>
    </span>
  );
}
