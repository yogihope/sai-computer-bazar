"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";

export function HeaderSnowDecoration() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);

    // Add styles to document
    const styleId = "header-snow-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, []);

  // Memoize icicle data to prevent re-render changes
  const icicles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      opacity: 0.6 + Math.random() * 0.4,
      rotation: -2 + Math.random() * 4,
      isOdd: i % 2 === 1,
      is3n: i % 3 === 0,
    })),
  []);

  const sparkles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      top: 2 + Math.random() * 6,
      left: 5 + (i * 6.5),
      delay: Math.random() * 2,
    })),
  []);

  if (!mounted) return null;

  // Theme-specific colors
  const snowCapGradient = isDark
    ? "linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 40%, rgba(255, 255, 255, 0.4) 70%, transparent 100%)"
    : "linear-gradient(to bottom, rgba(129, 212, 250, 0.9) 0%, rgba(79, 195, 247, 0.7) 40%, rgba(79, 195, 247, 0.3) 70%, transparent 100%)";

  const icicleColor = isDark
    ? "rgba(200, 230, 255, 0.9)"
    : "rgba(79, 195, 247, 0.85)";

  const icicleFilter = isDark
    ? "drop-shadow(0 2px 4px rgba(100, 180, 255, 0.3))"
    : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))";

  const sparkleColor = isDark ? "white" : "#4fc3f7";
  const sparkleShadow = isDark
    ? "0 0 6px 2px rgba(255, 255, 255, 0.8)"
    : "0 0 6px 2px rgba(79, 195, 247, 0.8)";

  return (
    <>
      {/* Snow cap on top */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "8px",
          zIndex: 10000,
          pointerEvents: "none",
          background: snowCapGradient,
        }}
        aria-hidden="true"
      />

      {/* Icicles hanging */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "30px",
          zIndex: 9999,
          pointerEvents: "none",
          display: "flex",
          justifyContent: "space-around",
          padding: "0 10px",
        }}
        aria-hidden="true"
      >
        {icicles.map((icicle) => (
          <div
            key={icicle.id}
            style={{
              width: 0,
              height: 0,
              borderLeft: `${icicle.isOdd ? 3 : icicle.is3n ? 5 : 4}px solid transparent`,
              borderRight: `${icicle.isOdd ? 3 : icicle.is3n ? 5 : 4}px solid transparent`,
              borderTop: `${icicle.isOdd ? 15 : icicle.is3n ? 25 : 20}px solid ${icicleColor}`,
              filter: icicleFilter,
              marginTop: "6px",
              opacity: icicle.opacity,
              transform: `rotate(${icicle.rotation}deg)`,
            }}
          />
        ))}
      </div>

      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          style={{
            position: "fixed",
            top: `${sparkle.top}px`,
            left: `${sparkle.left}%`,
            width: "4px",
            height: "4px",
            background: sparkleColor,
            borderRadius: "50%",
            boxShadow: sparkleShadow,
            animation: "sparkle 2s ease-in-out infinite",
            animationDelay: `${sparkle.delay}s`,
            zIndex: 10002,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
