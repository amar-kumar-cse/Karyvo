"use client";

import { useEffect, useRef } from "react";

export function AmbientSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let rafId: number | null = null;
    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let isMoving = false;

    const updateSpotlight = () => {
      // Smooth lerp damping
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      currentX += dx * 0.12;
      currentY += dy * 0.12;

      if (spotlightRef.current) {
        spotlightRef.current.style.setProperty("--spot-x", `${Math.round(currentX)}px`);
        spotlightRef.current.style.setProperty("--spot-y", `${Math.round(currentY)}px`);
      }

      // If settled close enough to target, stop loop to save CPU
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        rafId = requestAnimationFrame(updateSpotlight);
      } else {
        isMoving = false;
        rafId = null;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isMoving) {
        isMoving = true;
        rafId = requestAnimationFrame(updateSpotlight);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-500"
      style={
        {
          background: `radial-gradient(650px circle at var(--spot-x, -1000px) var(--spot-y, -1000px), rgba(139, 92, 246, 0.07), transparent 80%)`,
        } as React.CSSProperties
      }
    />
  );
}
