'use client';
import { motion } from 'framer-motion';

export default function AnimatedHeading({ text, className, delay = 0.2 }) {
  const lines = text.split('\n');
  
  return (
    <h1 className={className}>
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} className="block overflow-hidden pb-4 -mb-4">
          {line.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: delay + (lineIndex * line.length * 0.03) + (charIndex * 0.03),
                ease: [0.16, 1, 0.3, 1]
              }}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </div>
      ))}
    </h1>
  );
}
