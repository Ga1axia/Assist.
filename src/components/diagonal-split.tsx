"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sections = [
  {
    id: '01',
    title: 'LEARN',
    description: 'Master the fundamentals through interactive workshops and guided mentorship.',
    bgImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop',
    numberColor: 'text-primary'
  },
  {
    id: '02',
    title: 'BUILD',
    description: 'Transform concepts into reality during intensive buildathons and hackathons.',
    bgImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2670&auto=format&fit=crop',
    numberColor: 'text-primary'
  },
  {
    id: '03',
    title: 'INNOVATE',
    description: 'Launch ventures and push the boundaries of what is possible.',
    bgImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2670&auto=format&fit=crop',
    numberColor: 'text-primary'
  }
];

const FLEX_NORMAL = 1;
const FLEX_HOVER = 1.6;

function getSectionBoundaries(containerWidth: number, currentHoveredId: string | null): [number, number][] {
  const n = sections.length;
  const flexValues = sections.map((s) => (s.id === currentHoveredId ? FLEX_HOVER : FLEX_NORMAL));
  const total = flexValues.reduce((a, b) => a + b, 0);
  const boundaries: [number, number][] = [];
  let x = 0;
  for (let i = 0; i < n; i++) {
    const w = (containerWidth * flexValues[i]) / total;
    boundaries.push([x, x + w]);
    x += w;
  }
  return boundaries;
}

function getSectionIdAtX(containerWidth: number, localX: number, currentHoveredId: string | null): string | null {
  const boundaries = getSectionBoundaries(containerWidth, currentHoveredId);
  for (let i = 0; i < boundaries.length; i++) {
    const [left, right] = boundaries[i];
    if (localX >= left && localX < right) return sections[i].id;
  }
  if (localX >= boundaries[boundaries.length - 1][1]) return sections[sections.length - 1].id;
  return sections[0].id;
}

export function DiagonalSplitSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredIdRef = useRef<string | null>(null);

  useEffect(() => {
    hoveredIdRef.current = hoveredId;
  }, [hoveredId]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const id = getSectionIdAtX(rect.width, localX, hoveredIdRef.current);
    setHoveredId(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  // Use a custom sophisticated spring for buttery-smooth unchuncky physics
  const springTransition: any = {
    type: "spring",
    stiffness: 150,
    damping: 30,
    mass: 1,
  };

  return (
    <div className="w-full h-screen min-h-[700px] flex bg-background border-b-[8px] border-primary/20 overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full flex transform scale-[1.01]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {sections.map((section, idx) => {
          const isHovered = hoveredId === section.id;
          const isAnyHovered = hoveredId !== null;

          return (
            <motion.div
              layout
              key={section.id}
              initial={false}
              animate={{
                flex: isHovered ? 1.6 : 1,
                zIndex: isHovered ? 50 : 10,
              }}
              transition={springTransition}
              className={`
                relative cursor-pointer
                border-r-[6px] border-background
                origin-bottom skew-x-[-15deg]
                ${idx === 0 ? '-ml-24' : ''} 
                ${idx === sections.length - 1 ? '-mr-24 border-r-0' : ''}
              `}
            >
              {/* Background layer (Skewed, overflow-hidden) */}
              <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
                <div className="absolute inset-0 w-[150%] -left-[25%] h-full skew-x-[15deg]">

                  {/* Dark Gradient Overlay */}
                  <motion.div
                    initial={false}
                    animate={{ backgroundColor: isHovered ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.8)' }}
                    transition={springTransition}
                    className="absolute inset-0 z-10"
                  />

                  {/* Image Scaling */}
                  <motion.img
                    src={section.bgImage}
                    alt={section.title}
                    initial={false}
                    animate={{
                      scale: isHovered ? 1.05 : 1,
                      opacity: isHovered ? 1 : 0.5
                    }}
                    transition={springTransition}
                    className="w-full h-full object-cover"
                  />

                  {/* Bottom neon accent line */}
                  <motion.div
                    initial={false}
                    animate={{ y: isHovered ? "0%" : "100%" }}
                    transition={springTransition}
                    className="absolute bottom-0 left-0 w-full h-2 bg-primary z-30"
                  />
                </div>
              </div>

              {/* Content layer (Counter-skewed, NO overflow-hidden, so text can spill out) */}
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                <div className="absolute inset-0 w-[150%] -left-[25%] h-full skew-x-[15deg] pointer-events-auto flex flex-col justify-between p-12 lg:p-20 z-40">

                  {/* Top Header */}
                  <motion.div
                    initial={false}
                    animate={{
                      y: isHovered ? 0 : 20,
                      x: (idx === sections.length - 1 && !isHovered) ? -120 : 0
                    }}
                    transition={springTransition}
                    className={`
                      flex flex-col pt-24 
                      ${idx === 0 ? 'pl-20 lg:pl-32' : 'pl-12 lg:pl-20'} 
                      ${idx === sections.length - 1 ? 'pr-20 lg:pr-32' : ''}
                    `}
                  >

                    {/* Title & Description Container */}
                    <div className="relative">
                      <motion.h2
                        initial={false}
                        animate={{
                          opacity: isAnyHovered && !isHovered ? 0.2 : 1,
                          scale: isAnyHovered && !isHovered ? 0.75 : 1,
                        }}
                        transition={springTransition}
                        className="text-6xl md:text-7xl lg:text-[7rem] font-bold font-oswald uppercase tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] whitespace-nowrap origin-left"
                      >
                        {section.title}
                      </motion.h2>

                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ ...springTransition, delay: 0.1 }} // Slight delay so flex layout expands first
                            className="absolute top-full left-0 mt-6 w-[300px] lg:w-[400px]"
                          >
                            <p className="text-xl md:text-2xl font-lora italic text-white/95 leading-relaxed drop-shadow-md">
                              {section.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Bottom Ranking Number */}
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isHovered ? 1.05 : (isAnyHovered && !isHovered ? 0.8 : 1),
                      opacity: isAnyHovered && !isHovered ? 0.3 : 1
                    }}
                    transition={springTransition}
                    style={{ originX: 0, originY: 1 }}
                    className={`
                      flex items-end pb-8 
                      ${idx === 0 ? 'pl-20 lg:pl-32' : ''} 
                      ${idx === sections.length - 1 ? 'pr-20 lg:pr-32' : ''}
                    `}
                  >
                    <span className={`text-[10rem] lg:text-[14rem] font-bold leading-[0.7] -mb-6 font-oswald ${section.numberColor} drop-shadow-md`}>
                      {section.id}
                    </span>
                  </motion.div>

                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
