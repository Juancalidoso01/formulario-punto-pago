"use client";

import { useEffect, useRef, useState } from "react";

const RING_SIZE = 44;
const RING_LERP = 0.42;

/**
 * Fondo animado + brillo que sigue el cursor + aro circular marca (mismo patrón KYB / puntopago.net).
 */
export function PpAmbient() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [finePointer, setFinePointer] = useState<boolean | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [glow, setGlow] = useState({ x: 0, y: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Initial read after mount; subsequent updates come from the listener.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- media query bootstrap
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- media query bootstrap
    setFinePointer(mq.matches);
    const onChange = () => setFinePointer(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const showRing = !reduceMotion && finePointer === true;

  useEffect(() => {
    if (reduceMotion) return;

    target.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 3,
    };
    ringPos.current = { ...target.current };
    setGlow({ ...target.current });

    const o = RING_SIZE / 2;
    requestAnimationFrame(() => {
      const el = ringRef.current;
      if (el) {
        el.style.transform = `translate3d(${ringPos.current.x - o}px, ${ringPos.current.y - o}px, 0)`;
        el.style.opacity = "1";
      }
    });

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const loop = () => {
      setGlow((prev) => {
        const tx = target.current.x;
        const ty = target.current.y;
        const k = 0.14;
        return {
          x: prev.x + (tx - prev.x) * k,
          y: prev.y + (ty - prev.y) * k,
        };
      });

      const tx = target.current.x;
      const ty = target.current.y;
      ringPos.current.x += (tx - ringPos.current.x) * RING_LERP;
      ringPos.current.y += (ty - ringPos.current.y) * RING_LERP;
      const el = ringRef.current;
      if (el) {
        const o2 = RING_SIZE / 2;
        el.style.transform = `translate3d(${ringPos.current.x - o2}px, ${ringPos.current.y - o2}px, 0)`;
        el.style.opacity = "1";
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [reduceMotion]);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <div className="pp-blob pp-blob-a" />
        <div className="pp-blob pp-blob-b" />
        <div className="pp-blob pp-blob-c" />
        <div className="pp-grid-mask" />

        {!reduceMotion && (
          <div
            className="pp-cursor-glow"
            style={{
              transform: `translate3d(${glow.x - 280}px, ${glow.y - 280}px, 0)`,
            }}
          />
        )}
      </div>

      {showRing && (
        <div
          ref={ringRef}
          className="pp-cursor-ring pointer-events-none fixed left-0 top-0 z-[100]"
          aria-hidden
        />
      )}
    </>
  );
}
