"use client";

import { useEffect, useRef } from "react";

export function AmbientSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let rafId: number;
    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const updateSpotlight = () => {
      // Smooth lerp damping
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      if (spotlightRef.current) {
        spotlightRef.current.style.setProperty("--spot-x", `${currentX}px`);
        spotlightRef.current.style.setProperty("--spot-y", `${currentY}px`);
      }

      rafId = requestAnimationFrame(updateSpotlight);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateSpotlight);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
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
