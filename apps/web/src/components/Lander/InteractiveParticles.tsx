import { useEffect, useRef, useState } from "react";

import styles from "./InteractiveParticles.module.css";

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

export function InteractiveParticles() {
  const [particles, setParticles] = useState<ParticleState[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newParticles: ParticleState[] = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 10, // Small, subtle particles
        opacity: 0.1 + Math.random() * 0.8,
        sensitivity: 0.005 + Math.random() * 0.05,
        dx: 0,
        dy: 0,
      });
    }
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
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
        }))
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.particleContainer}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={styles.particle} // Potentially add more type classes here
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
