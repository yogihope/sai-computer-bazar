"use client";

import { useEffect, useState } from "react";

interface FlyingSantaProps {
  interval?: number; // seconds between appearances
}

export function FlyingSanta({ interval = 30 }: FlyingSantaProps) {
  const [isFlying, setIsFlying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [yPosition, setYPosition] = useState(15);

  useEffect(() => {
    setMounted(true);

    // Add styles to document
    const styleId = "santa-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes santa-fly-right {
          0% { transform: translateX(-200px) translateY(0) rotate(-5deg); }
          25% { transform: translateX(25vw) translateY(-20px) rotate(0deg); }
          50% { transform: translateX(50vw) translateY(10px) rotate(5deg); }
          75% { transform: translateX(75vw) translateY(-15px) rotate(0deg); }
          100% { transform: translateX(calc(100vw + 200px)) translateY(5px) rotate(-5deg); }
        }
        @keyframes santa-fly-left {
          0% { transform: translateX(calc(100vw + 200px)) translateY(0) rotate(5deg) scaleX(-1); }
          25% { transform: translateX(75vw) translateY(-20px) rotate(0deg) scaleX(-1); }
          50% { transform: translateX(50vw) translateY(10px) rotate(-5deg) scaleX(-1); }
          75% { transform: translateX(25vw) translateY(-15px) rotate(0deg) scaleX(-1); }
          100% { transform: translateX(-200px) translateY(5px) rotate(5deg) scaleX(-1); }
        }
      `;
      document.head.appendChild(style);
    }

    // Initial flight after 5 seconds
    const initialTimeout = setTimeout(() => {
      triggerFlight();
    }, 5000);

    // Periodic flights
    const intervalId = setInterval(() => {
      triggerFlight();
    }, interval * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, [interval]);

  const triggerFlight = () => {
    setDirection(Math.random() > 0.5 ? "left" : "right");
    setYPosition(10 + Math.random() * 20);
    setIsFlying(true);
    setTimeout(() => setIsFlying(false), 8000);
  };

  if (!mounted || !isFlying) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: `${yPosition}%`,
        left: 0,
        zIndex: 9998,
        pointerEvents: "none",
        fontSize: "2.5rem",
        filter: "drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3))",
        animation: `santa-fly-${direction} 8s ease-in-out forwards`,
      }}
      aria-hidden="true"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {direction === "right" ? (
          <>
            <span style={{ fontSize: "1.875rem" }}>🦌</span>
            <span style={{ fontSize: "1.875rem" }}>🦌</span>
            <span style={{ fontSize: "2.25rem" }}>🛷</span>
            <span style={{ fontSize: "2.25rem" }}>🎅</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: "2.25rem" }}>🎅</span>
            <span style={{ fontSize: "2.25rem" }}>🛷</span>
            <span style={{ fontSize: "1.875rem" }}>🦌</span>
            <span style={{ fontSize: "1.875rem" }}>🦌</span>
          </>
        )}
      </div>
    </div>
  );
}
