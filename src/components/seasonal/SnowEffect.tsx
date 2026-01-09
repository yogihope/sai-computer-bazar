"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";

interface SnowEffectProps {
  intensity?: "low" | "medium" | "high";
}

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  opacity: number;
  type: "white" | "blue" | "crystal";
}

export function SnowEffect({ intensity = "medium" }: SnowEffectProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);

    // Add keyframes to document
    const styleId = "snowfall-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes snowfall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      // Cleanup on unmount
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, [intensity]);

  const snowflakeCount = useMemo(() => {
    switch (intensity) {
      case "low": return 40;
      case "medium": return 80;
      case "high": return 120;
      default: return 80;
    }
  }, [intensity]);

  const snowflakes = useMemo<Snowflake[]>(() => {
    const types: ("white" | "blue" | "crystal")[] = ["white", "blue", "crystal"];
    return Array.from({ length: snowflakeCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 5 + Math.random() * 10,
      animationDelay: Math.random() * -15,
      size: 4 + Math.random() * 8,
      opacity: 0.5 + Math.random() * 0.5,
      type: types[i % 3],
    }));
  }, [snowflakeCount]);

  // Get snowflake color based on type and theme
  const getSnowflakeStyle = (flake: Snowflake) => {
    if (isDark) {
      // Dark mode - white/light blue snowflakes with glow
      switch (flake.type) {
        case "white":
          return {
            background: "white",
            boxShadow: `0 0 ${flake.size * 2}px rgba(255, 255, 255, 0.8)`,
          };
        case "blue":
          return {
            background: "linear-gradient(135deg, #e0f7ff 0%, #b3e5fc 100%)",
            boxShadow: `0 0 ${flake.size * 2}px rgba(179, 229, 252, 0.8)`,
          };
        case "crystal":
          return {
            background: "linear-gradient(135deg, #ffffff 0%, #e1f5fe 50%, #b3e5fc 100%)",
            boxShadow: `0 0 ${flake.size * 2.5}px rgba(255, 255, 255, 0.9)`,
          };
      }
    } else {
      // Light mode - light blue/cyan snowflakes with shadow for visibility
      switch (flake.type) {
        case "white":
          return {
            background: "linear-gradient(135deg, #81d4fa 0%, #4fc3f7 100%)",
            boxShadow: `0 0 ${flake.size}px rgba(79, 195, 247, 0.6), 0 2px 4px rgba(0, 0, 0, 0.1)`,
          };
        case "blue":
          return {
            background: "linear-gradient(135deg, #4dd0e1 0%, #26c6da 100%)",
            boxShadow: `0 0 ${flake.size}px rgba(77, 208, 225, 0.6), 0 2px 4px rgba(0, 0, 0, 0.1)`,
          };
        case "crystal":
          return {
            background: "linear-gradient(135deg, #b3e5fc 0%, #81d4fa 50%, #4fc3f7 100%)",
            boxShadow: `0 0 ${flake.size * 1.5}px rgba(129, 212, 250, 0.7), 0 2px 4px rgba(0, 0, 0, 0.15)`,
          };
      }
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 99999,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {snowflakes.map((flake) => {
        const colorStyle = getSnowflakeStyle(flake);
        return (
          <div
            key={flake.id}
            style={{
              position: "absolute",
              top: "-10px",
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              borderRadius: "50%",
              opacity: flake.opacity,
              animation: `snowfall ${flake.animationDuration}s linear infinite`,
              animationDelay: `${flake.animationDelay}s`,
              ...colorStyle,
            }}
          />
        );
      })}
    </div>
  );
}
