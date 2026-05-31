import { useEffect, useRef } from "react";

interface Atom {
  relX: number;
  relY: number;
  radius: number;
  color: string;
}

interface Bond {
  from: number;
  to: number;
}

interface MoleculeDef {
  atoms: Atom[];
  bonds: Bond[];
}

const MOLECULES: MoleculeDef[] = [
  {
    atoms: [
      { relX: 0, relY: 0, radius: 4.5, color: "#228be6" },
      { relX: -16, relY: -12, radius: 3.5, color: "#74c0fc" },
      { relX: 16, relY: -12, radius: 3.5, color: "#74c0fc" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
    ],
  },
  {
    atoms: [
      { relX: 0, relY: 0, radius: 4.5, color: "#228be6" },
      { relX: -20, relY: 12, radius: 3.5, color: "#a5d8ff" },
      { relX: 20, relY: 12, radius: 3.5, color: "#a5d8ff" },
      { relX: 0, relY: -20, radius: 3.5, color: "#4dabf7" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
    ],
  },
  {
    atoms: [
      { relX: -22, relY: 0, radius: 4, color: "#7950f2" },
      { relX: 0, relY: 0, radius: 5, color: "#228be6" },
      { relX: 22, relY: 0, radius: 4, color: "#7950f2" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
    ],
  },
  {
    atoms: [
      { relX: 0, relY: -18, radius: 3.5, color: "#a5d8ff" },
      { relX: 0, relY: 0, radius: 4.5, color: "#339af0" },
      { relX: -18, relY: 0, radius: 3.5, color: "#a5d8ff" },
      { relX: 18, relY: 0, radius: 3.5, color: "#a5d8ff" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 1, to: 3 },
    ],
  },
  {
    atoms: [
      { relX: 0, relY: -16, radius: 4, color: "#339af0" },
      { relX: 16, relY: 8, radius: 4, color: "#339af0" },
      { relX: -16, relY: 8, radius: 4, color: "#339af0" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 0 },
    ],
  },
  {
    atoms: [
      { relX: 0, relY: 0, radius: 4.5, color: "#228be6" },
      { relX: -14, relY: -14, radius: 3.5, color: "#a5d8ff" },
      { relX: 14, relY: -14, radius: 3.5, color: "#4dabf7" },
      { relX: -14, relY: 12, radius: 3.5, color: "#a5d8ff" },
      { relX: 14, relY: 12, radius: 3.5, color: "#fab005" },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 0, to: 4 },
    ],
  },
];

interface MoleculeInstance {
  def: MoleculeDef;
  x: number;
  y: number;
  angle: number;
  speedX: number;
  speedY: number;
  rotSpeed: number;
  scale: number;
  opacity: number;
}

const COUNT = 15;
const MOUSE_RADIUS = 240;
const MOUSE_FORCE = 0.025;

function createInstance(w: number, h: number): MoleculeInstance {
  const def = MOLECULES[Math.floor(Math.random() * MOLECULES.length)];
  return {
    def,
    x: Math.random() * w,
    y: Math.random() * h,
    angle: Math.random() * Math.PI * 2,
    speedX: (Math.random() - 0.5) * 0.12,
    speedY: (Math.random() - 0.5) * 0.12,
    rotSpeed: (Math.random() - 0.5) * 0.0025,
    scale: 0.9 + Math.random() * 1.3,
    opacity: 0.12 + Math.random() * 0.16,
  };
}

export function MoleculeField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instancesRef = useRef<MoleculeInstance[]>([]);
  const mouseRef = useRef({ x: -999, y: -999, active: false });
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const syncSize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
    };

    syncSize();

    if (instancesRef.current.length === 0) {
      const { w, h } = sizeRef.current;
      instancesRef.current = Array.from({ length: COUNT }, () =>
        createInstance(w || window.innerWidth, h || window.innerHeight),
      );
    }

    const ro = new ResizeObserver(() => {
      syncSize();
    });
    ro.observe(canvas);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const onLeave = () => {
      mouseRef.current.active = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const tick = () => {
      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const instances = instancesRef.current;
      const mouse = mouseRef.current;

      if (instances.length === 0) {
        instancesRef.current = Array.from({ length: COUNT }, () =>
          createInstance(w, h),
        );
      }

      ctx.clearRect(0, 0, w, h);

      for (const inst of instances) {
        if (mouse.active) {
          const dx = mouse.x - inst.x;
          const dy = mouse.y - inst.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 1) {
            const f = MOUSE_FORCE * (1 - dist / MOUSE_RADIUS);
            inst.speedX += (dx / dist) * f;
            inst.speedY += (dy / dist) * f;
          }
        }

        inst.speedX *= 0.998;
        inst.speedY *= 0.998;
        inst.x += inst.speedX;
        inst.y += inst.speedY;
        inst.angle += inst.rotSpeed;

        const m = 80;
        if (inst.x < -m) inst.x = w + m;
        if (inst.x > w + m) inst.x = -m;
        if (inst.y < -m) inst.y = h + m;
        if (inst.y > h + m) inst.y = -m;

        const { def, x, y, angle, scale, opacity } = inst;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const s = scale;

        const tx: number[] = [];
        const ty: number[] = [];
        for (const a of def.atoms) {
          tx.push(x + (a.relX * cos - a.relY * sin) * s);
          ty.push(y + (a.relX * sin + a.relY * cos) * s);
        }

        for (const b of def.bonds) {
          ctx.beginPath();
          ctx.moveTo(tx[b.from], ty[b.from]);
          ctx.lineTo(tx[b.to], ty[b.to]);
          ctx.strokeStyle = `rgba(34,139,230,${opacity * 1.5})`;
          ctx.lineWidth = 0.7 * s;
          ctx.stroke();
        }

        for (let i = 0; i < def.atoms.length; i++) {
          const a = def.atoms[i];
          const r = a.radius * s;

          ctx.beginPath();
          ctx.arc(tx[i], ty[i], r, 0, Math.PI * 2);
          ctx.fillStyle = a.color;
          ctx.globalAlpha = Math.min(opacity * 2.5, 0.55);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} style={S} aria-hidden="true" />;
}

const S: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  zIndex: 0,
};
