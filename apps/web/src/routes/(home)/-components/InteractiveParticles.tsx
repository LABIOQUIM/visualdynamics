import styles from "./InteractiveParticles.module.css";

import { useEffect, useRef, useState } from "react";

function throttleRaf<T extends (...args: never[]) => void>(fn: T): T {
  let rafId: ReturnType<typeof requestAnimationFrame> | null = null;
  return ((...args: Parameters<T>) => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      fn(...args);
      rafId = null;
    });
  }) as T;
}

const NUM_PARTICLES = 200; // Adjust for performance and desired density

interface ParticleState {
  id: number;
  x: number; // Initial x percentage
  y: number; // Initial y percentage
  size: number;
  opacity: number;
  sensitivity: number;
  // Current transform values
  dx: number;
  dy: number;
}

function createParticle(index: number): ParticleState {
  const seed = index + 1;
  const random = (offset: number) => {
    const value = Math.sin(seed * 999 + offset * 777) * 10000;

    return value - Math.floor(value);
  };

  return {
    id: index,
    x: random(1) * 100,
    y: random(2) * 100,
    size: 1 + random(3) * 10,
    opacity: 0.1 + random(4) * 0.8,
    sensitivity: 0.005 + random(5) * 0.05,
    dx: 0,
    dy: 0,
  };
}

export function InteractiveParticles() {
  const [particles, setParticles] = useState<ParticleState[]>(() =>
    Array.from({ length: NUM_PARTICLES }, (_, index) => createParticle(index)),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = throttleRaf((event: MouseEvent) => {
      if (!containerRef.current) return;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      setParticles((prevParticles) =>
        prevParticles.map((p) => ({
          ...p,
          dx: -(mouseX - centerX) * p.sensitivity,
          dy: -(mouseY - centerY) * p.sensitivity,
        })),
      );
    });

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={styles.particleContainer}
      ref={containerRef}
    >
      {particles.map((p) => (
        <div
          className={styles.particle} // Potentially add more type classes here
          key={p.id}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            transform: `translate(${p.dx}px, ${p.dy}px)`,
          }}
        />
      ))}
    </div>
  );
}
