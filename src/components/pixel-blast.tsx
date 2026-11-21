"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// 4x4 Bayer Dither Matrix normalized [0, 1)
const BAYER_4X4 = [
  [0 / 16, 8 / 16, 2 / 16, 10 / 16],
  [12 / 16, 4 / 16, 14 / 16, 6 / 16],
  [3 / 16, 11 / 16, 1 / 16, 9 / 16],
  [15 / 16, 7 / 16, 13 / 16, 5 / 16],
];

export interface PixelBlastProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  dotSize?: number;
  gap?: number;
  shape?: "square" | "circle" | "diamond";
  color?: string;
  density?: number;
  coverage?: number;
  showFloor?: boolean;
}

export function PixelBlast({
  children,
  className,
  dotSize = 3,
  gap = 6,
  shape = "square",
  color = "currentColor",
  density = 1,
  coverage = 1,
  showFloor = true,
  ...props
}: PixelBlastProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let isVisible = true;

    // Pointer state
    const pointer = { x: -1000, y: -1000, active: false };

    // Ripples array
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      speed: number;
      strength: number;
    }
    const ripples: Ripple[] = [];
    let autoRippleTimer = 0;

    // Intro wave state
    let introRadius = 0;
    const maxIntroRadius = 1200;

    // Value noise lookup
    const pseudoNoise = (x: number, y: number, t: number) => {
      return (
        Math.sin(x * 0.015 + t * 0.5) * Math.cos(y * 0.015 + t * 0.3) +
        Math.sin(x * 0.03 - t * 0.2 + y * 0.02) * 0.5
      );
    };

    const resize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);
    resize();

    // Intersection observer to pause offscreen
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    intersectionObserver.observe(container);

    // Mouse / Touch handlers
    const onPointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -1000;
      pointer.y = -1000;
    };

    const triggerRipple = (x: number, y: number, strong = false) => {
      ripples.push({
        x,
        y,
        radius: 0,
        maxRadius: Math.max(width, height) * 0.75,
        speed: strong ? 7 : 4.5,
        strength: strong ? 1.0 : 0.6,
      });
    };

    const onPointerDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      triggerRipple(x, y, true);
    };

    container.addEventListener("mousemove", onPointerMove);
    container.addEventListener("mouseleave", onPointerLeave);
    container.addEventListener("mousedown", onPointerDown);

    // Reduced motion check
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let time = 0;

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      time += 0.015;
      introRadius = Math.min(maxIntroRadius, introRadius + 14);

      // Auto ripple when pointer is not active
      if (!pointer.active) {
        autoRippleTimer += 1;
        if (autoRippleTimer > 240) {
          autoRippleTimer = 0;
          triggerRipple(
            width * (0.3 + Math.random() * 0.4),
            height * (0.3 + Math.random() * 0.4),
            false
          );
        }
      }

      // Update ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].radius += ripples[i].speed;
        if (ripples[i].radius > ripples[i].maxRadius) {
          ripples.splice(i, 1);
        }
      }

      ctx.clearRect(0, 0, width, height);

      // Computed Lissajous cloud bodies
      const c1X = width * 0.5 + Math.sin(time * 0.8) * width * 0.28 * coverage;
      const c1Y = height * 0.5 + Math.cos(time * 0.6) * height * 0.28 * coverage;

      const c2X = width * 0.5 + Math.cos(time * 0.5 + 1.5) * width * 0.32 * coverage;
      const c2Y = height * 0.5 + Math.sin(time * 0.7 + 0.5) * height * 0.32 * coverage;

      const c3X = width * 0.5 + Math.sin(time * 0.4 + 3) * width * 0.22 * coverage;
      const c3Y = height * 0.5 + Math.sin(time * 0.9 + 2) * height * 0.22 * coverage;

      const step = dotSize + gap;
      const cols = Math.ceil(width / step);
      const rows = Math.ceil(height / step);

      // Resolve color
      ctx.fillStyle = color === "currentColor" ? "white" : color;

      for (let r = 0; r < rows; r++) {
        const y = r * step;

        for (let c = 0; c < cols; c++) {
          const x = c * step;

          // 1. Distance to clouds
          const d1 = Math.hypot(x - c1X, y - c1Y);
          const d2 = Math.hypot(x - c2X, y - c2Y);
          const d3 = Math.hypot(x - c3X, y - c3Y);

          const r1 = Math.min(width, height) * 0.4;
          const r2 = Math.min(width, height) * 0.35;
          const r3 = Math.min(width, height) * 0.3;

          let cloudIntensity =
            Math.max(0, 1 - d1 / r1) * 0.9 +
            Math.max(0, 1 - d2 / r2) * 0.8 +
            Math.max(0, 1 - d3 / r3) * 0.7;

          // 2. Noise edge tearing
          const n = pseudoNoise(x, y, time);
          cloudIntensity += n * 0.35;
          cloudIntensity *= density;

          // 3. Perspective floor of dot rows rolling toward viewer
          if (showFloor && y > height * 0.6) {
            const floorProgress = (y - height * 0.6) / (height * 0.4);
            const wave = Math.sin(floorProgress * 10 - time * 3);
            if (wave > 0.4) {
              cloudIntensity += floorProgress * 0.45;
            }
          }

          // 4. Pointer proximity glow
          if (pointer.active) {
            const pDist = Math.hypot(x - pointer.x, y - pointer.y);
            const pRadius = 140;
            if (pDist < pRadius) {
              const glow = Math.pow(1 - pDist / pRadius, 2);
              cloudIntensity += glow * 1.2;
            }
          }

          // 5. Ripple rings
          for (const rip of ripples) {
            const dist = Math.hypot(x - rip.x, y - rip.y);
            const ringDist = Math.abs(dist - rip.radius);
            const ringWidth = 32;
            if (ringDist < ringWidth) {
              const ringStrength =
                (1 - ringDist / ringWidth) *
                (1 - rip.radius / rip.maxRadius) *
                rip.strength;
              cloudIntensity += ringStrength * 1.4;
            }
          }

          // 6. Intro spread from center
          const distFromCenter = Math.hypot(x - width * 0.5, y - height * 0.5);
          if (distFromCenter > introRadius) {
            cloudIntensity *= Math.max(0, 1 - (distFromCenter - introRadius) / 60);
          }

          // 7. Shimmer phase
          const shimmer = Math.sin(x * 12.9898 + y * 78.233 + time * 3) * 0.15;
          cloudIntensity += shimmer;

          // 8. Bayer 4x4 Dither Threshold
          const bayerThreshold = BAYER_4X4[r % 4][c % 4];

          if (cloudIntensity > bayerThreshold && cloudIntensity > 0.1) {
            // Draw dot with stepped size according to intensity
            const intensityNorm = Math.min(1, Math.max(0, cloudIntensity));
            const currentDotSize = Math.max(
              1,
              Math.min(dotSize * 1.5, dotSize * (0.6 + intensityNorm * 0.8))
            );

            const alpha = Math.min(0.9, 0.2 + intensityNorm * 0.7);
            ctx.globalAlpha = alpha;

            if (shape === "circle") {
              ctx.beginPath();
              ctx.arc(
                x + dotSize * 0.5,
                y + dotSize * 0.5,
                currentDotSize * 0.5,
                0,
                Math.PI * 2
              );
              ctx.fill();
            } else if (shape === "diamond") {
              const cx = x + dotSize * 0.5;
              const cy = y + dotSize * 0.5;
              const half = currentDotSize * 0.5;
              ctx.beginPath();
              ctx.moveTo(cx, cy - half);
              ctx.lineTo(cx + half, cy);
              ctx.lineTo(cx, cy + half);
              ctx.lineTo(cx - half, cy);
              ctx.closePath();
              ctx.fill();
            } else {
              // Square
              ctx.fillRect(x, y, currentDotSize, currentDotSize);
            }
          }
        }
      }

      ctx.globalAlpha = 1;

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener("mousemove", onPointerMove);
      container.removeEventListener("mouseleave", onPointerLeave);
      container.removeEventListener("mousedown", onPointerDown);
    };
  }, [dotSize, gap, shape, color, density, coverage, showFloor]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full"
      />
      {children && <div className="relative z-10 size-full">{children}</div>}
    </div>
  );
}
